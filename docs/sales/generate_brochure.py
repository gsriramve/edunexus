#!/usr/bin/env python3
"""
EduNexus 4-Page Sales Brochure Generator
Creates a professional PDF brochure for email sharing
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image
import os

# Brand Colors
PRIMARY_BLUE = HexColor('#2563EB')
INDIGO = HexColor('#4F46E5')
SLATE_900 = HexColor('#0F172A')
SLATE_700 = HexColor('#334155')
SLATE_500 = HexColor('#64748B')
ACCENT_GREEN = HexColor('#16A34A')
LIGHT_BLUE = HexColor('#DBEAFE')
LIGHT_GREEN = HexColor('#DCFCE7')

# Page dimensions
WIDTH, HEIGHT = A4
MARGIN = 0.5 * inch

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOTS_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'demo-screenshots')
OUTPUT_PATH = os.path.join(SCRIPT_DIR, 'EduNexus-Sales-Brochure.pdf')


def draw_gradient_rect(c, x, y, width, height, color1, color2, steps=50):
    """Draw a vertical gradient rectangle"""
    step_height = height / steps
    for i in range(steps):
        # Interpolate color
        r = color1.red + (color2.red - color1.red) * i / steps
        g = color1.green + (color2.green - color1.green) * i / steps
        b = color1.blue + (color2.blue - color1.blue) * i / steps
        c.setFillColorRGB(r, g, b)
        c.rect(x, y + height - (i + 1) * step_height, width, step_height + 1, fill=1, stroke=0)


def draw_rounded_rect(c, x, y, width, height, radius, fill_color=None, stroke_color=None):
    """Draw a rounded rectangle"""
    if fill_color:
        c.setFillColor(fill_color)
    if stroke_color:
        c.setStrokeColor(stroke_color)
    c.roundRect(x, y, width, height, radius, fill=1 if fill_color else 0, stroke=1 if stroke_color else 0)


def add_image(c, img_path, x, y, max_width, max_height):
    """Add image maintaining aspect ratio"""
    if not os.path.exists(img_path):
        return
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


def page1_cover(c):
    """Page 1: Cover page"""
    # Gradient header
    draw_gradient_rect(c, 0, HEIGHT - 3 * inch, WIDTH, 3 * inch, PRIMARY_BLUE, INDIGO)

    # Logo/Title
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 42)
    c.drawCentredString(WIDTH / 2, HEIGHT - 1.2 * inch, "edu-nexus")

    c.setFont("Helvetica", 14)
    c.drawCentredString(WIDTH / 2, HEIGHT - 1.6 * inch, "Powered by Quantumlayer Platform")

    # Main Headline
    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 28)
    y = HEIGHT - 3.8 * inch
    c.drawCentredString(WIDTH / 2, y, "Stop Managing Chaos.")
    c.drawCentredString(WIDTH / 2, y - 36, "Start Leading Your Institution.")

    # Subheadline
    c.setFillColor(SLATE_700)
    c.setFont("Helvetica", 14)
    c.drawCentredString(WIDTH / 2, y - 80, "AI-First College Management Platform for Indian Engineering Colleges")

    # Stats boxes
    stats = [
        ("50+", "Institutions"),
        ("120K+", "Students"),
        ("99.9%", "Uptime")
    ]
    box_width = 1.6 * inch
    start_x = (WIDTH - 3 * box_width - 0.4 * inch) / 2
    stats_y = HEIGHT - 5.8 * inch

    for i, (number, label) in enumerate(stats):
        x = start_x + i * (box_width + 0.2 * inch)
        draw_rounded_rect(c, x, stats_y, box_width, 0.9 * inch, 8, fill_color=LIGHT_BLUE)
        c.setFillColor(PRIMARY_BLUE)
        c.setFont("Helvetica-Bold", 24)
        c.drawCentredString(x + box_width / 2, stats_y + 0.55 * inch, number)
        c.setFillColor(SLATE_700)
        c.setFont("Helvetica", 11)
        c.drawCentredString(x + box_width / 2, stats_y + 0.2 * inch, label)

    # Hero image
    img_path = os.path.join(SCREENSHOTS_DIR, '01-landing.png')
    if os.path.exists(img_path):
        img_width = WIDTH - 1.5 * inch
        img_height = 2.5 * inch
        img_x = (WIDTH - img_width) / 2
        img_y = 1.8 * inch

        # Shadow effect
        c.setFillColor(HexColor('#E2E8F0'))
        c.roundRect(img_x + 4, img_y - 4, img_width, img_height, 8, fill=1, stroke=0)

        # Image border
        c.setStrokeColor(HexColor('#CBD5E1'))
        c.setLineWidth(1)
        c.roundRect(img_x, img_y, img_width, img_height, 8, fill=0, stroke=1)

        # Draw image (no clipping needed, just draw in bounds)
        add_image(c, img_path, img_x, img_y, img_width, img_height)

    # CTA Footer
    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(WIDTH / 2, 0.9 * inch, "Schedule Your Demo Today")
    c.setFillColor(PRIMARY_BLUE)
    c.setFont("Helvetica", 12)
    c.drawCentredString(WIDTH / 2, 0.55 * inch, "sales@edu-nexus.co.in  |  edu-nexus.co.in")


def page2_problem_solution(c):
    """Page 2: Problem & Solution"""
    c.showPage()

    # Header
    draw_gradient_rect(c, 0, HEIGHT - 1.2 * inch, WIDTH, 1.2 * inch, PRIMARY_BLUE, INDIGO)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(WIDTH / 2, HEIGHT - 0.8 * inch, "The Problem & Our Solution")

    # Pain Points Section
    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 16)
    y = HEIGHT - 2 * inch
    c.drawString(MARGIN, y, "Engineering Colleges Face These Challenges:")

    pain_points = [
        ("40+ hrs/month", "spent on manual administrative work", "95% time saved", "with AI automation"),
        ("Chasing", "fee defaulters manually", "35% faster", "fee collection"),
        ("At-risk students", "discovered too late", "AI alerts", "in week 2"),
        ("Fragmented", "data across systems", "Single platform", "for all operations"),
    ]

    y -= 0.5 * inch
    for before_val, before_desc, after_val, after_desc in pain_points:
        # Before box (red-tinted)
        c.setFillColor(HexColor('#FEE2E2'))
        c.roundRect(MARGIN, y - 0.55 * inch, 2.3 * inch, 0.65 * inch, 4, fill=1, stroke=0)
        c.setFillColor(HexColor('#DC2626'))
        c.setFont("Helvetica-Bold", 11)
        c.drawString(MARGIN + 8, y - 0.15 * inch, before_val)
        c.setFillColor(SLATE_700)
        c.setFont("Helvetica", 9)
        c.drawString(MARGIN + 8, y - 0.38 * inch, before_desc)

        # Arrow
        c.setFillColor(ACCENT_GREEN)
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(MARGIN + 2.6 * inch, y - 0.3 * inch, "→")

        # After box (green-tinted)
        c.setFillColor(LIGHT_GREEN)
        c.roundRect(MARGIN + 2.9 * inch, y - 0.55 * inch, 2.3 * inch, 0.65 * inch, 4, fill=1, stroke=0)
        c.setFillColor(ACCENT_GREEN)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(MARGIN + 2.9 * inch + 8, y - 0.15 * inch, after_val)
        c.setFillColor(SLATE_700)
        c.setFont("Helvetica", 9)
        c.drawString(MARGIN + 2.9 * inch + 8, y - 0.38 * inch, after_desc)

        y -= 0.8 * inch

    # 9 Portals Section
    y -= 0.3 * inch
    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(MARGIN, y, "One Platform, 9 Specialized Portals:")

    portals = [
        ("Platform Owner", "Multi-college oversight"),
        ("Principal", "Institution leadership"),
        ("HOD", "Department management"),
        ("Admin Staff", "Daily operations"),
        ("Teacher", "Academic delivery"),
        ("Lab Assistant", "Practical sessions"),
        ("Student", "Learning & career"),
        ("Parent", "Monitor & pay fees"),
        ("Alumni", "Stay connected"),
    ]

    y -= 0.5 * inch
    col_width = (WIDTH - 2 * MARGIN) / 3
    for i, (name, desc) in enumerate(portals):
        col = i % 3
        row = i // 3
        x = MARGIN + col * col_width
        box_y = y - row * 0.65 * inch

        c.setFillColor(LIGHT_BLUE)
        c.roundRect(x, box_y - 0.45 * inch, col_width - 0.15 * inch, 0.55 * inch, 4, fill=1, stroke=0)
        c.setFillColor(PRIMARY_BLUE)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(x + 6, box_y - 0.12 * inch, name)
        c.setFillColor(SLATE_700)
        c.setFont("Helvetica", 8)
        c.drawString(x + 6, box_y - 0.32 * inch, desc)

    # Dashboard preview
    img_path = os.path.join(SCREENSHOTS_DIR, '04-principal-dashboard.png')
    if os.path.exists(img_path):
        img_width = WIDTH - 1 * inch
        img_height = 1.8 * inch
        img_x = MARGIN
        img_y = 0.6 * inch

        c.setStrokeColor(HexColor('#CBD5E1'))
        c.setLineWidth(1)
        c.roundRect(img_x, img_y, img_width, img_height, 6, fill=0, stroke=1)

        add_image(c, img_path, img_x, img_y, img_width, img_height)

        c.setFillColor(SLATE_500)
        c.setFont("Helvetica", 8)
        c.drawCentredString(WIDTH / 2, 0.4 * inch, "Principal Dashboard - Complete institution visibility")


def page3_features(c):
    """Page 3: Features & AI Capabilities"""
    c.showPage()

    # Header
    draw_gradient_rect(c, 0, HEIGHT - 1.2 * inch, WIDTH, 1.2 * inch, PRIMARY_BLUE, INDIGO)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(WIDTH / 2, HEIGHT - 0.8 * inch, "Powerful Features & AI Capabilities")

    # Feature cards (2x3 grid)
    features = [
        ("Predict Before Problems", "40% fewer dropouts", "AI identifies at-risk students in week 2, not semester end"),
        ("Give Administrators Time", "20 hrs saved/week", "Automate attendance, fees, reports, and communications"),
        ("See the Full Picture", "Unified dashboard", "Real-time metrics across academics, finance, and operations"),
        ("Connect Every Stakeholder", "9 portals", "Parents, students, teachers, alumni - everyone connected"),
        ("Enterprise Security", "99.9% uptime", "AES-256 encryption, AWS Mumbai, bank-grade security"),
        ("Turn Data Into Placements", "+25% placement", "AI-powered career guidance and company matching"),
    ]

    card_width = (WIDTH - 2 * MARGIN - 0.3 * inch) / 2
    card_height = 1.15 * inch
    y_start = HEIGHT - 2 * inch

    for i, (title, stat, desc) in enumerate(features):
        col = i % 2
        row = i // 2
        x = MARGIN + col * (card_width + 0.3 * inch)
        y = y_start - row * (card_height + 0.2 * inch)

        # Card background
        c.setFillColor(HexColor('#F8FAFC'))
        c.roundRect(x, y - card_height, card_width, card_height, 6, fill=1, stroke=0)

        # Left accent bar
        c.setFillColor(PRIMARY_BLUE)
        c.rect(x, y - card_height, 4, card_height, fill=1, stroke=0)

        # Content
        c.setFillColor(SLATE_900)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(x + 12, y - 0.25 * inch, title)

        c.setFillColor(ACCENT_GREEN)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(x + 12, y - 0.5 * inch, stat)

        c.setFillColor(SLATE_700)
        c.setFont("Helvetica", 8)
        # Word wrap description
        words = desc.split()
        line = ""
        line_y = y - 0.7 * inch
        for word in words:
            test_line = line + " " + word if line else word
            if c.stringWidth(test_line, "Helvetica", 8) < card_width - 20:
                line = test_line
            else:
                c.drawString(x + 12, line_y, line)
                line = word
                line_y -= 0.15 * inch
        if line:
            c.drawString(x + 12, line_y, line)

    # AI Highlight Section
    y = HEIGHT - 6 * inch
    c.setFillColor(INDIGO)
    c.roundRect(MARGIN, y - 1.2 * inch, WIDTH - 2 * MARGIN, 1.2 * inch, 8, fill=1, stroke=0)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(WIDTH / 2, y - 0.35 * inch, "AI That Actually Works")

    ai_stats = [
        ("85%", "Prediction Accuracy"),
        ("24/7", "AI Chatbot Support"),
        ("6", "ML Models Built-in"),
    ]

    stat_width = (WIDTH - 2 * MARGIN) / 3
    for i, (num, label) in enumerate(ai_stats):
        x = MARGIN + i * stat_width + stat_width / 2
        c.setFont("Helvetica-Bold", 20)
        c.drawCentredString(x, y - 0.7 * inch, num)
        c.setFont("Helvetica", 10)
        c.drawCentredString(x, y - 0.95 * inch, label)

    # Dashboard screenshots
    screenshots = [
        ('10-student-dashboard.png', 'Student Dashboard'),
        ('07-admin-dashboard.png', 'Admin Dashboard'),
    ]

    img_width = (WIDTH - 2 * MARGIN - 0.3 * inch) / 2
    img_height = 1.6 * inch
    img_y = 0.5 * inch

    for i, (filename, caption) in enumerate(screenshots):
        img_path = os.path.join(SCREENSHOTS_DIR, filename)
        if os.path.exists(img_path):
            x = MARGIN + i * (img_width + 0.3 * inch)

            c.setStrokeColor(HexColor('#CBD5E1'))
            c.setLineWidth(1)
            c.roundRect(x, img_y, img_width, img_height, 6, fill=0, stroke=1)

            add_image(c, img_path, x, img_y, img_width, img_height)

            c.setFillColor(SLATE_500)
            c.setFont("Helvetica", 8)
            c.drawCentredString(x + img_width / 2, img_y - 0.15 * inch, caption)


def page4_roi_cta(c):
    """Page 4: ROI, Pricing & CTA"""
    c.showPage()

    # Header
    draw_gradient_rect(c, 0, HEIGHT - 1.2 * inch, WIDTH, 1.2 * inch, PRIMARY_BLUE, INDIGO)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(WIDTH / 2, HEIGHT - 0.8 * inch, "ROI That Speaks For Itself")

    # ROI Impact boxes
    roi_items = [
        ("+20%", "Fee Collection", "Online payments + auto-reminders"),
        ("40+ hrs", "Saved Monthly", "Per admin staff member"),
        ("+15-20%", "Placement Rate", "AI career guidance"),
        ("1,677%", "Typical ROI", "Payback < 1 month"),
    ]

    box_width = (WIDTH - 2 * MARGIN - 0.45 * inch) / 4
    box_height = 1.1 * inch
    y = HEIGHT - 2.5 * inch

    for i, (number, label, desc) in enumerate(roi_items):
        x = MARGIN + i * (box_width + 0.15 * inch)

        c.setFillColor(LIGHT_GREEN)
        c.roundRect(x, y, box_width, box_height, 6, fill=1, stroke=0)

        c.setFillColor(ACCENT_GREEN)
        c.setFont("Helvetica-Bold", 18)
        c.drawCentredString(x + box_width / 2, y + box_height - 0.35 * inch, number)

        c.setFillColor(SLATE_900)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x + box_width / 2, y + 0.45 * inch, label)

        c.setFillColor(SLATE_700)
        c.setFont("Helvetica", 7)
        c.drawCentredString(x + box_width / 2, y + 0.2 * inch, desc)

    # Pricing Section
    y = HEIGHT - 4.2 * inch
    c.setFillColor(PRIMARY_BLUE)
    c.roundRect(MARGIN, y, WIDTH - 2 * MARGIN, 1.5 * inch, 8, fill=1, stroke=0)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(WIDTH / 2, y + 1.15 * inch, "Simple, Transparent Pricing")

    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(WIDTH / 2, y + 0.65 * inch, "Rs. 500 / student / year")

    c.setFont("Helvetica", 12)
    c.drawCentredString(WIDTH / 2, y + 0.25 * inch, "All 20+ modules included  |  No hidden costs  |  24/7 support")

    # Timeline
    y = HEIGHT - 5.6 * inch
    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(MARGIN, y, "Go Live in 6 Weeks:")

    timeline = [
        ("Week 1-2", "Setup & Config"),
        ("Week 2-3", "Data Migration"),
        ("Week 3-4", "Training"),
        ("Week 4-6", "Pilot & Launch"),
    ]

    step_width = (WIDTH - 2 * MARGIN) / 4
    y -= 0.4 * inch

    for i, (week, task) in enumerate(timeline):
        x = MARGIN + i * step_width

        # Circle with number
        c.setFillColor(PRIMARY_BLUE)
        c.circle(x + 15, y - 0.1 * inch, 12, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(x + 15, y - 0.15 * inch, str(i + 1))

        # Line connector
        if i < 3:
            c.setStrokeColor(PRIMARY_BLUE)
            c.setLineWidth(2)
            c.line(x + 27, y - 0.1 * inch, x + step_width, y - 0.1 * inch)

        c.setFillColor(SLATE_900)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(x + 35, y - 0.05 * inch, week)
        c.setFillColor(SLATE_700)
        c.setFont("Helvetica", 8)
        c.drawString(x + 35, y - 0.25 * inch, task)

    # Free Pilot Offer
    y = HEIGHT - 7.2 * inch
    c.setFillColor(LIGHT_BLUE)
    c.roundRect(MARGIN, y, WIDTH - 2 * MARGIN, 0.8 * inch, 6, fill=1, stroke=0)

    c.setFillColor(PRIMARY_BLUE)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(WIDTH / 2, y + 0.5 * inch, "Start with a 30-Day Free Pilot")
    c.setFillColor(SLATE_700)
    c.setFont("Helvetica", 11)
    c.drawCentredString(WIDTH / 2, y + 0.2 * inch, "100 students  |  Full features  |  No commitment")

    # CTA Section
    y = 1.5 * inch
    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(WIDTH / 2, y + 0.6 * inch, "Ready to Transform Your College?")

    # Contact box
    c.setFillColor(INDIGO)
    c.roundRect((WIDTH - 4 * inch) / 2, y - 0.5 * inch, 4 * inch, 0.9 * inch, 8, fill=1, stroke=0)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(WIDTH / 2, y + 0.15 * inch, "sales@edu-nexus.co.in")
    c.setFont("Helvetica", 12)
    c.drawCentredString(WIDTH / 2, y - 0.15 * inch, "edu-nexus.co.in")

    # Footer
    c.setFillColor(SLATE_500)
    c.setFont("Helvetica", 8)
    c.drawCentredString(WIDTH / 2, 0.4 * inch, "Powered by Quantumlayer Platform  |  Made in India for Indian Colleges")


def main():
    """Generate the brochure PDF"""
    print("Generating EduNexus Sales Brochure...")

    # Create PDF
    c = canvas.Canvas(OUTPUT_PATH, pagesize=A4)

    # Set document info
    c.setTitle("EduNexus - AI-Powered College Management Platform")
    c.setAuthor("Quantumlayer Platform")
    c.setSubject("Sales Brochure")

    # Generate pages
    page1_cover(c)
    page2_problem_solution(c)
    page3_features(c)
    page4_roi_cta(c)

    # Save
    c.save()
    print(f"Brochure saved to: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
