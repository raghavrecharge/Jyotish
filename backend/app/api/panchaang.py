"""
Panchaang (Panchang) API endpoints
Provides Vedic calendar data: Tithi, Nakshatra, Yoga, Karana, Paksha
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, time
from typing import Optional, Dict, List
from zoneinfo import ZoneInfo
import swisseph as swe

from app.core.database import get_db
from app.models.profile import Profile
from app.modules.ephemeris.calculator import ephemeris

router = APIRouter(prefix="/api/panchaang", tags=["panchaang"])


def calculate_tithi_info(moon_longitude: float, sun_longitude: float) -> Dict:
    """
    Calculate tithi (lunar day) information.
    Tithi is based on angular distance between Sun and Moon.
    Each tithi is 12 degrees of separation.
    """
    # Calculate angular distance (moon ahead of sun)
    diff = (moon_longitude - sun_longitude) % 360
    
    # Tithi number (0-29, where 0-14 is waxing, 15-29 is waning)
    tithi_num = int(diff / 12)
    
    # Degree within tithi (0-12)
    degree_in_tithi = diff % 12
    
    # Tithi names (Vedic)
    tithi_names = [
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
        "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
        "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
        "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
        "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
    ]
    
    paksha = "Shukla" if tithi_num < 15 else "Krishna"
    tithi_in_paksha = tithi_num % 15
    
    return {
        "tithi_num": tithi_num,
        "tithi_name": tithi_names[tithi_num],
        "tithi_in_paksha": tithi_in_paksha + 1,
        "paksha": paksha,
        "degree_in_tithi": round(degree_in_tithi, 2),
        "progress_percent": round((degree_in_tithi / 12) * 100, 2)
    }


def calculate_nakshatra_info(moon_longitude: float) -> Dict:
    """
    Calculate Nakshatra (lunar constellation) information.
    There are 27 nakshatras, each occupying 13° 20' (13.333°) of the zodiac.
    """
    # Normalize moon longitude to 0-360
    moon_lon = moon_longitude % 360
    
    # Calculate nakshatra number (0-26)
    nakshatra_num = int(moon_lon / 13.333333)
    
    # Degree within nakshatra
    degree_in_nakshatra = moon_lon % 13.333333
    
    # Nakshatra names
    nakshatra_names = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha",
        "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
        "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
        "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
        "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
        "Uttara Bhadrapada", "Revati"
    ]
    
    # Nakshatra lords (Dashas)
    nakshatra_lords = [
        "Ketu", "Venus", "Sun", "Moon", "Mars",
        "Rahu", "Jupiter", "Saturn", "Mercury", "Ketu",
        "Venus", "Sun", "Moon", "Mars", "Rahu",
        "Jupiter", "Saturn", "Mercury", "Ketu", "Venus",
        "Sun", "Moon", "Mars", "Rahu", "Jupiter",
        "Saturn", "Mercury"
    ]
    
    return {
        "nakshatra_num": nakshatra_num,
        "nakshatra_name": nakshatra_names[nakshatra_num],
        "nakshatra_lord": nakshatra_lords[nakshatra_num],
        "degree_in_nakshatra": round(degree_in_nakshatra, 2),
        "progress_percent": round((degree_in_nakshatra / 13.333333) * 100, 2)
    }


def calculate_yoga_info(sun_longitude: float, moon_longitude: float) -> Dict:
    """
    Calculate Yoga (auspicious combination).
    Yoga is based on sum of sun and moon longitudes.
    There are 27 yogas.
    """
    # Sum of sun and moon longitudes
    combined_lon = (sun_longitude + moon_longitude) % 360
    
    # Yoga number (0-26)
    yoga_num = int(combined_lon / 13.333333)
    
    # Degree within yoga
    degree_in_yoga = combined_lon % 13.333333
    
    # Yoga names
    yoga_names = [
        "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
        "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
        "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
        "Siddhi", "Sadhya", "Shubha", "Shukla", "Brahma",
        "Indra", "Vaidhriti", "Parigha", "Shiva", "Siddha",
        "Sadharana", "Pramada"
    ]
    
    return {
        "yoga_num": yoga_num,
        "yoga_name": yoga_names[yoga_num],
        "degree_in_yoga": round(degree_in_yoga, 2),
        "progress_percent": round((degree_in_yoga / 13.333333) * 100, 2)
    }


def calculate_karana_info(moon_longitude: float, sun_longitude: float) -> Dict:
    """
    Calculate Karana (half lunar day).
    Karana is half of a tithi (6 degrees of separation).
    There are 60 karanas in a lunar month.
    """
    # Angular distance (moon ahead of sun)
    diff = (moon_longitude - sun_longitude) % 360
    
    # Karana number (0-59)
    karana_num = int(diff / 6)
    
    # Degree within karana
    degree_in_karana = diff % 6
    
    # Karana names (fixed + variable)
    fixed_karanas = ["Kava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"]
    variable_karanas = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", 
                       "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga"]
    
    # First two karanas are fixed, then repeating pattern
    karana_pattern = fixed_karanas + (variable_karanas * 6)
    
    return {
        "karana_num": karana_num,
        "karana_name": karana_pattern[karana_num % len(karana_pattern)] if karana_num < len(karana_pattern) else "Unknown",
        "degree_in_karana": round(degree_in_karana, 2),
        "progress_percent": round((degree_in_karana / 6) * 100, 2)
    }


def calculate_sunrise_sunset(dt: datetime, latitude: float, longitude: float, tz: str) -> Dict:
    """Calculate sunrise and sunset times for given date and location."""
    try:
        # Use date at midnight for rise/set calculation
        date_at_midnight = dt.replace(hour=0, minute=0, second=0, microsecond=0)
        jd = ephemeris.get_julian_day(date_at_midnight)
        
        # Swiss Ephemeris expects eastern longitude as positive
        # Calculate sunrise
        rise_result = swe.rise_trans(jd, swe.SUN, geopos=(longitude, latitude, 0), rsmi=swe.CALC_RISE | swe.BIT_DISC_CENTER)
        sunrise_jd = rise_result[1][0] if rise_result[0] >= 0 else None
        
        # Calculate sunset
        set_result = swe.rise_trans(jd, swe.SUN, geopos=(longitude, latitude, 0), rsmi=swe.CALC_SET | swe.BIT_DISC_CENTER)
        sunset_jd = set_result[1][0] if set_result[0] >= 0 else None
        
        if not sunrise_jd or not sunset_jd:
            return {"sunrise": "N/A", "sunset": "N/A", "sunrise_dt": None, "sunset_dt": None}
        
        # Convert JD to UTC datetime first, then to local timezone
        utc_zone = ZoneInfo("UTC")
        local_zone = ZoneInfo(tz) if tz else ZoneInfo("UTC")
        
        sunrise_tuple = swe.revjul(sunrise_jd)
        hour = int(sunrise_tuple[3])
        minute = int((sunrise_tuple[3] - hour) * 60)
        second = int(((sunrise_tuple[3] - hour) * 60 - minute) * 60)
        sunrise_utc = datetime(int(sunrise_tuple[0]), int(sunrise_tuple[1]), int(sunrise_tuple[2]),
                              hour, minute, second, tzinfo=utc_zone)
        sunrise = sunrise_utc.astimezone(local_zone)
        
        sunset_tuple = swe.revjul(sunset_jd)
        hour = int(sunset_tuple[3])
        minute = int((sunset_tuple[3] - hour) * 60)
        second = int(((sunset_tuple[3] - hour) * 60 - minute) * 60)
        sunset_utc = datetime(int(sunset_tuple[0]), int(sunset_tuple[1]), int(sunset_tuple[2]),
                             hour, minute, second, tzinfo=utc_zone)
        sunset = sunset_utc.astimezone(local_zone)
        
        return {
            "sunrise": sunrise.strftime("%H:%M"),
            "sunset": sunset.strftime("%H:%M"),
            "sunrise_dt": sunrise,
            "sunset_dt": sunset
        }
    except Exception as e:
        import traceback
        print(f"Error calculating sunrise/sunset: {e}")
        print(traceback.format_exc())
        return {"sunrise": "N/A", "sunset": "N/A", "sunrise_dt": None, "sunset_dt": None}


def calculate_moonrise_moonset(dt: datetime, latitude: float, longitude: float, tz: str) -> Dict:
    """Calculate moonrise and moonset times for given date and location."""
    try:
        date_at_midnight = dt.replace(hour=0, minute=0, second=0, microsecond=0)
        jd = ephemeris.get_julian_day(date_at_midnight)
        
        # Calculate moonrise
        rise_result = swe.rise_trans(jd, swe.MOON, geopos=(longitude, latitude, 0), rsmi=swe.CALC_RISE | swe.BIT_DISC_CENTER)
        moonrise_jd = rise_result[1][0] if rise_result[0] >= 0 else None
        
        # Calculate moonset
        set_result = swe.rise_trans(jd, swe.MOON, geopos=(longitude, latitude, 0), rsmi=swe.CALC_SET | swe.BIT_DISC_CENTER)
        moonset_jd = set_result[1][0] if set_result[0] >= 0 else None
        
        if not moonrise_jd or not moonset_jd:
            return {"moonrise": "N/A", "moonset": "N/A"}
        
        # Convert JD to UTC datetime first, then to local timezone
        utc_zone = ZoneInfo("UTC")
        local_zone = ZoneInfo(tz) if tz else ZoneInfo("UTC")
        
        moonrise_tuple = swe.revjul(moonrise_jd)
        hour = int(moonrise_tuple[3])
        minute = int((moonrise_tuple[3] - hour) * 60)
        second = int(((moonrise_tuple[3] - hour) * 60 - minute) * 60)
        moonrise_utc = datetime(int(moonrise_tuple[0]), int(moonrise_tuple[1]), int(moonrise_tuple[2]),
                               hour, minute, second, tzinfo=utc_zone)
        moonrise = moonrise_utc.astimezone(local_zone)
        
        moonset_tuple = swe.revjul(moonset_jd)
        hour = int(moonset_tuple[3])
        minute = int((moonset_tuple[3] - hour) * 60)
        second = int(((moonset_tuple[3] - hour) * 60 - minute) * 60)
        moonset_utc = datetime(int(moonset_tuple[0]), int(moonset_tuple[1]), int(moonset_tuple[2]),
                              hour, minute, second, tzinfo=utc_zone)
        moonset = moonset_utc.astimezone(local_zone)
        
        return {
            "moonrise": moonrise.strftime("%H:%M"),
            "moonset": moonset.strftime("%H:%M")
        }
    except Exception as e:
        import traceback
        print(f"Error calculating moonrise/moonset: {e}")
        print(traceback.format_exc())
        return {"moonrise": "N/A", "moonset": "N/A"}


def calculate_inauspicious_times(sunrise_dt: datetime, sunset_dt: datetime) -> Dict:
    """Calculate Rahu Kalam, Yamaganda, and Gulika periods."""
    if not sunrise_dt or not sunset_dt:
        return {
            "rahu_kalam": "N/A",
            "yamaganda": "N/A",
            "gulika": "N/A",
            "dur_muhurtam": "N/A"
        }
    
    # Day duration in minutes
    day_duration = (sunset_dt - sunrise_dt).total_seconds() / 60
    segment = day_duration / 8  # Divide day into 8 parts
    
    # Weekday (0=Monday, 6=Sunday)
    weekday = sunrise_dt.weekday()
    
    # Rahu Kalam segments by weekday
    rahu_segments = {0: 7, 1: 1, 2: 6, 3: 4, 4: 5, 5: 3, 6: 2}  # Mon-Sun
    yamaganda_segments = {0: 4, 1: 3, 2: 2, 3: 1, 4: 7, 5: 6, 6: 5}
    gulika_segments = {0: 6, 1: 5, 2: 4, 3: 3, 4: 2, 5: 1, 6: 7}
    
    rahu_seg = rahu_segments.get(weekday, 2)
    yama_seg = yamaganda_segments.get(weekday, 4)
    guli_seg = gulika_segments.get(weekday, 6)
    
    rahu_start = sunrise_dt + timedelta(minutes=(rahu_seg - 1) * segment)
    rahu_end = rahu_start + timedelta(minutes=segment)
    
    yama_start = sunrise_dt + timedelta(minutes=(yama_seg - 1) * segment)
    yama_end = yama_start + timedelta(minutes=segment)
    
    guli_start = sunrise_dt + timedelta(minutes=(guli_seg - 1) * segment)
    guli_end = guli_start + timedelta(minutes=segment)
    
    # Dur Muhurtam (2 minutes before sunrise)
    dur_start = sunrise_dt - timedelta(minutes=3)
    dur_end = sunrise_dt - timedelta(minutes=1)
    
    return {
        "rahu_kalam": f"{rahu_start.strftime('%H:%M')} - {rahu_end.strftime('%H:%M')}",
        "yamaganda": f"{yama_start.strftime('%H:%M')} - {yama_end.strftime('%H:%M')}",
        "gulika": f"{guli_start.strftime('%H:%M')} - {guli_end.strftime('%H:%M')}",
        "dur_muhurtam": f"{dur_start.strftime('%H:%M')} - {dur_end.strftime('%H:%M')}"
    }


def calculate_auspicious_times(sunrise_dt: datetime, sunset_dt: datetime) -> Dict:
    """Calculate Abhijeet Muhurta and Amrit Kalam."""
    if not sunrise_dt or not sunset_dt:
        return {"abhijeet": "N/A", "amrit_kalam": "None"}
    
    # Abhijeet Muhurta: Middle of the day, 24 minutes duration
    noon = sunrise_dt + (sunset_dt - sunrise_dt) / 2
    abhijeet_start = noon - timedelta(minutes=12)
    abhijeet_end = noon + timedelta(minutes=12)
    
    # Amrit Kalam calculation is complex; for now mark as conditional
    amrit_kalam = "None"  # Placeholder
    
    return {
        "abhijeet": f"{abhijeet_start.strftime('%H:%M')} - {abhijeet_end.strftime('%H:%M')}",
        "amrit_kalam": amrit_kalam
    }


def calculate_additional_info(dt: datetime, sun_lon: float, moon_lon: float) -> Dict:
    """Calculate Shaka era, months, weekday, sun/moon signs."""
    # Shaka era: Current year - 78
    shaka_year = dt.year - 78
    
    # Samvatsara (60-year cycle names)
    samvatsara_names = [
        "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapati",
        "Angiras", "Shrimukha", "Bhava", "Yuvan", "Dhatri",
        "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vrisha",
        "Chitrabhanu", "Svabhanu", "Tarana", "Parthiva", "Vyaya",
        "Sarvajit", "Sarvadharin", "Virodhin", "Vikrita", "Khara",
        "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha",
        "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava",
        "Shubhakrit", "Shobhana", "Krodhin", "Vishvavasu", "Parabhava",
        "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhakrit",
        "Paridhavi", "Pramadin", "Ananda", "Rakshasa", "Anala",
        "Pingala", "Kalayukta", "Siddharthi", "Raudra", "Durmati",
        "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya"
    ]
    samvatsara = samvatsara_names[(shaka_year - 1) % 60]
    
    # Moon sign and Sun sign
    moon_sign_num = int(moon_lon / 30) % 12
    sun_sign_num = int(sun_lon / 30) % 12
    
    sign_names = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    
    moon_sign = sign_names[moon_sign_num]
    sun_sign = sign_names[sun_sign_num]
    
    # Vedic month names (approximate based on sun sign)
    amanta_months = [
        "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
        "Ashwina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"
    ]
    purnimant_months = amanta_months.copy()
    
    # Approximate month based on sun's rasi (sun_sign_num)
    amanta_month = amanta_months[(sun_sign_num - 1) % 12]
    purnimant_month = purnimant_months[sun_sign_num % 12]
    
    # Weekday
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    weekday = weekdays[dt.weekday()]
    
    return {
        "shaka_year": shaka_year,
        "samvatsara": samvatsara,
        "amanta_month": amanta_month,
        "purnimant_month": purnimant_month,
        "sun_sign": sun_sign,
        "moon_sign": moon_sign,
        "weekday": weekday
    }



def calculate_choghadiya(sunrise_dt, sunset_dt, weekday):
    """Calculate Day Choghadiya - 8 divisions of the day with their qualities."""
    if not sunrise_dt or not sunset_dt:
        return []
    
    quality_meanings = {
        "Labh": {"meaning": "Gain", "color": "#22c55e"},
        "Amrit": {"meaning": "Best", "color": "#06b6d4"},
        "Kaal": {"meaning": "Bad", "color": "#ef4444"},
        "Shubh": {"meaning": "Good", "color": "#f59e0b"},
        "Rog": {"meaning": "Disease", "color": "#ec4899"},
    }
    
    day_duration = (sunset_dt - sunrise_dt).total_seconds() / 60
    segment_duration = day_duration / 8
    
    start_qualities = [
        ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Kaal", "Labh", "Amrit"],
        ["Amrit", "Shubh", "Rog", "Kaal", "Labh", "Amrit", "Shubh", "Rog"],
        ["Shubh", "Rog", "Kaal", "Labh", "Amrit", "Shubh", "Rog", "Kaal"],
        ["Rog", "Kaal", "Labh", "Amrit", "Shubh", "Rog", "Kaal", "Labh"],
        ["Kaal", "Labh", "Amrit", "Shubh", "Rog", "Kaal", "Labh", "Amrit"],
        ["Labh", "Amrit", "Shubh", "Rog", "Kaal", "Labh", "Amrit", "Shubh"],
        ["Amrit", "Shubh", "Rog", "Kaal", "Labh", "Amrit", "Shubh", "Rog"]
    ]
    
    choghadiya_list = []
    qualities_today = start_qualities[weekday % 7]
    
    for idx in range(8):
        start_time = sunrise_dt + timedelta(minutes=idx * segment_duration)
        end_time = start_time + timedelta(minutes=segment_duration)
        quality = qualities_today[idx]
        
        choghadiya_list.append({
            "index": idx + 1,
            "quality": quality,
            "meaning": quality_meanings.get(quality, {}).get("meaning", quality),
            "start_time": start_time.strftime("%H:%M"),
            "end_time": end_time.strftime("%H:%M"),
            "color": quality_meanings.get(quality, {}).get("color", "#64748b"),
        })
    
    return choghadiya_list



def calculate_choghadiya(sunrise_dt, sunset_dt, weekday):
    """Calculate Day Choghadiya - 8 divisions of the day with their qualities."""
    if not sunrise_dt or not sunset_dt:
        return []
    
    quality_meanings = {
        "Labh": {"meaning": "Gain", "color": "#22c55e"},
        "Amrit": {"meaning": "Best", "color": "#06b6d4"},
        "Kaal": {"meaning": "Bad", "color": "#ef4444"},
        "Shubh": {"meaning": "Good", "color": "#f59e0b"},
        "Rog": {"meaning": "Disease", "color": "#ec4899"},
    }
    
    day_duration = (sunset_dt - sunrise_dt).total_seconds() / 60
    segment_duration = day_duration / 8
    
    start_qualities = [
        ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Kaal", "Labh", "Amrit"],
        ["Amrit", "Shubh", "Rog", "Kaal", "Labh", "Amrit", "Shubh", "Rog"],
        ["Shubh", "Rog", "Kaal", "Labh", "Amrit", "Shubh", "Rog", "Kaal"],
        ["Rog", "Kaal", "Labh", "Amrit", "Shubh", "Rog", "Kaal", "Labh"],
        ["Kaal", "Labh", "Amrit", "Shubh", "Rog", "Kaal", "Labh", "Amrit"],
        ["Labh", "Amrit", "Shubh", "Rog", "Kaal", "Labh", "Amrit", "Shubh"],
        ["Amrit", "Shubh", "Rog", "Kaal", "Labh", "Amrit", "Shubh", "Rog"]
    ]
    
    choghadiya_list = []
    qualities_today = start_qualities[weekday % 7]
    
    for idx in range(8):
        start_time = sunrise_dt + timedelta(minutes=idx * segment_duration)
        end_time = start_time + timedelta(minutes=segment_duration)
        quality = qualities_today[idx]
        
        choghadiya_list.append({
            "index": idx + 1,
            "quality": quality,
            "meaning": quality_meanings.get(quality, {}).get("meaning", quality),
            "start_time": start_time.strftime("%H:%M"),
            "end_time": end_time.strftime("%H:%M"),
            "color": quality_meanings.get(quality, {}).get("color", "#64748b"),
        })
    
    return choghadiya_list


def calculate_panchaang(birth_datetime: datetime, latitude: float, longitude: float, ayanamsa: str) -> Dict:
    """
    Calculate complete Panchaang data for given datetime and location.
    """
    try:
        # Calculate planetary positions at given datetime
        jd = ephemeris.get_julian_day(birth_datetime)
        planets = ephemeris.get_all_planets(jd)
        
        sun_lon = planets["SUN"]["longitude"]
        moon_lon = planets["MOON"]["longitude"]
        
        # Calculate all panchaang elements
        tithi = calculate_tithi_info(moon_lon, sun_lon)
        nakshatra = calculate_nakshatra_info(moon_lon)
        yoga = calculate_yoga_info(sun_lon, moon_lon)
        karana = calculate_karana_info(moon_lon, sun_lon)
        
        # Get timezone from datetime or use profile timezone
        if birth_datetime.tzinfo:
            tz_str = str(birth_datetime.tzinfo)
        else:
            tz_str = "Asia/Kolkata"  # Default fallback
        
        # Calculate sunrise/sunset and moonrise/moonset
        sun_times = calculate_sunrise_sunset(birth_datetime, latitude, longitude, tz_str)
        moon_times = calculate_moonrise_moonset(birth_datetime, latitude, longitude, tz_str)
        
        # Calculate inauspicious and auspicious times
        inauspicious = calculate_inauspicious_times(sun_times.get("sunrise_dt"), sun_times.get("sunset_dt"))
        auspicious = calculate_auspicious_times(sun_times.get("sunrise_dt"), sun_times.get("sunset_dt"))
        
        # Calculate additional info
        additional = calculate_additional_info(birth_datetime, sun_lon, moon_lon)
        
        return {
            "datetime": birth_datetime.isoformat(),
            "sun_longitude": round(sun_lon, 4),
            "moon_longitude": round(moon_lon, 4),
            "tithi": tithi,
            "nakshatra": nakshatra,
            "yoga": yoga,
            "karana": karana,
            "ayanamsa": ayanamsa,
            "sunrise": sun_times["sunrise"],
            "sunset": sun_times["sunset"],
            "moonrise": moon_times["moonrise"],
            "moonset": moon_times["moonset"],
            "rahu_kalam": inauspicious["rahu_kalam"],
            "yamaganda": inauspicious["yamaganda"],
            "gulika": inauspicious["gulika"],
            "dur_muhurtam": inauspicious["dur_muhurtam"],
            "abhijeet": auspicious["abhijeet"],
            "amrit_kalam": auspicious["amrit_kalam"],
            "shaka_year": additional["shaka_year"],
            "samvatsara": additional["samvatsara"],
            "amanta_month": additional["amanta_month"],
            "purnimant_month": additional["purnimant_month"],
            "sun_sign": additional["sun_sign"],
            "moon_sign": additional["moon_sign"],
            "weekday": additional["weekday"]
        ,
            "choghadiya": calculate_choghadiya(sun_times.get("sunrise_dt"), sun_times.get("sunset_dt"), birth_datetime.weekday()),
            "choghadiya": calculate_choghadiya(sun_times.get("sunrise_dt"), sun_times.get("sunset_dt"), birth_datetime.weekday())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating panchaang: {str(e)}")


def find_transition_time(start_dt: datetime, latitude: float, longitude: float, ayanamsa: str, 
                         element_type: str, target_value: Optional[int] = None, direction: str = "forward") -> datetime:
    """
    Find when panchaang element transitions (tithi, nakshatra, yoga, karana).
    """
    current_dt = start_dt
    step = timedelta(minutes=1)
    
    if direction == "backward":
        step = -step
    
    current_panchaang = calculate_panchaang(current_dt, latitude, longitude, ayanamsa)
    current_value = current_panchaang[element_type].get(f"{element_type}_num")
    
    max_iterations = 24 * 60  # 24 hours max search
    iterations = 0
    
    while iterations < max_iterations:
        current_dt += step
        iterations += 1
        
        try:
            next_panchaang = calculate_panchaang(current_dt, latitude, longitude, ayanamsa)
            next_value = next_panchaang[element_type].get(f"{element_type}_num")
            
            # Check if value changed
            if next_value != current_value:
                if direction == "forward":
                    return current_dt
                else:
                    return current_dt - step
            
            current_value = next_value
        except Exception:
            continue
    
    # Fallback
    return current_dt + (step * max_iterations / 2)


@router.get("/{profile_id}")
async def get_panchaang(
    profile_id: int,
    db: Session = Depends(get_db)
):
    """
    Get Panchaang data for profile's birth date/time with previous and next transitions.
    Returns: current, prev (last transition), and next (upcoming transition) panchaang data.
    """
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Build birth datetime with timezone
    birth_datetime = datetime.combine(
        profile.birth_date.date(),
        datetime.strptime(profile.birth_time, "%H:%M:%S").time()
    )
    
    try:
        tz = ZoneInfo(profile.timezone)
        birth_datetime = birth_datetime.replace(tzinfo=tz)
    except Exception:
        from datetime import timezone
        birth_datetime = birth_datetime.replace(tzinfo=timezone.utc)
    
    # Calculate current panchaang
    current_panchaang = calculate_panchaang(
        birth_datetime,
        profile.latitude,
        profile.longitude,
        profile.ayanamsa
    )
    
    # Find previous tithi transition (most significant change)
    prev_time = find_transition_time(
        birth_datetime,
        profile.latitude,
        profile.longitude,
        profile.ayanamsa,
        "tithi",
        direction="backward"
    )
    
    prev_panchaang = calculate_panchaang(
        prev_time,
        profile.latitude,
        profile.longitude,
        profile.ayanamsa
    )
    
    # Find next tithi transition
    next_time = find_transition_time(
        birth_datetime,
        profile.latitude,
        profile.longitude,
        profile.ayanamsa,
        "tithi",
        direction="forward"
    )
    
    next_panchaang = calculate_panchaang(
        next_time,
        profile.latitude,
        profile.longitude,
        profile.ayanamsa
    )
    
    return {
        "profile": {
            "name": profile.name,
            "birth_date": profile.birth_date.isoformat(),
            "birth_time": profile.birth_time,
            "latitude": profile.latitude,
            "longitude": profile.longitude,
            "timezone": profile.timezone,
            "ayanamsa": profile.ayanamsa
        },
        "prev": {
            "datetime": prev_time.isoformat(),
            "panchaang": prev_panchaang,
            "time_until_current": str(birth_datetime - prev_time)
        },
        "current": {
            "datetime": birth_datetime.isoformat(),
            "panchaang": current_panchaang
        },
        "next": {
            "datetime": next_time.isoformat(),
            "panchaang": next_panchaang,
            "time_until_next": str(next_time - birth_datetime)
        }
    }


@router.get("/{profile_id}/date")
async def get_panchaang_for_date(
    profile_id: int,
    date: str,  # Format: YYYY-MM-DD
    time: str = "00:00:00",  # Format: HH:MM:SS
    db: Session = Depends(get_db)
):
    """
    Get Panchaang data for a specific date and time.
    """
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    try:
        # Parse the provided date and time
        target_datetime = datetime.combine(
            datetime.strptime(date, "%Y-%m-%d").date(),
            datetime.strptime(time, "%H:%M:%S").time()
        )
        
        tz = ZoneInfo(profile.timezone)
        target_datetime = target_datetime.replace(tzinfo=tz)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid date/time format: {str(e)}")
    
    # Calculate current panchaang
    current_panchaang = calculate_panchaang(
        target_datetime,
        profile.latitude,
        profile.longitude,
        profile.ayanamsa
    )
    
    # Find previous transition
    prev_time = find_transition_time(
        target_datetime,
        profile.latitude,
        profile.longitude,
        profile.ayanamsa,
        "tithi",
        direction="backward"
    )
    
    prev_panchaang = calculate_panchaang(
        prev_time,
        profile.latitude,
        profile.longitude,
        profile.ayanamsa
    )
    
    # Find next transition
    next_time = find_transition_time(
        target_datetime,
        profile.latitude,
        profile.longitude,
        profile.ayanamsa,
        "tithi",
        direction="forward"
    )
    
    next_panchaang = calculate_panchaang(
        next_time,
        profile.latitude,
        profile.longitude,
        profile.ayanamsa
    )
    
    return {
        "profile": {
            "name": profile.name,
            "latitude": profile.latitude,
            "longitude": profile.longitude,
            "timezone": profile.timezone,
            "ayanamsa": profile.ayanamsa
        },
        "prev": {
            "datetime": prev_time.isoformat(),
            "panchaang": prev_panchaang
        },
        "current": {
            "datetime": target_datetime.isoformat(),
            "panchaang": current_panchaang
        },
        "next": {
            "datetime": next_time.isoformat(),
            "panchaang": next_panchaang
        }
    }


@router.get("/{profile_id}/location")
async def get_panchaang_for_location(
    profile_id: int,
    date: str,  # Format: YYYY-MM-DD
    time: str = "00:00:00",  # Format: HH:MM:SS
    latitude: float = 26.5638,  # Default: Agra
    longitude: float = 78.7878,  # Default: Agra
    db: Session = Depends(get_db)
):
    """
    Get Panchaang data for a specific date, time, and location.
    This allows calculating panchaang for any location on Earth.
    """
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    try:
        # Parse the provided date and time
        target_datetime = datetime.combine(
            datetime.strptime(date, "%Y-%m-%d").date(),
            datetime.strptime(time, "%H:%M:%S").time()
        )
        
        tz = ZoneInfo(profile.timezone)
        target_datetime = target_datetime.replace(tzinfo=tz)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid date/time format: {str(e)}")
    
    # Calculate current panchaang using provided location
    current_panchaang = calculate_panchaang(
        target_datetime,
        latitude,
        longitude,
        profile.ayanamsa
    )
    
    # Find previous transition
    prev_time = find_transition_time(
        target_datetime,
        latitude,
        longitude,
        profile.ayanamsa,
        "tithi",
        direction="backward"
    )
    
    prev_panchaang = calculate_panchaang(
        prev_time,
        latitude,
        longitude,
        profile.ayanamsa
    )
    
    # Find next transition
    next_time = find_transition_time(
        target_datetime,
        latitude,
        longitude,
        profile.ayanamsa,
        "tithi",
        direction="forward"
    )
    
    next_panchaang = calculate_panchaang(
        next_time,
        latitude,
        longitude,
        profile.ayanamsa
    )
    
    return {
        "profile": {
            "name": profile.name,
            "latitude": latitude,
            "longitude": longitude,
            "timezone": profile.timezone,
            "ayanamsa": profile.ayanamsa
        },
        "prev": {
            "datetime": prev_time.isoformat(),
            "panchaang": prev_panchaang
        },
        "current": {
            "datetime": target_datetime.isoformat(),
            "panchaang": current_panchaang
        },
        "next": {
            "datetime": next_time.isoformat(),
            "panchaang": next_panchaang
        }
    }
