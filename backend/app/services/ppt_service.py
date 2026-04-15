from pptx import Presentation
from pptx.util import Inches, Pt
import os
from flask import current_app

class PPTService:
    @staticmethod
    def generate_presentation(idea):
        """Generates a PowerPoint presentation using Python-pptx based on the Idea data"""
        
        # Ensure reports directory exists
        reports_dir = os.path.join(current_app.root_path, '..', 'instance', 'reports')
        os.makedirs(reports_dir, exist_ok=True)
        
        safe_title = idea.title.replace(' ', '_').replace('/', '_')
        filename = f"{safe_title}_{idea.id}_Presentation.pptx"
        file_path = os.path.join(reports_dir, filename)
        
        prs = Presentation()
        
        # Helper to add standard slide
        def add_slide(title, content):
            slide_layout = prs.slide_layouts[1] # Title and Content layout
            slide = prs.slides.add_slide(slide_layout)
            title_shape = slide.shapes.title
            body_shape = slide.placeholders[1]
            
            title_shape.text = title
            tf = body_shape.text_frame
            
            # Very basic markdown / list stripping
            lines = content.split('\n')
            for index, line in enumerate(lines):
                line = line.strip()
                if not line:
                    continue
                if line.startswith('*') or line.startswith('-'):
                    line = line[1:].strip()
                
                if index == 0:
                    p = tf.text = line
                else:
                    p = tf.add_paragraph()
                    p.text = line
        
        # Title Slide
        title_slide_layout = prs.slide_layouts[0]
        slide = prs.slides.add_slide(title_slide_layout)
        title_shape = slide.shapes.title
        subtitle_shape = slide.placeholders[1]
        
        title_shape.text = idea.title
        subtitle_shape.text = "Investor Presentation"
        
        # Idea Overview
        add_slide("Overview", idea.description or "N/A")
        
        # Problem
        if idea.problem:
            add_slide("The Problem", idea.problem)
            
        # Solution
        if idea.solution:
            add_slide("Our Solution", idea.solution)
            
        # Target Market
        if idea.market:
            add_slide("Target Market", idea.market)
            
        # Target Audience
        if idea.audience:
            add_slide("Target Audience", idea.audience)
            
        # Added from Analysis Built-in
        if idea.analysis_data:
            analysis = idea.analysis_data
            if 'market_research' in analysis:
                market = analysis['market_research']
                market_text = f"TAM: {market.get('tam', 'N/A')}\nSAM: {market.get('sam', 'N/A')}\nSOM: {market.get('som', 'N/A')}"
                add_slide("Market Size", market_text)
                
            if 'strengths' in analysis and analysis['strengths']:
                strengths = "\n".join([f"- {s}" for s in analysis['strengths']])
                add_slide("Strengths", strengths)
                
            if 'risks' in analysis and analysis['risks']:
                risks = "\n".join([f"- {r}" for r in analysis['risks']])
                add_slide("Risks & Mitigation", risks)
                
        # Save presentation
        prs.save(file_path)
        return file_path
