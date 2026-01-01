from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
from app.middleware.auth_middleware import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing request data'}), 400
    
    response, status = AuthService.register_user(data)
    return jsonify(response), status

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing request data'}), 400
    
    response, status = AuthService.login_user(data)
    return jsonify(response), status

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user):
    return jsonify({'user': current_user.to_dict()}), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # For JWT, logout is usually handled by the client by deleting the token.
    # We can implement a blacklist if needed, but for now, simple success response.
    return jsonify({'message': 'Logged out successfully'}), 200
