import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from flask import current_app

class PDFService:
    @staticmethod
    def generate_report(idea):
        """Generates a PDF report for an idea in black & white and returns the file path."""
        # Setup paths
        reports_dir = os.path.join(current_app.root_path, '..', 'instance', 'reports')
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir)
        
        filename = f"{idea.title.replace(' ', '_')}_{idea.id}_Analysis.pdf"
        file_path = os.path.join(reports_dir, filename)
        
        # Return existing file if already exists
        if os.path.exists(file_path):
            return file_path
        
        # Create PDF
        doc = SimpleDocTemplate(file_path, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Styles (black & white)
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.black,
            spaceAfter=20
        )
        
        section_style = ParagraphStyle(
            'SectionStyle',
            parent=styles['Heading2'],
            fontSize=18,
            textColor=colors.black,
            spaceBefore=15,
            spaceAfter=10
        )
        
        subheading_style = ParagraphStyle(
            'Subheading',
            parent=styles['Heading3'],
            fontSize=14,
            textColor=colors.black,
            spaceBefore=10,
            spaceAfter=5
        )

        body_style = styles['BodyText']
        body_style.fontSize = 12
        body_style.textColor = colors.black

        # Header
        elements.append(Paragraph(f"Inceptrax: {idea.title}", title_style))
        elements.append(Paragraph("Full Business Analysis Report", section_style))
        elements.append(Paragraph(f"Date: {idea.created_at.strftime('%Y-%m-%d')}", body_style))
        elements.append(Spacer(1, 12))

        # Description
        elements.append(Paragraph("Project Overview", section_style))
        elements.append(Paragraph(idea.description, body_style))
        elements.append(Spacer(1, 12))

        analysis = idea.analysis_data
        if not analysis:
            elements.append(Paragraph("Detailed analysis data is not available for this idea.", body_style))
        else:
            # Validation Results
            elements.append(Paragraph("AI Validation Results", section_style))
            elements.append(Paragraph(f"Overall Score: {analysis.get('overall_score', 'N/A')}/100", body_style))
            elements.append(Spacer(1, 6))
            elements.append(Paragraph(f"Market Demand: {analysis.get('market_demand', 'N/A')}", body_style))
            elements.append(Paragraph(f"Growth Potential: {analysis.get('growth_potential', 'N/A')}", body_style))

            # Strengths & Risks
            elements.append(Paragraph("Key Strengths", subheading_style))
            for s in analysis.get('strengths', []):
                elements.append(Paragraph(f"• {s}", body_style))

            elements.append(Paragraph("Critical Risks", subheading_style))
            for r in analysis.get('risks', []):
                elements.append(Paragraph(f"• {r}", body_style))

            # Market Research
            market = analysis.get('market_research', {})
            elements.append(Paragraph("Market Research", section_style))
            m_data = [
                ["Metric", "Value"],
                ["TAM (Total Addressable Market)", market.get('tam', 'N/A')],
                ["SAM (Serviceable Addressable Market)", market.get('sam', 'N/A')],
                ["SOM (Serviceable Obtainable Market)", market.get('som', 'N/A')]
            ]
            t = Table(m_data, colWidths=[200, 250])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('PADDING', (0, 0), (-1, -1), 6)
            ]))
            elements.append(t)

            # Competitors
            elements.append(Paragraph("Competitive Landscape", section_style))
            for comp in analysis.get('competitors', []):
                elements.append(Paragraph(f"{comp.get('name')} ({comp.get('type')})", body_style))
                elements.append(Paragraph(f"Threat Level: {comp.get('threat')}", body_style))
                elements.append(Spacer(1, 4))

        # Build PDF
        doc.build(elements)
        return file_path
