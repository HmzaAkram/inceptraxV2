from flask import Blueprint, request
from app.models.user_model import User, Message
from app.middleware.auth_middleware import token_required
from app.utils.response_formatter import ResponseFormatter
from app import db
from sqlalchemy import or_, desc
from datetime import datetime

cofounder_bp = Blueprint('cofounder', __name__)

@cofounder_bp.route('/profiles', methods=['GET'])
@token_required
def get_profiles(current_user):
    skills_query = request.args.get('skills', '').lower()
    
    query = User.query.filter(User.is_discoverable == True, User.id != current_user.id)
    
    if skills_query:
        query = query.filter(User.skills.ilike(f'%{skills_query}%'))
        
    users = query.all()
    
    profiles = [user.to_public_profile_dict() for user in users]
    return ResponseFormatter.success(data={"profiles": profiles})

@cofounder_bp.route('/profile/me', methods=['GET'])
@token_required
def get_my_profile(current_user):
    return ResponseFormatter.success(data={
        "is_discoverable": current_user.is_discoverable,
        "bio": current_user.bio,
        "skills": current_user.skills,
        "looking_for": current_user.looking_for,
        "linkedin_url": current_user.linkedin_url
    })

@cofounder_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    
    if 'is_discoverable' in data:
        current_user.is_discoverable = data['is_discoverable']
    if 'bio' in data:
        current_user.bio = data['bio']
    if 'skills' in data:
        current_user.skills = data['skills']
    if 'looking_for' in data:
        current_user.looking_for = data['looking_for']
    if 'linkedin_url' in data:
        current_user.linkedin_url = data['linkedin_url']
        
    db.session.commit()
    return ResponseFormatter.success(message="Profile updated successfully")

@cofounder_bp.route('/conversations', methods=['GET'])
@token_required
def get_conversations(current_user):
    # Fetch all messages where current user is sender or receiver
    messages = Message.query.filter(
        or_(Message.sender_id == current_user.id, Message.receiver_id == current_user.id)
    ).order_by(desc(Message.created_at)).all()
    
    conversations = {}
    
    for msg in messages:
        other_user_id = msg.sender_id if msg.receiver_id == current_user.id else msg.receiver_id
        
        if other_user_id not in conversations:
            other_user = User.query.get(other_user_id)
            if not other_user: continue
            
            conversations[other_user_id] = {
                "user": {
                    "id": other_user.id,
                    "first_name": other_user.first_name,
                    "last_name": other_user.last_name
                },
                "last_message": msg.to_dict(),
                "unread_count": 0
            }
        
        # Count unread messages where current user is receiver
        if msg.receiver_id == current_user.id and not msg.is_read:
            conversations[other_user_id]["unread_count"] += 1
            
    # Sort conversations by last message created_at descending
    sorted_convos = sorted(list(conversations.values()), key=lambda x: x["last_message"]["created_at"], reverse=True)
    
    return ResponseFormatter.success(data={"conversations": sorted_convos})

@cofounder_bp.route('/messages/<int:user_id>', methods=['GET'])
@token_required
def get_messages(current_user, user_id):
    messages = Message.query.filter(
        or_(
            db.and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
            db.and_(Message.sender_id == user_id, Message.receiver_id == current_user.id)
        )
    ).order_by(Message.created_at).all()
    
    return ResponseFormatter.success(data={"messages": [msg.to_dict() for msg in messages]})

@cofounder_bp.route('/messages/<int:user_id>', methods=['POST'])
@token_required
def send_message(current_user, user_id):
    data = request.get_json()
    content = data.get('content')
    
    if not content:
        return ResponseFormatter.error("Content is required", 400)
    
    receiver = User.query.get(user_id)
    if not receiver:
        return ResponseFormatter.error("User not found", 404)
        
    msg = Message(
        sender_id=current_user.id,
        receiver_id=user_id,
        content=content
    )
    
    db.session.add(msg)
    db.session.commit()
    
    return ResponseFormatter.success(data={"message": msg.to_dict()})

@cofounder_bp.route('/messages/<int:user_id>/read', methods=['PUT'])
@token_required
def mark_read(current_user, user_id):
    messages = Message.query.filter(
        Message.sender_id == user_id,
        Message.receiver_id == current_user.id,
        Message.is_read == False
    ).all()
    
    for msg in messages:
        msg.is_read = True
        
    if messages:
        db.session.commit()
        
    return ResponseFormatter.success(message="Messages marked as read")
