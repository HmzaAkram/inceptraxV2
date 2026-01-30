import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, Frame, PageTemplate
from reportlab.lib import colors
from reportlab.lib.units import inch, mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from flask import current_app
from datetime import datetime

class PDFService:
    @staticmethod
    def generate_report(idea):
        """Generates a professional, monochrome PDF report."""
        # Setup paths
        reports_dir = os.path.join(current_app.root_path, '..', 'instance', 'reports')
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir)
        
        filename = f"{idea.title.replace(' ', '_')}_{idea.id}_Analysis.pdf"
        file_path = os.path.join(reports_dir, filename)
        
        # Standard professional margins (not too cramped, not too wide)
        doc = SimpleDocTemplate(
            file_path, 
            pagesize=letter,
            rightMargin=50, leftMargin=50, 
            topMargin=50, bottomMargin=50
        )
        
        styles = getSampleStyleSheet()
        PDFService._register_custom_styles(styles)
        
        elements = []
        
        analysis = idea.analysis_data or {}

        # 1. Header 
        PDFService._create_professional_header(idea, elements, styles)
        
        # 2. Recommendation Box (Prominent but clean)
        PDFService._create_recommendation_section(analysis, elements, styles)

        # 3. Validation Scorecard
        PDFService._create_section_diviver("Idea Validation", elements, styles)
        PDFService._create_validation_section(analysis, elements, styles)
        
        # 4. Market Research
        PDFService._create_section_diviver("Market Intelligence", elements, styles)
        PDFService._create_market_section(analysis, elements, styles)
    
        # 5. Competitor Analysis 
        PDFService._create_section_diviver("Competitive Landscape", elements, styles)
        PDFService._create_competitor_section(analysis, elements, styles)
        
        # 6. Monetization & MVP
        PDFService._create_section_diviver("Strategy & Execution", elements, styles)
        PDFService._create_monetization_section(analysis, elements, styles)
        PDFService._create_mvp_section(analysis, elements, styles)

        # 7. GTM
        PDFService._create_gtm_section(analysis, elements, styles)
        
        # Build PDF with Footer
        doc.build(elements, onFirstPage=PDFService._footer, onLaterPages=PDFService._footer)
        return file_path

    @staticmethod
    def _register_custom_styles(styles):
        """Defines custom monochrome paragraph styles."""
        
        # Typography: Clean, Sans-Serif (Helvetica)
        
        styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=26,
            leading=32,
            textColor=colors.black,
            spaceAfter=6
        ))
        styles.add(ParagraphStyle(
            name='ReportSubtitle',
            parent=styles['Heading2'],
            fontName='Helvetica',
            fontSize=12,
            leading=16,
            textColor=colors.darkgrey,
            spaceAfter=20
        ))
        
        # Section Dividers
        styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=colors.black,
            spaceBefore=15,
            spaceAfter=10,
            textTransform='uppercase' 
        ))

        styles.add(ParagraphStyle(
            name='ReportBody',
            parent=styles['BodyText'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            alignment=TA_JUSTIFY,
            spaceAfter=6,
            textColor=colors.black
        ))
        
        styles.add(ParagraphStyle(
            name='RecommendationText',
            parent=styles['BodyText'],
            fontName='Helvetica-Oblique',
            fontSize=11,
            leading=15,
            alignment=TA_LEFT,
            textColor=colors.black,
        ))

    @staticmethod
    def _footer(canvas, doc):
        """Draws the footer on each page."""
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.grey)
        
        # Left: Generated Date
        date_str = datetime.now().strftime('%B %d, %Y')
        canvas.drawString(50, 30, f"Generated on {date_str}")
        
        # Center: Branding
        canvas.drawCentredString(letter[0]/2, 30, "Made by Inceptrax")
        
        # Right: Page Number
        canvas.drawRightString(letter[0]-50, 30, f"Page {doc.page}")
        
        # Gentle line separator
        canvas.setStrokeColor(colors.lightgrey)
        canvas.line(50, 42, letter[0]-50, 42)
        canvas.restoreState()

    @staticmethod
    def _create_professional_header(idea, elements, styles):
        """Creates a clean top header with title and pitch."""
        elements.append(Paragraph(idea.title, styles['ReportTitle']))
        elements.append(Paragraph(idea.description, styles['ReportSubtitle']))
        elements.append(Spacer(1, 10))
        # Horizontal Rule
        elements.append(Paragraph("_" * 78, styles['ReportBody'])) # Simple separator
        elements.append(Spacer(1, 20))

    @staticmethod
    def _create_section_diviver(title, elements, styles):
        """Adds a section header with reduced spacing."""
        elements.append(Paragraph(title, styles['SectionHeader']))

    @staticmethod
    def _create_recommendation_section(analysis, elements, styles):
        rec_text = analysis.get('recommendation', "No recommendation available.")
        
        # Create a grey box for recommendation
        data = [[Paragraph(f"<b>AI RECOMMENDATION:</b><br/>{rec_text}", styles['RecommendationText'])]]
        t = Table(data, colWidths=[500])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.whitesmoke),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.grey),
            ('PADDING', (0, 0), (-1, -1), 15),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 15))

    @staticmethod
    def _create_validation_section(analysis, elements, styles):
        scores = analysis.get('scores', {})
        
        # Score Table
        data = [
            ["OVERALL SCORE", "MARKET DEMAND", "PROBLEM FIT", "GROWTH"],
            [
                f"{analysis.get('overall_score', 0)}/100",
                f"{scores.get('market_demand', {}).get('value', 0)}%",
                f"{scores.get('problem_severity', {}).get('value', 0)}%",
                f"{scores.get('growth_potential', {}).get('value', 0)}%"
            ]
        ]
        
        t = Table(data, colWidths=[125, 125, 125, 125])
        t.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.darkgrey),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, 1), 14),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('LINEBELOW', (0, 0), (-1, 0), 0.5, colors.lightgrey),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 15))

    @staticmethod
    def _create_market_section(analysis, elements, styles):
        market = analysis.get('market_research', {})
        
        # Standard Data Table
        data = [
            ["METRIC", "VALUE", "DETAILS"],
            ["TAM", str(market.get('tam', 'N/A')), "Total Addressable Market"],
            ["SAM", str(market.get('sam', 'N/A')), "Serviceable Addressable Market"],
            ["SOM", str(market.get('som', 'N/A')), "Serviceable Obtainable Market"]
        ]
        
        PDFService._add_monochrome_table(data, elements, [100, 150, 250])
        
        # Textual trends
        for trend in market.get('trends', [])[:3]:
            elements.append(Paragraph(f"• <b>{trend.get('title')}:</b> {trend.get('description')}", styles['ReportBody']))

    @staticmethod
    def _create_competitor_section(analysis, elements, styles):
        competitors = analysis.get('competitors', [])
        if not competitors: return

        data = [["COMPETITOR", "TYPE", "THREAT", "ANALYSIS"]]
        for comp in competitors[:5]: 
            details = f"Str: {', '.join(comp.get('strengths', [])[:2])}"
            data.append([
                comp.get('name', 'N/A'),
                comp.get('type', 'N/A'),
                comp.get('threat', 'N/A'),
                Paragraph(details, styles['ReportBody'])
            ])
            
        PDFService._add_monochrome_table(data, elements, [120, 80, 80, 220])

    @staticmethod
    def _create_monetization_section(analysis, elements, styles):
        monetization = analysis.get('monetization_strategy', {})
        elements.append(Paragraph(f"<b>Primary revenue model:</b> {monetization.get('primary_model', 'N/A')}", styles['ReportBody']))
        elements.append(Spacer(1, 5))
        
        data = [["PLAN", "PRICE", "TARGET AUDIENCE"]]
        for plan in monetization.get('pricing_plans', [])[:3]:
            data.append([
                plan.get('name', 'N/A'),
                plan.get('price_point', 'N/A'),
                Paragraph(plan.get('target_audience', 'N/A'), styles['ReportBody'])
            ])
        PDFService._add_monochrome_table(data, elements, [120, 100, 280])

    @staticmethod
    def _create_mvp_section(analysis, elements, styles):
        blueprint = analysis.get('mvp_blueprint', [])
        elements.append(Paragraph("<b>MVP Feature Roadmap:</b>", styles['ReportBody']))
        elements.append(Spacer(1, 5))

        data = [["FEATURE", "PRIORITY", "BUSINESS VALUE"]]
        for feature in blueprint[:5]:
            data.append([
                Paragraph(feature.get('feature_name', 'N/A'), styles['ReportBody']),
                feature.get('priority', 'N/A'),
                Paragraph(feature.get('business_value', 'N/A'), styles['ReportBody'])
            ])
        PDFService._add_monochrome_table(data, elements, [180, 80, 240])

    @staticmethod
    def _create_gtm_section(analysis, elements, styles):
        gtm = analysis.get('gtm_strategy', {})
        if not gtm: return
        
        PDFService._create_section_diviver("Go-To-Market", elements, styles)
        
        # Channels
        channels = [f"{c.get('channel')}" for c in gtm.get('acquisition_channels', [])[:4]]
        elements.append(Paragraph(f"<b>Key Channels:</b> {', '.join(channels)}", styles['ReportBody']))
        
        # Simple funnel text
        funnel = gtm.get('funnel_stages', {})
        elements.append(Paragraph(f"<b>Funnel Strategy:</b> Build awareness via {funnel.get('awareness', 'N/A')} -> Convert via {funnel.get('conversion', 'N/A')}", styles['ReportBody']))

    @staticmethod
    def _add_monochrome_table(data, elements, col_widths):
        """Helper for clean grey/white tables."""
        t = Table(data, colWidths=col_widths)
        t.setStyle(TableStyle([
            # Header Row
            ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.9, 0.9, 0.9)), # Light Grey
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            
            # Body Rows
            ('GRID', (0, 0), (-1, -1), 0.5, colors.Color(0.8, 0.8, 0.8)), # Subtle grid
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 10))
