from flask import Blueprint, request, jsonify, send_file
from app.services.idea_analysis_service import IdeaAnalysisService
from app.services.gemini_service import GeminiService
from app.services.pdf_service import PDFService
from app.services.market_service import MarketService
from app.models.user_model import Idea
from app.middleware.auth_middleware import token_required
from app.utils.response_formatter import ResponseFormatter
import os
import json

idea_bp = Blueprint('idea', __name__)

@idea_bp.route('/', methods=['POST'])
@token_required
def create_idea(current_user):
    data = request.get_json()
    if not data:
        return ResponseFormatter.error("Missing request data")
    
    idea = IdeaAnalysisService.create_idea(current_user.id, data)
    
    # Trigger analysis (This could be asynchronous in production, but here we do it synchronously or simulate it)
    # The requirement says "no dummy responses", so we perform real analysis.
    # For better UX, we could return the idea ID and have the frontend poll, 
    # but the frontend redirect logic suggests it expects the idea to exist.
    
    analysis_results = IdeaAnalysisService.process_idea_analysis(idea.id)
    
    return ResponseFormatter.success(
        data={'idea': idea.to_dict()},
        message="Idea created and analyzed successfully",
        status=201
    )

@idea_bp.route('/', methods=['GET'])
@token_required
def get_user_ideas(current_user):
    ideas = Idea.query.filter_by(user_id=current_user.id).all()
    return ResponseFormatter.success(
        data={'ideas': [idea.to_dict() for idea in ideas]}
    )

@idea_bp.route('/<int:idea_id>', methods=['GET'])
@token_required
def get_idea(current_user, idea_id):
    idea = Idea.query.get(idea_id)
    if not idea or idea.user_id != current_user.id:
        return ResponseFormatter.error("Idea not found", status=404)
    
    return ResponseFormatter.success(data={'idea': idea.to_dict()})

@idea_bp.route('/<int:idea_id>/download', methods=['GET'])
@token_required
def download_report(current_user, idea_id):
    idea = Idea.query.get(idea_id)
    if not idea or idea.user_id != current_user.id:
        return ResponseFormatter.error("Idea not found", status=404)
        
    try:
        file_path = PDFService.generate_report(idea)
        return send_file(
            file_path,
            as_attachment=True,
            download_name=f"{idea.title.replace(' ', '_')}-Full-Analysis.pdf"
        )
    except Exception as e:
        return ResponseFormatter.error(f"Failed to generate PDF: {str(e)}", status=500)

@idea_bp.route('/<int:idea_id>', methods=['DELETE'])
@token_required
def delete_idea(current_user, idea_id):
    success = IdeaAnalysisService.delete_idea(idea_id, current_user.id)
    if success:
        return ResponseFormatter.success(message="Idea deleted successfully")
    return ResponseFormatter.error("Idea not found or unauthorized", status=404)

@idea_bp.route('/<int:idea_id>/reanalyze', methods=['POST'])
@token_required
def reanalyze_idea(current_user, idea_id):
    idea = Idea.query.get(idea_id)
    if not idea or idea.user_id != current_user.id:
        return ResponseFormatter.error("Idea not found", status=404)
    
    analysis_results = IdeaAnalysisService.process_idea_analysis(idea.id)
    return ResponseFormatter.success(
        data={'idea': idea.to_dict()},
        message="Idea re-analyzed successfully"
    )

@idea_bp.route('/<int:idea_id>/market/research', methods=['POST'])
@token_required
def fetch_market_research(current_user, idea_id):
    idea = Idea.query.get(idea_id)
    if not idea or idea.user_id != current_user.id:
        return ResponseFormatter.error("Idea not found", status=404)
        
    results = MarketService.fetch_market_data(idea.id)
    if isinstance(results, dict) and "error" in results:
        return ResponseFormatter.error(results["error"], status=500)
        
    return ResponseFormatter.success(
        data={'market_data': results},
        message="Market data fetched successfully"
    )

@idea_bp.route('/upload/voice', methods=['POST'])
@token_required
def upload_voice(current_user):
    if 'file' not in request.files:
        return ResponseFormatter.error("No file part")
    
    file = request.files['file']
    if file.filename == '':
        return ResponseFormatter.error("No selected file")
        
    try:
        file_data = file.read()
        mime_type = file.content_type or "audio/wav"
        
        # Extract idea from audio
        extracted_text = GeminiService.extract_idea_from_media(
            mime_type=mime_type, 
            data=file_data,
            prompt="Listen to this voice note and extract the startup idea details. Return valid JSON only."
        )
        
        # Clean potential markdown code blocks
        cleaned_json = extracted_text.replace('```json', '').replace('```', '').strip()
        idea_data = json.loads(cleaned_json)
        
        return ResponseFormatter.success(
            data=idea_data,
            message="Voice processed successfully"
        )
        
    except Exception as e:
        print(f"Voice processing error: {str(e)}")
        return ResponseFormatter.error(f"Failed to process voice: {str(e)}", status=500)

@idea_bp.route('/upload/file', methods=['POST'])
@token_required
def upload_file(current_user):
    if 'file' not in request.files:
        return ResponseFormatter.error("No file part")
    
    file = request.files['file']
    if file.filename == '':
        return ResponseFormatter.error("No selected file")
        
    try:
        file_data = file.read()
        mime_type = file.content_type or "application/pdf"
        
        # Extract idea from file
        extracted_text = GeminiService.extract_idea_from_media(
            mime_type=mime_type, 
            data=file_data,
            prompt="Analyze this document/image and extract the startup idea details. Return valid JSON only."
        )
        
        # Clean potential markdown code blocks
        cleaned_json = extracted_text.replace('```json', '').replace('```', '').strip()
        idea_data = json.loads(cleaned_json)
        
        return ResponseFormatter.success(
            data=idea_data,
            message="File processed successfully"
        )
        
    except Exception as e:
        print(f"File processing error: {str(e)}")
        return ResponseFormatter.error(f"Failed to process file: {str(e)}", status=500)

@idea_bp.route('/<int:idea_id>/refine', methods=['POST'])
@token_required
def refine_idea_section(current_user, idea_id):
    idea = Idea.query.get(idea_id)
    if not idea or idea.user_id != current_user.id:
        return ResponseFormatter.error("Idea not found", status=404)
        
    data = request.get_json()
    if not data or 'section' not in data or 'query' not in data:
        return ResponseFormatter.error("Missing section or query")
        
    section = data['section']
    query = data['query']
    
    # Get current section data
    analysis = idea.analysis_data or {}
    
    # Map frontend section names to DB keys
    section_map = {
        'market': 'market_research',
        'competitors': 'competitors',
        'monetization': 'monetization_strategy',
        'mvp': 'mvp_blueprint',
        'gtm': 'gtm_strategy', 
        'validation': 'scores' # simpler mapping for validation
    }
    
    db_key = section_map.get(section, section)
    current_section_data = analysis.get(db_key, {})
    
    try:
        # Call Gemini to refine
        refined_json_text = GeminiService.refine_analysis(current_section_data, section, query)
        
        # Clean and parse response - handle various formats
        cleaned_json = refined_json_text.strip()
        
        # Remove markdown code fences if present
        if '```json' in cleaned_json:
            cleaned_json = cleaned_json.split('```json')[1]
            cleaned_json = cleaned_json.split('```')[0]
        elif '```' in cleaned_json:
            cleaned_json = cleaned_json.split('```')[1]
            if cleaned_json.count('```') > 0:
                cleaned_json = cleaned_json.split('```')[0]
        
        cleaned_json = cleaned_json.strip()
        
        # Try to find JSON object boundaries if there's extra text
        if not cleaned_json.startswith('{') and not cleaned_json.startswith('['):
            # Find first { or [
            start_idx = min(
                cleaned_json.find('{') if cleaned_json.find('{') != -1 else len(cleaned_json),
                cleaned_json.find('[') if cleaned_json.find('[') != -1 else len(cleaned_json)
            )
            cleaned_json = cleaned_json[start_idx:]
        
        # Find the end of the JSON by counting braces
        if cleaned_json.startswith('{'):
            brace_count = 0
            for i, char in enumerate(cleaned_json):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        cleaned_json = cleaned_json[:i+1]
                        break
        elif cleaned_json.startswith('['):
            bracket_count = 0
            for i, char in enumerate(cleaned_json):
                if char == '[':
                    bracket_count += 1
                elif char == ']':
                    bracket_count -= 1
                    if bracket_count == 0:
                        cleaned_json = cleaned_json[:i+1]
                        break
        
        try:
            updated_data = json.loads(cleaned_json)
        except json.JSONDecodeError as je:
            print(f"JSON parsing failed. Raw response: {refined_json_text[:500]}")
            print(f"Cleaned JSON: {cleaned_json[:500]}")
            print(f"JSON Error: {str(je)}")
            raise ValueError(f"Invalid JSON response from AI: {str(je)}")
        
        # Update specific section in analysis
        analysis[db_key] = updated_data
        
        # Save to DB
        idea.analysis_data = analysis
        from app import db
        db.session.commit()
        
        return ResponseFormatter.success(
            data={
                'section': section,
                'updated_data': updated_data,
                'message': "I've updated the plan based on your feedback."
            },
            message="Analysis refined successfully"
        )
        
    except Exception as e:
        print(f"Refinement error: {str(e)}")
        import traceback
        traceback.print_exc()
        return ResponseFormatter.error(f"Failed to refine analysis: {str(e)}", status=500)
