"""Authentication API endpoints.

Provides user registration, login, token refresh, and user profile endpoints.
"""

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    token_required,
)
import os
from datetime import timedelta

# Create blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')


@auth_bp.route('/register', methods=['POST'])
@cross_origin()
def register():
    """Register a new user.
    
    Request body:
    {
        "email": "user@example.com",
        "password": "password123",
        "name": "John Doe"
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        email = data.get('email')
        password = data.get('password')
        name = data.get('name', email.split('@')[0])
        
        # Hash password
        hashed_password = hash_password(password)
        
        # TODO: Save user to database
        # user = User(email=email, password=hashed_password, name=name)
        # db.session.add(user)
        # db.session.commit()
        
        # Create access token
        access_token = create_access_token(
            data={'sub': email},
            expires_delta=timedelta(minutes=int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 30)))
        )
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'token_type': 'bearer',
            'user': {
                'email': email,
                'name': name
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
@cross_origin()
def login():
    """User login endpoint.
    
    Request body:
    {
        "email": "user@example.com",
        "password": "password123"
    }
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing email or password'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        # TODO: Get user from database
        # user = User.query.filter_by(email=email).first()
        # if not user or not verify_password(password, user.password):
        #     return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create access token
        access_token = create_access_token(
            data={'sub': email},
            expires_delta=timedelta(minutes=int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 30)))
        )
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'token_type': 'bearer',
            'user': {'email': email}
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/refresh', methods=['POST'])
@cross_origin()
@token_required
def refresh_token():
    """Refresh access token."""
    try:
        # Get user email from current token
        email = request.user_id
        
        # Create new access token
        new_token = create_access_token(
            data={'sub': email},
            expires_delta=timedelta(minutes=int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 30)))
        )
        
        return jsonify({
            'message': 'Token refreshed',
            'access_token': new_token,
            'token_type': 'bearer'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/me', methods=['GET'])
@cross_origin()
@token_required
def get_current_user():
    """Get current user profile."""
    try:
        user_id = request.user_id
        
        # TODO: Get user from database
        # user = User.query.filter_by(id=user_id).first()
        
        return jsonify({
            'user': {
                'email': user_id,
                'id': user_id
                # Add other user fields from database
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
