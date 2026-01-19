from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, Dict, List
import hashlib

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.chart import NatalChart, PlanetaryPosition, DivisionalChart
from app.modules.charts.calculator import chart_calculator
from app.modules.ephemeris.calculator import ephemeris

router = APIRouter(prefix="/api/charts", tags=["charts"])


def _build_house_chart_from_rasi(ascendant_rasi: int, planetary_data: Dict[str, Dict]) -> Dict:
    """Build a simple north-indian style house map from an ascendant sign and planetary rasi data.

    planetary_data: {planet: {"rasi": int, "degree": Optional[float], "is_retrograde": Optional[bool]}}
    """
    houses: Dict[int, Dict] = {}
    for house_num in range(1, 13):
        rasi_num = ((ascendant_rasi - 1 + house_num - 1) % 12) + 1
        houses[house_num] = {"rasi": rasi_num, "planets": []}

    for planet, pdata in planetary_data.items():
        prasi = pdata.get("rasi")
        if prasi is None:
            continue
        
        # Ensure rasi is in 1-12 range
        prasi = ((prasi - 1) % 12) + 1
        
        placed = False
        for house_num, hdata in houses.items():
            if hdata["rasi"] == prasi:
                hdata["planets"].append({
                    "planet": planet,
                    "degree": pdata.get("degree"),
                    "is_retrograde": bool(pdata.get("is_retrograde", False))
                })
                placed = True
                break
        
        # Debug: If planet wasn't placed, add to house 1 (fallback)
        if not placed:
            # This shouldn't happen, but if rasi doesn't match any house, place in house 1
            houses[1]["planets"].append({
                "planet": planet,
                "degree": pdata.get("degree"),
                "is_retrograde": bool(pdata.get("is_retrograde", False))
            })
    
    return houses


def _format_chalit_chart(natal_chart: NatalChart, positions: List[PlanetaryPosition]) -> Dict:
    """Compute Bhava Chalit (house-based) placement using cusps."""
    cusps = natal_chart.house_cusps or []
    if len(cusps) != 12:
        return {"error": "House cusps unavailable"}

    # Normalize cusps to 0-360
    cusps = [c % 360 for c in cusps]

    houses: Dict[int, Dict] = {}
    for i in range(12):
        start = cusps[i]
        end = cusps[(i + 1) % 12]
        # Calculate which rasi (sign) this house primarily occupies
        # Use the house's starting cusp to determine rasi
        rasi = int(start / 30) + 1
        houses[i + 1] = {
            "rasi": rasi,
            "start_deg": round(start, 3),
            "end_deg": round(end, 3),
            "planets": []
        }

    def house_for_longitude(lon: float) -> int:
        """Find which house a longitude belongs to based on cusps."""
        lon = lon % 360
        for i in range(12):
            start = cusps[i]
            end = cusps[(i + 1) % 12]
            
            if start < end:
                # Normal case: no wrap-around
                if start <= lon < end:
                    return i + 1
            else:
                # Wrap-around case: start > end (e.g., 350 to 10)
                if lon >= start or lon < end:
                    return i + 1
        
        # Fallback to house 1
        return 1

    for pos in positions:
        hnum = house_for_longitude(pos.longitude)
        houses[hnum]["planets"].append({
            "planet": pos.planet,
            "longitude": round(pos.longitude, 4),
            "rasi": pos.rasi,
            "degree_in_rasi": round(pos.degree_in_rasi, 4),
            "is_retrograde": bool(pos.is_retrograde)
        })

    return {
        "chart_type": "chalit",
        "division": 1,
        "division_name": "Bhava Chalit",
        "ascendant": natal_chart.ascendant,
        "ascendant_rasi": int(natal_chart.ascendant / 30.0) + 1,
        "houses": houses,
        "sign_names": [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
    }


@router.get("/{profile_id}/debug")
async def debug_chart(
    profile_id: int,
    db: Session = Depends(get_db)
):
    """Debug endpoint: Show D1 longitudes and corresponding D9 positions"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    # Get planetary positions
    positions = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id
    ).order_by(PlanetaryPosition.planet).all()
    
    div_calc = chart_calculator.div_calculator
    
    debug_data = {
        "d1_ascendant_longitude": natal_chart.ascendant,
        "d1_ascendant_rasi": int(natal_chart.ascendant / 30.0) + 1,
        "d9_ascendant_rasi": div_calc.calculate_divisional_position(natal_chart.ascendant, 9),
        "planets": []
    }
    
    for pos in positions:
        d9_rasi = div_calc.calculate_divisional_position(pos.longitude, 9)
        debug_data["planets"].append({
            "planet": pos.planet,
            "d1_longitude": pos.longitude,
            "d1_rasi": pos.rasi,
            "d1_degree_in_rasi": pos.degree_in_rasi,
            "d9_rasi_computed": d9_rasi,
            "nakshatra": pos.nakshatra,
            "pada": pos.nakshatra_pada
        })
    
    return debug_data


@router.get("/{profile_id}")
async def get_chart(
    profile_id: int,
    chart: str = "D1",
    style: str = "north_indian",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get natal or divisional chart"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Compute or fetch cached chart
    natal_chart = get_or_compute_chart(profile, db)
    
    # Get divisional chart
    division = 1 if chart == "D1" else int(chart[1:])
    
    if division == 1:
        # Return D1 with North Indian format
        return format_north_indian_chart(natal_chart, profile, db)
    else:
        # Return divisional chart in same format as D1
        div_chart = db.query(DivisionalChart).filter(
            DivisionalChart.natal_chart_id == natal_chart.id,
            DivisionalChart.division == division
        ).first()
        
        if not div_chart:
            raise HTTPException(status_code=404, detail=f"Chart {chart} not found")
        
        return format_divisional_chart_proper(
            div_chart,
            natal_chart.ascendant,
            db
        )


@router.get("/{profile_id}/divisional")
async def get_divisional_chart(
    profile_id: int,
    d: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific divisional chart"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    div_chart = db.query(DivisionalChart).filter(
        DivisionalChart.natal_chart_id == natal_chart.id,
        DivisionalChart.division == d
    ).first()
    
    if not div_chart:
        raise HTTPException(status_code=404, detail=f"D{d} not found")
    
    return format_divisional_chart_proper(div_chart, natal_chart.ascendant, db)


@router.get("/{profile_id}/bundle")
async def get_chart_bundle(
    profile_id: int,
    db: Session = Depends(get_db)
):
    """Get D1 + D9 bundle (planetary table included)."""
    profile = db.query(Profile).filter(
        Profile.id == profile_id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    # Get planetary positions for table
    positions = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id
    ).all()
    
    
    # Build response with D1
    response = {
        "d1": format_north_indian_chart(natal_chart, profile, db),
        "planetary_table": [
            {
                "planet": pos.planet,
                "longitude": pos.longitude,
                "rasi": pos.rasi,
                "nakshatra": pos.nakshatra,
                "pada": pos.nakshatra_pada,
                "degree_in_rasi": pos.degree_in_rasi,
                "is_retrograde": bool(pos.is_retrograde),
                "is_combust": bool(pos.is_combust),
                "dignity": pos.dignity
            }
            for pos in positions
        ]
    }

    # Include ALL divisional charts D2..D60
    from types import SimpleNamespace
    div_calc = chart_calculator.div_calculator

    # Helper to format a divisional chart, computing on-the-fly if missing in DB
    def _format_division(d: int):
        # Try DB first
        div_chart = db.query(DivisionalChart).filter(
            DivisionalChart.natal_chart_id == natal_chart.id,
            DivisionalChart.division == d
        ).first()

        if not div_chart:
            # Compute positions from D1 longitudes
            computed_positions = {
                p.planet: div_calc.calculate_divisional_position(p.longitude, d)
                for p in positions
            }
            div_chart = SimpleNamespace(
                division=d,
                division_name=div_calc.DIVISIONS.get(d, f"D{d}"),
                planetary_positions=computed_positions
            )
        return format_divisional_chart_proper(div_chart, natal_chart.ascendant, db)

    # Only include specified divisional charts
    divisional_charts = [2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 60]
    for d in divisional_charts:
        key = f"d{d}"
        try:
            response[key] = _format_division(d)
        except Exception as e:
            # Ensure one bad division doesn't break the bundle
            response[key] = {
                "chart_type": "north_indian",
                "division": d,
                "division_name": div_calc.DIVISIONS.get(d, f"D{d}"),
                "error": f"Failed to compute D{d}: {e}"
            }

    # Add special charts
    # 1) Sun Chart (Sun as ascendant) using D1 positions
    sun_pos = next((p for p in positions if p.planet == "SUN"), None)
    if sun_pos:
        sun_planetary_data = {
            p.planet: {
                "rasi": p.rasi,
                "degree": round(p.degree_in_rasi, 4) if p.degree_in_rasi is not None else None,
                "is_retrograde": bool(p.is_retrograde)
            }
            for p in positions
        }
        response["sun"] = {
            "chart_type": "sun",
            "division": 1,
            "division_name": "Sun Chart",
            "ascendant_rasi": sun_pos.rasi,
            "houses": _build_house_chart_from_rasi(sun_pos.rasi, sun_planetary_data),
            "sign_names": [
                "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
            ]
        }

    # 2) Moon Chart (Moon as ascendant) using D1 positions
    moon_pos = next((p for p in positions if p.planet == "MOON"), None)
    if moon_pos:
        moon_planetary_data = {
            p.planet: {
                "rasi": p.rasi,
                "degree": round(p.degree_in_rasi, 4) if p.degree_in_rasi is not None else None,
                "is_retrograde": bool(p.is_retrograde)
            }
            for p in positions
        }
        response["moon"] = {
            "chart_type": "moon",
            "division": 1,
            "division_name": "Moon Chart",
            "ascendant_rasi": moon_pos.rasi,
            "houses": _build_house_chart_from_rasi(moon_pos.rasi, moon_planetary_data),
            "sign_names": [
                "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
            ]
        }

    # 3) Chalit (Bhava Chalit) using cusps
    response["chalit"] = _format_chalit_chart(natal_chart, positions)

    # Precompute D9 planetary positions for special charts below
    computed_positions_9 = {
        p.planet: div_calc.calculate_divisional_position(p.longitude, 9)
        for p in positions
    }

    # 4) Karakamsha (Navamsa-based chart with AK navamsa as lagna)
    atmakaraka = _compute_chara_atmakaraka(positions)
    if atmakaraka:
        ak_d9_rasi = computed_positions_9.get(atmakaraka.planet)
        if ak_d9_rasi:
            # 4a) Karakamsha - D9 positions with AK's D9 as lagna
            navamsa_planetary_data = {
                planet: {"rasi": rasi, "degree": None, "is_retrograde": False}
                for planet, rasi in computed_positions_9.items()
            }
            response["karakamsha"] = {
                "chart_type": "karakamsha",
                "division": 9,
                "division_name": "Karakamsha (D9)",
                "ascendant_rasi": ak_d9_rasi,
                "houses": _build_house_chart_from_rasi(ak_d9_rasi, navamsa_planetary_data),
                "atmakaraka": atmakaraka.planet,
                "atmakaraka_degree": round(atmakaraka.degree_in_rasi, 4),
                "sign_names": [
                    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
                ]
            }

            # 4b) Swamsa - D1 positions with AK's D9 as lagna
            swamsa_planetary_data = {
                p.planet: {
                    "rasi": p.rasi,
                    "degree": round(p.degree_in_rasi, 4) if p.degree_in_rasi is not None else None,
                    "is_retrograde": bool(p.is_retrograde)
                }
                for p in positions
            }
            response["swamsa"] = {
                "chart_type": "swamsa",
                "division": 1,
                "division_name": "Swamsa (D1)",
                "ascendant_rasi": ak_d9_rasi,  # Use AK's D9 rasi (same as Karakamsha)
                "houses": _build_house_chart_from_rasi(ak_d9_rasi, swamsa_planetary_data),
                "atmakaraka": atmakaraka.planet,
                "sign_names": [
                    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
                ]
            }

    return response


def get_or_compute_chart(profile: Profile, db: Session) -> NatalChart:
    """Get cached chart or compute new one"""
    # Build datetime from profile with correct timezone
    from zoneinfo import ZoneInfo
    birth_datetime = datetime.combine(
        profile.birth_date.date(),
        datetime.strptime(profile.birth_time, "%H:%M:%S").time()
    )
    # Attach the profile's timezone
    try:
        tz = ZoneInfo(profile.timezone)
        birth_datetime = birth_datetime.replace(tzinfo=tz)
    except Exception as e:
        # Fallback to treating as UTC if timezone is invalid
        from datetime import timezone
        birth_datetime = birth_datetime.replace(tzinfo=timezone.utc)
        print(f"Warning: Invalid timezone '{profile.timezone}', using UTC: {e}")
    
    # Generate hash
    chart_hash = chart_calculator.generate_chart_hash(
        birth_datetime,
        profile.latitude,
        profile.longitude,
        profile.ayanamsa
    )
    
    # Check cache
    natal_chart = db.query(NatalChart).filter(
        NatalChart.chart_hash == chart_hash
    ).first()
    
    if natal_chart:
        return natal_chart
    
    # Compute new chart
    chart_data = chart_calculator.calculate_natal_chart(
        birth_datetime,
        profile.latitude,
        profile.longitude,
        profile.ayanamsa
    )
    
    # Store in DB
    natal_chart = NatalChart(
        profile_id=profile.id,
        chart_hash=chart_hash,
        julian_day=chart_data["julian_day"],
        ayanamsa_value=chart_data["ayanamsa_value"],
        ascendant=chart_data["ascendant"],
        mc=chart_data["mc"],
        house_cusps=chart_data["house_cusps"],
        created_at=datetime.utcnow()
    )
    db.add(natal_chart)
    db.flush()
    
    # Store planetary positions
    for planet, pos in chart_data["planets"].items():
        planet_pos = PlanetaryPosition(
            natal_chart_id=natal_chart.id,
            planet=planet,
            longitude=pos["longitude"],
            latitude=pos.get("latitude"),
            distance=pos.get("distance"),
            speed=pos.get("speed"),
            is_retrograde=1 if pos.get("is_retrograde") else 0,
            nakshatra=pos.get("nakshatra"),
            nakshatra_pada=pos.get("pada"),
            rasi=pos.get("rasi"),
            degree_in_rasi=pos.get("degree_in_rasi"),
            is_combust=1 if pos.get("is_combust") else 0,
            dignity=pos.get("dignity")
        )
        db.add(planet_pos)
    
    # Store divisional charts
    from app.modules.charts.calculator import DivisionalChartCalculator
    div_calc = DivisionalChartCalculator()
    
    for div_num, div_name in div_calc.DIVISIONS.items():
        div_positions = chart_data["divisional_charts"].get(div_num, {})
        
        div_chart = DivisionalChart(
            natal_chart_id=natal_chart.id,
            division=div_num,
            division_name=div_name,
            planetary_positions=div_positions
        )
        db.add(div_chart)
    
    db.commit()
    db.refresh(natal_chart)
    
    return natal_chart  


def format_north_indian_chart(natal_chart: NatalChart, profile: Profile, db: Session) -> dict:
    """Format D1 chart for North Indian display"""
    
    # Get planetary positions
    positions = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id
    ).all()
    
    # Calculate ascendant rasi
    asc_rasi = int(natal_chart.ascendant / 30.0) + 1
    
    # North Indian chart houses
    houses = {}
    for house_num in range(1, 13):
        rasi_num = ((asc_rasi - 1 + house_num - 1) % 12) + 1
        houses[house_num] = {
            "rasi": rasi_num,
            "planets": []
        }
    
    # Place planets in houses
    for pos in positions:
        planet_rasi = pos.rasi
        for house_num, house_data in houses.items():
            if house_data["rasi"] == planet_rasi:
                houses[house_num]["planets"].append({
                    "planet": pos.planet,
                    "degree": round(pos.degree_in_rasi, 2),
                    "is_retrograde": bool(pos.is_retrograde)
                })
                break
    
    return {
        "chart_type": "north_indian",
        "division": 1,
        "division_name": "Rasi (D1)",
        "ascendant": natal_chart.ascendant,
        "ascendant_rasi": asc_rasi,
        "houses": houses,
        "sign_names": [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
    }


def calculate_divisional_ascendant(d1_ascendant: float, division: int) -> int:
    """Calculate divisional ascendant using the same logic as planetary division."""
    # Reuse the divisional calculator so ascendant uses identical rules
    div_calc = chart_calculator.div_calculator
    result = div_calc.calculate_divisional_position(d1_ascendant, division)
    return result


def format_divisional_chart_proper(div_chart: DivisionalChart, d1_ascendant: float, db: Session) -> dict:
    """Format divisional chart with proper ascendant calculation"""
    
    planetary_positions = div_chart.planetary_positions
    
    if not planetary_positions:
        return {
            "chart_type": "north_indian",
            "division": div_chart.division,
            "division_name": div_chart.division_name,
            "error": "No planetary positions available"
        }
    
    # Calculate divisional ascendant
    divisional_ascendant_rasi = calculate_divisional_ascendant(
        d1_ascendant,
        div_chart.division
    )
    
    # Store D1 info for reference
    d1_asc_rasi = int(d1_ascendant / 30.0) + 1
    d1_degree_in_rasi = d1_ascendant % 30.0
    
    # Build houses based on divisional ascendant
    houses = {}
    for house_num in range(1, 13):
        rasi_num = ((divisional_ascendant_rasi - 1 + house_num - 1) % 12) + 1
        houses[house_num] = {
            "rasi": rasi_num,
            "planets": []
        }
    
    # Place planets according to divisional chart positions
    for planet, planet_rasi in planetary_positions.items():
        # Skip ascendant if it's in the dict
        if planet in ["ASC", "ASCENDANT", "LAGNA"]:
            continue
        
        # Find which house this planet belongs to
        for house_num, house_data in houses.items():
            if house_data["rasi"] == planet_rasi:
                houses[house_num]["planets"].append({
                    "planet": planet,
                    "degree": None,  # Divisional charts typically don't show degrees
                    "is_retrograde": False  # Can fetch from D1 if needed
                })
                break
    
    return {
        "chart_type": "north_indian",
        "division": div_chart.division,
        "division_name": div_chart.division_name,
        "ascendant_rasi": divisional_ascendant_rasi,
        "d1_ascendant_longitude": round(d1_ascendant, 4),
        "d1_ascendant_rasi": d1_asc_rasi,
        "d1_ascendant_degree": round(d1_degree_in_rasi, 4),
        "houses": houses,
        "sign_names": [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ],
        "planetary_positions_raw": planetary_positions  # Keep original positions for reference
    }


def _compute_chara_atmakaraka(positions: List[PlanetaryPosition]) -> Optional[PlanetaryPosition]:
    """Return the planet with highest degree_in_rasi (Chara Atmakaraka)."""
    if not positions:
        return None
    return max(positions, key=lambda p: p.degree_in_rasi or 0)