import os
import json
from datetime import datetime, timedelta
from serpapi import GoogleSearch
from app import db
from app.models.competitor_model import CompetitorWatch, CompetitorAlert

class CompetitorMonitoringService:
    
    @staticmethod
    def extract_keywords(idea):
        """Generate search keywords from idea data"""
        keywords = set()
        
        # Add core terms (Title is usually the best keyword)
        if idea.title:
            keywords.add(idea.title.lower())
            
        if idea.analysis_data:
            # Add competitor names (High Priority)
            competitors = idea.analysis_data.get('competitors', [])
            for comp in competitors:
                if isinstance(comp, dict) and 'name' in comp:
                    name = comp['name']
                    # Filter out "Unknown" or generic names
                    if name and len(name) < 40 and name.lower() not in ['unknown competitor', 'n/a', 'unknown']:
                        keywords.add(name.lower())

            # Add industry/market terms if available (keep them short)
            market_data = idea.analysis_data.get('market_research', {})
            if 'industry' in market_data:
                # Only add if it's not a long sentence
                industry = market_data['industry'].lower()
                if len(industry.split()) < 5:
                    keywords.add(industry)
                    
        # Add market if it's short
        if idea.market and len(idea.market.split()) < 5:
            keywords.add(idea.market.lower())
            
        return list(keywords)[:7]  # Limit to 7 most relevant
    
    @staticmethod
    def classify_alert_type(title, snippet):
        """Determine alert type based on content"""
        text = (title + ' ' + snippet).lower()
        
        if any(word in text for word in ['funding', 'raised', 'investment', 'series', 'round', 'million', 'billion']):
            return 'funding'
        elif any(word in text for word in ['launch', 'launches', 'released', 'announces', 'unveils', 'introduces']):
            return 'launch'
        elif any(word in text for word in ['startup', 'founded', 'new company', 'co-founder']):
            return 'new_startup'
        else:
            return 'other'
    
    @staticmethod
    def calculate_relevance(result, keywords):
        """Calculate relevance score (0-1) based on keyword matching"""
        text = (result.get('title', '') + ' ' + result.get('snippet', '')).lower()
        
        matches = sum(1 for keyword in keywords if keyword.lower() in text)
        score = min(matches / len(keywords), 1.0) if keywords else 0.5
        
        return round(score, 2)
    
    @staticmethod
    def scan_competitors(watch_id):
        """Execute SerpAPI search for a specific watch"""
        watch = CompetitorWatch.query.get(watch_id)
        if not watch or not watch.is_active:
            return {'error': 'Watch not found or inactive'}
            
        # Auto-update keywords if they seem insufficient (just title)
        # This fixes the issue where initial watches created before analysis don't have competitor names
        if watch.idea and (not watch.keywords or len(watch.keywords) <= 1):
            try:
                new_keywords = CompetitorMonitoringService.extract_keywords(watch.idea)
                # If we found more/better keywords, update them
                if new_keywords and len(new_keywords) > len(watch.keywords or []):
                    watch.keywords = new_keywords
                    db.session.commit()
            except Exception as e:
                print(f"Auto-update keywords failed: {e}")
        
        api_key = os.getenv('SERPAPI_KEY')
        if not api_key:
            return {'error': 'SERPAPI_KEY not configured'}
        
        keywords = watch.keywords
        if not keywords:
            return {'error': 'No keywords configured'}
        
        # Determine date filter (since last scan or last 7 days)
        if watch.last_scan_at:
            days_ago = (datetime.utcnow() - watch.last_scan_at).days
        else:
            days_ago = 7  # First scan, look back 7 days
        
        new_alerts = []
        
        try:
            # Create search query
            keyword_str = ' OR '.join(keywords[:3])  # Use top 3 keywords
            
            # Search Google News for recent updates
            news_query = f"{keyword_str} (startup OR funding OR launch OR announces)"
            news_params = {
                'engine': 'google',
                'q': news_query,
                'api_key': api_key,
                'tbm': 'nws',  # News search
                'num': 10,
                'tbs': f'qdr:w'  # Past week
            }
            
            news_search = GoogleSearch(news_params)
            news_results = news_search.get_dict()
            
            # Process news results
            for result in news_results.get('news_results', [])[:10]:
                title = result.get('title', '')
                snippet = result.get('snippet', '')
                url = result.get('link', '')
                
                if not url:
                    continue
                
                # Check if this URL already exists for this watch
                existing = CompetitorAlert.query.filter_by(
                    watch_id=watch_id,
                    url=url
                ).first()
                
                if existing:
                    continue  # Skip duplicates
                
                alert_type = CompetitorMonitoringService.classify_alert_type(title, snippet)
                relevance = CompetitorMonitoringService.calculate_relevance(result, keywords)
                
                # Only save if relevance is above threshold
                if relevance >= 0.3:
                    alert = CompetitorAlert(
                        watch_id=watch_id,
                        alert_type=alert_type,
                        title=title,
                        snippet=snippet,
                        url=url,
                        source='google_news',
                        relevance_score=relevance
                    )
                    db.session.add(alert)
                    new_alerts.append(alert)
            
            # Also search regular Google for startup mentions
            search_query = f"{keyword_str} startup OR company"
            search_params = {
                'engine': 'google',
                'q': search_query,
                'api_key': api_key,
                'num': 5
            }
            
            search = GoogleSearch(search_params)
            search_results = search.get_dict()
            
            for result in search_results.get('organic_results', [])[:5]:
                title = result.get('title', '')
                snippet = result.get('snippet', '')
                url = result.get('link', '')
                
                if not url:
                    continue
                
                existing = CompetitorAlert.query.filter_by(
                    watch_id=watch_id,
                    url=url
                ).first()
                
                if existing:
                    continue
                
                alert_type = CompetitorMonitoringService.classify_alert_type(title, snippet)
                relevance = CompetitorMonitoringService.calculate_relevance(result, keywords)
                
                if relevance >= 0.4:  # Higher threshold for regular search
                    alert = CompetitorAlert(
                        watch_id=watch_id,
                        alert_type=alert_type,
                        title=title,
                        snippet=snippet,
                        url=url,
                        source='google_search',
                        relevance_score=relevance
                    )
                    db.session.add(alert)
                    new_alerts.append(alert)
            
            # Update last scan time
            watch.last_scan_at = datetime.utcnow()
            db.session.commit()
            
            return {
                'success': True,
                'new_alerts': len(new_alerts),
                'watch_id': watch_id
            }
            
        except Exception as e:
            print(f"Error scanning competitors for watch {watch_id}: {str(e)}")
            return {'error': str(e)}
    
    @staticmethod
    def create_watch_for_idea(idea_id):
        """Create a new competitor watch for an idea"""
        from app.models.user_model import Idea
        
        idea = Idea.query.get(idea_id)
        if not idea:
            return {'error': 'Idea not found'}
        
        # Extract keywords
        keywords = CompetitorMonitoringService.extract_keywords(idea)
        
        # Ensure we have at least something to search for
        if not keywords:
            keywords = [idea.title.lower()] if idea.title else ["startup", "new company"]
        
        # Create watch
        watch = CompetitorWatch(
            idea_id=idea_id,
            keywords=keywords,
            is_active=True,
            scan_frequency='daily'
        )
        
        db.session.add(watch)
        db.session.commit()
        
        return {'success': True, 'watch': watch}
