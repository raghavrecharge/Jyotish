#!/usr/bin/env python3
import sys
sys.path.insert(0, '/Users/ajitsingh/Downloads/Ops360-Jyotish/backend')

from app.core.database import SessionLocal
from app.models.profile import Profile
from app.api.charts import get_or_compute_chart
from app.api.dashas import get_or_compute_dashas, nest_dashas_by_parent_id

s = SessionLocal()
p = s.query(Profile).get(2)
c = get_or_compute_chart(p, s)
dashas = get_or_compute_dashas(c, p, "VIMSHOTTARI", s, depth=5)
allowed = ["maha", "antar", "pratyantar", "sookshma", "prana"]
filtered = [d for d in dashas if d["level"].lower() in allowed]
nested = nest_dashas_by_parent_id(filtered)

print("First Maha:", nested[0]["lord"])
print("Antar children count:", len(nested[0].get("children", [])))
print("\nFirst 3 Antar with their Pratyantar children:")
for i, antar in enumerate(nested[0].get("children", [])[:3]):
    print(f"  {i+1}. {antar['lord']}: {len(antar.get('children', []))} pratyantar children")
    
s.close()
