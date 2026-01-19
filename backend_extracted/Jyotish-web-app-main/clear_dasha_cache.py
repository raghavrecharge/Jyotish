#!/usr/bin/env python3
"""
Clear all cached dasha records from the database.
This is needed after the timezone fix to recalculate dashas with correct times.
"""

import sys
sys.path.insert(0, '/Users/ajitsingh/Downloads/Ops360-Jyotish/backend')

from app.core.database import SessionLocal
from app.models.dasha import Dasha

def clear_dasha_cache():
    """Delete all cached dasha records"""
    db = SessionLocal()
    try:
        # Count existing records
        count = db.query(Dasha).count()
        print(f"Found {count} dasha records in database")
        
        if count > 0:
            # Delete all dasha records
            db.query(Dasha).delete()
            db.commit()
            print(f"✓ Successfully deleted {count} dasha records")
            print("✓ Dashas will be recalculated on next API request with correct timezone")
        else:
            print("No dasha records found")
        
    except Exception as e:
        print(f"✗ Error clearing dasha cache: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Clearing Dasha Cache (Timezone Fix)")
    print("=" * 60)
    clear_dasha_cache()
    print("=" * 60)
