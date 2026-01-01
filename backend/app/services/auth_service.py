import jwt
import datetime
from flask import current_app
from app.models.user_model import User
from app import db

class AuthService:
    @staticmethod
    def generate_token(user_id):
        try:
            payload = {
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
                'iat': datetime.datetime.utcnow(),
                'sub': user_id
            }
            return jwt.encode(
                payload,
                current_app.config.get('SECRET_KEY'),
                algorithm='HS256'
            )
        except Exception as e:
            return str(e)

    @staticmethod
    def decode_token(token):
        try:
            payload = jwt.decode(
                token,
                current_app.config.get('SECRET_KEY'),
                algorithms=['HS256']
            )
            return payload['sub']
        except jwt.ExpiredSignatureError:
            return 'Signature expired. Please log in again.'
        except jwt.InvalidTokenError:
            return 'Invalid token. Please log in again.'

    @staticmethod
    def register_user(data):
        email = data.get('email')
        if User.query.filter_by(email=email).first():
            return {'error': 'User already exists'}, 400
        
        user = User(
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            email=email
        )
        user.set_password(data.get('password'))
        
        db.session.add(user)
        db.session.commit()
        
        token = AuthService.generate_token(user.id)
        return {
            'message': 'User registered successfully',
            'token': token,
            'user': user.to_dict()
        }, 201

    @staticmethod
    def login_user(data):
        user = User.query.filter_by(email=data.get('email')).first()
        if user and user.check_password(data.get('password')):
            token = AuthService.generate_token(user.id)
            return {
                'message': 'Login successful',
                'token': token,
                'user': user.to_dict()
            }, 200
        return {'error': 'Invalid email or password'}, 401
