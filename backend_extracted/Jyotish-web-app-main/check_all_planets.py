import swisseph as swe
from datetime import datetime
import pytz

birth = datetime(1990, 9, 20, 15, 15, 0)
tz = pytz.timezone('Asia/Kolkata')
birth_utc = tz.localize(birth).astimezone(pytz.UTC)

jd = swe.julday(birth_utc.year, birth_utc.month, birth_utc.day, birth_utc.hour + birth_utc.minute/60.0)

swe.set_sid_mode(swe.SIDM_LAHIRI)
flags = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL

print('Birth IST: Sep 20, 1990, 15:15:00')
print('Ayanamsa:', round(swe.get_ayanamsa(jd), 4))
print()

planets = [
    (swe.SUN, 'Sun'),
    (swe.MOON, 'Moon'),
    (swe.MERCURY, 'Mercury'),
    (swe.VENUS, 'Venus'),
    (swe.MARS, 'Mars'),
    (swe.JUPITER, 'Jupiter'),
    (swe.SATURN, 'Saturn'),
    (swe.MEAN_NODE, 'Rahu (Mean)'),  # Rahu is mean north node
]

print("Sidereal Positions (ALL PLANETS):")
print("-" * 60)

all_planets = []
for planet_id, name in planets:
    result = swe.calc_ut(jd, planet_id, flags)
    lon = result[0][0]
    rasi = int(lon / 30) + 1
    degree_in_rasi = lon % 30
    all_planets.append((name, lon, rasi, degree_in_rasi))
    print(f'{name:15} {lon:7.2f}° = Rasi {rasi:2} ({degree_in_rasi:.2f}° in rasi)')

# Ketu is 180° opposite to Rahu
rahu_lon = all_planets[-1][1]
ketu_lon = (rahu_lon + 180) % 360
ketu_rasi = int(ketu_lon / 30) + 1
ketu_deg = ketu_lon % 30
print(f'{"Ketu (Calc)":15} {ketu_lon:7.2f}° = Rasi {ketu_rasi:2} ({ketu_deg:.2f}° in rasi)')

print("\n" + "=" * 60)
print("ATMAKARAKA Analysis (7 planets only, no Rahu/Ketu):")
print("=" * 60)
max_deg = 0
max_planet = ""
for name, lon, rasi, deg_in_rasi in all_planets[:-1]:  # Exclude Rahu
    if deg_in_rasi > max_deg:
        max_deg = deg_in_rasi
        max_planet = name
        max_rasi = rasi
print(f'Atmakaraka: {max_planet} at {max_deg:.2f}° in Rasi {max_rasi}')
print()

print("=" * 60)
print("CHECKING IF VENUS COULD BE AK:")
print("=" * 60)
venus_data = [p for p in all_planets if p[0] == 'Venus'][0]
print(f'Venus: Rasi {venus_data[2]} at {venus_data[3]:.2f}° in rasi')
print(f'Venus D1 Rasi: {venus_data[2]}')
print()
print("IF Venus were AK:")
print(f"  Swamsa (AK's D1 rasi) = Rasi {venus_data[2]}")
