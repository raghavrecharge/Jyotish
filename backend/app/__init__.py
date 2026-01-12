"""Jyotish Application Package.

Initializes Flask application with all required configurations,
middleware, blueprints, and security settings for production.
"""

from flask import Flask
from flask_cors import CORS
import os
from datetime import datetime


def create_app(config_name='production'):
    """Application factory function.
    
    Args:
        config_name: Configuration environment (production, development, testing)
        
    Returns:
        Configured Flask application instance
    """
    app = Flask(__name__)
    
    # Configuration
    app.config['ENV'] = os.getenv('FLASK_ENV', config_name)
    app.config['DEBUG'] = os.getenv('FLASK_DEBUG', False)
    app.config['JSON_SORT_KEYS'] = False
    
    # CORS Configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(','),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Register middleware
    from app.middleware.cors import setup_cors_headers
    setup_cors_headers(app)
    
    # Register blueprints
    from app.api.auth import auth_bp
    app.register_blueprint(auth_bp)
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint for monitoring."""
        return {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0'
        }, 200
    
    # 404 Error handler
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors."""
        return {
            'error': 'Resource not found',
            'status': 404
        }, 404
    
    # 500 Error handler
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors."""
        return {
            'error': 'Internal server error',
            'status': 500
        }, 500
    
    # Request logging
    @app.before_request
    def log_request():
        """Log incoming requests."""
        app.logger.info(f'{datetime.utcnow()} - {request.method} {request.path}')
    
    return app


# Create default app instance for WSGI servers
app = create_app()
