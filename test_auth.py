import sys
import os

# Add the backend directory to the search path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import create_app, db
from app.models.user_model import User
from app.services.auth_service import AuthService

app = create_app()
with app.app_context():
    # Clear existing users to be sure
    # db.drop_all() # Dangerous if they have data
    db.create_all()
    
    test_email = "test@example.com"
    test_password = "password123"
    
    # Check if exists
    user = User.query.filter_by(email=test_email).first()
    if user:
        db.session.delete(user)
        db.session.commit()
    
    # Register
    print(f"Registering {test_email}...")
    reg_data = {
        "email": test_email,
        "password": test_password,
        "first_name": "Test",
        "last_name": "User"
    }
    resp, code = AuthService.register_user(reg_data)
    print(f"Register Response: {code}")
    
    # Login
    print(f"Logging in {test_email}...")
    login_data = {
        "email": test_email,
        "password": test_password
    }
    resp, code = AuthService.login_user(login_data)
    print(f"Login Response: {code}")
    if code == 200:
        print("Login SUCCESSFUL")
    else:
        print(f"Login FAILED: {resp.get('error')}")
        # Check hash length
        u = User.query.filter_by(email=test_email).first()
        if u:
            print(f"Hash length: {len(u.password_hash)}")
            print(f"Hash: {u.password_hash}")
