import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app import create_app, db
app = create_app()
with app.app_context():
    db.drop_all()
    db.create_all()
    print("Database schema reset successfully with updated column lengths.")
