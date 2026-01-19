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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get D1 to D60 + planetary table"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    # Get planetary positions for table
    positions = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id
    ).all()
    
    # Get all divisional charts
    divisional_charts = db.query(DivisionalChart).filter(
        DivisionalChart.natal_chart_id == natal_chart.id
    ).order_by(DivisionalChart.division).all()
    
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
    
    # Add all divisional charts (D2 to D60)
    for div_chart in divisional_charts:
        chart_key = f"d{div_chart.division}"
        response[chart_key] = format_divisional_chart_proper(
            div_chart,
            natal_chart.ascendant,
            db
        )
    
    return response


@router.get("/bundles")
async def get_all_profile_bundles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get D1 to D60 + planetary table for all profiles of the current user"""
    profiles = db.query(Profile).filter(Profile.user_id == current_user.id).all()

    result = {}
    for profile in profiles:
        natal_chart = get_or_compute_chart(profile, db)

        # Planetary positions
        positions = db.query(PlanetaryPosition).filter(
            PlanetaryPosition.natal_chart_id == natal_chart.id
        ).all()

        # All divisional charts
        divisional_charts = db.query(DivisionalChart).filter(
            DivisionalChart.natal_chart_id == natal_chart.id
        ).order_by(DivisionalChart.division).all()

        bundle = {
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

        for div_chart in divisional_charts:
            chart_key = f"d{div_chart.division}"
            bundle[chart_key] = format_divisional_chart_proper(
                div_chart,
                natal_chart.ascendant,
                db
            )

        result[profile.id] = {
            "profile_name": profile.name,
            "bundle": bundle
        }

    return result


def get_or_compute_chart(profile: Profile, db: Session) -> NatalChart:
    """Get cached chart or compute new one"""
    # Build datetime from profile
    birth_datetime = datetime.combine(
        profile.birth_date.date(),
        datetime.strptime(profile.birth_time, "%H:%M:%S").time()
    )
    
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
    """Calculate ascendant for divisional chart"""
    
    # Get D1 ascendant in rasi and degrees
    d1_asc_rasi = int(d1_ascendant / 30.0)
    d1_asc_degrees = d1_ascendant % 30.0
    
    # Calculate divisional position based on division type
    if division == 2:  # Hora (D2)
        if d1_asc_degrees < 15:
            div_rasi = 3  # Cancer (4th sign, index 3)
        else:
            div_rasi = 4  # Leo (5th sign, index 4)
    
    elif division == 3:  # Drekkana (D3)
        decan = int(d1_asc_degrees / 10.0)
        div_rasi = (d1_asc_rasi + decan * 4) % 12
    
    elif division == 4:  # Chaturthamsha (D4)
        quarter = int(d1_asc_degrees / 7.5)
        div_rasi = (d1_asc_rasi + quarter * 3) % 12
    
    elif division == 7:  # Saptamsa (D7)
        seventh = int(d1_asc_degrees / 4.285714)
        # Odd sign: start from same sign
        # Even sign: start from 7th sign
        if (d1_asc_rasi + 1) % 2 == 1:  # Odd sign
            div_rasi = (d1_asc_rasi + seventh) % 12
        else:  # Even sign
            div_rasi = (d1_asc_rasi + 6 + seventh) % 12
    
    elif division == 9:  # Navamsa (D9)
        navamsa_num = int(d1_asc_degrees / 3.333333)
        div_rasi = (d1_asc_rasi + navamsa_num) % 12
    
    elif division == 10:  # Dashamsa (D10)
        dashamsa_num = int(d1_asc_degrees / 3.0)
        # Odd sign: start from same sign
        # Even sign: start from 9th sign
        if (d1_asc_rasi + 1) % 2 == 1:  # Odd sign
            div_rasi = (d1_asc_rasi + dashamsa_num) % 12
        else:  # Even sign
            div_rasi = (d1_asc_rasi + 8 + dashamsa_num) % 12
    
    elif division == 12:  # Dvadashamsa (D12)
        dvadashamsa_num = int(d1_asc_degrees / 2.5)
        div_rasi = (d1_asc_rasi + dvadashamsa_num) % 12
    
    elif division == 16:  # Shodashamsha (D16)
        shodashamsha_num = int(d1_asc_degrees / 1.875)
        # Movable sign: start from Aries
        # Fixed sign: start from Leo
        # Dual sign: start from Sagittarius
        movable_signs = [0, 3, 6, 9]  # Aries, Cancer, Libra, Capricorn
        fixed_signs = [1, 4, 7, 10]    # Taurus, Leo, Scorpio, Aquarius
        
        if d1_asc_rasi in movable_signs:
            div_rasi = (0 + shodashamsha_num) % 12  # Start from Aries
        elif d1_asc_rasi in fixed_signs:
            div_rasi = (4 + shodashamsha_num) % 12  # Start from Leo
        else:
            div_rasi = (8 + shodashamsha_num) % 12  # Start from Sagittarius
    
    elif division == 20:  # Vimshamsha (D20)
        vimshamsha_num = int(d1_asc_degrees / 1.5)
        # Movable sign: start from Aries
        # Fixed sign: start from Sagittarius
        # Dual sign: start from Leo
        movable_signs = [0, 3, 6, 9]
        fixed_signs = [1, 4, 7, 10]
        
        if d1_asc_rasi in movable_signs:
            div_rasi = (0 + vimshamsha_num) % 12
        elif d1_asc_rasi in fixed_signs:
            div_rasi = (8 + vimshamsha_num) % 12
        else:
            div_rasi = (4 + vimshamsha_num) % 12
    
    elif division == 24:  # Chaturvimshamsha (D24)
        chaturvimshamsha_num = int(d1_asc_degrees / 1.25)
        # Odd sign: start from Leo
        # Even sign: start from Cancer
        if (d1_asc_rasi + 1) % 2 == 1:
            div_rasi = (4 + chaturvimshamsha_num) % 12  # Leo
        else:
            div_rasi = (3 + chaturvimshamsha_num) % 12  # Cancer
    
    elif division == 27:  # Nakshatramsa (D27)
        nakshatramsa_num = int(d1_asc_degrees / 1.111111)
        div_rasi = (d1_asc_rasi + nakshatramsa_num) % 12
    
    elif division == 30:  # Trimshamsha (D30)
        trimshamsha_num = int(d1_asc_degrees / 1.0)
        # Odd sign: Mars(5°), Saturn(5°), Jupiter(8°), Mercury(7°), Venus(5°)
        # Even sign: Venus(5°), Mercury(7°), Jupiter(8°), Saturn(5°), Mars(5°)
        if (d1_asc_rasi + 1) % 2 == 1:  # Odd
            if d1_asc_degrees < 5:
                div_rasi = 0  # Mars - Aries
            elif d1_asc_degrees < 10:
                div_rasi = 9  # Saturn - Capricorn
            elif d1_asc_degrees < 18:
                div_rasi = 8  # Jupiter - Sagittarius
            elif d1_asc_degrees < 25:
                div_rasi = 2  # Mercury - Gemini
            else:
                div_rasi = 1  # Venus - Taurus
        else:  # Even
            if d1_asc_degrees < 5:
                div_rasi = 1  # Venus - Taurus
            elif d1_asc_degrees < 12:
                div_rasi = 2  # Mercury - Gemini
            elif d1_asc_degrees < 20:
                div_rasi = 8  # Jupiter - Sagittarius
            elif d1_asc_degrees < 25:
                div_rasi = 9  # Saturn - Capricorn
            else:
                div_rasi = 0  # Mars - Aries
    
    elif division == 40:  # Khavedamsa (D40)
        khavedamsa_num = int(d1_asc_degrees / 0.75)
        # Movable sign: start from Aries
        # Fixed sign: start from Leo
        # Dual sign: start from Sagittarius
        movable_signs = [0, 3, 6, 9]
        fixed_signs = [1, 4, 7, 10]
        
        if d1_asc_rasi in movable_signs:
            div_rasi = (0 + khavedamsa_num) % 12
        elif d1_asc_rasi in fixed_signs:
            div_rasi = (4 + khavedamsa_num) % 12
        else:
            div_rasi = (8 + khavedamsa_num) % 12
    
    elif division == 45:  # Akshavedamsa (D45)
        akshavedamsa_num = int(d1_asc_degrees / 0.666667)
        div_rasi = (d1_asc_rasi + akshavedamsa_num) % 12
    
    elif division == 60:  # Shashtyamsa (D60)
        shashtyamsa_num = int(d1_asc_degrees / 0.5)
        div_rasi = (d1_asc_rasi + shashtyamsa_num) % 12
    
    else:
        # Generic formula for other divisions
        portion = int((d1_asc_degrees / 30.0) * division)
        div_rasi = (d1_asc_rasi + portion) % 12
    
    return div_rasi + 1  # Return 1-12 instead of 0-11


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
        "houses": houses,
        "sign_names": [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ],
        "planetary_positions_raw": planetary_positions  # Keep original positions for reference
    }