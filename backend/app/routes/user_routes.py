from flask import Blueprint, jsonify
from app.models.user_model import User, Idea
from app.middleware.auth_middleware import token_required
from app.utils.response_formatter import ResponseFormatter
from app import db
from sqlalchemy import func

user_bp = Blueprint('user', __name__)

@user_bp.route('/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    # Calculate stats for the dashboard
    total_ideas = Idea.query.filter_by(user_id=current_user.id).count()
    
    avg_score = db.session.query(func.avg(Idea.validation_score)).filter(Idea.user_id == current_user.id).scalar()
    avg_score = round(avg_score, 1) if avg_score else 0
    
    # Reports generated (could be same as total ideas or a separate count)
    reports_count = Idea.query.filter(Idea.user_id == current_user.id, Idea.status == 'completed').count()
    
    stats = [
        {"name": "Ideas Created", "value": str(total_ideas), "icon": "Lightbulb", "change": "Total concepts"},
        {"name": "Avg. Validation Score", "value": f"{avg_score}%", "icon": "TrendingUp", "change": "Based on AI analysis"},
        {"name": "Reports Generated", "value": str(reports_count), "icon": "BarChart3", "change": "Completed deep-dives"}
    ]
    
    return ResponseFormatter.success(data={'stats': stats})

@user_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return ResponseFormatter.success(data={'user': current_user.to_dict()})
