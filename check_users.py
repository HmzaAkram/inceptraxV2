import sys
import os

# Add the backend directory to the search path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app import create_app, db
    from app.models.user_model import User
    
    app = create_app()
    with app.app_context():
        users = User.query.all()
        print(f"Total users: {len(users)}")
        for u in users:
            print(f"- ID: {u.id}, Email: {u.email}, Name: {u.first_name} {u.last_name}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
