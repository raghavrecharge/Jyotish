import swisseph as swe
from datetime import datetime
import pytz

birth = datetime(1990, 9, 20, 15, 15, 0)
tz = pytz.timezone('Asia/Kolkata')
birth_utc = tz.localize(birth).astimezone(pytz.UTC)
jd = swe.julday(birth_utc.year, birth_utc.month, birth_utc.day, 
                birth_utc.hour + birth_utc.minute/60.0)

print("Testing different Ayanamsas for Saturn position:")
print("=" * 60)

ayanamsas = {
    "Lahiri": swe.SIDM_LAHIRI,
    "Raman": swe.SIDM_RAMAN,
    "KP (Krishnamurti)": swe.SIDM_KRISHNAMURTI,
    "Yukteshwar": swe.SIDM_YUKTESHWAR,
    "Fagan/Bradley": swe.SIDM_FAGAN_BRADLEY
}

flags = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL

for name, mode in ayanamsas.items():
    swe.set_sid_mode(mode)
    ayanamsa_val = swe.get_ayanamsa(jd)
    result = swe.calc_ut(jd, swe.SATURN, flags)
    
    saturn_lon = result[0][0]
    saturn_rasi = int(saturn_lon / 30) + 1
    saturn_deg = saturn_lon % 30
    
    match = "✓ MATCH!" if saturn_rasi == 8 else ""
    print(f"{name:20} Ayanamsa: {ayanamsa_val:6.2f}°  Saturn: {saturn_lon:7.2f}° = Rasi {saturn_rasi:2} {match}")

print("\n" + "=" * 60)
print("If none match Rasi 8, the issue is NOT ayanamsa.")
print("It could be different birth time or different ephemeris source.")
