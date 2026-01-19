#!/usr/bin/env python3
import sys
sys.path.insert(0, '/Users/ajitsingh/Downloads/Ops360-Jyotish/backend')

from app.core.database import SessionLocal
from app.models.profile import Profile
from app.api.charts import get_or_compute_chart
from app.models.chart import PlanetaryPosition
from app.modules.ashtakavarga.calculator import ashtakavarga_calculator
import json

s = SessionLocal()
p = s.query(Profile).get(2)
c = get_or_compute_chart(p, s)
positions = s.query(PlanetaryPosition).filter(PlanetaryPosition.natal_chart_id==c.id).all()
pos_dict = {pos.planet: {'rasi': pos.rasi, 'longitude': pos.longitude} for pos in positions}
result = ashtakavarga_calculator.calculate_all(pos_dict)

# Build table format
planets = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN']
print("RN  Su  Mo  Ma  Me  Ju  Ve  Sa  Tot")
print("-" * 40)
for house_idx in range(12):
    house_num = house_idx + 1
    row_data = [house_num]
    for planet in planets:
        row_data.append(result['bav'][planet][house_idx])
    row_data.append(sum([result['bav'][p][house_idx] for p in planets]))
    print(f"{row_data[0]:2d}  " + "  ".join(f"{v:2d}" for v in row_data[1:]))

print()
print('Total points:', result['summary']['total_points'])
print('Average points per house:', round(result['summary']['average'], 2))
s.close()
