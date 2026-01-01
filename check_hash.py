import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app import create_app, db
from app.models.user_model import User
app = create_app()
with app.app_context():
    u = User.query.filter_by(email="test@example.com").first()
    if u:
        print(f"Hash length: {len(u.password_hash)}")
        print(f"Hash: {u.password_hash}")
