from app import db
from datetime import datetime

class CompetitorWatch(db.Model):
    __tablename__ = 'competitor_watch'
    
    id = db.Column(db.Integer, primary_key=True)
    idea_id = db.Column(db.Integer, db.ForeignKey('ideas.id'), nullable=False)
    keywords = db.Column(db.JSON, nullable=False)  # List of search keywords
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    scan_frequency = db.Column(db.String(20), default='daily', nullable=False)  # 'daily' or 'weekly'
    last_scan_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    idea = db.relationship('Idea', backref='competitor_watch')
    alerts = db.relationship('CompetitorAlert', backref='watch', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'idea_id': self.idea_id,
            'keywords': self.keywords,
            'is_active': self.is_active,
            'scan_frequency': self.scan_frequency,
            'last_scan_at': self.last_scan_at.isoformat() if self.last_scan_at else None,
            'created_at': self.created_at.isoformat(),
            'unread_alerts_count': sum(1 for alert in self.alerts if not alert.is_read)
        }


class CompetitorAlert(db.Model):
    __tablename__ = 'competitor_alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    watch_id = db.Column(db.Integer, db.ForeignKey('competitor_watch.id'), nullable=False)
    alert_type = db.Column(db.String(50), nullable=False)  # 'new_startup', 'funding', 'launch', 'other'
    title = db.Column(db.String(500), nullable=False)
    snippet = db.Column(db.Text, nullable=True)
    url = db.Column(db.String(1000), nullable=False)
    source = db.Column(db.String(100), nullable=False)  # 'google_search', 'google_news'
    relevance_score = db.Column(db.Float, default=0.5, nullable=False)  # 0.0 to 1.0
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    discovered_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'watch_id': self.watch_id,
            'alert_type': self.alert_type,
            'title': self.title,
            'snippet': self.snippet,
            'url': self.url,
            'source': self.source,
            'relevance_score': self.relevance_score,
            'is_read': self.is_read,
            'discovered_at': self.discovered_at.isoformat()
        }
