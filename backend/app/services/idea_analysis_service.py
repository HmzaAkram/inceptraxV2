import os
from flask import current_app
import json
from app.services.gemini_service import GeminiService
from app.models.user_model import Idea, User
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
            idea.status = 'completed'
            # Increment credits
            user = User.query.get(idea.user_id)
            if user:
                user.api_credits_used += 1
                
            db.session.commit()
            
            return analysis_data
        except Exception as e:
            # Fallback Validation Logic (Antigravity Emergency Stabilizers)
            print(f"Error analyzing idea {idea_id}: {str(e)}")
            
            fallback_data = {
                "overall_score": 50,
                "scores": {
                    "market_demand": { "label": "N/A (Error)", "value": 50 },
                    "problem_severity": { "label": "N/A (Error)", "value": 50 },
                    "growth_potential": { "label": "N/A (Error)", "value": 50 }
                },
                "strengths": ["System recorded the idea correctly"],
                "risks": ["AI analysis failure: " + str(e)],
                "recommendation": "The 'Source of Gravity' (Gemini model) was unreachable. Please retry the analysis in a few minutes.",
                "market_research": {
                    "tam": "N/A", "sam": "N/A", "som": "N/A",
                    "trends": [{"title": "System Error", "description": "AI Model Timeout"}],
                    "segments": [{"name": "Error Recovery", "description": "Processing failed", "percentage": "0%", "wtp": "N/A"}]
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

    @staticmethod
    def generate_investor_pitches(idea_id):
        idea = Idea.query.get(idea_id)
        if not idea:
            return {"error": "Idea not found"}
            
        # Check if already generated
        if idea.analysis_data and "investor_pitches" in idea.analysis_data:
            return idea.analysis_data["investor_pitches"]
            
        system_instruction = """You are an expert startup pitch creator and investor. 
Generate 3 distinct investor pitches based on the provided idea and its analysis data.
The format must be valid JSON matching this schema exactly:
{
    "pitches": [
        {
            "style": "string (e.g., The Visionary, The Data-Driven, The Storyteller)",
            "hook": "string (A compelling opening sentence)",
            "problem": "string (The core problem)",
            "solution": "string (How the idea solves it)",
            "traction_market": "string (Why now and the market size)",
            "ask": "string (The call to action or funding ask)",
            "full_pitch": "string (The complete 1-2 minute compiled pitch text)"
        }
    ]
}
Generate exactly 3 pitches."""
        
        prompt = f"Title: {idea.title}\nDescription: {idea.description}\nProblem: {idea.problem}\nSolution: {idea.solution}\nMarket: {idea.market}\nAnalysis Data: {json.dumps(idea.analysis_data)}"
        
        try:
            pitches_json = GeminiService.extract_idea_from_media("text/plain", bytes(prompt, "utf-8"), prompt, system_instruction)
            cleaned_json = pitches_json.replace('```json', '').replace('```', '').strip()
            pitches_data = json.loads(cleaned_json)
            
            # Save into Idea analysis_data
            if not idea.analysis_data:
                idea.analysis_data = {}
            new_data = dict(idea.analysis_data)
            new_data["investor_pitches"] = pitches_data.get("pitches", [])
            idea.analysis_data = new_data
            db.session.commit()
            
            return pitches_data.get("pitches", [])
            
        except Exception as e:
            print(f"Error generating pitches: {str(e)}")
            return {"error": "Failed to generate pitches"}

    @staticmethod
    def generate_research_hub(idea_id):
        idea = Idea.query.get(idea_id)
        if not idea:
            return {"error": "Idea not found"}

        # Return cached result if available
        if idea.analysis_data and "research_hub" in idea.analysis_data:
            return idea.analysis_data["research_hub"]

        system_instruction = """You are an expert startup strategist, researcher, and execution coach.
Given a startup idea and its full analysis data, generate a comprehensive Research & Execution Hub.
The output must be a single valid JSON object matching this schema EXACTLY:
{
    "research_links": [
        {
            "title": "string (name of the resource/report)",
            "url": "string (real, working URL to an authoritative source)",
            "source": "string (domain name, e.g. 'Statista', 'McKinsey', 'Product Hunt')",
            "relevance": "string (1 sentence on why this matters for this idea)"
        }
    ],
    "execution_checklist": [
        {
            "phase": "string (one of: Validation, MVP, Growth)",
            "step": "string (short action title)",
            "description": "string (1-2 sentences on how to do it)"
        }
    ],
    "tool_recommendations": [
        {
            "name": "string (tool name)",
            "category": "string (e.g. 'No-Code Builder', 'Analytics', 'CRM', 'Marketing')",
            "url": "string (real tool URL)",
            "use_case": "string (specific to this idea)"
        }
    ],
    "action_plan": [
        {
            "week": number,
            "focus": "string (theme for the week)",
            "tasks": ["string", "string", "string"]
        }
    ]
}
Rules:
- research_links: provide exactly 6 items with REAL, accurate URLs.
- execution_checklist: provide 4-5 items per phase (Validation, MVP, Growth) = 12-15 total, ORDERED by phase.
- tool_recommendations: provide exactly 8 tools relevant to the idea's industry and needs.
- action_plan: provide exactly 8 weeks.
- All content must be SPECIFIC to the provided idea — no generic advice.
- Return ONLY the JSON object, no markdown, no explanation."""

        analysis = idea.analysis_data or {}
        prompt = f"""Startup Idea: {idea.title}
Description: {idea.description}
Problem Being Solved: {idea.problem}
Solution: {idea.solution}
Target Audience: {idea.audience}
Market: {idea.market}

Analysis Summary:
- Overall Score: {analysis.get('overall_score', 'N/A')}/100
- GTM Strategy: {json.dumps(analysis.get('gtm_strategy', {}))}
- MVP Blueprint: {json.dumps(analysis.get('mvp_blueprint', []))}
- Market Research TAM/SAM/SOM: {json.dumps(analysis.get('market_research', {}).get('tam', 'N/A'))}, {json.dumps(analysis.get('market_research', {}).get('sam', 'N/A'))}, {json.dumps(analysis.get('market_research', {}).get('som', 'N/A'))}
- Strengths: {json.dumps(analysis.get('strengths', []))}
- Risks: {json.dumps(analysis.get('risks', []))}

Generate the Research & Execution Hub JSON now."""

        try:
            hub_json = GeminiService.extract_idea_from_media(
                "text/plain",
                bytes(prompt, "utf-8"),
                prompt,
                system_instruction
            )
            cleaned_json = hub_json.replace('```json', '').replace('```', '').strip()
            hub_data = json.loads(cleaned_json)

            # Cache in analysis_data
            if not idea.analysis_data:
                idea.analysis_data = {}
            new_data = dict(idea.analysis_data)
            new_data["research_hub"] = hub_data
            idea.analysis_data = new_data
            db.session.commit()

            return hub_data

        except Exception as e:
            print(f"Error generating research hub for idea {idea_id}: {str(e)}")
            return {"error": f"Failed to generate research hub: {str(e)}"}

