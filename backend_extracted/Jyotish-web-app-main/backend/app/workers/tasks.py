"""
Celery tasks module

Add your background tasks here.
Example:

from app.workers.celery_app import celery_app

@celery_app.task
def example_task(param1, param2):
    # Your task logic here
    return {"result": "Task completed"}
"""
from app.workers.celery_app import celery_app

# Example task (can be removed if not needed)
@celery_app.task(name="app.workers.tasks.example_task")
def example_task():
    """Example Celery task"""
    return {"status": "success", "message": "Celery worker is running"}

