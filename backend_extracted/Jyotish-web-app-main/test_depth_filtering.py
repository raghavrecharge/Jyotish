#!/usr/bin/env python3
"""Test API responses with different depths"""

import sys
sys.path.insert(0, '/Users/ajitsingh/Downloads/Ops360-Jyotish/backend')

from app.core.database import SessionLocal
from app.models.dasha import Dasha, DashaLevel
from app.models.chart import NatalChart
from app.api.dashas import get_or_compute_dashas
from app.models.profile import Profile

db = SessionLocal()

try:
    profile = db.query(Profile).filter(Profile.id == 2).first()
    natal_chart = db.query(NatalChart).filter(NatalChart.profile_id == 2).first()
    
    print("Testing get_or_compute_dashas with different depth filters:\n")
    
    # Get all dashas
    all_dashas = get_or_compute_dashas(natal_chart, profile, "VIMSHOTTARI", db)
    
    print(f"Total dashas returned: {len(all_dashas)}")
    
    # Count by level
    by_level = {}
    for d in all_dashas:
        level = d["level"].lower()
        if level not in by_level:
            by_level[level] = []
        by_level[level].append(d)
    
    print("\nDashas by level:")
    for level in sorted(by_level.keys()):
        print(f"  {level}: {len(by_level[level])}")
    
    # Now test the filtering logic that happens in get_dashas
    print("\n" + "=" * 60)
    print("Simulating API filtering for different depths:\n")
    
    depth_filters = {
        "vimshottari": {
            1: ["maha"],
            2: ["maha", "antar"],
            3: ["maha", "antar", "pratyantar"],
            4: ["maha", "antar", "pratyantar", "sookshma"],
            5: ["maha", "antar", "pratyantar", "sookshma", "prana"]
        }
    }
    
    for depth in [1, 2, 3]:
        allowed_levels = depth_filters["vimshottari"][depth]
        filtered = [d for d in all_dashas if d["level"].lower() in allowed_levels]
        print(f"Depth {depth}: allowed levels {allowed_levels}")
        print(f"  Returned {len(filtered)} dashas")
        
        # Count by level
        counts = {}
        for d in filtered:
            level = d["level"].lower()
            counts[level] = counts.get(level, 0) + 1
        
        for level, count in sorted(counts.items()):
            print(f"    - {level}: {count}")
        print()

finally:
    db.close()
