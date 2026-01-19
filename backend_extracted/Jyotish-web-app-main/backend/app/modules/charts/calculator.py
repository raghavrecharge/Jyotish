from typing import Dict, List
import hashlib
import json
from datetime import datetime
from app.modules.ephemeris.calculator import ephemeris

class DivisionalChartCalculator:
    """Calculate all divisional charts D1-D60"""
    
    DIVISIONS = {
        1: "Rasi", 2: "Hora", 3: "Drekkana", 4: "Chaturthamsa", 5: "Panchamsa",
        6: "Shashthamsa", 7: "Saptamsa", 8: "Ashtamsa", 9: "Navamsa", 10: "Dasamsa",
        11: "Ekadasamsa", 12: "Dwadasamsa", 16: "Shodasamsa", 20: "Vimsamsa",
        24: "Chaturvimsamsa", 27: "Saptavimsamsa", 30: "Trimsamsa", 40: "Khavedamsa",
        45: "Akshavedamsa", 60: "Shashtiamsa"
    }
    
    def calculate_divisional_position(self, longitude: float, division: int) -> int:
        """Calculate divisional chart position for a planet"""
        # Get rasi and degree within rasi
        rasi = int(longitude / 30.0)
        degree_in_rasi = longitude % 30.0
        
        # Calculate division within rasi
        division_size = 30.0 / division
        division_index = int(degree_in_rasi / division_size)
        
        # Calculate resulting rasi based on division type
        if division == 2:  # Hora
            if rasi % 2 == 0:  # Even sign
                result_rasi = 4 if division_index == 0 else 5
            else:  # Odd sign
                result_rasi = 5 if division_index == 0 else 4
        elif division == 3:  # Drekkana
            result_rasi = (rasi + (division_index * 4)) % 12
        elif division == 9:  # Navamsa - Standard Vedic Astrology
            # Navamsa follows standard zodiac progression
            # Each sign divided into 9 navaamsas (3° 20' each)
            # Aries starts Aries, Taurus starts Leo, Gemini starts Sagittarius, etc.
            # Formula: Each sign has 9 parts, so total parts = (rasi * 9) + pada
            # Then % 12 to get final sign
            navamsa_number = (rasi * 9) + division_index  # 0-107 for all 12 signs
            result_rasi = navamsa_number % 12
        elif division == 4:  # Chaturthamsa
            result_rasi = (rasi + division_index * 3) % 12
        elif division == 7:  # Saptamsa
            if rasi % 2 == 1:  # Odd sign
                result_rasi = (rasi + division_index) % 12
            else:  # Even sign
                result_rasi = (rasi + 6 + division_index) % 12
        elif division == 10:  # Dashamsa
            if rasi % 2 == 1:  # Odd sign
                result_rasi = (rasi + division_index) % 12
            else:  # Even sign
                result_rasi = (rasi + 8 + division_index) % 12
        elif division == 12:  # Dvadashamsa
            result_rasi = (rasi + division_index) % 12
        elif division == 16:  # Shodasamsa
            movable_signs = [0, 3, 6, 9]
            fixed_signs = [1, 4, 7, 10]
            if rasi in movable_signs:
                result_rasi = (0 + division_index) % 12
            elif rasi in fixed_signs:
                result_rasi = (4 + division_index) % 12
            else:
                result_rasi = (8 + division_index) % 12
        elif division == 20:  # Vimsamsa
            movable_signs = [0, 3, 6, 9]
            fixed_signs = [1, 4, 7, 10]
            if rasi in movable_signs:
                result_rasi = (0 + division_index) % 12
            elif rasi in fixed_signs:
                result_rasi = (8 + division_index) % 12
            else:
                result_rasi = (4 + division_index) % 12
        elif division == 24:  # Chaturvimsamsa
            if rasi % 2 == 1:
                result_rasi = (4 + division_index) % 12
            else:
                result_rasi = (3 + division_index) % 12
        elif division == 27:  # Nakshatramsa
            result_rasi = (rasi + division_index) % 12
        elif division == 30:  # Trimshamsa
            if rasi % 2 == 1:  # Odd
                if degree_in_rasi < 5:
                    result_rasi = 0
                elif degree_in_rasi < 10:
                    result_rasi = 9
                elif degree_in_rasi < 18:
                    result_rasi = 8
                elif degree_in_rasi < 25:
                    result_rasi = 2
                else:
                    result_rasi = 1
            else:  # Even
                if degree_in_rasi < 5:
                    result_rasi = 1
                elif degree_in_rasi < 12:
                    result_rasi = 2
                elif degree_in_rasi < 20:
                    result_rasi = 8
                elif degree_in_rasi < 25:
                    result_rasi = 9
                else:
                    result_rasi = 0
        elif division == 40:  # Khavedamsa
            movable_signs = [0, 3, 6, 9]
            fixed_signs = [1, 4, 7, 10]
            if rasi in movable_signs:
                result_rasi = (0 + division_index) % 12
            elif rasi in fixed_signs:
                result_rasi = (4 + division_index) % 12
            else:
                result_rasi = (8 + division_index) % 12
        elif division == 45:  # Akshavedamsa
            result_rasi = (rasi + division_index) % 12
        elif division == 60:  # Shashtiamsa
            result_rasi = (rasi + division_index) % 12
        else:
            result_rasi = (rasi + division_index) % 12
        
        return result_rasi + 1  # Return 1-based rasi number
    
    def calculate_all_divisions(self, planetary_positions: Dict[str, Dict]) -> Dict[int, Dict[str, int]]:
        """Calculate all divisional charts for all planets"""
        divisions = {}
        
        for div_num in self.DIVISIONS.keys():
            div_chart = {}
            for planet, pos in planetary_positions.items():
                div_chart[planet] = self.calculate_divisional_position(pos["longitude"], div_num)
            divisions[div_num] = div_chart
        
        return divisions

class ChartCalculator:
    """Main chart calculation engine"""
    
    def __init__(self):
        self.div_calculator = DivisionalChartCalculator()
    
    def generate_chart_hash(self, dt: datetime, lat: float, lon: float, ayanamsa: str) -> str:
        """Generate deterministic hash for chart caching"""
        data = f"{dt.isoformat()}_{lat}_{lon}_{ayanamsa}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    def calculate_natal_chart(self, dt: datetime, lat: float, lon: float, ayanamsa: str = "LAHIRI") -> Dict:
        """Calculate complete natal chart"""
        # Get Julian Day
        jd = ephemeris.get_julian_day(dt)
        
        # Get ayanamsa value
        ayanamsa_value = ephemeris.get_ayanamsa(jd)
        
        # Calculate houses and ascendant
        ascendant, house_cusps = ephemeris.get_houses(jd, lat, lon)
        
        # Apply ayanamsa to ascendant
        asc_sidereal = (ascendant - ayanamsa_value) % 360.0
        
        # Get all planetary positions
        planets = ephemeris.get_all_planets(jd)
        
        # Enhance planet data with additional info
        sun_lon = planets["SUN"]["longitude"]
        for planet, pos in planets.items():
            lon_val = pos["longitude"]
            pos["nakshatra"], pos["pada"] = ephemeris.get_nakshatra(lon_val)
            pos["rasi"] = ephemeris.get_rasi(lon_val)
            pos["degree_in_rasi"] = lon_val % 30.0
            pos["is_combust"] = ephemeris.is_combust(lon_val, sun_lon, planet)
            pos["dignity"] = ephemeris.get_dignity(planet, pos["rasi"])
        
        # Calculate MC (10th house cusp)
        mc = (house_cusps[9] - ayanamsa_value) % 360.0
        
        # Calculate divisional charts
        divisional_charts = self.div_calculator.calculate_all_divisions(planets)
        
        return {
            "julian_day": jd,
            "ayanamsa_value": ayanamsa_value,
            "ascendant": asc_sidereal,
            "mc": mc,
            "house_cusps": [(cusp - ayanamsa_value) % 360.0 for cusp in house_cusps],
            "planets": planets,
            "divisional_charts": divisional_charts,
            "chart_hash": self.generate_chart_hash(dt, lat, lon, ayanamsa)
        }

chart_calculator = ChartCalculator()
