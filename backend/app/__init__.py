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

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(idea_bp, url_prefix='/api/ideas')
    app.register_blueprint(user_bp, url_prefix='/api/users')

    return app
