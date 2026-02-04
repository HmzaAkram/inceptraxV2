import sys
import os
import traceback

OUTPUT_FILE = 'debug_output.txt'

def log(msg):
    try:
        with open(OUTPUT_FILE, 'a', encoding='utf-8') as f:
            f.write(str(msg) + "\n")
    except Exception:
        pass # Fallback
    print(msg)

# Initialize file
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write("--- Debug Log Started ---\n")

# Add backend to path
sys.path.append(os.path.abspath('backend'))

log("Checking Environment Variables...")
try:
    from dotenv import load_dotenv
    # Attempt to load from common locations
    load_dotenv()
    load_dotenv(os.path.join('backend', '.env'))
    log("Loaded .env files (if present).")
except ImportError:
    log("python-dotenv not installed, using existing environment.")

# Check Key
try:
    key = os.getenv('SERPAPI_KEY')
    log(f"SERPAPI_KEY present: {bool(key)}")
    if key:
        masked = key[:5] + "..." + key[-5:] if len(key) > 10 else "***"
        log(f"Key preview: {masked}")
    else:
        log("SERPAPI_KEY is Missing!")
        alt_key = os.getenv('SERPAPI_API_KEY')
        log(f"SERPAPI_API_KEY result: {bool(alt_key)}")
except Exception as e:
    log(f"Env check error: {e}")

log("\nChecking Database...")
try:
    from app import create_app
    from app.models.competitor_model import CompetitorWatch
    
    app = create_app()
    with app.app_context():
        watch = CompetitorWatch.query.filter_by(idea_id=5).first()
        if watch:
            log(f"Watch found: ID={watch.id}")
            log(f"Is Active: {watch.is_active}")
            
            # Inspect Keywords
            keywords = watch.keywords
            log(f"Keywords Type: {type(keywords)}")
            log(f"Keywords Value: {keywords}")
            
            if isinstance(keywords, list) and keywords:
                kw_str = ' OR '.join(keywords[:3])
                log(f"Generated News Query: {kw_str} (startup OR funding OR launch OR announces)")
                log(f"Generated Search Query: {kw_str} startup OR company")
            else:
                log("WARNING: Keywords are empty or not a list.")
        else:
            log("No CompetitorWatch found for Idea 5.")
            
except Exception as e:
    log(f"App/DB Error: {e}")
    log(traceback.format_exc())

log("Debug Complete.")
