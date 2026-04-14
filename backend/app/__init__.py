from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from app.config import Config

db = SQLAlchemy()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": [
        "http://localhost:3000", 
        "https://hmzaakram.pythonanywhere.com",
        "https://inceptrax-v2.vercel.app"
    ]}}, supports_credentials=True)
    db.init_app(app)

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.idea_routes import idea_bp
    from app.routes.user_routes import user_bp
    from app.routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(idea_bp, url_prefix='/api/ideas')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Initialize background scheduler
    with app.app_context():
        init_scheduler()

    from app.routes.contact_routes import contact_bp
    app.register_blueprint(contact_bp, url_prefix='/api')
    
    return app


def init_scheduler():
    """Initialize APScheduler for background tasks"""
    from apscheduler.schedulers.background import BackgroundScheduler
    from app.scheduler import scan_all_active_watches
    import atexit
    
    scheduler = BackgroundScheduler()
    
    # Schedule daily competitor scans at 9 AM
    scheduler.add_job(
        func=scan_all_active_watches,
        trigger="cron",
        hour=9,
        minute=0,
        id='competitor_scan_daily'
    )
    
    scheduler.start()
    print("[Scheduler] Background scheduler started. Daily competitor scans enabled.")
    
    # Shut down scheduler when app exits
    atexit.register(lambda: scheduler.shutdown())

