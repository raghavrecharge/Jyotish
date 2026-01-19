#!/usr/bin/env python3
import sys
sys.path.insert(0, '/Users/ajitsingh/Downloads/Ops360-Jyotish/backend')

from app.core.database import SessionLocal
from app.models.profile import Profile
from app.api.charts import get_or_compute_chart
from app.api.dashas import get_or_compute_dashas

s = SessionLocal()
try:
    p = s.query(Profile).get(2)
    c = get_or_compute_chart(p, s)
    d = get_or_compute_dashas(c, p, 'VIMSHOTTARI', s)
    print(f'Recomputed {len(d)} dashas')
finally:
    s.close()
