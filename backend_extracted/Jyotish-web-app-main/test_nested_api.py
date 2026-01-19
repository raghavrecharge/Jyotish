#!/usr/bin/env python3
"""Test nested API response"""

import sys
sys.path.insert(0, '/Users/ajitsingh/Downloads/Ops360-Jyotish/backend')

from app.core.database import SessionLocal
from app.models.profile import Profile
from app.api.charts import get_or_compute_chart
from app.api.dashas import get_or_compute_dashas, nest_dashas_by_dates
import json

db = SessionLocal()

try:
    profile = db.query(Profile).get(2)
    chart = get_or_compute_chart(profile, db)
    dashas = get_or_compute_dashas(chart, profile, 'VIMSHOTTARI', db)
    
    # Filter for depth 3
    allowed = ['maha', 'antar', 'pratyantar']
    filtered = [d for d in dashas if d['level'].lower() in allowed]
    
    # Nest them
    nested = nest_dashas_by_dates(filtered)
    
    print('Total Maha:', len(nested))
    if nested:
        print('First Maha has', len(nested[0].get('children', [])), 'antar children')
        if nested[0]['children']:
            print('First Antar has', len(nested[0]['children'][0].get('children', [])), 'pratyantar children')
        print('\nSample nested structure:')
        sample = {
            'id': nested[0]['id'],
            'lord': nested[0]['lord'],
            'level': nested[0]['level'],
            'start_date': str(nested[0]['start_date']),
            'end_date': str(nested[0]['end_date']),
            'children': [
                {
                    'id': nested[0]['children'][0]['id'],
                    'lord': nested[0]['children'][0]['lord'],
                    'level': nested[0]['children'][0]['level'],
                    'start_date': str(nested[0]['children'][0]['start_date']),
                    'end_date': str(nested[0]['children'][0]['end_date']),
                    'children': [
                        {
                            'id': nested[0]['children'][0]['children'][0]['id'],
                            'lord': nested[0]['children'][0]['children'][0]['lord'],
                            'level': nested[0]['children'][0]['children'][0]['level'],
                            'start_date': str(nested[0]['children'][0]['children'][0]['start_date']),
                            'end_date': str(nested[0]['children'][0]['children'][0]['end_date'])
                        }
                    ] if nested[0]['children'][0]['children'] else []
                }
            ] if nested[0]['children'] else []
        }
        print(json.dumps(sample, indent=2))
finally:
    db.close()
