from flask import Blueprint, request
from app.middleware.auth_middleware import token_required
from app.utils.response_formatter import ResponseFormatter
from app.models.user_model import Notification
from app import db

notification_bp = Blueprint('notification', __name__)


@notification_bp.route('/', methods=['GET'])
@token_required
def get_notifications(current_user):
    """Get all notifications for the current user."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    unread_only = request.args.get('unread', 'false').lower() == 'true'

    query = Notification.query.filter_by(user_id=current_user.id)
    if unread_only:
        query = query.filter_by(is_read=False)

    query = query.order_by(Notification.created_at.desc())
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    unread_count = Notification.query.filter_by(
        user_id=current_user.id, is_read=False
    ).count()

    return ResponseFormatter.success(data={
        "notifications": [n.to_dict() for n in paginated.items],
        "unread_count": unread_count,
        "total": paginated.total,
    })


@notification_bp.route('/read', methods=['PUT'])
@token_required
def mark_all_read(current_user):
    """Mark all notifications as read."""
    Notification.query.filter_by(
        user_id=current_user.id, is_read=False
    ).update({"is_read": True})
    db.session.commit()
    return ResponseFormatter.success(message="All notifications marked as read")


@notification_bp.route('/<int:notification_id>/read', methods=['PUT'])
@token_required
def mark_one_read(current_user, notification_id):
    """Mark a single notification as read."""
    notif = Notification.query.get(notification_id)
    if not notif or notif.user_id != current_user.id:
        return ResponseFormatter.error("Notification not found", status=404)
    notif.is_read = True
    db.session.commit()
    return ResponseFormatter.success(message="Notification marked as read")
