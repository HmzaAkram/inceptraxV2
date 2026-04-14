from app import db

class SystemStats(db.Model):
    __tablename__ = 'system_stats'

    id = db.Column(db.Integer, primary_key=True)
    total_visitors = db.Column(db.Integer, default=0)

    @classmethod
    def get_stats(cls):
        stats = cls.query.first()
        if not stats:
            stats = cls(total_visitors=0)
            db.session.add(stats)
            db.session.commit()
        return stats
