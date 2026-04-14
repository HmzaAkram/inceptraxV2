from functools import wraps
from flask import request, jsonify
from app.services.auth_service import AuthService
from app.models.user_model import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        user_id = AuthService.decode_token(token)
        if isinstance(user_id, str): # Error message
            return jsonify({'message': user_id}), 401

        current_user = User.query.get(user_id)
        if not current_user:
            return jsonify({'message': 'User not found!'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_admin:
            return jsonify({'message': 'Admin privileges required!'}), 403
        
        return f(current_user, *args, **kwargs)
    
    return decorated
