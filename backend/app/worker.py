"""
Worker module for Celery - exports the celery app instance.
This module is imported by celery command: celery -A app.worker
"""
from app.workers.celery_app import celery_app

__all__ = ["celery_app"]
