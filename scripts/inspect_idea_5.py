import sys
import os
import json

# Add backend directory to path
sys.path.append(os.path.abspath('backend'))

from app import create_app, db
from app.models.user_model import Idea

app = create_app()

with app.app_context():
    idea = Idea.query.get(5)
    if idea:
        print(f"Idea Title: {idea.title}")
        print("Analysis Data - Competitors:")
        if idea.analysis_data and 'competitors' in idea.analysis_data:
            competitors = idea.analysis_data.get('competitors', [])
            print(json.dumps(competitors, indent=2))
        else:
            print("No analysis_data or competitors found")
            print("Full analysis_data keys:", idea.analysis_data.keys() if idea.analysis_data else "None")
    else:
        print("Idea 5 not found")
