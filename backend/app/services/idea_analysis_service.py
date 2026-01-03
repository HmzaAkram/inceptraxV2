import os
import json
from app.services.gemini_service import GeminiService
from app.models.user_model import Idea
from app import db

BASE_PATH = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

def load_prompt(filename):
    with open(os.path.join(BASE_PATH, 'prompts', filename), 'r') as f:
        return f.read()

class IdeaAnalysisService:

    @staticmethod
    def create_idea(user_id, data):
        idea = Idea(
            user_id=user_id,
            title=data.get('title'),
            description=data.get('description'),
            problem=data.get('problem'),
            solution=data.get('solution'),
            audience=data.get('audience'),
            market=data.get('market'),
            status='pending',
            analysis_status={
                "validation": "pending",
                "market": "pending",
                "competitors": "pending",
                "mvp": "pending",
                "monetization": "pending",
                "gtm": "pending"
            }
        )
        db.session.add(idea)
        db.session.commit()
        return idea

    @staticmethod
    def run_validation(idea: Idea):
        system_prompt = load_prompt("system_prompt.txt")
        validation_prompt = load_prompt("idea_validation_prompt.txt").format(
            title=idea.title,
            description=idea.description,
            problem=idea.problem or "Not specified",
            solution=idea.solution or "Not specified",
            audience=idea.audience or "General",
            market=idea.market or "Unknown"
        )

        response = GeminiService.generate_analysis(validation_prompt, system_prompt)
        data = json.loads(response)

        idea.analysis_data = data
        idea.analysis_status["validation"] = "completed"
        db.session.commit()

    @staticmethod
    def process_idea_analysis(idea_id: int):
        idea = Idea.query.get(idea_id)
        if not idea:
            return None

        try:
            idea.status = "processing"
            db.session.commit()

            IdeaAnalysisService.run_validation(idea)

            idea.status = "completed"
            db.session.commit()

            return idea.analysis_data

        except Exception as e:
            idea.status = "failed"
            idea.analysis_status["validation"] = "failed"
            idea.analysis_data = {
                "error": "AI analysis failed",
                "details": str(e)
            }
            db.session.commit()
            return idea.analysis_data
