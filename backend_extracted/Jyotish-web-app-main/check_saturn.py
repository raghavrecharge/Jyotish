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
print('Birth UTC:', birth_utc)
print('Julian Day:', jd)
print('Ayanamsa:', round(swe.get_ayanamsa(jd), 4))
print()

planets = [
    (swe.SUN, 'Sun'),
    (swe.MOON, 'Moon'),
    (swe.MERCURY, 'Mercury'),
    (swe.VENUS, 'Venus'),
    (swe.MARS, 'Mars'),
    (swe.JUPITER, 'Jupiter'),
    (swe.SATURN, 'Saturn')
]

print("Sidereal Positions:")
for planet_id, name in planets:
    result = swe.calc_ut(jd, planet_id, flags)
    lon = result[0][0]
    rasi = int(lon / 30) + 1
    degree_in_rasi = lon % 30
    print(f'{name:10} {lon:7.2f}° = Rasi {rasi:2} ({degree_in_rasi:.2f}° in rasi)')

print("\nAtmakaraka (highest degree in rasi):")
max_deg = 0
max_planet = ""
for planet_id, name in planets:
    result = swe.calc_ut(jd, planet_id, flags)
    degree_in_rasi = result[0][0] % 30
    if degree_in_rasi > max_deg:
        max_deg = degree_in_rasi
        max_planet = name
print(f'{max_planet} at {max_deg:.2f}° in rasi')
