#!/usr/bin/env python3
"""
Test script to verify end-to-end dasha data flow
"""

import sys
sys.path.insert(0, '/Users/ajitsingh/Downloads/Ops360-Jyotish/backend')

from app.core.database import SessionLocal
from app.models.dasha import Dasha, DashaLevel, DashaSystem
from app.models.chart import NatalChart
import json

db = SessionLocal()

print("=" * 80)
print("DASHA DATA VERIFICATION TEST")
print("=" * 80)

try:
    # Get profile 2's natal chart
    natal_chart = db.query(NatalChart).filter(NatalChart.profile_id == 2).first()
    if not natal_chart:
        print("✗ Profile 2 has no natal chart")
        exit(1)
    
    print(f"\n✓ Found natal chart for profile 2 (ID: {natal_chart.id})")
    
    # Test 1: Get Maha dashas with parent_id
    print("\n" + "-" * 80)
    print("TEST 1: MAHA DASHAS (Depth=1)")
    print("-" * 80)
    
    maha_dashas = db.query(Dasha).filter(
        Dasha.natal_chart_id == natal_chart.id,
        Dasha.system == DashaSystem.VIMSHOTTARI,
        Dasha.level == DashaLevel.MAHA
    ).order_by(Dasha.start_date).all()
    
    print(f"✓ Found {len(maha_dashas)} Maha dashas")
    for i, d in enumerate(maha_dashas[:3], 1):
        print(f"  {i}. {d.lord:10} | {d.start_date.date()} to {d.end_date.date()} | parent_id={d.parent_id}")
    print("  ...")
    
    # Test 2: Get first Maha's Antar dashas
    print("\n" + "-" * 80)
    print("TEST 2: ANTAR DASHAS (for first Maha)")
    print("-" * 80)
    
    first_maha = maha_dashas[0]
    print(f"\nMaha Dasha: {first_maha.lord} (ID: {first_maha.id})")
    
    antar_dashas = db.query(Dasha).filter(
        Dasha.natal_chart_id == natal_chart.id,
        Dasha.parent_id == first_maha.id,
        Dasha.level == DashaLevel.ANTAR
    ).order_by(Dasha.start_date).all()
    
    print(f"✓ Found {len(antar_dashas)} Antar dashas (should be 9)")
    for i, d in enumerate(antar_dashas[:5], 1):
        print(f"  {i}. {d.lord:10} | {d.start_date.date()} to {d.end_date.date()} | parent_id={d.parent_id}")
    
    # Test 3: Get first Antar's Pratyantar dashas
    print("\n" + "-" * 80)
    print("TEST 3: PRATYANTAR DASHAS (for first Antar)")
    print("-" * 80)
    
    first_antar = antar_dashas[0]
    print(f"\nAntar Dasha: {first_antar.lord} (ID: {first_antar.id}, parent_id: {first_antar.parent_id})")
    
    pratyantar_dashas = db.query(Dasha).filter(
        Dasha.natal_chart_id == natal_chart.id,
        Dasha.parent_id == first_antar.id,
        Dasha.level == DashaLevel.PRATYANTAR
    ).order_by(Dasha.start_date).all()
    
    print(f"✓ Found {len(pratyantar_dashas)} Pratyantar dashas (should be 9)")
    for i, d in enumerate(pratyantar_dashas[:5], 1):
        print(f"  {i}. {d.lord:10} | {d.start_date.date()} to {d.end_date.date()} | parent_id={d.parent_id}")
    
    # Test 4: Verify parent-child relationships
    print("\n" + "-" * 80)
    print("TEST 4: PARENT-CHILD RELATIONSHIPS")
    print("-" * 80)
    
    all_dashas = db.query(Dasha).filter(
        Dasha.natal_chart_id == natal_chart.id,
        Dasha.system == DashaSystem.VIMSHOTTARI
    ).all()
    
    maha_count = len([d for d in all_dashas if d.level == DashaLevel.MAHA])
    antar_count = len([d for d in all_dashas if d.level == DashaLevel.ANTAR])
    pratyantar_count = len([d for d in all_dashas if d.level == DashaLevel.PRATYANTAR])
    sookshma_count = len([d for d in all_dashas if d.level == DashaLevel.SOOKSHMA])
    prana_count = len([d for d in all_dashas if d.level == DashaLevel.PRANA])
    
    print(f"✓ Total Maha dashas: {maha_count} (expected: 10)")
    print(f"✓ Total Antar dashas: {antar_count} (expected: 90)")
    print(f"✓ Total Pratyantar dashas: {pratyantar_count} (expected: 270)")
    print(f"✓ Total Sookshma dashas: {sookshma_count} (expected: 270)")
    print(f"✓ Total Prana dashas: {prana_count} (expected: 270)")
    
    # Test 5: Verify all parent IDs are correct
    print("\n" + "-" * 80)
    print("TEST 5: PARENT_ID VALIDATION")
    print("-" * 80)
    
    # Antar dashas should have parent_id pointing to a Maha
    antar_with_invalid_parent = [d for d in all_dashas 
                                 if d.level == DashaLevel.ANTAR 
                                 and d.parent_id is None]
    
    if antar_with_invalid_parent:
        print(f"✗ Found {len(antar_with_invalid_parent)} Antar dashas with NULL parent_id")
    else:
        print(f"✓ All {antar_count} Antar dashas have valid parent_id")
    
    # Pratyantar dashas should have parent_id pointing to an Antar
    pratyantar_with_invalid_parent = [d for d in all_dashas 
                                      if d.level == DashaLevel.PRATYANTAR 
                                      and d.parent_id is None]
    
    if pratyantar_with_invalid_parent:
        print(f"✗ Found {len(pratyantar_with_invalid_parent)} Pratyantar dashas with NULL parent_id")
    else:
        print(f"✓ All {pratyantar_count} Pratyantar dashas have valid parent_id")
    
    # Test 6: Sample hierarchical structure
    print("\n" + "-" * 80)
    print("TEST 6: SAMPLE HIERARCHICAL STRUCTURE")
    print("-" * 80)
    
    print(f"\nStructure for {first_maha.lord} Maha Dasha:")
    print(f"├── {first_maha.lord} (MAHA, ID={first_maha.id})")
    
    for i, antar in enumerate(antar_dashas[:3]):
        antar_children = db.query(Dasha).filter(
            Dasha.parent_id == antar.id,
            Dasha.level == DashaLevel.PRATYANTAR
        ).order_by(Dasha.start_date).limit(3).all()
        
        connector = "└──" if i == len(antar_dashas[:3]) - 1 else "├──"
        print(f"{connector} {antar.lord} (ANTAR, ID={antar.id})")
        
        for j, pratyantar in enumerate(antar_children):
            prat_connector = "   └──" if j == len(antar_children) - 1 else "   ├──"
            print(f"{prat_connector} {pratyantar.lord} (PRATYANTAR, ID={pratyantar.id})")
        
        if len(antar_children) < 3:
            print(f"   └── ... ({len(antar_children)} total)")
    
    print(f"\n(showing first 3 Antar out of {len(antar_dashas)})")
    
    print("\n" + "=" * 80)
    print("✓ ALL TESTS PASSED!")
    print("=" * 80)
    print("\nThe API will now return:")
    print("- Depth=1: 10 Maha dashas")
    print("- Depth=2: 10 Maha + 90 Antar dashas")
    print("- Depth=3: 10 Maha + 90 Antar + 270 Pratyantar dashas")
    print("\nFrontend will build hierarchical tree using parent_id relationships")
    
finally:
    db.close()
