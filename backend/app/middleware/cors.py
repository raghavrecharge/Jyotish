"""CORS and Frontend Integration Middleware

Handles Cross-Origin Resource Sharing for frontend-backend communication
and adds security headers for production deployments.
"""

import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from typing import List

def get_cors_origins() -> List[str]:
    """Get CORS allowed origins from environment variables."""
    env = os.getenv('ENVIRONMENT', 'development')
    
    if env == 'production':
        origins = os.getenv('CORS_ORIGINS', '').split(',')
        return [o.strip() for o in origins if o.strip()]
    
    # Development mode - allow localhost and typical dev ports
    return [
        'http://localhost:3000',      # React frontend dev server
        'http://localhost:3001',      # Alternative React port
        'http://localhost:8000',      # Alternative API port
        'http://localhost:8001',      # Main API port
        'http://127.0.0.1:3000',      # Localhost variant
        'http://127.0.0.1:3001',      # Localhost variant
        'http://127.0.0.1:8001',      # Localhost variant
    ]

def configure_cors(app: FastAPI) -> None:
    """Configure CORS middleware for the FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    origins = get_cors_origins()
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allow_headers=[
            'Accept',
            'Accept-Language',
            'Content-Language',
            'Content-Type',
            'Authorization',
            'X-CSRF-Token',
            'X-Requested-With',
        ],
        expose_headers=['Content-Range', 'X-Content-Range', 'X-Total-Count'],
        max_age=3600,  # Cache preflight for 1 hour
    )

def configure_security_headers(app: FastAPI) -> None:
    """Configure security headers middleware.
    
    Args:
        app: FastAPI application instance
    """
    @app.middleware('http')
    async def add_security_headers(request, call_next):
        response = await call_next(request)
        
        # Security headers for production
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Content-Security-Policy'] = "default-src 'self'"
        
        return response

def configure_trusted_hosts(app: FastAPI) -> None:
    """Configure trusted hosts middleware.
    
    Args:
        app: FastAPI application instance
    """
    trusted_hosts = [
        'localhost',
        '127.0.0.1',
        os.getenv('DOMAIN', 'localhost'),
    ]
    
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=trusted_hosts,
    )

def setup_frontend_middleware(app: FastAPI) -> None:
    """Complete setup for frontend integration.
    
    Configures all necessary middleware for frontend-backend communication.
    
    Args:
        app: FastAPI application instance
    """
    # Configure in order (reversed order of execution)
    configure_trusted_hosts(app)
    configure_security_headers(app)
    configure_cors(app)
