from flask import Blueprint, jsonify, request
from app.models.user_model import User
from app.models.stats_model import SystemStats
from app.middleware.auth_middleware import token_required, admin_required
from app import db
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
@token_required
@admin_required
def get_admin_stats(current_user):
    total_users = User.query.count()
    total_ideas = db.session.query(db.func.count(User.id)).join(User.ideas).scalar() or 0
    
    # Signups today
    today = datetime.utcnow().date()
    signups_today = User.query.filter(db.func.date(User.created_at) == today).count()
    
    # Visitors
    stats = SystemStats.get_stats()
    
    # Total API Credits used across all users
    total_api_used = db.session.query(db.func.sum(User.api_credits_used)).scalar() or 0
    
    # For demo purposes, we'll assume a fixed budget for Gemini, e.g., 10000 credits
    # In a real scenario, this might come from an API or config
    gemini_budget = 10000
    gemini_remaining = max(0, gemini_budget - total_api_used)

    return jsonify({
        "total_users": total_users,
        "total_ideas": total_ideas,
        "signups_today": signups_today,
        "total_visitors": stats.total_visitors,
        "api_usage": {
            "used": total_api_used,
            "remaining": gemini_remaining,
            "total_budget": gemini_budget
        }
    }), 200

@admin_bp.route('/users', methods=['GET'])
@token_required
@admin_required
def get_all_users(current_user):
    users = User.query.order_by(User.created_at.desc()).all()
    users_list = [user.to_dict() for user in users]
    return jsonify({"users": users_list}), 200

@admin_bp.route('/track-visit', methods=['POST'])
def track_visit():
    # Public route to increment visitor counter
    stats = SystemStats.get_stats()
    stats.total_visitors += 1
    db.session.commit()
    return jsonify({"message": "Visit tracked"}), 200

@admin_bp.route('/users/<int:user_id>/role', methods=['PATCH'])
@token_required
@admin_required
def update_user_role(current_user, user_id):
    data = request.get_json()
    if not data or 'is_admin' not in data:
        return jsonify({"error": "Missing 'is_admin' field"}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Optional: Prevent self-demotion if the admin email matches the hardcoded one
    if user.email == "hmzaakram295@gmail.com" and not data['is_admin']:
        return jsonify({"error": "Main admin account cannot be demoted"}), 403
    
    user.is_admin = data['is_admin']
    db.session.commit()
    
    return jsonify({
        "message": f"User role updated to {'Admin' if user.is_admin else 'User'}",
        "user": user.to_dict()
    }), 200
