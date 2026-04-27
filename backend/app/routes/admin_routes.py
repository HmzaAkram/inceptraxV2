from flask import Blueprint, jsonify, request, send_file, current_app
import os
import shutil
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

    return jsonify({
        "total_users": total_users,
        "total_ideas": total_ideas,
        "signups_today": signups_today,
        "total_visitors": stats.total_visitors,
        "api_usage": {
            "used": total_api_used,
            "remaining": "unlimited",
            "total_budget": "unlimited"
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

@admin_bp.route('/backup', methods=['GET'])
@token_required
@admin_required
def backup_database(current_user):
    db_path = os.path.join(current_app.instance_path, 'inceptrax.db')
    if not os.path.exists(db_path):
        db_path = os.path.join(current_app.root_path, '..', 'inceptrax.db')
        
    if not os.path.exists(db_path):
        return jsonify({"error": "Database file not found"}), 404
        
    date_str = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    filename = f"inceptrax_backup_{date_str}.db"
    
    return send_file(
        db_path,
        as_attachment=True,
        download_name=filename,
        mimetype='application/x-sqlite3'
    )

@admin_bp.route('/restore', methods=['POST'])
@token_required
@admin_required
def restore_database(current_user):
    if 'file' not in request.files:
        return jsonify({"error": "No file parameter provided"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if not file.filename.endswith('.db'):
        return jsonify({"error": "Only .db files are accepted"}), 400
        
    db_path = os.path.join(current_app.instance_path, 'inceptrax.db')
    if not os.path.exists(db_path):
        db_path = os.path.join(current_app.root_path, '..', 'inceptrax.db')
        
    try:
        temp_path = db_path + '.temp'
        file.save(temp_path)
        
        db.engine.dispose()
        
        shutil.move(temp_path, db_path)
        
        return jsonify({"message": "Database restored successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
