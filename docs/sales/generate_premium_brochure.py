#!/usr/bin/env python3
"""
EduNexus Premium Sales Brochure Generator
Creates a stunning 6-page PDF brochure focused on pain points and solutions
NO PRICING - Focus on value proposition
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image
import os
import math

# Premium Brand Colors
DEEP_BLUE = HexColor('#0F172A')
PRIMARY_BLUE = HexColor('#2563EB')
INDIGO = HexColor('#4F46E5')
PURPLE = HexColor('#7C3AED')
SLATE_900 = HexColor('#0F172A')
SLATE_800 = HexColor('#1E293B')
SLATE_700 = HexColor('#334155')
SLATE_600 = HexColor('#475569')
SLATE_500 = HexColor('#64748B')
SLATE_400 = HexColor('#94A3B8')
SLATE_200 = HexColor('#E2E8F0')
SLATE_100 = HexColor('#F1F5F9')
ACCENT_GREEN = HexColor('#10B981')
ACCENT_AMBER = HexColor('#F59E0B')
ACCENT_RED = HexColor('#EF4444')
LIGHT_BLUE = HexColor('#DBEAFE')
LIGHT_GREEN = HexColor('#D1FAE5')
LIGHT_AMBER = HexColor('#FEF3C7')
LIGHT_RED = HexColor('#FEE2E2')

# Page dimensions
WIDTH, HEIGHT = A4
MARGIN = 0.6 * inch

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOTS_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'demo-screenshots')
OUTPUT_PATH = os.path.join(SCRIPT_DIR, 'EduNexus-Premium-Brochure.pdf')


def draw_gradient_rect(c, x, y, width, height, color1, color2, steps=100):
    """Draw a vertical gradient rectangle"""
    step_height = height / steps
    for i in range(steps):
        r = color1.red + (color2.red - color1.red) * i / steps
        g = color1.green + (color2.green - color1.green) * i / steps
        b = color1.blue + (color2.blue - color1.blue) * i / steps
        c.setFillColorRGB(r, g, b)
        c.rect(x, y + height - (i + 1) * step_height, width, step_height + 1, fill=1, stroke=0)


def draw_diagonal_gradient(c, x, y, width, height, color1, color2):
    """Draw a diagonal gradient effect"""
    steps = 80
    for i in range(steps):
        r = color1.red + (color2.red - color1.red) * i / steps
        g = color1.green + (color2.green - color1.green) * i / steps
        b = color1.blue + (color2.blue - color1.blue) * i / steps
        c.setFillColorRGB(r, g, b)
        offset = (width / steps) * i
        c.rect(x + offset, y, width / steps + 1, height, fill=1, stroke=0)


def add_image(c, img_path, x, y, max_width, max_height):
    """Add image maintaining aspect ratio"""
    if not os.path.exists(img_path):
        return None, None
    img = Image.open(img_path)
    img_width, img_height = img.size
    aspect = img_width / img_height

    if max_width / aspect <= max_height:
        w = max_width
        h = max_width / aspect
    else:
        h = max_height
        w = max_height * aspect

    c.drawImage(img_path, x, y, width=w, height=h, preserveAspectRatio=True)
    return w, h


def draw_icon_circle(c, x, y, radius, color):
    """Draw a colored circle for icons"""
    c.setFillColor(color)
    c.circle(x, y, radius, fill=1, stroke=0)


def draw_check_icon(c, x, y, size=12):
    """Draw a checkmark"""
    c.setStrokeColor(white)
    c.setLineWidth(2)
    c.line(x - size/3, y, x - size/6, y - size/3)
    c.line(x - size/6, y - size/3, x + size/3, y + size/4)


def page1_cover(c):
    """Page 1: Stunning Cover Page"""
    # Full page dark gradient background
    draw_gradient_rect(c, 0, 0, WIDTH, HEIGHT, DEEP_BLUE, SLATE_800)

    # Decorative elements - subtle geometric shapes
    c.setFillColor(HexColor('#1E3A5F'))
    c.circle(WIDTH + 50, HEIGHT - 100, 200, fill=1, stroke=0)
    c.circle(-80, 150, 150, fill=1, stroke=0)

    # Accent line
    c.setStrokeColor(PRIMARY_BLUE)
    c.setLineWidth(4)
    c.line(MARGIN, HEIGHT - 2.5 * inch, MARGIN + 2 * inch, HEIGHT - 2.5 * inch)

    # Main headline
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(MARGIN, HEIGHT - 2.8 * inch, "INTRODUCING")

    c.setFont("Helvetica-Bold", 52)
    c.drawString(MARGIN, HEIGHT - 3.5 * inch, "edu-nexus")

    # Tagline
    c.setFillColor(SLATE_400)
    c.setFont("Helvetica", 18)
    c.drawString(MARGIN, HEIGHT - 4.1 * inch, "AI-Powered College Management Platform")

    # Main value proposition
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 28)
    y = HEIGHT - 5.5 * inch
    c.drawString(MARGIN, y, "Stop Managing Chaos.")
    c.setFillColor(PRIMARY_BLUE)
    c.drawString(MARGIN, y - 40, "Start Leading Your Institution.")

    # Key stats in boxes
    stats = [
        ("9", "Role-Based Portals"),
        ("20+", "Integrated Modules"),
        ("85%", "AI Prediction Accuracy"),
    ]

    box_width = 1.5 * inch
    box_height = 1.1 * inch
    start_x = MARGIN
    y = HEIGHT - 8 * inch

    for i, (number, label) in enumerate(stats):
        x = start_x + i * (box_width + 0.3 * inch)

        # Box with border
        c.setFillColor(HexColor('#1E293B'))
        c.roundRect(x, y, box_width, box_height, 8, fill=1, stroke=0)
        c.setStrokeColor(PRIMARY_BLUE)
        c.setLineWidth(2)
        c.roundRect(x, y, box_width, box_height, 8, fill=0, stroke=1)

        c.setFillColor(PRIMARY_BLUE)
        c.setFont("Helvetica-Bold", 32)
        c.drawCentredString(x + box_width/2, y + box_height - 0.4 * inch, number)

        c.setFillColor(SLATE_400)
        c.setFont("Helvetica", 10)
        c.drawCentredString(x + box_width/2, y + 0.2 * inch, label)

    # Bottom section
    c.setFillColor(SLATE_500)
    c.setFont("Helvetica", 11)
    c.drawString(MARGIN, 1.2 * inch, "Built for Indian Engineering Colleges")

    c.setFillColor(SLATE_400)
    c.setFont("Helvetica", 10)
    c.drawString(MARGIN, 0.85 * inch, "Powered by Quantumlayer Platform")

    # Website
    c.setFillColor(PRIMARY_BLUE)
    c.setFont("Helvetica-Bold", 12)
    c.drawRightString(WIDTH - MARGIN, 0.85 * inch, "edu-nexus.co.in")


def page2_pain_points(c):
    """Page 2: The Problem - Pain Points"""
    c.showPage()

    # Header section with gradient
    draw_gradient_rect(c, 0, HEIGHT - 2.2 * inch, WIDTH, 2.2 * inch, ACCENT_RED, HexColor('#DC2626'))

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN, HEIGHT - 0.7 * inch, "THE CHALLENGE")

    c.setFont("Helvetica-Bold", 32)
    c.drawString(MARGIN, HEIGHT - 1.3 * inch, "Engineering Colleges Are")
    c.drawString(MARGIN, HEIGHT - 1.75 * inch, "Drowning in Chaos")

    # Pain points
    pain_points = [
        ("40+ Hours/Month", "Wasted on Manual Work",
         "Staff spend countless hours on attendance registers, fee reconciliation, manual reports, and parent phone calls."),
        ("Fragmented Systems", "Data Silos Everywhere",
         "Student data in Excel, fees in Tally, attendance on paper. No single source of truth. Decisions made on incomplete information."),
        ("At-Risk Students", "Discovered Too Late",
         "By the time you identify struggling students, it's already end of semester. Dropouts could have been prevented."),
        ("Fee Collection", "A Never-Ending Chase",
         "Manual reminders, phone calls, defaulter lists. Parents struggle to pay. Collection rates stuck at 80-85%."),
        ("Placement Anxiety", "No Career Guidance System",
         "Students unprepared for interviews. No skill gap analysis. Placement rates suffer. Rankings drop."),
        ("Parent Disconnect", "Complaints Keep Coming",
         "Parents feel out of loop. No visibility into child's progress. Communication is one-way and delayed."),
    ]

    y = HEIGHT - 3 * inch
    col_width = (WIDTH - 2 * MARGIN - 0.4 * inch) / 2

    for i, (title, subtitle, desc) in enumerate(pain_points):
        col = i % 2
        row = i // 2
        x = MARGIN + col * (col_width + 0.4 * inch)
        card_y = y - row * 1.7 * inch

        # Card
        c.setFillColor(LIGHT_RED)
        c.roundRect(x, card_y - 1.4 * inch, col_width, 1.5 * inch, 6, fill=1, stroke=0)

        # Red accent
        c.setFillColor(ACCENT_RED)
        c.rect(x, card_y - 1.4 * inch, 4, 1.5 * inch, fill=1, stroke=0)

        # Number
        c.setFillColor(ACCENT_RED)
        c.setFont("Helvetica-Bold", 24)
        c.drawString(x + 15, card_y - 0.35 * inch, str(i + 1))

        # Title
        c.setFillColor(SLATE_900)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(x + 45, card_y - 0.3 * inch, title)

        # Subtitle
        c.setFillColor(ACCENT_RED)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(x + 45, card_y - 0.55 * inch, subtitle)

        # Description
        c.setFillColor(SLATE_700)
        c.setFont("Helvetica", 8)
        words = desc.split()
        line = ""
        line_y = card_y - 0.8 * inch
        for word in words:
            test_line = line + " " + word if line else word
            if c.stringWidth(test_line, "Helvetica", 8) < col_width - 55:
                line = test_line
            else:
                c.drawString(x + 15, line_y, line)
                line = word
                line_y -= 12
        if line:
            c.drawString(x + 15, line_y, line)

    # Bottom quote
    c.setFillColor(SLATE_600)
    c.setFont("Helvetica-Oblique", 11)
    c.drawCentredString(WIDTH/2, 0.6 * inch, '"We knew there had to be a better way..."')


def page3_solution(c):
    """Page 3: The Solution - EduNexus"""
    c.showPage()

    # Header
    draw_gradient_rect(c, 0, HEIGHT - 2.2 * inch, WIDTH, 2.2 * inch, PRIMARY_BLUE, INDIGO)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN, HEIGHT - 0.7 * inch, "THE SOLUTION")

    c.setFont("Helvetica-Bold", 32)
    c.drawString(MARGIN, HEIGHT - 1.3 * inch, "One Intelligent Platform")
    c.drawString(MARGIN, HEIGHT - 1.75 * inch, "For Complete Control")

    # Main description
    c.setFillColor(SLATE_700)
    c.setFont("Helvetica", 12)
    y = HEIGHT - 3 * inch
    c.drawString(MARGIN, y, "EduNexus brings together every stakeholder, every process, and every")
    c.drawString(MARGIN, y - 18, "data point into one AI-powered platform designed specifically for")
    c.drawString(MARGIN, y - 36, "Indian engineering colleges.")

    # 9 Portals section
    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(MARGIN, y - 80, "9 Role-Based Portals - Everyone Connected")

    portals = [
        ("Platform Owner", "Multi-college oversight", PRIMARY_BLUE),
        ("Principal", "Executive dashboard", INDIGO),
        ("HOD", "Department control", PURPLE),
        ("Admin Staff", "Daily operations", ACCENT_GREEN),
        ("Teacher", "Academic delivery", HexColor('#0EA5E9')),
        ("Lab Assistant", "Practical sessions", ACCENT_AMBER),
        ("Student", "Learning & career", HexColor('#EC4899')),
        ("Parent", "Track & pay", HexColor('#8B5CF6')),
        ("Alumni", "Stay connected", HexColor('#6366F1')),
    ]

    portal_y = y - 120
    col_width = (WIDTH - 2 * MARGIN) / 3

    for i, (name, desc, color) in enumerate(portals):
        col = i % 3
        row = i // 3
        x = MARGIN + col * col_width
        py = portal_y - row * 0.7 * inch

        # Icon circle
        draw_icon_circle(c, x + 12, py - 0.1 * inch, 10, color)

        c.setFillColor(SLATE_900)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(x + 28, py - 0.05 * inch, name)

        c.setFillColor(SLATE_600)
        c.setFont("Helvetica", 8)
        c.drawString(x + 28, py - 0.25 * inch, desc)

    # Key benefits
    benefits_y = portal_y - 2.6 * inch
    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(MARGIN, benefits_y, "What Changes When You Switch to EduNexus")

    benefits = [
        ("Single Source of Truth", "All data in one place. No more Excel chaos.", ACCENT_GREEN),
        ("AI-Powered Predictions", "Know which students need help before it's too late.", PRIMARY_BLUE),
        ("Automated Workflows", "Let the system handle repetitive tasks.", PURPLE),
        ("Real-Time Visibility", "Dashboards that show you what matters, now.", ACCENT_AMBER),
    ]

    ben_y = benefits_y - 0.5 * inch
    for title, desc, color in benefits:
        # Checkmark circle
        draw_icon_circle(c, MARGIN + 10, ben_y - 0.1 * inch, 10, color)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(MARGIN + 10, ben_y - 0.15 * inch, "✓")

        c.setFillColor(SLATE_900)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(MARGIN + 30, ben_y - 0.05 * inch, title)

        c.setFillColor(SLATE_600)
        c.setFont("Helvetica", 9)
        c.drawString(MARGIN + 30, ben_y - 0.28 * inch, desc)

        ben_y -= 0.55 * inch

    # Screenshot
    img_path = os.path.join(SCREENSHOTS_DIR, '04-principal-dashboard.png')
    if os.path.exists(img_path):
        img_width = WIDTH - 2 * MARGIN
        img_height = 1.4 * inch
        img_x = MARGIN
        img_y = 0.5 * inch

        c.setStrokeColor(SLATE_200)
        c.setLineWidth(1)
        c.roundRect(img_x - 2, img_y - 2, img_width + 4, img_height + 4, 8, fill=0, stroke=1)
        add_image(c, img_path, img_x, img_y, img_width, img_height)


def page4_features(c):
    """Page 4: Key Features Deep Dive"""
    c.showPage()

    # Header
    c.setFillColor(SLATE_100)
    c.rect(0, HEIGHT - 1.5 * inch, WIDTH, 1.5 * inch, fill=1, stroke=0)

    c.setFillColor(PRIMARY_BLUE)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN, HEIGHT - 0.6 * inch, "POWERFUL FEATURES")

    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 28)
    c.drawString(MARGIN, HEIGHT - 1.1 * inch, "Built for How Colleges Actually Work")

    # Feature cards
    features = [
        ("Attendance Management",
         "Digital attendance in 2 minutes vs 15. Subject-wise tracking. Automatic shortage alerts. Parent notifications. Biometric-ready.",
         "2 min", "vs 15 min manual", ACCENT_GREEN),
        ("Fee Collection & Payments",
         "Online payments via UPI, cards, net banking. Automated reminders via SMS, WhatsApp, email. Real-time reconciliation. Zero manual follow-ups.",
         "+20%", "collection rate", PRIMARY_BLUE),
        ("Exam & Results Management",
         "End-to-end exam management. Marks entry, grade calculation, CGPA/SGPA. One-click marksheet generation. Result analytics.",
         "1-click", "report generation", PURPLE),
        ("AI Score Prediction",
         "85% accurate predictions using LSTM + XGBoost. Identifies at-risk students in week 2. Personalized intervention recommendations.",
         "Week 2", "early warning", ACCENT_AMBER),
        ("Placement & Career Hub",
         "AI-powered placement predictions. Skill gap analysis. Resume builder. Company-student matching. Mock interview prep.",
         "+25%", "placement rate", HexColor('#EC4899')),
        ("Parent Portal",
         "Real-time academic updates. Online fee payment. Live bus tracking. Direct teacher communication. Complete peace of mind.",
         "60%", "more engagement", HexColor('#8B5CF6')),
    ]

    y = HEIGHT - 2.2 * inch
    col_width = (WIDTH - 2 * MARGIN - 0.3 * inch) / 2
    card_height = 1.6 * inch

    for i, (title, desc, stat, stat_label, color) in enumerate(features):
        col = i % 2
        row = i // 2
        x = MARGIN + col * (col_width + 0.3 * inch)
        card_y = y - row * (card_height + 0.2 * inch)

        # Card background
        c.setFillColor(white)
        c.roundRect(x, card_y - card_height, col_width, card_height, 8, fill=1, stroke=0)

        # Shadow effect
        c.setFillColor(SLATE_200)
        c.roundRect(x + 2, card_y - card_height - 2, col_width, card_height, 8, fill=1, stroke=0)
        c.setFillColor(white)
        c.roundRect(x, card_y - card_height, col_width, card_height, 8, fill=1, stroke=0)

        # Colored top bar
        c.setFillColor(color)
        c.roundRect(x, card_y - 4, col_width, 4, 2, fill=1, stroke=0)

        # Title
        c.setFillColor(SLATE_900)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(x + 12, card_y - 0.35 * inch, title)

        # Stat badge
        c.setFillColor(color)
        c.setFont("Helvetica-Bold", 14)
        c.drawRightString(x + col_width - 12, card_y - 0.3 * inch, stat)
        c.setFillColor(SLATE_500)
        c.setFont("Helvetica", 7)
        c.drawRightString(x + col_width - 12, card_y - 0.48 * inch, stat_label)

        # Description
        c.setFillColor(SLATE_600)
        c.setFont("Helvetica", 8)
        words = desc.split()
        line = ""
        line_y = card_y - 0.65 * inch
        max_lines = 4
        lines_drawn = 0
        for word in words:
            if lines_drawn >= max_lines:
                break
            test_line = line + " " + word if line else word
            if c.stringWidth(test_line, "Helvetica", 8) < col_width - 24:
                line = test_line
            else:
                c.drawString(x + 12, line_y, line)
                line = word
                line_y -= 11
                lines_drawn += 1
        if line and lines_drawn < max_lines:
            c.drawString(x + 12, line_y, line)

    # Bottom - more modules teaser
    c.setFillColor(SLATE_100)
    c.roundRect(MARGIN, 0.4 * inch, WIDTH - 2 * MARGIN, 0.7 * inch, 6, fill=1, stroke=0)

    c.setFillColor(SLATE_700)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(WIDTH/2, 0.85 * inch, "Plus: Transport Management • Hostel & Mess • Library • Sports & Clubs")
    c.setFont("Helvetica", 10)
    c.drawCentredString(WIDTH/2, 0.6 * inch, "Communications • Documents • AICTE Compliance Reports • And More...")


def page5_ai_power(c):
    """Page 5: AI Capabilities"""
    c.showPage()

    # Dark theme for AI page
    c.setFillColor(DEEP_BLUE)
    c.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)

    # Decorative circles
    c.setFillColor(HexColor('#1E3A5F'))
    c.circle(WIDTH - 80, HEIGHT - 150, 180, fill=1, stroke=0)
    c.circle(100, 200, 120, fill=1, stroke=0)

    # Header
    c.setFillColor(PRIMARY_BLUE)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN, HEIGHT - 0.8 * inch, "AI THAT ACTUALLY WORKS")

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(MARGIN, HEIGHT - 1.4 * inch, "Predictive Intelligence")
    c.drawString(MARGIN, HEIGHT - 1.85 * inch, "Built Into Every Module")

    # AI capabilities
    ai_features = [
        ("Score Prediction Engine",
         "LSTM + XGBoost ensemble model predicts student performance with 85% accuracy. Identifies struggling students weeks before exams.",
         "85%", "Accuracy", ACCENT_GREEN),
        ("Placement Prediction",
         "AI analyzes CGPA, skills, certifications, and internships to predict placement probability and match students with ideal companies.",
         "80%", "Match Rate", PRIMARY_BLUE),
        ("Weak Topic Identification",
         "Machine learning identifies specific topics where students struggle. Generates personalized study plans and resource recommendations.",
         "Smart", "Analysis", PURPLE),
        ("24/7 AI Chatbot",
         "Instant answers to student queries. Context-aware responses. Handles 80% of routine questions. Seamless escalation to humans.",
         "24/7", "Support", ACCENT_AMBER),
    ]

    y = HEIGHT - 3 * inch

    for i, (title, desc, stat, stat_label, color) in enumerate(ai_features):
        card_y = y - i * 1.35 * inch

        # Card
        c.setFillColor(SLATE_800)
        c.roundRect(MARGIN, card_y - 1.1 * inch, WIDTH - 2 * MARGIN, 1.2 * inch, 8, fill=1, stroke=0)

        # Accent line
        c.setFillColor(color)
        c.rect(MARGIN, card_y - 1.1 * inch, 4, 1.2 * inch, fill=1, stroke=0)

        # Stat on right
        c.setFillColor(color)
        c.setFont("Helvetica-Bold", 28)
        c.drawRightString(WIDTH - MARGIN - 20, card_y - 0.45 * inch, stat)
        c.setFillColor(SLATE_400)
        c.setFont("Helvetica", 10)
        c.drawRightString(WIDTH - MARGIN - 20, card_y - 0.7 * inch, stat_label)

        # Title
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(MARGIN + 20, card_y - 0.35 * inch, title)

        # Description
        c.setFillColor(SLATE_400)
        c.setFont("Helvetica", 9)
        words = desc.split()
        line = ""
        line_y = card_y - 0.6 * inch
        max_width = WIDTH - 2 * MARGIN - 120
        for word in words:
            test_line = line + " " + word if line else word
            if c.stringWidth(test_line, "Helvetica", 9) < max_width:
                line = test_line
            else:
                c.drawString(MARGIN + 20, line_y, line)
                line = word
                line_y -= 12
        if line:
            c.drawString(MARGIN + 20, line_y, line)

    # Bottom quote
    c.setFillColor(SLATE_500)
    c.setFont("Helvetica-Oblique", 11)
    c.drawCentredString(WIDTH/2, 0.8 * inch, '"AI identifies problems before they become crises."')

    c.setFillColor(SLATE_600)
    c.setFont("Helvetica", 9)
    c.drawCentredString(WIDTH/2, 0.5 * inch, "6 ML Models • GPT-4/Claude Integration • Real-time Analytics")


def page6_cta(c):
    """Page 6: Call to Action"""
    c.showPage()

    # Gradient background
    draw_gradient_rect(c, 0, 0, WIDTH, HEIGHT, PRIMARY_BLUE, INDIGO)

    # Decorative elements
    c.setFillColor(HexColor('#3B82F6'))
    c.circle(-50, HEIGHT/2, 200, fill=1, stroke=0)
    c.circle(WIDTH + 30, HEIGHT - 200, 150, fill=1, stroke=0)

    # Main headline
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(WIDTH/2, HEIGHT - 2.5 * inch, "Ready to Transform")
    c.drawCentredString(WIDTH/2, HEIGHT - 3 * inch, "Your College?")

    # Subheadline
    c.setFillColor(HexColor('#BFDBFE'))
    c.setFont("Helvetica", 16)
    c.drawCentredString(WIDTH/2, HEIGHT - 3.8 * inch, "Join forward-thinking institutions that have")
    c.drawCentredString(WIDTH/2, HEIGHT - 4.1 * inch, "already made the switch to AI-powered management.")

    # What you get
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(WIDTH/2, HEIGHT - 5 * inch, "SCHEDULE A PERSONALIZED DEMO")

    benefits = [
        "See EduNexus configured for your college",
        "Get answers to all your questions",
        "Understand implementation timeline",
        "Discuss customization options",
    ]

    y = HEIGHT - 5.5 * inch
    for benefit in benefits:
        c.setFillColor(HexColor('#93C5FD'))
        c.setFont("Helvetica", 12)
        c.drawCentredString(WIDTH/2, y, f"✓  {benefit}")
        y -= 0.35 * inch

    # Contact box
    c.setFillColor(white)
    box_width = 4 * inch
    box_height = 1.8 * inch
    box_x = (WIDTH - box_width) / 2
    box_y = 1.8 * inch
    c.roundRect(box_x, box_y, box_width, box_height, 12, fill=1, stroke=0)

    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(WIDTH/2, box_y + box_height - 0.5 * inch, "Let's Talk")

    c.setFillColor(PRIMARY_BLUE)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(WIDTH/2, box_y + box_height - 0.95 * inch, "sales@edu-nexus.co.in")

    c.setFillColor(SLATE_700)
    c.setFont("Helvetica", 12)
    c.drawCentredString(WIDTH/2, box_y + box_height - 1.3 * inch, "edu-nexus.co.in")

    c.setFillColor(SLATE_500)
    c.setFont("Helvetica", 10)
    c.drawCentredString(WIDTH/2, box_y + 0.25 * inch, "Powered by Quantumlayer Platform")

    # Footer
    c.setFillColor(HexColor('#93C5FD'))
    c.setFont("Helvetica", 9)
    c.drawCentredString(WIDTH/2, 0.6 * inch, "Made in India  •  For Indian Engineering Colleges  •  AWS Mumbai Region")


def main():
    """Generate the premium brochure PDF"""
    print("Generating EduNexus Premium Sales Brochure...")
    print("Focus: Pain points & solutions, NO pricing")

    c = canvas.Canvas(OUTPUT_PATH, pagesize=A4)

    c.setTitle("EduNexus - AI-Powered College Management Platform")
    c.setAuthor("Quantumlayer Platform")
    c.setSubject("Premium Sales Brochure")

    page1_cover(c)
    page2_pain_points(c)
    page3_solution(c)
    page4_features(c)
    page5_ai_power(c)
    page6_cta(c)

    c.save()
    print(f"✓ Premium brochure saved: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
