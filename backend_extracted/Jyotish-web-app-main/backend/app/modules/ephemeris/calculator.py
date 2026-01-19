import swisseph as swe
import os
from datetime import datetime, timezone
from typing import Dict, List, Tuple
import math
from app.core.config import settings
from zoneinfo import ZoneInfo

# Initialize Swiss Ephemeris
if not os.path.exists(settings.EPHEMERIS_PATH):
    os.makedirs(settings.EPHEMERIS_PATH)
swe.set_ephe_path(settings.EPHEMERIS_PATH)

print("✅ Swiss Ephemeris initialized")

# Ayanamsa mapping
AYANAMSA_MAP = {
    "LAHIRI": swe.SIDM_LAHIRI,
    "RAMAN": swe.SIDM_RAMAN,
    "KP": swe.SIDM_KRISHNAMURTI,
    "YUKTESHWAR": swe.SIDM_YUKTESHWAR
}

# Planet constants
PLANETS = {
    "SUN": swe.SUN, "MOON": swe.MOON, "MERCURY": swe.MERCURY,
    "VENUS": swe.VENUS, "MARS": swe.MARS, "JUPITER": swe.JUPITER,
    "SATURN": swe.SATURN, "RAHU": swe.MEAN_NODE, "KETU": swe.MEAN_NODE,
    "URANUS": swe.URANUS, "NEPTUNE": swe.NEPTUNE, "PLUTO": swe.PLUTO
}

# Nakshatra data
NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]

class EphemerisCalculator:
    def __init__(self, ayanamsa: str = "LAHIRI"):
        self.ayanamsa = ayanamsa.upper()
        sid_mode = AYANAMSA_MAP.get(self.ayanamsa, swe.SIDM_LAHIRI)
        swe.set_sid_mode(sid_mode)
        print(f"🌙 Ephemeris: Ayanamsa={self.ayanamsa} (mode={sid_mode})")
    
    def get_julian_day(self, dt: datetime) -> float:
        """Convert datetime to Julian Day - handles both naive and timezone-aware datetimes"""
        
        if dt.tzinfo is None:
            # Default IST → UTC for India (backward compatibility)
            ist_tz = ZoneInfo("Asia/Kolkata")
            dt = dt.replace(tzinfo=ist_tz).astimezone(timezone.utc)
            print(f"🌙 Converted naive datetime (assumed IST) to UTC: {dt}")
        else:
            # Convert timezone-aware datetime to UTC
            dt = dt.astimezone(timezone.utc)
            print(f"🌙 Converted timezone-aware datetime to UTC: {dt}")
        
        return swe.julday(dt.year, dt.month, dt.day,
                         dt.hour + dt.minute/60.0 + dt.second/3600.0)
    
    def get_ayanamsa(self, jd: float) -> float:
        """Get ayanamsa value for given Julian Day"""
        return swe.get_ayanamsa(jd)
    
    def get_planet_position(self, jd: float, planet: str, sidereal: bool = True) -> Dict:
        """Get position of a planet - FIXED FOR MOON 19.33°"""
        planet_id = PLANETS.get(planet.upper())
        if planet_id is None:
            raise ValueError(f"Unknown planet: {planet}")
        
        # ✅ PROPER FLAGS (Fixes Moon accuracy)
        flags = (swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_MOSEPH | swe.FLG_SIDEREAL)
        
        if planet.upper() == "KETU":
            result = swe.calc_ut(jd, PLANETS["RAHU"], flags)
            longitude = (result[0][0] + 180.0) % 360.0
            return {
                "longitude": longitude,
                "latitude": -result[0][1],
                "distance": result[0][2],
                "speed": -result[0][3],
                "is_retrograde": True
            }
        
        result = swe.calc_ut(jd, planet_id, flags)
        
        # 🌙 MOON DEBUG
        if planet.upper() == "MOON":
            print(f"🌙 MOON RAW: JD={jd:.3f}, Longitude={result[0][0]:.2f}°")
        
        return {
            "longitude": result[0][0] % 360,
            "latitude": result[0][1],
            "distance": result[0][2],
            "speed": result[0][3],
            "is_retrograde": result[0][3] < 0 if planet.upper() not in ["RAHU", "KETU"] else False
        }
    
    def get_all_planets(self, jd: float) -> Dict[str, Dict]:
        """Get positions of all planets - REQUIRED METHOD"""
        positions = {}
        for planet in ["SUN", "MOON", "MERCURY", "VENUS", "MARS", "JUPITER", "SATURN", "RAHU", "KETU"]:
            positions[planet] = self.get_planet_position(jd, planet)
        return positions
    
    def get_houses(self, jd: float, lat: float, lon: float) -> Tuple[float, List[float]]:
        """Calculate house cusps and ascendant using Placidus"""
        # Swiss Ephemeris: Eastern longitude = positive, Western = negative
        # India is East, so pass longitude as-is (no negation needed)
        cusps, ascmc = swe.houses(jd, lat, lon, b'P')
        ascendant = ascmc[0]
        return ascendant, list(cusps)
    
    def get_nakshatra(self, longitude: float) -> Tuple[str, int]:
        """Get nakshatra and pada"""
        nakshatra_span = 360.0 / 27.0
        nakshatra_index = int(longitude / nakshatra_span) % 27
        pada = int((longitude % nakshatra_span) / (nakshatra_span / 4)) + 1
        return NAKSHATRAS[nakshatra_index], pada
    
    def get_rasi(self, longitude: float) -> int:
        """Get rasi number (1-12)"""
        return int(longitude / 30.0) % 12 + 1
    
    def is_combust(self, planet_lon: float, sun_lon: float, planet: str) -> bool:
        """Check if planet is combust"""
        if planet.upper() in ["SUN", "RAHU", "KETU"]:
            return False
        
        combustion_degrees = {
            "MOON": 12, "MARS": 17, "MERCURY": 14,
            "JUPITER": 11, "VENUS": 10, "SATURN": 15
        }
        degrees = combustion_degrees.get(planet.upper(), 15)
        diff = abs(planet_lon - sun_lon)
        if diff > 180:
            diff = 360 - diff
        return diff <= degrees
    
    def get_dignity(self, planet: str, rasi: int) -> str:
        """Get planetary dignity"""
        dignity_map = {
            "SUN": {"own": [5], "exalted": [1], "debilitated": [7], "friend": [3, 9], "enemy": [6, 12]},
            "MOON": {"own": [4], "exalted": [2], "debilitated": [8], "friend": [5], "enemy": [10]},
            "MARS": {"own": [1, 8], "exalted": [10], "debilitated": [4], "friend": [5, 9, 12], "enemy": [2, 3, 6, 7, 11]},
            "MERCURY": {"own": [3, 6], "exalted": [6], "debilitated": [12], "friend": [2, 5], "enemy": [9]},
            "JUPITER": {"own": [9, 12], "exalted": [4], "debilitated": [10], "friend": [1, 5, 8], "enemy": [3, 6]},
            "VENUS": {"own": [2, 7], "exalted": [12], "debilitated": [6], "friend": [3, 8], "enemy": [5, 9]},
            "SATURN": {"own": [10, 11], "exalted": [7], "debilitated": [1], "friend": [3, 6], "enemy": [1, 4, 5]}
        }
        
        planet_dignity = dignity_map.get(planet.upper(), {})
        if rasi in planet_dignity.get("own", []): return "Own"
        elif rasi in planet_dignity.get("exalted", []): return "Exalted"
        elif rasi in planet_dignity.get("debilitated", []): return "Debilitated"
        elif rasi in planet_dignity.get("friend", []): return "Friend"
        elif rasi in planet_dignity.get("enemy", []): return "Enemy"
        return "Neutral"

# Global instance
ephemeris = EphemerisCalculator("LAHIRI")
