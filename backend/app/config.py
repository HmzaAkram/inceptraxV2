import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Core Flask
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', os.getenv('SECRET_KEY'))

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///inceptrax.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # AI / APIs — no hardcoded fallbacks
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')
    SERPAPI_KEY = os.getenv('SERPAPI_KEY')

    # Email
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')

    # Frontend URL for CORS and password reset links
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

    # Token expiry (in days)
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_EXPIRES', '7'))
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv('JWT_REFRESH_EXPIRES', '30'))
