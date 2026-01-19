"""
Celery application configuration
"""
from celery import Celery
from app.core.config import settings

# Create Celery app instance
celery_app = Celery(
    "astroos",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)

# Auto-discover tasks (when tasks.py is created)
# celery_app.autodiscover_tasks(["app.workers"])

if __name__ == "__main__":
    celery_app.start()

