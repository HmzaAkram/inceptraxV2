from flask import Blueprint, request
from app.models.user_model import User, Idea
from app.middleware.auth_middleware import token_required
from app.utils.response_formatter import ResponseFormatter
from app import db
from sqlalchemy import func
from werkzeug.security import generate_password_hash

user_bp = Blueprint('user', __name__)

# ------------------ DASHBOARD STATS ------------------
@user_bp.route('/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    total_ideas = Idea.query.filter_by(user_id=current_user.id).count()

    avg_score = db.session.query(func.avg(Idea.validation_score)) \
        .filter(Idea.user_id == current_user.id).scalar()
    avg_score = round(avg_score, 1) if avg_score else 0

    reports_count = Idea.query.filter(
        Idea.user_id == current_user.id,
        Idea.status == 'completed'
    ).count()

    stats = [
        {"name": "Ideas Created", "value": str(total_ideas)},
        {"name": "Avg. Validation Score", "value": f"{avg_score}%"},
        {"name": "Reports Generated", "value": str(reports_count)},
    ]

    return ResponseFormatter.success(data={"stats": stats})


# ------------------ GET PROFILE ------------------
@user_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return ResponseFormatter.success(data={"user": current_user.to_dict()})


# ------------------ UPDATE PROFILE ------------------
@user_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()

    current_user.first_name = data.get("first_name", current_user.first_name)
    current_user.last_name = data.get("last_name", current_user.last_name)
    current_user.email = data.get("email", current_user.email)

    db.session.commit()

    return ResponseFormatter.success(
        message="Profile updated successfully",
        data={"user": current_user.to_dict()}
    )


# ------------------ RESET PASSWORD ------------------
@user_bp.route('/reset-password', methods=['PUT'])
@token_required
def reset_password(current_user):
    data = request.get_json()

    if not data or not data.get("new_password"):
        return ResponseFormatter.error("New password required", 400)

    current_user.password_hash = generate_password_hash(data["new_password"])
    db.session.commit()

    return ResponseFormatter.success(message="Password reset successful")


# ------------------ DELETE ACCOUNT ------------------
@user_bp.route('/delete-account', methods=['DELETE'])
@token_required
def delete_account(current_user):
    Idea.query.filter_by(user_id=current_user.id).delete()
    db.session.delete(current_user)
    db.session.commit()

    return ResponseFormatter.success(message="Account deleted successfully")
