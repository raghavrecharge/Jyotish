from app.core.database import SessionLocal
from app.models.dasha import Dasha, DashaLevel

db = SessionLocal()
try:
    count = db.query(Dasha).count()
    print(f'Found {count} dasha records')
    
    if count > 0:
        # Delete in reverse order: Prana -> Sookshma -> Pratyantar -> Antar -> Maha
        levels = [DashaLevel.PRANA, DashaLevel.SOOKSHMA, DashaLevel.PRATYANTAR, DashaLevel.ANTAR, DashaLevel.MAHA]
        total_deleted = 0
        
        for level in levels:
            level_count = db.query(Dasha).filter(Dasha.level == level).count()
            if level_count > 0:
                db.query(Dasha).filter(Dasha.level == level).delete()
                total_deleted += level_count
                print(f'  Deleted {level_count} {level.value} dashas')
        
        db.commit()
        print(f'✓ Total deleted: {total_deleted} dasha records')
    else:
        print('No records to delete')
except Exception as e:
    print(f'Error: {e}')
    db.rollback()
finally:
    db.close()
