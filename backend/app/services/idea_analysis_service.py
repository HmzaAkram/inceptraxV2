import os
from flask import current_app
import json
from app.services.gemini_service import GeminiService
from app.models.user_model import Idea
from app import db

class IdeaAnalysisService:
    @staticmethod
    def process_idea_analysis(idea_id):
        idea = Idea.query.get(idea_id)
        if not idea:
            return None
        
        # Load prompts
        base_path = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        with open(os.path.join(base_path, 'prompts', 'system_prompt.txt'), 'r') as f:
            system_prompt = f.read()
        
        with open(os.path.join(base_path, 'prompts', 'idea_validation_prompt.txt'), 'r') as f:
            validation_prompt_template = f.read()
        
        # Format prompt
        prompt = validation_prompt_template.format(
            title=idea.title,
            description=idea.description,
            problem=idea.problem,
            solution=idea.solution,
            audience=idea.audience,
            market=idea.market
        )
        
        try:
            # Update status to processing
            idea.status = 'processing'
            db.session.commit()
            
            # Call Gemini
            analysis_json = GeminiService.generate_analysis(prompt, system_prompt)
            analysis_data = json.loads(analysis_json)
            
            # Update idea with results
            idea.analysis_data = analysis_data
            idea.validation_score = analysis_data.get('overall_score', 0)
            idea.status = 'completed'
            db.session.commit()
            
            return analysis_data
        except Exception as e:
            # Fallback Validation Logic (Antigravity Emergency Stabilizers)
            print(f"Error analyzing idea {idea_id}: {str(e)}")
            
            fallback_data = {
                "overall_score": 50,
                "market_demand": "Unable to verify (AI Gravity Source Unavailable)",
                "problem_severity": "Validation pending due to system error",
                "growth_potential": "Analysis suspended",
                "strengths": ["System recorded the idea correctly"],
                "risks": ["AI analysis failure: " + str(e)],
                "recommendation": "The 'Source of Gravity' (Gemini model) was unreachable. Please retry the analysis in a few minutes.",
                "market_research": {
                    "tam": "N/A", "sam": "N/A", "som": "N/A",
                    "trends": ["System Error: AI Model Timeout"],
                    "segments": ["Error Recovery Mode"]
                },
                "competitors": [
                    {"name": "Internal Error", "type": "Critical", "threat": "High", "strengths": ["None"], "weaknesses": ["Model not found"]}
                ],
                "monetization": {
                    "pricing_model": "N/A",
                    "recommended_strategy": "Error recovery - check system logs",
                    "plans": [],
                    "conversion_logic": "N/A"
                },
                "mvp_blueprint": [],
                "gtm_strategy": {
                    "acquisition_channels": [],
                    "messaging": {"hook": "N/A", "value_prop": "N/A"},
                    "funnel_stages": {"awareness": "N/A", "activation": "N/A", "conversion": "N/A"},
                    "early_traction": "N/A"
                }
            }
            
            idea.status = 'failed'
            idea.analysis_data = fallback_data
            idea.validation_score = 0
            db.session.commit()
            
            return fallback_data

    @staticmethod
    def create_idea(user_id, data):
        idea = Idea(
            user_id=user_id,
            title=data.get('title'),
            description=data.get('description'),
            problem=data.get('problem'),
            solution=data.get('solution'),
            audience=data.get('audience'),
            market=data.get('market')
        )
        db.session.add(idea)
        db.session.commit()
        return idea

    @staticmethod
    def delete_idea(idea_id, user_id):
        idea = Idea.query.filter_by(id=idea_id, user_id=user_id).first()
        if not idea:
            return False
            
        # Remove associated PDF if exists
        reports_dir = os.path.join(current_app.root_path, '..', 'instance', 'reports')
        filename = f"{idea.title.replace(' ', '_')}_{idea.id}_Analysis.pdf"
        file_path = os.path.join(reports_dir, filename)
        
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error deleting PDF file: {e}")
                
        db.session.delete(idea)
        db.session.commit()
        return True
