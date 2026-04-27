from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app.config import Config
import os

db = SQLAlchemy()

# Initialize Flask-Limiter globally
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)

    # ─── CORS ─────────────────────────────────────────────────────────────
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    CORS(app, resources={r"/*": {
        "origins": [FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }})

    # ─── Extensions ───────────────────────────────────────────────────────
    db.init_app(app)
    limiter.init_app(app)

    # ─── Blueprints ───────────────────────────────────────────────────────
    from app.routes.auth_routes import auth_bp
    from app.routes.idea_routes import idea_bp
    from app.routes.user_routes import user_bp
    from app.routes.cofounder_routes import cofounder_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.notification_routes import notification_bp
    from app.routes.contact_routes import contact_bp
    from app.routes.chat_routes import chat_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(idea_bp, url_prefix='/ideas')
    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(cofounder_bp, url_prefix='/cofounder')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(notification_bp, url_prefix='/notifications')
    app.register_blueprint(contact_bp)
    app.register_blueprint(chat_bp, url_prefix='/chat')

    # ─── Security Headers ─────────────────────────────────────────────────
    @app.after_request
    def add_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = 'camera=(), microphone=(self), geolocation=()'

        # Only add HSTS in production
        if not app.debug:
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'

        return response

    # ─── Error Handlers ───────────────────────────────────────────────────
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return jsonify({"error": "Too many requests. Please slow down.", "message": str(e.description)}), 429

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    # ─── Background Scheduler ─────────────────────────────────────────────
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from app.scheduler import scan_all_active_watches

        scheduler = BackgroundScheduler()
        scheduler.add_job(func=scan_all_active_watches, trigger="interval", hours=24)
        scheduler.start()

        print("[Scheduler] Background scheduler started. Daily competitor scans enabled.")
    except Exception as e:
        print(f"[Scheduler] Failed to start: {e}")

    return app
