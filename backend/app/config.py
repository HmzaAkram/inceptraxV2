import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-12345')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///inceptrax.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')
    SERPAPI_KEY = os.environ.get('SERPAPI_KEY', 'b7e80144a76185547005e01e8d91516abfc472637adc52cfa4b60b237eadec0c')
    SERP_API_KEY = os.environ.get('SERP_API_KEY', 'b7e80144a76185547005e01e8d91516abfc472637adc52cfa4b60b237eadec0c')
    JWT_SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-12345')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours
