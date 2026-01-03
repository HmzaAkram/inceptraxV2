from celery import Celery
from app import create_app, db
from app.models.user_model import Idea
from app.services.idea_analysis_service import IdeaAnalysisService

# Flask app context
flask_app = create_app()
celery = Celery(
    "worker",
    broker="redis://localhost:6379/0",  # Redis broker
    backend="redis://localhost:6379/0"
)

celery.conf.update(flask_app.config)


@celery.task(bind=True)
def run_ai_analysis(self, idea_id):
    with flask_app.app_context():
        idea = Idea.query.get(idea_id)
        if not idea:
            return {"error": "Idea not found"}

        try:
            IdeaAnalysisService.run_validation(idea)
            idea.status = "completed"
            db.session.commit()
            return {"status": "success", "idea_id": idea.id}
        except Exception as e:
            idea.status = "failed"
            idea.analysis_status["validation"] = "failed"
            idea.analysis_data = {"error": str(e)}
            db.session.commit()
            return {"status": "failed", "error": str(e)}
