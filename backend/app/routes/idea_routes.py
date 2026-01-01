from flask import Blueprint, request, jsonify
from app.services.idea_analysis_service import IdeaAnalysisService
from app.models.user_model import Idea
from app.middleware.auth_middleware import token_required
from app.utils.response_formatter import ResponseFormatter

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
