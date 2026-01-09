#!/usr/bin/env python3
"""
EduNexus Sales Pitch PDF Generator
Creates a professional PDF for sales presentations to college management teams
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, ListFlowable, ListItem, KeepTogether
)
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus.flowables import Flowable
import os

# Brand Colors
PRIMARY_BLUE = HexColor('#1e40af')  # Deep blue
ACCENT_TEAL = HexColor('#0d9488')   # Teal accent
LIGHT_BLUE = HexColor('#dbeafe')    # Light blue background
DARK_TEXT = HexColor('#1f2937')     # Dark gray text
LIGHT_TEXT = HexColor('#6b7280')    # Light gray text
SUCCESS_GREEN = HexColor('#059669') # Green for positive metrics
WARNING_ORANGE = HexColor('#d97706') # Orange for highlights

class ColoredBox(Flowable):
    """A colored box with text inside"""
    def __init__(self, text, width, height, bg_color, text_color=white, font_size=14):
        Flowable.__init__(self)
        self.text = text
        self.width = width
        self.height = height
        self.bg_color = bg_color
        self.text_color = text_color
        self.font_size = font_size

    def draw(self):
        self.canv.setFillColor(self.bg_color)
        self.canv.roundRect(0, 0, self.width, self.height, 5, fill=1, stroke=0)
        self.canv.setFillColor(self.text_color)
        self.canv.setFont("Helvetica-Bold", self.font_size)
        text_width = self.canv.stringWidth(self.text, "Helvetica-Bold", self.font_size)
        self.canv.drawString((self.width - text_width) / 2, self.height / 2 - 5, self.text)

def create_styles():
    """Create custom paragraph styles"""
    styles = getSampleStyleSheet()

    # Title style
    styles.add(ParagraphStyle(
        name='MainTitle',
        parent=styles['Title'],
        fontSize=28,
        textColor=PRIMARY_BLUE,
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    ))

    # Subtitle
    styles.add(ParagraphStyle(
        name='Subtitle',
        parent=styles['Normal'],
        fontSize=16,
        textColor=ACCENT_TEAL,
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica'
    ))

    # Section Header
    styles.add(ParagraphStyle(
        name='SectionHeader',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=PRIMARY_BLUE,
        spaceBefore=20,
        spaceAfter=15,
        fontName='Helvetica-Bold',
        borderWidth=0,
        borderPadding=0,
        borderColor=PRIMARY_BLUE,
    ))

    # Subsection Header
    styles.add(ParagraphStyle(
        name='SubsectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=ACCENT_TEAL,
        spaceBefore=15,
        spaceAfter=10,
        fontName='Helvetica-Bold'
    ))

    # Body text - update existing style
    styles['BodyText'].fontSize = 11
    styles['BodyText'].textColor = DARK_TEXT
    styles['BodyText'].spaceAfter = 8
    styles['BodyText'].alignment = TA_JUSTIFY
    styles['BodyText'].leading = 16

    # Bullet point
    styles.add(ParagraphStyle(
        name='BulletPoint',
        parent=styles['Normal'],
        fontSize=11,
        textColor=DARK_TEXT,
        leftIndent=20,
        spaceAfter=5,
        bulletIndent=10,
        leading=14
    ))

    # Highlight box text
    styles.add(ParagraphStyle(
        name='HighlightText',
        parent=styles['Normal'],
        fontSize=12,
        textColor=PRIMARY_BLUE,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    ))

    # Quote style
    styles.add(ParagraphStyle(
        name='Quote',
        parent=styles['Normal'],
        fontSize=14,
        textColor=ACCENT_TEAL,
        alignment=TA_CENTER,
        fontName='Helvetica-Oblique',
        spaceBefore=15,
        spaceAfter=15
    ))

    return styles

def create_table_style(header_color=PRIMARY_BLUE):
    """Create a professional table style"""
    return TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), white),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_TEXT),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e5e7eb')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_BLUE]),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ])

def add_page_number(canvas, doc):
    """Add page numbers to each page"""
    page_num = canvas.getPageNumber()
    text = f"Page {page_num}"
    canvas.saveState()
    canvas.setFont('Helvetica', 9)
    canvas.setFillColor(LIGHT_TEXT)
    canvas.drawRightString(A4[0] - 0.5*inch, 0.5*inch, text)
    canvas.drawString(0.5*inch, 0.5*inch, "EduNexus - Confidential")
    canvas.restoreState()

def build_pdf():
    """Build the complete PDF document"""
    output_path = "/Users/sriramvenkatg/edunexus/docs/sales/EduNexus_Sales_Pitch.pdf"

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=0.6*inch,
        leftMargin=0.6*inch,
        topMargin=0.6*inch,
        bottomMargin=0.8*inch
    )

    styles = create_styles()
    story = []

    # ==================== COVER PAGE ====================
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph("EduNexus", styles['MainTitle']))
    story.append(Paragraph("AI-First College Management Platform", styles['Subtitle']))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph('"From Admission to Placement - One Intelligent Platform"', styles['Quote']))
    story.append(Spacer(1, 0.5*inch))

    # Key stats boxes
    stats_data = [
        ['20+ Modules', '8 Portals', 'AI Engine', '6 Weeks Go-Live']
    ]
    stats_table = Table(stats_data, colWidths=[1.6*inch]*4)
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), ACCENT_TEAL),
        ('TEXTCOLOR', (0, 0), (-1, -1), white),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('GRID', (0, 0), (-1, -1), 2, white),
    ]))
    story.append(stats_table)

    story.append(Spacer(1, 1*inch))
    story.append(Paragraph("For Indian Engineering Colleges", styles['SubsectionHeader']))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("Document Version: 1.0 | January 2026", styles['BodyText']))
    story.append(Paragraph("Prepared For: College Management Teams", styles['BodyText']))
    story.append(PageBreak())

    # ==================== TABLE OF CONTENTS ====================
    story.append(Paragraph("Table of Contents", styles['SectionHeader']))
    story.append(Spacer(1, 0.2*inch))

    toc_items = [
        ("1. Executive Summary", "Quick ROI and key differentiators"),
        ("2. The Problem We Solve", "Pain points across college personas"),
        ("3. Our Solution: EduNexus", "Platform architecture and capabilities"),
        ("4. Persona-Wise Features", "Benefits for each role"),
        ("5. Quality & Reliability", "Testing and security verification"),
        ("6. AI-Powered Capabilities", "Prediction and automation features"),
        ("7. ROI & Time Savings", "Quantified benefits analysis"),
        ("8. Implementation & Support", "6-week deployment timeline"),
        ("9. Pricing & Next Steps", "Transparent pricing and demo access"),
    ]

    for title, desc in toc_items:
        story.append(Paragraph(f"<b>{title}</b>", styles['BodyText']))
        story.append(Paragraph(f"<i>{desc}</i>", styles['BulletPoint']))

    story.append(PageBreak())

    # ==================== EXECUTIVE SUMMARY ====================
    story.append(Paragraph("1. Executive Summary", styles['SectionHeader']))
    story.append(Paragraph("One Platform. Complete Transformation.", styles['SubsectionHeader']))
    story.append(Paragraph(
        "<b>EduNexus</b> is an AI-First College Management Platform designed specifically for Indian Engineering Colleges. "
        "We unify all college operations - from admission to placement - in one intelligent system that predicts, recommends, and automates.",
        styles['BodyText']
    ))
    story.append(Spacer(1, 0.2*inch))

    # Key Differentiators Table
    story.append(Paragraph("Key Differentiators", styles['SubsectionHeader']))
    diff_data = [
        ['Traditional ERP', 'EduNexus'],
        ['Generic modules', 'Student-centric design for engineering colleges'],
        ['Reactive reporting', 'Predictive AI - know problems before they happen'],
        ['Desktop-only', 'Mobile-first - works on any device'],
        ['6+ months implementation', '6 weeks to go live'],
        ['Hidden costs', 'Transparent pricing - Rs 500/student/year'],
    ]
    diff_table = Table(diff_data, colWidths=[2.5*inch, 4*inch])
    diff_table.setStyle(create_table_style())
    story.append(diff_table)
    story.append(Spacer(1, 0.3*inch))

    # Quick ROI Snapshot
    story.append(Paragraph("Quick ROI Snapshot", styles['SubsectionHeader']))
    roi_data = [
        ['Metric', 'Impact'],
        ['Fee Collection', '+20% improvement'],
        ['Staff Time Saved', '40+ hours/month'],
        ['Placement Rate', '+15-20% increase'],
        ['Report Generation', '10x faster'],
        ['Parent Satisfaction', '+60% improvement'],
    ]
    roi_table = Table(roi_data, colWidths=[3*inch, 3.5*inch])
    roi_table.setStyle(create_table_style(SUCCESS_GREEN))
    story.append(roi_table)
    story.append(PageBreak())

    # ==================== THE PROBLEM ====================
    story.append(Paragraph("2. The Problem We Solve", styles['SectionHeader']))
    story.append(Paragraph("Business Analyst Perspective: Pain Points Across the College", styles['SubsectionHeader']))
    story.append(Paragraph(
        "Engineering colleges today face systemic challenges that impact students, staff, and institutional success. "
        "Here's what we hear from college management teams:",
        styles['BodyText']
    ))
    story.append(Spacer(1, 0.2*inch))

    problem_data = [
        ['Persona', 'Current Pain Point', 'Business Impact'],
        ['Principal', 'Fragmented systems, no unified view', 'Cannot make data-driven decisions'],
        ['HOD', 'No real-time department analytics', 'At-risk students identified too late'],
        ['Admin Staff', 'Manual fee collection, paper processes', '40+ hours/month wasted per person'],
        ['Teacher', 'Attendance & marks entry consumes time', 'Less time for actual teaching'],
        ['Lab Assistant', 'Paper-based equipment tracking', 'Equipment issues go unreported'],
        ['Student', 'No career guidance, scattered info', 'Lower placement rates'],
        ['Parent', 'Disconnected from child\'s progress', 'Complaints, dissatisfaction'],
    ]
    problem_table = Table(problem_data, colWidths=[1.3*inch, 2.5*inch, 2.7*inch])
    problem_table.setStyle(create_table_style(WARNING_ORANGE))
    story.append(problem_table)
    story.append(Spacer(1, 0.3*inch))

    # Admin Staff Time Analysis
    story.append(Paragraph("Admin Staff: Time Lost to Manual Processes", styles['SubsectionHeader']))
    admin_time_data = [
        ['Task', 'Current Time', 'Frequency', 'Monthly Hours'],
        ['Fee collection & receipts', '2 hrs/day', 'Daily', '40 hours'],
        ['Attendance compilation', '1 hr/day', 'Daily', '20 hours'],
        ['Report generation', '4 hrs', 'Weekly', '16 hours'],
        ['Parent phone calls', '2 hrs/day', 'Daily', '40 hours'],
        ['Certificate processing', '30 min each', '50/month', '25 hours'],
        ['TOTAL', '', '', '141 hours'],
    ]
    admin_table = Table(admin_time_data, colWidths=[2.2*inch, 1.5*inch, 1.3*inch, 1.5*inch])
    admin_table.setStyle(create_table_style())
    story.append(admin_table)
    story.append(Paragraph("<i>That's almost one full-time employee's month spent on repetitive tasks!</i>", styles['BodyText']))
    story.append(PageBreak())

    # ==================== OUR SOLUTION ====================
    story.append(Paragraph("3. Our Solution: EduNexus", styles['SectionHeader']))
    story.append(Paragraph("Product Team Perspective: A Complete Platform", styles['SubsectionHeader']))

    # Platform Overview
    platform_data = [
        ['Layer', 'Components'],
        ['8 Specialized Portals', 'Principal, HOD, Admin, Teacher, Lab Assistant, Student, Parent, Alumni'],
        ['20+ Integrated Modules', 'Academic, Financial, Operations, Career, AI/ML, Communication'],
        ['AI Engine', 'Score Prediction, Placement Prediction, Chatbot, Content Generation'],
        ['Technology Stack', 'Next.js, NestJS, PostgreSQL, Redis, Python ML, AWS'],
    ]
    platform_table = Table(platform_data, colWidths=[2.2*inch, 4.3*inch])
    platform_table.setStyle(create_table_style(ACCENT_TEAL))
    story.append(platform_table)
    story.append(Spacer(1, 0.3*inch))

    # What Makes EduNexus Different
    story.append(Paragraph("What Makes EduNexus Different", styles['SubsectionHeader']))
    differentiators = [
        "<b>Student-Centric Design:</b> Built specifically for Indian engineering colleges, not adapted from generic ERPs.",
        "<b>AI-First Architecture:</b> Every module has intelligence - Score Prediction, Placement Prediction, Smart Alerts.",
        "<b>Mobile-First Approach:</b> Works seamlessly on any device - phones, tablets, desktops.",
        "<b>Multi-Tenant Security:</b> Complete data isolation. Your college data is never visible to any other institution.",
        "<b>Rapid Deployment:</b> 6 weeks to go live, not 6 months. We've done it, tested it, proven it.",
    ]
    for item in differentiators:
        story.append(Paragraph(f"• {item}", styles['BulletPoint']))
    story.append(PageBreak())

    # ==================== PERSONA FEATURES ====================
    story.append(Paragraph("4. Persona-Wise Features & Benefits", styles['SectionHeader']))
    story.append(Paragraph("Each Role Gets a Specialized Experience", styles['SubsectionHeader']))
    story.append(Spacer(1, 0.2*inch))

    # Personas summary table
    personas = [
        ['Role', 'Key Features', 'Time Saved/Month', 'Key Value'],
        ['Principal', 'Executive Dashboard, Department Analytics, AICTE Reports', '10-15 hours', 'Strategic focus'],
        ['HOD', 'Faculty Management, Student Analytics, Curriculum Planning', '15-20 hours', 'Better outcomes'],
        ['Admin Staff', 'Fee Collection, Online Payments, Bulk Communication', '40-60 hours', 'Less paperwork'],
        ['Teacher', 'Quick Attendance, Digital Gradebook, Assignment Manager', '10-15 hours', 'More teaching time'],
        ['Lab Assistant', 'Lab Attendance, Practical Marks, Equipment Tracker', '8-10 hours', 'Better tracking'],
        ['Student', 'AI Dashboard, Career Hub, Practice Zone, Chatbot', '5-10 hours', 'Self-service'],
        ['Parent', 'Academic Progress, Fee Payment, Transport Tracking', '5 hours', 'Peace of mind'],
    ]
    persona_table = Table(personas, colWidths=[1.2*inch, 2.8*inch, 1.2*inch, 1.3*inch])
    persona_table.setStyle(create_table_style())
    story.append(persona_table)
    story.append(Spacer(1, 0.3*inch))

    # Admin Staff Detail
    story.append(Paragraph("Admin Staff: Biggest Impact", styles['SubsectionHeader']))
    admin_detail = [
        ['Task', 'Before', 'After', 'Saved/Month'],
        ['Fee collection & receipts', '40 hrs', '5 hrs', '35 hrs'],
        ['Attendance compilation', '20 hrs', '1 hr', '19 hrs'],
        ['Report generation', '16 hrs', '2 hrs', '14 hrs'],
        ['Parent communication', '40 hrs', '8 hrs', '32 hrs'],
        ['Certificate processing', '25 hrs', '5 hrs', '20 hrs'],
        ['TOTAL', '141 hrs', '21 hrs', '120 hrs'],
    ]
    admin_detail_table = Table(admin_detail, colWidths=[2.2*inch, 1.2*inch, 1.2*inch, 1.5*inch])
    admin_detail_table.setStyle(create_table_style(SUCCESS_GREEN))
    story.append(admin_detail_table)
    story.append(PageBreak())

    # ==================== QUALITY & RELIABILITY ====================
    story.append(Paragraph("5. Quality & Reliability Assurance", styles['SectionHeader']))
    story.append(Paragraph("QA Perspective: Tested, Verified, Trusted", styles['SubsectionHeader']))
    story.append(Spacer(1, 0.2*inch))

    # Test Coverage
    story.append(Paragraph("End-to-End Testing Verification", styles['SubsectionHeader']))
    test_data = [
        ['Metric', 'Result'],
        ['Total Personas Tested', '21 (7 roles x 3 colleges)'],
        ['Test Scenarios', '100+ automated test cases'],
        ['404 Errors Found', '0'],
        ['Access Denied Errors', '0'],
        ['Tenant Isolation', 'Verified'],
        ['Overall Status', 'PASS'],
    ]
    test_table = Table(test_data, colWidths=[3*inch, 3.5*inch])
    test_table.setStyle(create_table_style(SUCCESS_GREEN))
    story.append(test_table)
    story.append(Spacer(1, 0.2*inch))

    # Performance
    story.append(Paragraph("Performance Benchmarks", styles['SubsectionHeader']))
    perf_data = [
        ['Metric', 'Target', 'Actual', 'Status'],
        ['Login Page Load', '< 2s', '1.8s', 'PASS'],
        ['Dashboard Load', '< 3s', '2.5s', 'PASS'],
        ['Data Tables (300 records)', '< 5s', '3.2s', 'PASS'],
        ['API Response (p95)', '< 200ms', '150ms', 'PASS'],
    ]
    perf_table = Table(perf_data, colWidths=[2.2*inch, 1.2*inch, 1.2*inch, 1.5*inch])
    perf_table.setStyle(create_table_style())
    story.append(perf_table)
    story.append(Spacer(1, 0.2*inch))

    # Security
    story.append(Paragraph("Security & Compliance", styles['SubsectionHeader']))
    security_data = [
        ['Aspect', 'Implementation'],
        ['Encryption at Rest', 'AES-256'],
        ['Encryption in Transit', 'TLS 1.3'],
        ['Authentication', 'Clerk with MFA support'],
        ['Data Location', 'AWS Mumbai (ap-south-1) - India'],
        ['Uptime SLA', '99.9%'],
        ['Compliance', 'AICTE, IT Act 2000 ready'],
    ]
    security_table = Table(security_data, colWidths=[2.5*inch, 4*inch])
    security_table.setStyle(create_table_style())
    story.append(security_table)
    story.append(PageBreak())

    # ==================== AI CAPABILITIES ====================
    story.append(Paragraph("6. AI-Powered Capabilities", styles['SectionHeader']))
    story.append(Paragraph("The Intelligence That Sets Us Apart", styles['SubsectionHeader']))
    story.append(Paragraph(
        "Traditional ERPs give you reports. EduNexus gives you <b>predictions and recommendations</b>.",
        styles['BodyText']
    ))
    story.append(Spacer(1, 0.2*inch))

    ai_data = [
        ['AI Feature', 'Description', 'Accuracy'],
        ['Score Prediction', 'Predicts exam scores based on attendance, past performance', '85%+'],
        ['Placement Prediction', 'Predicts placement probability and salary band', '80%+'],
        ['Weak Topic ID', 'Identifies topics where student struggles', 'Personalized'],
        ['AI Chatbot', '24/7 query resolution in English/Hindi', 'Instant'],
        ['Content Generation', 'Sample papers, mock tests, study plans', 'AI-powered'],
        ['Resume Builder', 'ATS-optimized resumes with AI suggestions', 'Professional'],
    ]
    ai_table = Table(ai_data, colWidths=[1.8*inch, 3.2*inch, 1.5*inch])
    ai_table.setStyle(create_table_style(ACCENT_TEAL))
    story.append(ai_table)
    story.append(Spacer(1, 0.3*inch))

    # AI Examples
    story.append(Paragraph("How AI Helps Students", styles['SubsectionHeader']))
    ai_examples = [
        "Score Prediction: \"Rahul's predicted Physics score: 72/100 (+-5). Weak areas: Integration, Differential Equations. Suggested study time: 8 hrs/week\"",
        "Placement Prediction: \"Priya's placement probability: 85%. Expected package: Rs 6-8 LPA. Top matches: TCS (92%), Infosys (88%)\"",
        "AI Chatbot: \"Your fee of Rs 45,000 is due on 15th January. You can pay now through the Fees section.\"",
    ]
    for example in ai_examples:
        story.append(Paragraph(f"• {example}", styles['BulletPoint']))
    story.append(PageBreak())

    # ==================== ROI ANALYSIS ====================
    story.append(Paragraph("7. ROI & Time Savings Analysis", styles['SectionHeader']))
    story.append(Paragraph("Quantified Benefits for Your College", styles['SubsectionHeader']))
    story.append(Spacer(1, 0.2*inch))

    # Time Savings Summary
    story.append(Paragraph("Per-Persona Time Savings (5,000 Student College)", styles['SubsectionHeader']))
    time_data = [
        ['Persona', 'Monthly Time Saved', 'Annual Hours', 'Monetary Value'],
        ['Principal', '10-15 hours', '144 hours', 'Strategic focus'],
        ['HOD (5 HODs)', '75-100 hours', '1,050 hours', 'Rs 3.5L'],
        ['Admin Staff (15)', '600-900 hours', '9,000 hours', 'Rs 20L'],
        ['Teachers (50)', '500-750 hours', '7,500 hours', 'Rs 15L'],
        ['Lab Assistants (10)', '80-100 hours', '1,080 hours', 'Rs 2L'],
        ['TOTAL', '1,265-1,865 hrs', '18,774 hrs', 'Rs 40L+'],
    ]
    time_table = Table(time_data, colWidths=[1.8*inch, 1.5*inch, 1.4*inch, 1.5*inch])
    time_table.setStyle(create_table_style())
    story.append(time_table)
    story.append(Spacer(1, 0.3*inch))

    # Financial Impact
    story.append(Paragraph("College-Level Financial Impact (5,000 Students)", styles['SubsectionHeader']))
    financial_data = [
        ['Benefit Area', 'Annual Impact'],
        ['Fee Collection Improvement (5%)', 'Rs 3,75,00,000'],
        ['Staff Productivity Savings', 'Rs 20,10,420'],
        ['Placement Value Increase', 'Rs 45,00,000'],
        ['Compliance & Reporting Savings', 'Rs 3,00,000'],
        ['Reduced Complaints & Support', 'Rs 1,00,000'],
        ['TOTAL RETURNS', 'Rs 4,44,10,420'],
    ]
    financial_table = Table(financial_data, colWidths=[3.5*inch, 3*inch])
    financial_table.setStyle(create_table_style(SUCCESS_GREEN))
    story.append(financial_table)
    story.append(Spacer(1, 0.2*inch))

    # ROI Calculation highlight
    roi_highlight = [
        ['Metric', 'Value'],
        ['Annual Investment', 'Rs 25,00,000'],
        ['Annual Returns', 'Rs 4,44,10,420'],
        ['Net Benefit', 'Rs 4,19,10,420'],
        ['ROI', '1,677%'],
        ['Payback Period', '< 1 month'],
    ]
    roi_highlight_table = Table(roi_highlight, colWidths=[3*inch, 3.5*inch])
    roi_highlight_table.setStyle(create_table_style(PRIMARY_BLUE))
    story.append(roi_highlight_table)
    story.append(PageBreak())

    # ==================== IMPLEMENTATION ====================
    story.append(Paragraph("8. Implementation & Support", styles['SectionHeader']))
    story.append(Paragraph("6 Weeks to Transform Your College", styles['SubsectionHeader']))
    story.append(Spacer(1, 0.2*inch))

    impl_data = [
        ['Phase', 'Duration', 'Deliverables'],
        ['Setup', 'Week 1-2', 'Server provisioning, branding, initial configuration'],
        ['Data Migration', 'Week 2-3', 'Student, staff, fee, attendance data import'],
        ['Training', 'Week 3-4', 'Role-wise training sessions (recorded for reference)'],
        ['Pilot', 'Week 4-5', 'Limited rollout with feedback collection'],
        ['Launch', 'Week 5-6', 'Full deployment with go-live support'],
        ['Ongoing', 'Continuous', '24/7 support, monthly updates, optimization'],
    ]
    impl_table = Table(impl_data, colWidths=[1.5*inch, 1.2*inch, 3.8*inch])
    impl_table.setStyle(create_table_style())
    story.append(impl_table)
    story.append(Spacer(1, 0.3*inch))

    # SLA
    story.append(Paragraph("SLA Commitments", styles['SubsectionHeader']))
    sla_data = [
        ['Severity', 'Response Time', 'Resolution Time'],
        ['Critical (system down)', '15 minutes', '4 hours'],
        ['High (major feature)', '1 hour', '8 hours'],
        ['Medium (partial impact)', '4 hours', '24 hours'],
        ['Low (minor issue)', '24 hours', '72 hours'],
    ]
    sla_table = Table(sla_data, colWidths=[2.5*inch, 2*inch, 2*inch])
    sla_table.setStyle(create_table_style())
    story.append(sla_table)
    story.append(PageBreak())

    # ==================== PRICING ====================
    story.append(Paragraph("9. Pricing & Next Steps", styles['SectionHeader']))
    story.append(Paragraph("Simple, Transparent Pricing", styles['SubsectionHeader']))
    story.append(Spacer(1, 0.2*inch))

    # Pricing highlight
    story.append(Paragraph("Rs 500 / Student / Year", styles['MainTitle']))
    story.append(Paragraph("EVERYTHING INCLUDED - No hidden costs, no implementation fees, no surprises", styles['BodyText']))
    story.append(Spacer(1, 0.2*inch))

    # What's included
    included = [
        "All 20+ Modules", "All 8 Portals", "AI/ML Features", "Mobile Apps (PWA)",
        "Email/SMS Integration", "24/7 Support", "Training & Onboarding", "Regular Updates"
    ]
    story.append(Paragraph("What's Included:", styles['SubsectionHeader']))
    for item in included:
        story.append(Paragraph(f"✓ {item}", styles['BulletPoint']))
    story.append(Spacer(1, 0.2*inch))

    # Volume Discounts
    story.append(Paragraph("Volume Discounts", styles['SubsectionHeader']))
    volume_data = [
        ['Student Count', 'Price/Student', 'Example Annual Cost'],
        ['1 - 5,000', 'Rs 500', 'Rs 25,00,000'],
        ['5,001 - 15,000', 'Rs 450 (10% off)', 'Rs 45,00,000 (10K students)'],
        ['15,001 - 30,000', 'Rs 400 (20% off)', 'Rs 80,00,000 (20K students)'],
        ['30,001+', 'Custom', 'Contact us'],
    ]
    volume_table = Table(volume_data, colWidths=[2*inch, 2*inch, 2.5*inch])
    volume_table.setStyle(create_table_style())
    story.append(volume_table)
    story.append(Spacer(1, 0.3*inch))

    # Next Steps
    story.append(Paragraph("Get Started Today", styles['SubsectionHeader']))
    steps = [
        "<b>Step 1: Schedule Demo</b> - See EduNexus in action with your college data (60 min, Free)",
        "<b>Step 2: Pilot Program</b> - Free 30-day pilot with 100 students",
        "<b>Step 3: Full Rollout</b> - Go live in 6 weeks with complete support",
    ]
    for step in steps:
        story.append(Paragraph(step, styles['BulletPoint']))
    story.append(Spacer(1, 0.3*inch))

    # Contact Info
    story.append(Paragraph("Contact Us", styles['SubsectionHeader']))
    contact_data = [
        ['Channel', 'Contact'],
        ['Email', 'sales@edunexus.in'],
        ['Phone', '+91-XXXXX-XXXXX'],
        ['Website', 'www.edunexus.in'],
        ['Live Demo', 'http://15.206.243.177'],
    ]
    contact_table = Table(contact_data, colWidths=[2*inch, 4.5*inch])
    contact_table.setStyle(create_table_style(ACCENT_TEAL))
    story.append(contact_table)
    story.append(Spacer(1, 0.3*inch))

    # Demo Credentials
    story.append(Paragraph("Demo Environment Access", styles['SubsectionHeader']))
    story.append(Paragraph("Test accounts (all use password: Nexus@1104):", styles['BodyText']))
    demo_data = [
        ['Role', 'Email'],
        ['Principal', 'principal@nexus-ec.edu'],
        ['HOD', 'hod.cse@nexus-ec.edu'],
        ['Admin', 'admin@nexus-ec.edu'],
        ['Teacher', 'teacher@nexus-ec.edu'],
        ['Student', 'student@nexus-ec.edu'],
        ['Parent', 'parent@nexus-ec.edu'],
    ]
    demo_table = Table(demo_data, colWidths=[2*inch, 4.5*inch])
    demo_table.setStyle(create_table_style())
    story.append(demo_table)
    story.append(PageBreak())

    # ==================== CLOSING ====================
    story.append(Spacer(1, 1*inch))
    story.append(Paragraph("Why Choose EduNexus?", styles['SectionHeader']))
    story.append(Spacer(1, 0.2*inch))

    why_data = [
        ['Reason', 'Benefit'],
        ['Student-Centric', 'Built for engineering colleges, not adapted'],
        ['AI-First', 'Predictions and recommendations, not just reports'],
        ['Mobile-First', 'Works on any device, anywhere'],
        ['All-Inclusive', 'One price, all features, no surprises'],
        ['India-Built', 'Data stays in India, AICTE compliant'],
        ['Rapid Deployment', 'Live in 6 weeks, not 6 months'],
        ['Proven ROI', '1,000%+ return on investment'],
    ]
    why_table = Table(why_data, colWidths=[2.5*inch, 4*inch])
    why_table.setStyle(create_table_style(PRIMARY_BLUE))
    story.append(why_table)
    story.append(Spacer(1, 0.5*inch))

    story.append(Paragraph('"Your Students\' Success is Our Mission"', styles['Quote']))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("Document Prepared By: EduNexus Product, QA, BA & Marketing Teams", styles['BodyText']))
    story.append(Paragraph("Version: 1.0 | Date: January 2026", styles['BodyText']))
    story.append(Paragraph("© 2026 EduNexus. All rights reserved.", styles['BodyText']))

    # Build PDF
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"PDF created successfully: {output_path}")
    return output_path

if __name__ == "__main__":
    build_pdf()
