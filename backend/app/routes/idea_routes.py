from flask import Blueprint, request, jsonify, send_file
from app.services.idea_analysis_service import IdeaAnalysisService
from app.services.gemini_service import GeminiService
from app.services.pdf_service import PDFService
from app.services.market_service import MarketService
from app.services.competitor_monitoring_service import CompetitorMonitoringService
from app.models.user_model import Idea
from app.models.competitor_model import CompetitorWatch, CompetitorAlert
from app.middleware.auth_middleware import token_required
from app.utils.response_formatter import ResponseFormatter
import os
import json
from app import db

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
        
        system_instruction = """You are an expert transcriber. Your job is to extract the EXACT text from the provided input verbatim. Do not summarize, outline, or alter the text.
Output JSON format:
{
    "title": "",
    "description": "exact transcribed text here"
}"""
        # Extract idea from audio
        extracted_text = GeminiService.extract_idea_from_media(
            mime_type=mime_type, 
            data=file_data,
            prompt="Transcribe this audio recording EXACTLY. Return valid JSON only.",
            system_instruction=system_instruction
        )
        
        # Clean potential markdown code blocks
        cleaned_json = extracted_text.replace('```json', '').replace('```', '').strip()
        idea_data = json.loads(cleaned_json)
        
        # Increment admin tracking credits
        current_user.api_credits_used += 1
        db.session.commit()
        
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
        
        system_instruction = """You are an expert text extractor. Your job is to extract the EXACT text from the provided document, image, or presentation verbatim. Do not summarize, outline, or alter the text.
Output JSON format:
{
    "title": "",
    "description": "exact extracted text here"
}"""
        # Extract idea from file
        extracted_text = GeminiService.extract_idea_from_media(
            mime_type=mime_type, 
            data=file_data,
            prompt="Extract the EXACT text from this file verbatim. Return valid JSON only.",
            system_instruction=system_instruction
        )
        
        # Clean potential markdown code blocks
        cleaned_json = extracted_text.replace('```json', '').replace('```', '').strip()
        idea_data = json.loads(cleaned_json)
        
        # Increment admin tracking credits
        current_user.api_credits_used += 1
        db.session.commit()
        
        return ResponseFormatter.success(
            data=idea_data,

            message="File processed successfully"
        )
        
    except Exception as e:
        print(f"File processing error: {str(e)}")
        return ResponseFormatter.error(f"Failed to process file: {str(e)}", status=500)





# ============================================
# Competitor Watch Endpoints
# ============================================

@idea_bp.route('/<int:idea_id>/competitor-watch', methods=['GET'])
@token_required
def get_competitor_watch(current_user, idea_id):
    """Get competitor watch configuration for an idea"""
    idea = Idea.query.get(idea_id)
    if not idea or idea.user_id != current_user.id:
        return ResponseFormatter.error("Idea not found", status=404)
    
    watch = CompetitorWatch.query.filter_by(idea_id=idea_id).first()
    
    if not watch:
        return ResponseFormatter.success(
            data={'watch': None, 'has_watch': False},
            message="No competitor watch configured"
        )
    
    return ResponseFormatter.success(
        data={'watch': watch.to_dict(), 'has_watch': True},
        message="Competitor watch retrieved"
    )


@idea_bp.route('/<int:idea_id>/competitor-watch', methods=['POST'])
@token_required
def create_or_update_competitor_watch(current_user, idea_id):
    """Create or update competitor watch for an idea"""
    idea = Idea.query.get(idea_id)
    if not idea or idea.user_id != current_user.id:
        return ResponseFormatter.error("Idea not found", status=404)
    
    data = request.get_json(silent=True) or {}
    
    try:
        watch = CompetitorWatch.query.filter_by(idea_id=idea_id).first()
        
        if watch:
            # Update existing watch
            if 'is_active' in data:
                watch.is_active = data['is_active']
            if 'scan_frequency' in data:
                watch.scan_frequency = data['scan_frequency']
            if 'keywords' in data:
                watch.keywords = data['keywords']
        else:
            # Create new watch
            result = CompetitorMonitoringService.create_watch_for_idea(idea_id)
            if 'error' in result:
                print(f"Watch creation error for idea {idea_id}: {result['error']}")
                return ResponseFormatter.error(result['error'])
            watch = result['watch']
        
        from app import db
        db.session.commit()
        
        return ResponseFormatter.success(
            data={'watch': watch.to_dict()},
            message="Competitor watch configured successfully"
        )
    except Exception as e:
        print(f"Watch configuration exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return ResponseFormatter.error(f"Internal error: {str(e)}", status=500)


@idea_bp.route('/<int:idea_id>/competitor-watch', methods=['DELETE'])
@token_required
def delete_competitor_watch(current_user, idea_id):
    """Delete competitor watch for an idea"""
    idea = Idea.query.get(idea_id)
    if not idea or idea.user_id != current_user.id:
        return ResponseFormatter.error("Idea not found", status=404)
    
    watch = CompetitorWatch.query.filter_by(idea_id=idea_id).first()
    if not watch:
        return ResponseFormatter.error("No watch found", status=404)
    
    from app import db
    db.session.delete(watch)
    db.session.commit()
    
    return ResponseFormatter.success(message="Competitor watch deleted")


@idea_bp.route('/<int:idea_id>/alerts', methods=['GET'])
@token_required
def get_competitor_alerts(current_user, idea_id):
    """Get competitor alerts for an idea"""
    idea = Idea.query.get(idea_id)
    if not idea or idea.user_id != current_user.id:
        return ResponseFormatter.error("Idea not found", status=404)
    
    watch = CompetitorWatch.query.filter_by(idea_id=idea_id).first()
    if not watch:
        return ResponseFormatter.success(
            data={'alerts': [], 'total': 0},
            message="No watch configured"
        )
    
    # Get query parameters
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    limit = int(request.args.get('limit', 50))
    
    query = CompetitorAlert.query.filter_by(watch_id=watch.id)
    
    if unread_only:
        query = query.filter_by(is_read=False)
    
    alerts = query.order_by(CompetitorAlert.discovered_at.desc()).limit(limit).all()
    
    return ResponseFormatter.success(
        data={
            'alerts': [alert.to_dict() for alert in alerts],
            'total': len(alerts),
            'unread_count': sum(1 for a in alerts if not a.is_read)
        },
        message="Alerts retrieved"
    )


@idea_bp.route('/alerts/<int:alert_id>/read', methods=['PATCH'])
@token_required
def mark_alert_read(current_user, alert_id):
    """Mark an alert as read"""
    alert = CompetitorAlert.query.get(alert_id)
    if not alert:
        return ResponseFormatter.error("Alert not found", status=404)
    
    # Verify ownership through watch -> idea -> user
    watch = CompetitorWatch.query.get(alert.watch_id)
    if not watch:
        return ResponseFormatter.error("Watch not found", status=404)
    
    idea = Idea.query.get(watch.idea_id)
    if not idea or idea.user_id != current_user.id:
        return ResponseFormatter.error("Unauthorized", status=403)
    
    alert.is_read = True
    from app import db
    db.session.commit()
    
    return ResponseFormatter.success(
        data={'alert': alert.to_dict()},
        message="Alert marked as read"
    )


@idea_bp.route('/<int:idea_id>/competitor-watch/scan', methods=['POST'])
@token_required
def trigger_competitor_scan(current_user, idea_id):
    """Manually trigger a competitor scan"""
    idea = Idea.query.get(idea_id)
    if not idea or idea.user_id != current_user.id:
        return ResponseFormatter.error("Idea not found", status=404)
    
    watch = CompetitorWatch.query.filter_by(idea_id=idea_id).first()
    if not watch:
        return ResponseFormatter.error("No watch configured", status=404)
    
    result = CompetitorMonitoringService.scan_competitors(watch.id)
    
    if 'error' in result:
        return ResponseFormatter.error(result['error'])
    
    return ResponseFormatter.success(
        data=result,
        message=f"Scan completed. Found {result.get('new_alerts', 0)} new alerts."
    )

