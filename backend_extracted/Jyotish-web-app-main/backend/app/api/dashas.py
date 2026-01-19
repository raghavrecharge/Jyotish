from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.chart import NatalChart, PlanetaryPosition
from app.models.dasha import Dasha, DashaSystem, DashaLevel
from app.modules.dasha.calculator import dasha_engine, VimshottariDasha
from app.api.charts import get_or_compute_chart

router = APIRouter(prefix="/api/dashas", tags=["dashas"])

def nest_dashas_by_parent_id(dashas: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Nest dashas based on parent_id relationships.
    A child dasha has parent_id pointing to its parent dasha's id.
    """
    if not dashas:
        return []
    
    # Create a map of id -> dasha for quick lookup
    dasha_map = {d["id"]: d for d in dashas}
    
    # Create a map of parent_id -> [children]
    children_map = {}
    for dasha in dashas:
        parent_id = dasha.get("parent_id")
        if parent_id:
            if parent_id not in children_map:
                children_map[parent_id] = []
            children_map[parent_id].append(dasha)
    
    def build_tree(dasha):
        """Recursively build tree for a single dasha"""
        dasha_copy = dict(dasha)
        children_raw = children_map.get(dasha["id"], [])
        dasha_copy["children"] = [build_tree(child) for child in children_raw]
        return dasha_copy
    
    # Find root dashas (Maha dashas with no parent)
    root_dashas = [d for d in dashas if d.get("level", "").lower() == "maha" and not d.get("parent_id")]
    
    # Build trees for each root
    return [build_tree(root) for root in root_dashas]

@router.get("/systems")
async def get_dasha_systems():
    """Get available dasha systems"""
    return {
        "systems": [
            {
                "id": "vimshottari", 
                "name": "Vimshottari", 
                "type": "Planets",
                "levels": ["Maha", "Antar", "Pratyantar"],
                "max_depth": 3
            },
            {
                "id": "chara", 
                "name": "Chara (Jaimini)", 
                "type": "Rashis",
                "levels": ["Maha", "Antar"],
                "max_depth": 2
            },
            {
                "id": "yogini", 
                "name": "Yogini", 
                "type": "Planets",
                "levels": ["Maha", "Antar"],
                "max_depth": 2
            },
            {
                "id": "ashtottari", 
                "name": "Ashtottari", 
                "type": "Planets",
                "levels": ["Maha", "Antar"],
                "max_depth": 2
            },
            {
                "id": "kala_chakra", 
                "name": "Kalachakra", 
                "type": "Nakshatra + Rashi",
                "levels": ["Multi-level"],
                "max_depth": 2
            }
        ]
    }

def format_dasha_date(dt):
    """Normalize datetime to ISO format string, handling both timezone-aware and naive datetimes"""
    if dt is None:
        return None
    if isinstance(dt, str):
        # Already a string, parse and re-format to ensure consistency
        try:
            dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return dt
    # Ensure we return a consistent ISO format string
    return dt.isoformat() if isinstance(dt, datetime) else str(dt)

@router.get("/{profile_id}/all")
async def get_all_dashas(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all dasha systems for profile"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    all_systems = {}
    systems = [
        ("vimshottari", 3, ["maha", "antar", "pratyantar"]),
        ("chara", 2, ["maha", "antar"]),
        ("yogini", 2, ["maha", "antar"]),
        ("ashtottari", 2, ["maha", "antar"]),
        ("kala_chakra", 2, ["maha"])
    ]
    
    for system_name, max_depth, levels in systems:
        try:
            # Get or compute dashas for this system
            dashas = get_or_compute_dashas(natal_chart, profile, system_name.upper(), db)
            
            # Filter by depth levels - normalize to lowercase for comparison
            filtered_dashas = [d for d in dashas if d["level"].lower() in levels]
            
            # Normalize dates
            for d in filtered_dashas:
                d["start_date"] = format_dasha_date(d.get("start_date"))
                d["end_date"] = format_dasha_date(d.get("end_date"))
            
            # Get current dasha
            current_dasha = get_current_dasha(filtered_dashas)
            if current_dasha:
                current_dasha["start_date"] = format_dasha_date(current_dasha.get("start_date"))
                current_dasha["end_date"] = format_dasha_date(current_dasha.get("end_date"))
            
            all_systems[system_name] = {
                "dashas": filtered_dashas,
                "current": current_dasha,
                "max_depth": max_depth,
                "available_levels": levels
            }
        except Exception as e:
            print(f"Error calculating {system_name}: {e}")
            all_systems[system_name] = {
                "error": str(e),
                "dashas": [],
                "current": None
            }
    
    return all_systems

@router.get("/{profile_id}")
async def get_dashas(
    profile_id: int,
    system: str = "vimshottari",
    depth: int = 3,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashas for profile (single system)"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    # Get or compute dashas
    dashas = get_or_compute_dashas(natal_chart, profile, system.upper(), db)
    
    # Filter by depth based on system
    depth_filters = {
        "vimshottari": {
            1: ["maha"],
            2: ["maha", "antar"],
            3: ["maha", "antar", "pratyantar"],
            4: ["maha", "antar", "pratyantar", "sookshma"],
            5: ["maha", "antar", "pratyantar", "sookshma", "prana"]
        },
        "chara": {
            1: ["maha"],
            2: ["maha", "antar"]
        },
        "yogini": {
            1: ["maha"],
            2: ["maha", "antar"]
        },
        "ashtottari": {
            1: ["maha"],
            2: ["maha", "antar"]
        },
        "kala_chakra": {
            1: ["maha"],
            2: ["maha", "antar"]
        }
    }
    
    system_key = system.lower()
    if system_key in depth_filters and depth in depth_filters[system_key]:
        allowed_levels = depth_filters[system_key][depth]
        # Normalize level values to lowercase for comparison
        dashas = [d for d in dashas if d["level"].lower() in allowed_levels]
    elif depth == 1:
        # Normalize level values to lowercase for comparison
        dashas = [d for d in dashas if d["level"].lower() == "maha"]
    
    # Normalize all dates in dashas to ensure consistency
    for d in dashas:
        d["start_date"] = format_dasha_date(d.get("start_date"))
        d["end_date"] = format_dasha_date(d.get("end_date"))
    
    # Nest dashas by parent_id relationships
    nested_dashas = nest_dashas_by_parent_id(dashas)
    
    # Get current dasha (from flat list for easier search)
    current_dasha = get_current_dasha(dashas)
    
    # Normalize current dasha dates if it exists
    if current_dasha:
        current_dasha["start_date"] = format_dasha_date(current_dasha.get("start_date"))
        current_dasha["end_date"] = format_dasha_date(current_dasha.get("end_date"))
    
    return {
        "system": system,
        "dashas": nested_dashas,
        "current": current_dasha,
        "depth": depth
    }

@router.get("/node/{dasha_id}/children")
async def get_dasha_children(
    dasha_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get children dashas for a parent dasha"""
    parent_dasha = db.query(Dasha).filter(Dasha.id == dasha_id).first()
    
    if not parent_dasha:
        raise HTTPException(status_code=404, detail="Dasha not found")
    
    # Verify ownership
    natal_chart = db.query(NatalChart).filter(
        NatalChart.id == parent_dasha.natal_chart_id
    ).first()
    
    profile = db.query(Profile).filter(
        Profile.id == natal_chart.profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get children
    children = db.query(Dasha).filter(
        Dasha.parent_id == dasha_id
    ).order_by(Dasha.start_date).all()
    
    return {
        "parent": {
            "id": parent_dasha.id,
            "lord": parent_dasha.lord,
            "level": parent_dasha.level.value
        },
        "children": [
            {
                "id": d.id,
                "lord": d.lord,
                "level": d.level.value,
                "start_date": format_dasha_date(d.start_date),
                "end_date": format_dasha_date(d.end_date),
                "has_children": db.query(Dasha).filter(Dasha.parent_id == d.id).count() > 0
            }
            for d in children
        ]
    }

def get_or_compute_dashas(natal_chart: NatalChart, profile: Profile, system: str, db: Session):
    """Get cached dashas or compute new ones"""
    # Convert string to enum for comparison
    try:
        system_enum = DashaSystem[system]  # e.g., DashaSystem["VIMSHOTTARI"]
    except KeyError:
        system_enum = DashaSystem.VIMSHOTTARI  # Default
    
    # Check if dashas exist
    existing = db.query(Dasha).filter(
        Dasha.natal_chart_id == natal_chart.id,
        Dasha.system == system_enum
    ).first()
    
    if existing:
        # Return all dashas for this system
        all_dashas = db.query(Dasha).filter(
            Dasha.natal_chart_id == natal_chart.id,
            Dasha.system == system_enum
        ).order_by(Dasha.start_date).all()
        
        return [
            {
                "id": d.id,
                "lord": d.lord,
                "level": d.level.value,
                "start_date": format_dasha_date(d.start_date),
                "end_date": format_dasha_date(d.end_date),
                "parent_id": d.parent_id,
                "has_children": db.query(Dasha).filter(Dasha.parent_id == d.id).count() > 0
            }
            for d in all_dashas
        ]
    
    # Compute new dashas
    from zoneinfo import ZoneInfo
    from datetime import timezone
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
        birth_datetime = birth_datetime.replace(tzinfo=timezone.utc)
        print(f"Warning: Invalid timezone '{profile.timezone}', using UTC: {e}")
    
    # Get Moon longitude
    moon_pos = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id,
        PlanetaryPosition.planet == "MOON"
    ).first()
    
    if not moon_pos:
        raise HTTPException(status_code=500, detail="Moon position not found")
    
    # Calculate dashas
    if system == "VIMSHOTTARI":
        maha_dashas = dasha_engine.calculate_dashas(
            "vimshottari",
            birth_datetime,
            moon_pos.longitude,
            num_years=120
        )
        
        # Store Maha Dashas and compute all 5 levels
        calculator = VimshottariDasha(birth_datetime, moon_pos.longitude)
        
        for maha in maha_dashas[:10]:  # First 10 Maha Dashas
            maha_record = Dasha(
                natal_chart_id=natal_chart.id,
                system=DashaSystem.VIMSHOTTARI,
                level=DashaLevel.MAHA,
                lord=maha["lord"],
                start_date=maha["start_date"],
                end_date=maha["end_date"],
                parent_id=None
            )
            db.add(maha_record)
            db.flush()
            
            # Calculate Antar Dashas
            antar_dashas = calculator.calculate_antar_dashas(maha)
            for antar in antar_dashas:
                antar_record = Dasha(
                    natal_chart_id=natal_chart.id,
                    system=DashaSystem.VIMSHOTTARI,
                    level=DashaLevel.ANTAR,
                    lord=antar["lord"],
                    start_date=antar["start_date"],
                    end_date=antar["end_date"],
                    parent_id=maha_record.id
                )
                db.add(antar_record)
                db.flush()
                
                # Calculate Pratyantar Dashas for ALL Antars
                pratyantar_dashas = calculator.calculate_pratyantar_dashas(antar)
                for pratyantar in pratyantar_dashas:
                    pratyantar_record = Dasha(
                        natal_chart_id=natal_chart.id,
                        system=DashaSystem.VIMSHOTTARI,
                        level=DashaLevel.PRATYANTAR,
                        lord=pratyantar["lord"],
                        start_date=pratyantar["start_date"],
                        end_date=pratyantar["end_date"],
                        parent_id=antar_record.id
                    )
                    db.add(pratyantar_record)
                    db.flush()
                    
                    # Calculate Sookshma Dashas for ALL Pratyantars
                    sookshma_dashas = calculator.calculate_sookshma_dashas(pratyantar)
                    for sookshma in sookshma_dashas:
                        sookshma_record = Dasha(
                            natal_chart_id=natal_chart.id,
                            system=DashaSystem.VIMSHOTTARI,
                            level=DashaLevel.SOOKSHMA,
                            lord=sookshma["lord"],
                            start_date=sookshma["start_date"],
                            end_date=sookshma["end_date"],
                            parent_id=pratyantar_record.id
                        )
                        db.add(sookshma_record)
                        db.flush()
                        
                        # Calculate Prana Dashas for ALL Sookshmas
                        prana_dashas = calculator.calculate_prana_dashas(sookshma)
                        for prana in prana_dashas:
                            prana_record = Dasha(
                                natal_chart_id=natal_chart.id,
                                system=DashaSystem.VIMSHOTTARI,
                                level=DashaLevel.PRANA,
                                lord=prana["lord"],
                                start_date=prana["start_date"],
                                end_date=prana["end_date"],
                                parent_id=sookshma_record.id
                            )
                            db.add(prana_record)
    
    else:
        # Other systems (simplified - only Maha level stored)
        if system == "CHARA":
            # Get planets for Chara Dasha
            all_positions = db.query(PlanetaryPosition).filter(
                PlanetaryPosition.natal_chart_id == natal_chart.id
            ).all()
            
            planets_dict = {pos.planet: {"longitude": pos.longitude, "rasi": pos.rasi} for pos in all_positions}
            
            maha_dashas = dasha_engine.calculate_dashas(
                "chara",
                birth_datetime,
                moon_pos.longitude,
                ascendant=natal_chart.ascendant,
                planets=planets_dict,
                num_years=120
            )
        else:
            maha_dashas = dasha_engine.calculate_dashas(
                system.lower(),
                birth_datetime,
                moon_pos.longitude,
                num_years=120
            )
        
        for maha in maha_dashas[:20]:
            maha_record = Dasha(
                natal_chart_id=natal_chart.id,
                system=system_enum,
                level=DashaLevel.MAHA,
                lord=maha["lord"],
                start_date=maha["start_date"],
                end_date=maha["end_date"],
                parent_id=None
            )
            db.add(maha_record)
    
    db.commit()
    
    # Return all dashas
    all_dashas = db.query(Dasha).filter(
        Dasha.natal_chart_id == natal_chart.id,
        Dasha.system == system_enum
    ).order_by(Dasha.start_date).all()
    
    return [
        {
            "id": d.id,
            "lord": d.lord,
            "level": d.level.value,
            "start_date": format_dasha_date(d.start_date),
            "end_date": format_dasha_date(d.end_date),
            "parent_id": d.parent_id,
            "has_children": db.query(Dasha).filter(Dasha.parent_id == d.id).count() > 0
        }
        for d in all_dashas
    ]

def get_current_dasha(dashas):
    """Get currently running dasha"""
    now = datetime.now()

    for dasha in dashas:
        start_str = dasha.get("start_date")
        end_str = dasha.get("end_date")

        if not start_str or not end_str:
            continue

        try:
            # Handle both timezone-aware and naive datetime strings
            start_str_clean = start_str.replace("Z", "+00:00")
            end_str_clean = end_str.replace("Z", "+00:00")

            start = datetime.fromisoformat(start_str_clean)
            end = datetime.fromisoformat(end_str_clean)

            # Normalize to naive datetimes
            if start.tzinfo is not None:
                start = start.replace(tzinfo=None)
            if end.tzinfo is not None:
                end = end.replace(tzinfo=None)

            if start <= now < end:
                return dasha

        except (ValueError, AttributeError, TypeError):
            # Skip invalid date formats
            continue

    return None
