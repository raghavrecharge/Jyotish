import swisseph as swe
import os
from datetime import datetime
import pytz

print("=" * 70)
print("EPHEMERIS VERIFICATION")
print("=" * 70)

# Check current ephemeris path
print(f"\nConfigured ephemeris path: /app/ephe")

# Check if our folder exists
ephe_path = '/app/ephe'
if os.path.exists(ephe_path):
    files = os.listdir(ephe_path)
    se_files = [f for f in files if f.endswith('.se1')]
    print(f"\n✓ {ephe_path} exists")
    print(f"  Total .se1 files: {len(se_files)}")
    print(f"  Sample files: {se_files[:5]}")
    
    # Check specific Saturn files
    saturn_files = [f for f in files if 'sepl' in f.lower()]
    print(f"  Saturn ephemeris files (sepl*): {len(saturn_files)}")
else:
    print(f"\n✗ {ephe_path} does NOT exist")

print("\n" + "=" * 70)
print("SATURN CALCULATION TEST")
print("=" * 70)

# Calculate Saturn for Sep 20, 1990, 15:15 IST
birth = datetime(1990, 9, 20, 15, 15, 0)
tz = pytz.timezone('Asia/Kolkata')
birth_utc = tz.localize(birth).astimezone(pytz.UTC)

print(f"\nBirth Time (IST): Sep 20, 1990, 15:15")
print(f"Birth Time (UTC): {birth_utc}")

jd = swe.julday(birth_utc.year, birth_utc.month, birth_utc.day, 
                birth_utc.hour + birth_utc.minute/60.0)
print(f"Julian Day: {jd}")

# Set Lahiri ayanamsa
swe.set_sid_mode(swe.SIDM_LAHIRI)
ayanamsa = swe.get_ayanamsa(jd)
print(f"Ayanamsa (Lahiri): {ayanamsa:.4f}°")

# Calculate Saturn
flags = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL
result = swe.calc_ut(jd, swe.SATURN, flags)

saturn_lon = result[0][0]
saturn_rasi = int(saturn_lon / 30) + 1
saturn_deg_in_rasi = saturn_lon % 30

print(f"\nSaturn Sidereal Longitude: {saturn_lon:.4f}°")
print(f"Saturn Rasi: {saturn_rasi} ({saturn_deg_in_rasi:.2f}° in rasi)")

# Expected values
print("\n" + "=" * 70)
print("COMPARISON")
print("=" * 70)
print(f"Our calculation: Rasi {saturn_rasi} (longitude {saturn_lon:.2f}°)")
print(f"AstroSage shows: Rasi 8 (Scorpio, should be ~210-240°)")
print(f"Difference: {saturn_lon - 234:.2f}° (expecting ~234° for Rasi 8)")

if saturn_rasi == 8:
    print("\n✓ MATCH! Saturn is in Rasi 8")
else:
    print(f"\n✗ MISMATCH! Saturn is in Rasi {saturn_rasi}, not 8")
    print("This means the ephemeris files are calculating the same as before.")
