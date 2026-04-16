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


    ideas = db.relationship('Idea', backref='author', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "is_admin": self.is_admin,
            "api_credits_used": self.api_credits_used,
            "created_at": self.created_at.isoformat()
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
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # New fields for AI analysis
    problem = db.Column(db.Text, nullable=True)
    solution = db.Column(db.Text, nullable=True)
    audience = db.Column(db.Text, nullable=True)
    market = db.Column(db.Text, nullable=True)
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

    # Visibility / sharing
    is_public = db.Column(db.Boolean, default=False, nullable=False)
    share_token = db.Column(db.String(64), unique=True, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
            "user_id": self.user_id,
            "problem": self.problem,
            "solution": self.solution,
            "audience": self.audience,
            "market": self.market,
            "status": self.status,
            "analysis_status": self.analysis_status,
            "analysis_data": self.analysis_data,
            "validation_score": self.validation_score,
            "is_public": self.is_public,
            "share_token": self.share_token
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
            "status": self.status,
            "analysis_data": self.analysis_data,
            "validation_score": self.validation_score,
            "is_public": self.is_public,
            "share_token": self.share_token
        }

    @property
    def validation_score(self):
        if self.analysis_data and 'overall_score' in self.analysis_data:
            return self.analysis_data.get('overall_score', 0)
        return 0

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
