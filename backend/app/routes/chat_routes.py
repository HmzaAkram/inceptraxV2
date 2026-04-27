from flask import Blueprint, request, jsonify
from app.models.user_model import Message, User, BlockedUser
from app.middleware.auth_middleware import token_required
from app import db
from sqlalchemy import or_, and_, func

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/conversations', methods=['GET'])
@token_required
def get_conversations(current_user):
    """Get list of all conversations (unique users you've chatted with)."""
    # Find all unique user IDs this user has chatted with
    sent_to = db.session.query(Message.receiver_id).filter(
        Message.sender_id == current_user.id
    ).distinct()

    received_from = db.session.query(Message.sender_id).filter(
        Message.receiver_id == current_user.id
    ).distinct()

    partner_ids = set()
    for row in sent_to:
        partner_ids.add(row[0])
    for row in received_from:
        partner_ids.add(row[0])

    conversations = []
    for partner_id in partner_ids:
        partner = User.query.get(partner_id)
        if not partner:
            continue

        # Get last message between them
        last_msg = Message.query.filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == partner_id),
                and_(Message.sender_id == partner_id, Message.receiver_id == current_user.id),
            )
        ).order_by(Message.created_at.desc()).first()

        # Count unread messages from this partner
        unread_count = Message.query.filter(
            Message.sender_id == partner_id,
            Message.receiver_id == current_user.id,
            Message.is_read == False,
        ).count()

        conversations.append({
            "partner_id": partner.id,
            "partner_name": f"{partner.first_name} {partner.last_name or ''}".strip(),
            "partner_initial": (partner.first_name[0].upper() if partner.first_name else "?"),
            "last_message": last_msg.content[:80] if last_msg else "",
            "last_message_time": last_msg.created_at.isoformat() if last_msg else None,
            "last_message_is_mine": (last_msg.sender_id == current_user.id) if last_msg else False,
            "unread_count": unread_count,
        })

    # Sort by most recent message first
    conversations.sort(key=lambda c: c["last_message_time"] or "", reverse=True)

    return jsonify({"conversations": conversations}), 200


@chat_bp.route('/messages/<int:partner_id>', methods=['GET'])
@token_required
def get_messages(current_user, partner_id):
    """Get all messages between current user and a specific partner."""
    partner = User.query.get(partner_id)
    if not partner:
        return jsonify({"error": "User not found"}), 404

    # Check if blocked
    blocked = BlockedUser.query.filter(
        or_(
            and_(BlockedUser.blocker_id == current_user.id, BlockedUser.blocked_id == partner_id),
            and_(BlockedUser.blocker_id == partner_id, BlockedUser.blocked_id == current_user.id),
        )
    ).first()
    if blocked:
        return jsonify({"error": "This conversation is not available"}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)

    messages = Message.query.filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == partner_id),
            and_(Message.sender_id == partner_id, Message.receiver_id == current_user.id),
        )
    ).order_by(Message.created_at.asc()).paginate(page=page, per_page=per_page, error_out=False)

    # Mark unread messages from partner as read
    unread = Message.query.filter(
        Message.sender_id == partner_id,
        Message.receiver_id == current_user.id,
        Message.is_read == False,
    ).all()
    for msg in unread:
        msg.is_read = True
    db.session.commit()

    return jsonify({
        "messages": [m.to_dict() for m in messages.items],
        "partner": {
            "id": partner.id,
            "name": f"{partner.first_name} {partner.last_name or ''}".strip(),
            "initial": partner.first_name[0].upper() if partner.first_name else "?",
        },
        "total": messages.total,
        "pages": messages.pages,
        "current_page": page,
    }), 200


@chat_bp.route('/messages/<int:partner_id>', methods=['POST'])
@token_required
def send_message(current_user, partner_id):
    """Send a message to another user."""
    if partner_id == current_user.id:
        return jsonify({"error": "Cannot message yourself"}), 400

    partner = User.query.get(partner_id)
    if not partner:
        return jsonify({"error": "User not found"}), 404

    # Check if blocked
    blocked = BlockedUser.query.filter(
        or_(
            and_(BlockedUser.blocker_id == current_user.id, BlockedUser.blocked_id == partner_id),
            and_(BlockedUser.blocker_id == partner_id, BlockedUser.blocked_id == current_user.id),
        )
    ).first()
    if blocked:
        return jsonify({"error": "Cannot send message to this user"}), 403

    data = request.get_json()
    content = data.get('content', '').strip() if data else ''
    if not content:
        return jsonify({"error": "Message cannot be empty"}), 400
    if len(content) > 2000:
        return jsonify({"error": "Message too long (max 2000 chars)"}), 400

    message = Message(
        sender_id=current_user.id,
        receiver_id=partner_id,
        content=content,
    )
    db.session.add(message)
    db.session.commit()

    # Try to create a notification (non-blocking)
    try:
        from app.models.user_model import Notification
        notif = Notification(
            user_id=partner_id,
            type="chat",
            message=f"New message from {current_user.first_name}",
            link=f"/dashboard/chat?with={current_user.id}",
        )
        db.session.add(notif)
        db.session.commit()
    except Exception:
        pass  # Notification is nice-to-have, don't fail the message

    return jsonify({"message": message.to_dict()}), 201


@chat_bp.route('/unread-count', methods=['GET'])
@token_required
def get_unread_count(current_user):
    """Get total unread message count for the current user."""
    count = Message.query.filter(
        Message.receiver_id == current_user.id,
        Message.is_read == False,
    ).count()

    return jsonify({"unread_count": count}), 200
