import swisseph as swe
from datetime import datetime, timedelta
import pytz

tz = pytz.timezone('Asia/Kolkata')
swe.set_sid_mode(swe.SIDM_LAHIRI)
flags = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL

print("Finding what time gives Saturn at ~234° (Rasi 8):")
print("=" * 70)

# Test different times on Sep 20, 1990
base_date = datetime(1990, 9, 20)

for hour in range(0, 24, 2):
    test_time = base_date.replace(hour=hour, minute=15)
    test_utc = tz.localize(test_time).astimezone(pytz.UTC)
    jd = swe.julday(test_utc.year, test_utc.month, test_utc.day,
                    test_utc.hour + test_utc.minute/60.0)
    
    result = swe.calc_ut(jd, swe.SATURN, flags)
    saturn_lon = result[0][0]
    saturn_rasi = int(saturn_lon / 30) + 1
    
    match = "✓" if saturn_rasi == 8 else " "
    print(f"{match} {hour:02d}:15 IST  →  Saturn: {saturn_lon:7.2f}° = Rasi {saturn_rasi}")

print("\n" + "=" * 70)
print("Saturn moves very slowly (~0.08° per day)")
print("To get Saturn 30° different, we'd need ~1 year difference!")
print("\nConclusion: Birth time difference cannot explain this.")
