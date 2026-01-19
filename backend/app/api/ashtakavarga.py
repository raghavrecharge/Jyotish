from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.api.charts import get_or_compute_chart
from app.modules.ashtakavarga.calculator import ashtakavarga_calculator
from app.models.chart import PlanetaryPosition

router = APIRouter(prefix="/api/ashtakavarga", tags=["ashtakavarga"])

@router.get("/{profile_id}/bav")
async def get_bav(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Bhinnashtakavarga for all planets"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    # Get planetary positions
    positions = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id
    ).all()
    
    planetary_positions = {pos.planet: {"rasi": pos.rasi, "longitude": pos.longitude} for pos in positions}
    
    # Add LAGNA (Ascendant) position for Ashtakavarga calculation
    # Calculate rasi from ascendant longitude (0-30=Aries/1, 30-60=Taurus/2, etc.)
    ascendant_rasi = int(natal_chart.ascendant / 30) + 1
    planetary_positions["LAGNA"] = {"rasi": ascendant_rasi, "longitude": natal_chart.ascendant}
    
    # Calculate BAV
    result = ashtakavarga_calculator.calculate_all(planetary_positions)
    
    return {
        "bav": result["bav"],
        "planet_totals": {planet: sum(values) for planet, values in result["bav"].items()}
    }

@router.get("/{profile_id}/sav")
async def get_sav(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Sarvashtakavarga"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    positions = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id
    ).all()
    
    planetary_positions = {pos.planet: {"rasi": pos.rasi, "longitude": pos.longitude} for pos in positions}
    
    # Add LAGNA (Ascendant) position for Ashtakavarga calculation
    # Calculate rasi from ascendant longitude (0-30=Aries/1, 30-60=Taurus/2, etc.)
    ascendant_rasi = int(natal_chart.ascendant / 30) + 1
    planetary_positions["LAGNA"] = {"rasi": ascendant_rasi, "longitude": natal_chart.ascendant}
    
    result = ashtakavarga_calculator.calculate_all(planetary_positions)
    
    return {
        "sav": result["sav"],
        "reductions": result["reductions"],
        "total_points": result["summary"]["total_points"]
    }

@router.get("/{profile_id}/summary")
async def get_ashtakavarga_summary(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Ashtakavarga summary with detailed table by house"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    positions = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id
    ).all()
    
    planetary_positions = {pos.planet: {"rasi": pos.rasi, "longitude": pos.longitude} for pos in positions}
    
    # Add LAGNA (Ascendant) position for Ashtakavarga calculation
    # Calculate rasi from ascendant longitude (0-30=Aries/1, 30-60=Taurus/2, etc.)
    ascendant_rasi = int(natal_chart.ascendant / 30) + 1
    planetary_positions["LAGNA"] = {"rasi": ascendant_rasi, "longitude": natal_chart.ascendant}
    
    result = ashtakavarga_calculator.calculate_all(planetary_positions)
    
    # Build detailed table format (house x planet matrix)
    planets = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]
    bav_table = []
    
    for house_idx in range(12):
        house_num = house_idx + 1
        row = {"house": house_num}
        house_total = 0
        
        for planet in planets:
            planet_bindu = result["bav"][planet][house_idx] if planet in result["bav"] else 0
            row[planet.lower()] = planet_bindu
            house_total += planet_bindu
        
        row["total"] = house_total
        bav_table.append(row)
    
    # Calculate totals by planet
    planet_totals = {}
    for planet in planets:
        planet_total = sum([row[planet.lower()] for row in bav_table])
        planet_totals[planet.lower()] = planet_total
    
    # Determine strong and weak houses
    sav = result["sav"]
    avg = result["summary"]["average"]
    
    strong_houses = [i+1 for i, val in enumerate(sav) if val > avg]
    weak_houses = [i+1 for i, val in enumerate(sav) if val < avg]
    
    # Rotate SAV data to start from ascendant rashi
    # If ascendant is in rashi 10, we want: [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    rotated_sav_by_house = {}
    for i in range(12):
        original_house = i + 1  # 1-12
        rotated_position = ((original_house - ascendant_rasi) % 12) + 1  # Position from ascendant
        rotated_sav_by_house[rotated_position] = {"rasi": original_house, "points": sav[i]}
    
    # Rotate BAV table to start from ascendant rashi
    rotated_bav_table = []
    for i in range(12):
        original_idx = (ascendant_rasi - 1 + i) % 12  # Index in original array (0-11)
        original_house = original_idx + 1  # Original house number (1-12)
        bhava_num = i + 1  # Bhava number from ascendant (1-12)
        
        row = {"bhava": bhava_num, "rasi": original_house}
        house_total = 0
        
        for planet in planets:
            planet_bindu = result["bav"][planet][original_idx] if planet in result["bav"] else 0
            row[planet.lower()] = planet_bindu
            house_total += planet_bindu
        
        row["total"] = house_total
        rotated_bav_table.append(row)
    
    return {
        "ascendant_rasi": ascendant_rasi,  # Which rashi the ascendant is in
        "sav_by_house": dict(enumerate(sav, 1)),  # Original: House 1-12 with their SAV points
        "sav_by_bhava": rotated_sav_by_house,  # Rotated: Bhava 1-12 starting from ascendant
        "bav_table": bav_table,  # Original table (rasi-based)
        "bav_table_by_bhava": rotated_bav_table,  # Rotated table (bhava-based, starting from ascendant)
        "planet_totals": planet_totals,  # Sum of points for each planet across all houses
        "total_points": result["summary"]["total_points"],
        "average_points": result["summary"]["average"],
        "strong_houses": strong_houses,
        "weak_houses": weak_houses,
        "strongest_house": result["summary"]["max_rasi"],
        "weakest_house": result["summary"]["min_rasi"],
        "interpretation": {
            "overall_strength": "Excellent" if result["summary"]["total_points"] > 320 else "Good" if result["summary"]["total_points"] > 300 else "Moderate" if result["summary"]["total_points"] > 280 else "Weak"
        }
    }
