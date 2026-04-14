import sqlite3
from app import create_app, db
from app.models.stats_model import SystemStats
from app.models.user_model import User
from werkzeug.security import generate_password_hash

def upgrade_db():
    app = create_app()
    with app.app_context():
        # First, ensure all new tables are created
        db.create_all()

        db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
        if db_path == 'inceptrax.db':
            db_path = 'instance/inceptrax.db'
        
        if db_path.startswith('sqlite://'):
            # In-memory or different config, skip manual alter
            pass
        else:
            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                try:
                    cursor.execute('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0')
                except sqlite3.OperationalError as e:
                    print("is_admin maybe already exists:", e)
                
                try:
                    cursor.execute('ALTER TABLE users ADD COLUMN api_credits_used INTEGER DEFAULT 0')
                except sqlite3.OperationalError as e:
                    print("api_credits_used maybe already exists:", e)
                
                conn.commit()
                conn.close()
            except Exception as e:
                print("Error connecting to sqlite3 directly:", e)

        # Seed the admin user if not exists
        admin_email = "hmzaakram295@gmail.com"
        admin = User.query.filter_by(email=admin_email).first()
        if not admin:
            admin = User(
                first_name="Admin",
                last_name="User",
                email=admin_email,
                is_admin=True
            )
            admin.set_password("dear036409")
            db.session.add(admin)
            print(f"Created admin user {admin_email}")
        else:
            # Upgrade existing user to admin
            admin.is_admin = True
            print(f"Upgraded {admin_email} to admin")
        
        db.session.commit()
        print("Database migration completed successfully!")

if __name__ == '__main__':
    upgrade_db()
