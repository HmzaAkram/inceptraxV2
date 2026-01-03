import os
import json
from serpapi import GoogleSearch
from app import db
from app.models.user_model import Idea

class MarketService:
    @staticmethod
    def fetch_market_data(idea_id):
        idea = Idea.query.get(idea_id)
        if not idea:
            return None

        api_key = os.getenv("SERPAPI_KEY")
        if not api_key:
            return {"error": "SERPAPI_KEY not configured"}

        # Define search queries based on idea context
        queries = [
            f"{idea.title} market size and trends 2024 2025",
            f"{idea.market} industry statistics growth rate",
            f"competitors for {idea.title} {idea.solution}"
        ]

        aggregated_results = []
        
        try:
            for query in queries:
                params = {
                    "engine": "google",
                    "q": query,
                    "api_key": api_key,
                    "num": 3  # Limit results per query to save credits/keep it focused
                }

                search = GoogleSearch(params)
                results = search.get_dict()
                
                organic_results = results.get("organic_results", [])
                for result in organic_results:
                    aggregated_results.append({
                        "title": result.get("title"),
                        "link": result.get("link"),
                        "snippet": result.get("snippet"),
                        "source": result.get("source"),
                        "date": result.get("date", "Recent")
                    })
            
            # Update idea analysis data with new insights
            # We treat this as an appendage to existing data
            if not idea.analysis_data:
                idea.analysis_data = {}
            
            if "market_research" not in idea.analysis_data:
                 idea.analysis_data["market_research"] = {}

            # Ensure we don't overwrite the AI analysis, just add to it
            current_market_data = idea.analysis_data.get("market_research", {})
            current_market_data["live_search"] = aggregated_results
            
            # Re-assign to trigger SQLalchemy JSON update detection
            market_data_copy = dict(idea.analysis_data)
            market_data_copy["market_research"] = current_market_data
            idea.analysis_data = market_data_copy
            
            db.session.commit()
            
            return aggregated_results

        except Exception as e:
            print(f"Error fetching market data: {str(e)}")
            return {"error": str(e)}
