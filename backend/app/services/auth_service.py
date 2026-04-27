import jwt
import datetime
import os
from flask import current_app
from app.models.user_model import User, TokenBlacklist
from app import db


class AuthService:
    """JWT authentication service with bcrypt password hashing and token blacklisting.

    V2 Changes:
    - Dual hash support: bcrypt primary, werkzeug fallback with auto-rehash
    - Access token (7 days) + refresh token (30 days)
    - Token blacklisting for proper logout
    - Generic error messages (never reveal which field is wrong)
    - Password validation rules
    """

    @staticmethod
    def generate_tokens(user_id):
        """Generate both access and refresh JWT tokens."""
        secret = current_app.config.get('JWT_SECRET_KEY', current_app.config.get('SECRET_KEY'))

        access_token = jwt.encode({
            'sub': user_id,
            'type': 'access',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
            'iat': datetime.datetime.utcnow(),
        }, secret, algorithm='HS256')

        refresh_token = jwt.encode({
            'sub': user_id,
            'type': 'refresh',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30),
            'iat': datetime.datetime.utcnow(),
        }, secret, algorithm='HS256')

        return access_token, refresh_token

    @staticmethod
    def generate_token(user_id):
        """Legacy single-token generation for backward compatibility."""
        access, _ = AuthService.generate_tokens(user_id)
        return access

    @staticmethod
    def decode_token(token):
        """Decode and validate a JWT token. Returns user_id or error string."""
        try:
            # Check if token is blacklisted
            if TokenBlacklist.query.filter_by(token=token).first():
                return 'Token has been revoked'

            secret = current_app.config.get('JWT_SECRET_KEY', current_app.config.get('SECRET_KEY'))
            payload = jwt.decode(token, secret, algorithms=['HS256'])
            return payload['sub']
        except jwt.ExpiredSignatureError:
            return 'Token expired. Please log in again.'
        except jwt.InvalidTokenError:
            return 'Invalid token. Please log in again.'

    @staticmethod
    def decode_refresh_token(token):
        """Decode a refresh token specifically."""
        try:
            if TokenBlacklist.query.filter_by(token=token).first():
                return None, 'Token has been revoked'

            secret = current_app.config.get('JWT_SECRET_KEY', current_app.config.get('SECRET_KEY'))
            payload = jwt.decode(token, secret, algorithms=['HS256'])

            if payload.get('type') != 'refresh':
                return None, 'Invalid token type'

            return payload['sub'], None
        except jwt.ExpiredSignatureError:
            return None, 'Refresh token expired. Please log in again.'
        except jwt.InvalidTokenError:
            return None, 'Invalid refresh token.'

    @staticmethod
    def blacklist_token(token):
        """Add a token to the blacklist (for logout)."""
        try:
            existing = TokenBlacklist.query.filter_by(token=token).first()
            if not existing:
                bl = TokenBlacklist(token=token)
                db.session.add(bl)
                db.session.commit()
            return True
        except Exception as e:
            print(f"Error blacklisting token: {e}")
            return False

    @staticmethod
    def validate_password(password):
        """Validate password meets security requirements.
        - Minimum 8 characters
        - At least 1 uppercase, 1 lowercase, 1 number
        """
        if not password or len(password) < 8:
            return False, "Password must be at least 8 characters"
        if not any(c.isupper() for c in password):
            return False, "Password must contain at least one uppercase letter"
        if not any(c.islower() for c in password):
            return False, "Password must contain at least one lowercase letter"
        if not any(c.isdigit() for c in password):
            return False, "Password must contain at least one number"
        return True, None

    @staticmethod
    def register_user(data):
        """Register a new user with validation."""
        email = (data.get('email') or '').strip().lower()
        first_name = (data.get('first_name') or '').strip()
        last_name = (data.get('last_name') or '').strip()
        password = data.get('password', '')

        # Validate required fields
        if not email:
            return {'error': 'Email is required'}, 400
        if not first_name:
            return {'error': 'First name is required'}, 400
        if not last_name:
            return {'error': 'Last name is required'}, 400

        # Validate password
        valid, error = AuthService.validate_password(password)
        if not valid:
            return {'error': error}, 400

        # Check existing user (return 409 Conflict)
        if User.query.filter_by(email=email).first():
            return {'error': 'An account with this email already exists'}, 409

        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        access_token, refresh_token = AuthService.generate_tokens(user.id)
        return {
            'message': 'Account created successfully',
            'token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }, 201

    @staticmethod
    def login_user(data):
        """Login with generic error message — never reveal which field is wrong."""
        email = (data.get('email') or '').strip().lower()
        password = data.get('password', '')

        user = User.query.filter_by(email=email).first()

        # Generic error message for both "email not found" and "wrong password"
        if not user or not user.check_password(password):
            return {'error': 'Invalid credentials'}, 401

        # Update last login
        user.last_login = datetime.datetime.utcnow() if hasattr(user, 'last_login') else None

        access_token, refresh_token = AuthService.generate_tokens(user.id)
        db.session.commit()

        return {
            'message': 'Login successful',
            'token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }, 200

    @staticmethod
    def refresh_access_token(refresh_token):
        """Generate a new access token from a valid refresh token."""
        user_id, error = AuthService.decode_refresh_token(refresh_token)
        if error:
            return {'error': error}, 401

        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 401

        new_access_token = AuthService.generate_token(user_id)
        return {
            'token': new_access_token,
            'user': user.to_dict()
        }, 200
