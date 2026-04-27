from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_admin = db.Column(db.Boolean, default=False)
    api_credits_used = db.Column(db.Integer, default=0)

    # Co-founder discovery opt-in fields
    is_discoverable = db.Column(db.Boolean, default=False, nullable=False)
    bio = db.Column(db.Text, nullable=True)
    skills = db.Column(db.String(500), nullable=True)      # comma-separated
    looking_for = db.Column(db.String(500), nullable=True) # what they need
    linkedin_url = db.Column(db.String(300), nullable=True)

    ideas = db.relationship('Idea', backref='author', lazy=True)
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy=True)
    received_messages = db.relationship('Message', foreign_keys='Message.receiver_id', backref='receiver', lazy=True)

    def set_password(self, password):
        """Hash password. Tries bcrypt first, falls back to werkzeug."""
        try:
            import bcrypt
            salt = bcrypt.gensalt(rounds=12)
            self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        except ImportError:
            self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check password. Supports both bcrypt and werkzeug hashes.
        If hash is werkzeug format, auto-rehashes with bcrypt on success."""
        if self.password_hash.startswith('$2b$') or self.password_hash.startswith('$2a$'):
            # bcrypt hash
            try:
                import bcrypt
                return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
            except ImportError:
                return False
        else:
            # werkzeug hash — verify and auto-rehash to bcrypt
            if check_password_hash(self.password_hash, password):
                # Auto-migrate to bcrypt
                self.set_password(password)
                db.session.commit()
                return True
            return False

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "is_admin": self.is_admin,
            "api_credits_used": self.api_credits_used,
            "created_at": self.created_at.isoformat(),
            "is_discoverable": self.is_discoverable,
            "bio": self.bio,
            "skills": self.skills,
            "looking_for": self.looking_for,
            "linkedin_url": self.linkedin_url
        }

    def to_public_profile_dict(self):
        """Safe public co-founder profile — no email exposed."""
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "bio": self.bio,
            "skills": self.skills,
            "looking_for": self.looking_for,
            "linkedin_url": self.linkedin_url,
            "joined": self.created_at.isoformat()
        }

    def increment_api_credits(self, count=1):
        self.api_credits_used += count
        db.session.commit()


class Idea(db.Model):
    __tablename__ = 'ideas'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Idea detail fields
    problem = db.Column(db.Text, nullable=True)
    solution = db.Column(db.Text, nullable=True)
    audience = db.Column(db.Text, nullable=True)
    market = db.Column(db.Text, nullable=True)

    # V2 fields
    industry = db.Column(db.String(50), nullable=True)
    target_market = db.Column(db.String(200), nullable=True)
    target_audience = db.Column(db.String(200), nullable=True)
    stage = db.Column(db.String(20), default='idea')  # idea / early_stage / scaling

    # Analysis
    status = db.Column(db.String(50), default="pending")
    analysis_status = db.Column(db.JSON, default={
        "validation": "pending",
        "market": "pending",
        "competitors": "pending",
        "mvp": "pending",
        "monetization": "pending",
        "gtm": "pending"
    })
    analysis_data = db.Column(db.JSON, nullable=True)
    overall_score = db.Column(db.Integer, nullable=True)
    risk_level = db.Column(db.String(20), nullable=True)

    # Visibility / sharing
    is_public = db.Column(db.Boolean, default=False, nullable=False)
    share_token = db.Column(db.String(64), unique=True, nullable=True)
    public_views = db.Column(db.Integer, default=0)

    # AI Layers
    ai_layers_count = db.Column(db.Integer, default=0)

    # Founder match
    founder_match_score = db.Column(db.Integer, nullable=True)

    # Relationships
    stage_results = db.relationship('StageResult', backref='idea', lazy=True, cascade='all, delete-orphan')
    checklist_items = db.relationship('ChecklistItem', backref='idea', lazy=True, cascade='all, delete-orphan')
    ai_layers_sessions = db.relationship('AILayersSession', backref='idea', lazy=True, cascade='all, delete-orphan')
    research_notes = db.relationship('ResearchNote', backref='idea', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "user_id": self.user_id,
            "problem": self.problem,
            "solution": self.solution,
            "audience": self.audience,
            "market": self.market,
            "industry": self.industry,
            "target_market": self.target_market,
            "target_audience": self.target_audience,
            "stage": self.stage,
            "status": self.status,
            "analysis_status": self.analysis_status,
            "analysis_data": self.analysis_data,
            "overall_score": self.overall_score,
            "risk_level": self.risk_level,
            "is_public": self.is_public,
            "share_token": self.share_token,
            "public_views": self.public_views,
            "ai_layers_count": self.ai_layers_count,
            "founder_match_score": self.founder_match_score
        }

    def to_public_dict(self):
        """Safe subset of idea data for unauthenticated public share view."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
            "problem": self.problem,
            "solution": self.solution,
            "audience": self.audience,
            "market": self.market,
            "industry": self.industry,
            "status": self.status,
            "analysis_data": self.analysis_data,
            "validation_score": self.validation_score,
            "overall_score": self.overall_score,
            "risk_level": self.risk_level,
            "is_public": self.is_public,
            "share_token": self.share_token,
            "public_views": self.public_views,
            "ai_layers_count": self.ai_layers_count,
            "founder_match_score": self.founder_match_score
        }

    @property
    def validation_score(self):
        if self.analysis_data and 'overall_score' in self.analysis_data:
            return self.analysis_data.get('overall_score', 0)
        return 0

    def get_idea_context(self):
        """Returns all idea fields formatted for AI prompt injection."""
        return {
            "title": self.title or "",
            "description": self.description or "",
            "industry": self.industry or self.market or "",
            "target_market": self.target_market or "",
            "target_audience": self.target_audience or self.audience or "",
            "problem": self.problem or "",
            "solution": self.solution or "",
            "stage": self.stage or "idea"
        }


class StageResult(db.Model):
    """Individual stage results for the 8-stage analysis pipeline."""
    __tablename__ = 'stage_results'

    id = db.Column(db.Integer, primary_key=True)
    idea_id = db.Column(db.Integer, db.ForeignKey('ideas.id'), nullable=False)
    stage_number = db.Column(db.Integer, nullable=False)
    stage_name = db.Column(db.String(50), nullable=False)
    result_json = db.Column(db.JSON, nullable=False)
    score = db.Column(db.Integer, nullable=True)
    version = db.Column(db.Integer, default=1)  # Increments with AI Layers refinements
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.Index('idx_idea_stage', 'idea_id', 'stage_name'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "idea_id": self.idea_id,
            "stage_number": self.stage_number,
            "stage_name": self.stage_name,
            "result_json": self.result_json,
            "score": self.score,
            "version": self.version,
            "created_at": self.created_at.isoformat()
        }


class AILayersSession(db.Model):
    """Tracks AI Layers improvement sessions."""
    __tablename__ = 'ai_layers_sessions'

    id = db.Column(db.Integer, primary_key=True)
    idea_id = db.Column(db.Integer, db.ForeignKey('ideas.id'), nullable=False)
    conversation = db.Column(db.JSON)  # [{role: "ai"|"user", content: "..."}]
    status = db.Column(db.String(20), default='active')  # active / complete
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "idea_id": self.idea_id,
            "conversation": self.conversation,
            "status": self.status,
            "created_at": self.created_at.isoformat()
        }


class ChecklistItem(db.Model):
    """Execution checklist items per idea."""
    __tablename__ = 'checklist_items'

    id = db.Column(db.Integer, primary_key=True)
    idea_id = db.Column(db.Integer, db.ForeignKey('ideas.id'), nullable=False)
    category = db.Column(db.String(50))  # pre-launch / build / launch
    text = db.Column(db.String(500), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    sort_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "idea_id": self.idea_id,
            "category": self.category,
            "text": self.text,
            "is_completed": self.is_completed,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "sort_order": self.sort_order
        }


class ResearchNote(db.Model):
    """Saved research queries and results per idea."""
    __tablename__ = 'research_notes'

    id = db.Column(db.Integer, primary_key=True)
    idea_id = db.Column(db.Integer, db.ForeignKey('ideas.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    query = db.Column(db.String(500))
    result = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "idea_id": self.idea_id,
            "user_id": self.user_id,
            "query": self.query,
            "result": self.result,
            "created_at": self.created_at.isoformat()
        }


class TokenBlacklist(db.Model):
    """Blacklisted JWT tokens for proper logout."""
    __tablename__ = 'token_blacklist'

    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(512), unique=True, nullable=False)
    blacklisted_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.Index('idx_token', 'token'),
    )


class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    author_name = db.Column(db.String(50), default="Anonymous")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    idea_id = db.Column(db.Integer, db.ForeignKey('ideas.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "author_name": self.author_name,
            "created_at": self.created_at.isoformat(),
            "idea_id": self.idea_id
        }

class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "content": self.content,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat()
        }


class BlockedUser(db.Model):
    __tablename__ = 'blocked_users'

    id = db.Column(db.Integer, primary_key=True)
    blocker_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    blocked_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('blocker_id', 'blocked_id'),)


class UserReport(db.Model):
    __tablename__ = 'user_reports'

    id = db.Column(db.Integer, primary_key=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reported_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reason = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default='info')  # info, success, warning, comment
    is_read = db.Column(db.Boolean, default=False)
    link = db.Column(db.String(500), nullable=True)  # optional URL to navigate to
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('notifications', lazy=True, order_by='Notification.created_at.desc()'))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "link": self.link,
            "created_at": self.created_at.isoformat(),
        }
