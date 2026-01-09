const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

// Brand Colors (no # prefix for PptxGenJS)
const PRIMARY_BLUE = '1e40af';
const ACCENT_TEAL = '0d9488';
const DARK_TEXT = '1f2937';
const LIGHT_BG = 'f8fafc';
const WHITE = 'FFFFFF';
const SUCCESS_GREEN = '059669';
const WARNING_ORANGE = 'd97706';

async function createPresentation() {
    const pptx = new pptxgen();

    // Presentation metadata
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'EduNexus';
    pptx.title = 'EduNexus - AI-First College Management Platform';
    pptx.subject = 'Sales Pitch for Engineering Colleges';
    pptx.company = 'EduNexus';

    // ==================== SLIDE 1: COVER ====================
    let slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: PRIMARY_BLUE } });
    slide.addText('EduNexus', { x: 0.5, y: 1.5, w: 9, h: 1.2, fontSize: 54, bold: true, color: WHITE, fontFace: 'Arial' });
    slide.addText('AI-First College Management Platform', { x: 0.5, y: 2.7, w: 9, h: 0.6, fontSize: 24, color: ACCENT_TEAL, fontFace: 'Arial' });
    slide.addText('"From Admission to Placement - One Intelligent Platform"', { x: 0.5, y: 3.5, w: 9, h: 0.5, fontSize: 18, italic: true, color: WHITE, fontFace: 'Arial' });

    // Stats boxes
    const statsY = 4.3;
    const stats = [
        { text: '20+ Modules', x: 0.5 },
        { text: '8 Portals', x: 2.7 },
        { text: 'AI Engine', x: 4.9 },
        { text: '6 Weeks Go-Live', x: 7.1 }
    ];
    stats.forEach(s => {
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: s.x, y: statsY, w: 2, h: 0.6, fill: { color: ACCENT_TEAL }, rectRadius: 0.1 });
        slide.addText(s.text, { x: s.x, y: statsY, w: 2, h: 0.6, fontSize: 12, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Arial' });
    });

    // ==================== SLIDE 2: AGENDA ====================
    slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: PRIMARY_BLUE } });
    slide.addText('Agenda', { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 32, bold: true, color: WHITE, fontFace: 'Arial' });

    const agenda = [
        '1. Executive Summary - ROI & Key Differentiators',
        '2. The Problem We Solve - Pain Points by Persona',
        '3. Our Solution - EduNexus Platform Overview',
        '4. Persona-Wise Features & Benefits',
        '5. Quality & Reliability Assurance',
        '6. AI-Powered Capabilities',
        '7. ROI & Time Savings Analysis',
        '8. Implementation & Pricing'
    ];
    agenda.forEach((item, i) => {
        slide.addText(item, { x: 0.8, y: 1.5 + (i * 0.55), w: 8.5, h: 0.5, fontSize: 18, color: DARK_TEXT, fontFace: 'Arial' });
    });

    // ==================== SLIDE 3: EXECUTIVE SUMMARY ====================
    slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: PRIMARY_BLUE } });
    slide.addText('Executive Summary', { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 32, bold: true, color: WHITE, fontFace: 'Arial' });
    slide.addText('One Platform. Complete Transformation.', { x: 0.5, y: 1.4, w: 9, h: 0.4, fontSize: 20, bold: true, color: ACCENT_TEAL, fontFace: 'Arial' });
    slide.addText('EduNexus is an AI-First College Management Platform designed specifically for Indian Engineering Colleges. We unify all college operations - from admission to placement - in one intelligent system.',
        { x: 0.5, y: 1.9, w: 9, h: 0.8, fontSize: 14, color: DARK_TEXT, fontFace: 'Arial' });

    // Differentiators table
    slide.addTable([
        [{ text: 'Traditional ERP', options: { fill: { color: WARNING_ORANGE }, color: WHITE, bold: true } },
         { text: 'EduNexus', options: { fill: { color: SUCCESS_GREEN }, color: WHITE, bold: true } }],
        ['Generic modules', 'Student-centric design'],
        ['Reactive reporting', 'Predictive AI insights'],
        ['Desktop-only', 'Mobile-first PWA'],
        ['6+ months implementation', '6 weeks to go live'],
        ['Hidden costs', 'Rs 500/student/year - all inclusive']
    ], { x: 0.5, y: 2.8, w: 4.3, h: 2.2, fontSize: 11, border: { pt: 0.5, color: 'CCCCCC' }, align: 'left', valign: 'middle', colW: [2.15, 2.15] });

    // ROI Snapshot
    slide.addText('Quick ROI Snapshot', { x: 5, y: 2.7, w: 4.5, h: 0.4, fontSize: 16, bold: true, color: PRIMARY_BLUE, fontFace: 'Arial' });
    slide.addTable([
        [{ text: 'Metric', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true } },
         { text: 'Impact', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true } }],
        ['Fee Collection', '+20%'],
        ['Staff Time Saved', '40+ hrs/month'],
        ['Placement Rate', '+15-20%'],
        ['Report Generation', '10x faster'],
        ['Parent Satisfaction', '+60%']
    ], { x: 5, y: 3.1, w: 4.5, h: 1.9, fontSize: 11, border: { pt: 0.5, color: 'CCCCCC' }, align: 'center', valign: 'middle', colW: [2.25, 2.25] });

    // ==================== SLIDE 4: THE PROBLEM ====================
    slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: PRIMARY_BLUE } });
    slide.addText('The Problem We Solve', { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 32, bold: true, color: WHITE, fontFace: 'Arial' });
    slide.addText('Pain Points Across the College', { x: 0.5, y: 1.4, w: 9, h: 0.4, fontSize: 18, color: WARNING_ORANGE, fontFace: 'Arial' });

    slide.addTable([
        [{ text: 'Persona', options: { fill: { color: WARNING_ORANGE }, color: WHITE, bold: true } },
         { text: 'Pain Point', options: { fill: { color: WARNING_ORANGE }, color: WHITE, bold: true } },
         { text: 'Impact', options: { fill: { color: WARNING_ORANGE }, color: WHITE, bold: true } }],
        ['Principal', 'Fragmented systems, no unified view', 'Cannot make data-driven decisions'],
        ['HOD', 'No real-time analytics', 'At-risk students identified too late'],
        ['Admin Staff', 'Manual processes, paperwork', '40+ hours/month wasted'],
        ['Teacher', 'Time on attendance & marks', 'Less time for teaching'],
        ['Student', 'No career guidance', 'Lower placement rates'],
        ['Parent', 'Disconnected from progress', 'Complaints, dissatisfaction']
    ], { x: 0.5, y: 1.9, w: 9, h: 3.1, fontSize: 12, border: { pt: 0.5, color: 'CCCCCC' }, align: 'left', valign: 'middle', colW: [1.5, 3.5, 4] });

    // ==================== SLIDE 5: ADMIN STAFF TIME ====================
    slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: PRIMARY_BLUE } });
    slide.addText('Admin Staff: Drowning in Paperwork', { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 32, bold: true, color: WHITE, fontFace: 'Arial' });
    slide.addText('141 hours/month spent on repetitive tasks!', { x: 0.5, y: 1.4, w: 9, h: 0.4, fontSize: 18, color: WARNING_ORANGE, bold: true, fontFace: 'Arial' });

    slide.addTable([
        [{ text: 'Task', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true } },
         { text: 'Current Time', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true } },
         { text: 'Frequency', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true } },
         { text: 'Monthly Hrs', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true } }],
        ['Fee collection & receipts', '2 hrs/day', 'Daily', '40 hrs'],
        ['Attendance compilation', '1 hr/day', 'Daily', '20 hrs'],
        ['Report generation', '4 hrs', 'Weekly', '16 hrs'],
        ['Parent phone calls', '2 hrs/day', 'Daily', '40 hrs'],
        ['Certificate processing', '30 min each', '50/month', '25 hrs'],
        [{ text: 'TOTAL', options: { bold: true } }, '', '', { text: '141 hrs', options: { bold: true, color: WARNING_ORANGE } }]
    ], { x: 0.5, y: 1.9, w: 9, h: 2.8, fontSize: 12, border: { pt: 0.5, color: 'CCCCCC' }, align: 'center', valign: 'middle', colW: [3.5, 2, 1.5, 2] });

    slide.addText("That's almost one full-time employee's month spent on repetitive tasks!", { x: 0.5, y: 4.8, w: 9, h: 0.4, fontSize: 14, italic: true, color: DARK_TEXT, fontFace: 'Arial' });

    // ==================== SLIDE 6: OUR SOLUTION ====================
    slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: PRIMARY_BLUE } });
    slide.addText('Our Solution: EduNexus Platform', { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 32, bold: true, color: WHITE, fontFace: 'Arial' });

    slide.addTable([
        [{ text: 'Layer', options: { fill: { color: ACCENT_TEAL }, color: WHITE, bold: true } },
         { text: 'Components', options: { fill: { color: ACCENT_TEAL }, color: WHITE, bold: true } }],
        ['8 Specialized Portals', 'Principal, HOD, Admin, Teacher, Lab Assistant, Student, Parent, Alumni'],
        ['20+ Integrated Modules', 'Academic, Financial, Operations, Career, AI/ML, Communication'],
        ['AI Engine', 'Score Prediction, Placement Prediction, Chatbot, Content Generation'],
        ['Technology Stack', 'Next.js, NestJS, PostgreSQL, Redis, Python ML, AWS Mumbai']
    ], { x: 0.5, y: 1.5, w: 9, h: 2, fontSize: 12, border: { pt: 0.5, color: 'CCCCCC' }, align: 'left', valign: 'middle', colW: [2.5, 6.5] });

    slide.addText('What Makes EduNexus Different', { x: 0.5, y: 3.6, w: 9, h: 0.4, fontSize: 16, bold: true, color: PRIMARY_BLUE, fontFace: 'Arial' });
    const differentiators = [
        'Student-Centric Design - Built for engineering colleges, not adapted',
        'AI-First Architecture - Score Prediction, Placement Prediction, Smart Alerts',
        'Mobile-First Approach - Works seamlessly on any device',
        'Multi-Tenant Security - Complete data isolation per college',
        'Rapid Deployment - 6 weeks to go live, not 6 months'
    ];
    differentiators.forEach((item, i) => {
        slide.addText('• ' + item, { x: 0.7, y: 4.0 + (i * 0.35), w: 8.8, h: 0.35, fontSize: 12, color: DARK_TEXT, fontFace: 'Arial' });
    });

    // ==================== SLIDE 7: PERSONA SUMMARY ====================
    slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: PRIMARY_BLUE } });
    slide.addText('Persona-Wise Features & Time Savings', { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 32, bold: true, color: WHITE, fontFace: 'Arial' });

    slide.addTable([
        [{ text: 'Role', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true } },
         { text: 'Key Features', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true } },
         { text: 'Time Saved', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true } },
         { text: 'Key Value', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true } }],
        ['Principal', 'Dashboard, Analytics, AICTE Reports', '10-15 hrs/mo', 'Strategic focus'],
        ['HOD', 'Faculty Mgmt, Student Analytics', '15-20 hrs/mo', 'Better outcomes'],
        ['Admin Staff', 'Fee Collection, Online Payments', '40-60 hrs/mo', 'Less paperwork'],
        ['Teacher', 'Quick Attendance, Gradebook', '10-15 hrs/mo', 'More teaching'],
        ['Lab Assistant', 'Lab Attendance, Equipment Tracker', '8-10 hrs/mo', 'Better tracking'],
        ['Student', 'AI Dashboard, Career Hub, Chatbot', '5-10 hrs/mo', 'Self-service'],
        ['Parent', 'Progress Tracking, Fee Payment', '5 hrs/mo', 'Peace of mind']
    ], { x: 0.3, y: 1.5, w: 9.4, h: 3.5, fontSize: 11, border: { pt: 0.5, color: 'CCCCCC' }, align: 'center', valign: 'middle', colW: [1.3, 3.3, 1.5, 1.5] });

    // ==================== SLIDE 8: ADMIN STAFF SAVINGS ====================
    slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: PRIMARY_BLUE } });
    slide.addText('Admin Staff: Biggest Impact', { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 32, bold: true, color: WHITE, fontFace: 'Arial' });
    slide.addText('120 hours saved per month!', { x: 0.5, y: 1.4, w: 9, h: 0.4, fontSize: 18, color: SUCCESS_GREEN, bold: true, fontFace: 'Arial' });

    slide.addTable([
        [{ text: 'Task', options: { fill: { color: SUCCESS_GREEN }, color: WHITE, bold: true } },
         { text: 'Before', options: { fill: { color: SUCCESS_GREEN }, color: WHITE, bold: true } },
         { text: 'After', options: { fill: { color: SUCCESS_GREEN }, color: WHITE, bold: true } },
         { text: 'Saved/Month', options: { fill: { color: SUCCESS_GREEN }, color: WHITE, bold: true } }],
        ['Fee collection & receipts', '40 hrs', '5 hrs', '35 hrs'],
        ['Attendance compilation', '20 hrs', '1 hr', '19 hrs'],
        ['Report generation', '16 hrs', '2 hrs', '14 hrs'],
        ['Parent communication', '40 hrs', '8 hrs', '32 hrs'],
        ['Certificate processing', '25 hrs', '5 hrs', '20 hrs'],
        [{ text: 'TOTAL', options: { bold: true } }, { text: '141 hrs', options: { bold: true } }, { text: '21 hrs', options: { bold: true } }, { text: '120 hrs', options: { bold: true, color: SUCCESS_GREEN } }]
    ], { x: 0.5, y: 1.9, w: 9, h: 2.8, fontSize: 12, border: { pt: 0.5, color: 'CCCCCC' }, align: 'center', valign: 'middle', colW: [3.5, 1.8, 1.8, 1.9] });

    // ==================== SLIDE 9: QUALITY & TESTING ====================
    slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: PRIMARY_BLUE } });
    slide.addText('Quality & Reliability Assurance', { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 32, bold: true, color: WHITE, fontFace: 'Arial' });

    // Test Coverage
    slide.addText('E2E Testing Verification', { x: 0.5, y: 1.4, w: 4, h: 0.4, fontSize: 16, bold: true, color: ACCENT_TEAL, fontFace: 'Arial' });
    slide.addTable([
        [{ text: 'Metric', options: { fill: { color: SUCCESS_GREEN }, color: WHITE, bold: true } },
         { text: 'Result', options: { fill: { color: SUCCESS_GREEN }, color: WHITE, bold: true } }],
        ['Total Personas Tested', '21 (7 roles x 3 colleges)'],
        ['Test Scenarios', '100+ automated'],
        ['404 Errors Found', '0'],
        ['Access Denied Errors', '0'],
        ['Tenant Isolation', 'Verified'],
        ['Overall Status', 'PASS']
    ], { x: 0.5, y: 1.8, w: 4.3, h: 2.5, fontSize: 11, border: { pt: 0.5, color: 'CCCCCC' }, align: 'center', valign: 'middle', colW: [2.15, 2.15] });

    // Performance
    slide.addText('Performance & Security', { x: 5, y: 1.4, w: 4.5, h: 0.4, fontSize: 16, bold: true, color: ACCENT_TEAL, fontFace: 'Arial' });
    slide.addTable([
        [{ text: 'Aspect', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true } },
         { text: 'Status', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true } }],
        ['Dashboard Load', '< 3 seconds'],
        ['API Response (p95)', '< 200ms'],
        ['Uptime SLA', '99.9%'],
        ['Encryption', 'AES-256 + TLS 1.3'],
        ['Data Location', 'AWS Mumbai (India)'],
        ['Compliance', 'AICTE Ready']
    ], { x: 5, y: 1.8, w: 4.5, h: 2.5, fontSize: 11, border: { pt: 0.5, color: 'CCCCCC' }, align: 'center', valign: 'middle', colW: [2.25, 2.25] });

    // ==================== SLIDE 10: AI CAPABILITIES ====================
    slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: PRIMARY_BLUE } });
    slide.addText('AI-Powered Capabilities', { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 32, bold: true, color: WHITE, fontFace: 'Arial' });
    slide.addText('The Intelligence That Sets Us Apart', { x: 0.5, y: 1.4, w: 9, h: 0.4, fontSize: 18, color: ACCENT_TEAL, fontFace: 'Arial' });

    slide.addTable([
        [{ text: 'AI Feature', options: { fill: { color: ACCENT_TEAL }, color: WHITE, bold: true } },
         { text: 'Description', options: { fill: { color: ACCENT_TEAL }, color: WHITE, bold: true } },
         { text: 'Accuracy', options: { fill: { color: ACCENT_TEAL }, color: WHITE, bold: true } }],
        ['Score Prediction', 'Predicts exam scores based on attendance, past performance', '85%+'],
        ['Placement Prediction', 'Predicts placement probability and salary band', '80%+'],
        ['Weak Topic ID', 'Identifies topics where student struggles', 'Personalized'],
        ['AI Chatbot', '24/7 query resolution in English/Hindi', 'Instant'],
        ['Content Generation', 'Sample papers, mock tests, study plans', 'AI-powered'],
        ['Resume Builder', 'ATS-optimized resumes with AI suggestions', 'Professional']
    ], { x: 0.5, y: 1.9, w: 9, h: 2.5, fontSize: 11, border: { pt: 0.5, color: 'CCCCCC' }, align: 'left', valign: 'middle', colW: [2, 5.3, 1.7] });

    slide.addText('Traditional ERPs give you reports. EduNexus gives you predictions and recommendations.',
        { x: 0.5, y: 4.6, w: 9, h: 0.4, fontSize: 14, italic: true, bold: true, color: PRIMARY_BLUE, fontFace: 'Arial' });

    // ==================== SLIDE 11: ROI ANALYSIS ====================
    slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: PRIMARY_BLUE } });
    slide.addText('ROI & Time Savings Analysis', { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 32, bold: true, color: WHITE, fontFace: 'Arial' });

    // Time savings
    slide.addText('Per-Persona Time Savings (5,000 Students)', { x: 0.5, y: 1.4, w: 5, h: 0.4, fontSize: 14, bold: true, color: ACCENT_TEAL, fontFace: 'Arial' });
    slide.addTable([
        [{ text: 'Persona', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true, fontSize: 10 } },
         { text: 'Monthly', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true, fontSize: 10 } },
         { text: 'Annual', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true, fontSize: 10 } },
         { text: 'Value', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true, fontSize: 10 } }],
        ['Principal', '10-15 hrs', '144 hrs', 'Strategic'],
        ['HOD (5)', '75-100 hrs', '1,050 hrs', 'Rs 3.5L'],
        ['Admin (15)', '600-900 hrs', '9,000 hrs', 'Rs 20L'],
        ['Teachers (50)', '500-750 hrs', '7,500 hrs', 'Rs 15L'],
        [{ text: 'TOTAL', options: { bold: true } }, { text: '1,265+ hrs', options: { bold: true } }, { text: '18,774 hrs', options: { bold: true } }, { text: 'Rs 40L+', options: { bold: true } }]
    ], { x: 0.5, y: 1.8, w: 4.8, h: 2.2, fontSize: 10, border: { pt: 0.5, color: 'CCCCCC' }, align: 'center', valign: 'middle', colW: [1.3, 1.1, 1.2, 1.2] });

    // Financial Impact
    slide.addText('Financial Impact (5,000 Students)', { x: 5.5, y: 1.4, w: 4, h: 0.4, fontSize: 14, bold: true, color: ACCENT_TEAL, fontFace: 'Arial' });
    slide.addTable([
        [{ text: 'Benefit', options: { fill: { color: SUCCESS_GREEN }, color: WHITE, bold: true, fontSize: 10 } },
         { text: 'Annual', options: { fill: { color: SUCCESS_GREEN }, color: WHITE, bold: true, fontSize: 10 } }],
        ['Fee Collection (+5%)', 'Rs 3.75 Cr'],
        ['Staff Productivity', 'Rs 20.1 L'],
        ['Placement Value', 'Rs 45 L'],
        ['Compliance Savings', 'Rs 3 L'],
        [{ text: 'TOTAL RETURNS', options: { bold: true } }, { text: 'Rs 4.44 Cr', options: { bold: true } }]
    ], { x: 5.5, y: 1.8, w: 4, h: 2.2, fontSize: 10, border: { pt: 0.5, color: 'CCCCCC' }, align: 'center', valign: 'middle', colW: [2.2, 1.8] });

    // ROI Highlight
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.2, w: 9, h: 0.9, fill: { color: PRIMARY_BLUE }, rectRadius: 0.1 });
    slide.addText('Investment: Rs 25L  |  Returns: Rs 4.44 Cr  |  ROI: 1,677%  |  Payback: < 1 month',
        { x: 0.5, y: 4.2, w: 9, h: 0.9, fontSize: 18, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Arial' });

    // ==================== SLIDE 12: IMPLEMENTATION ====================
    slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: PRIMARY_BLUE } });
    slide.addText('Implementation: 6 Weeks to Transform', { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 32, bold: true, color: WHITE, fontFace: 'Arial' });

    slide.addTable([
        [{ text: 'Phase', options: { fill: { color: ACCENT_TEAL }, color: WHITE, bold: true } },
         { text: 'Duration', options: { fill: { color: ACCENT_TEAL }, color: WHITE, bold: true } },
         { text: 'Deliverables', options: { fill: { color: ACCENT_TEAL }, color: WHITE, bold: true } }],
        ['Setup', 'Week 1-2', 'Server provisioning, branding, configuration'],
        ['Data Migration', 'Week 2-3', 'Student, staff, fee, attendance data import'],
        ['Training', 'Week 3-4', 'Role-wise training sessions (recorded)'],
        ['Pilot', 'Week 4-5', 'Limited rollout with feedback collection'],
        ['Launch', 'Week 5-6', 'Full deployment with go-live support'],
        ['Ongoing', 'Continuous', '24/7 support, monthly updates, optimization']
    ], { x: 0.5, y: 1.5, w: 9, h: 2.5, fontSize: 12, border: { pt: 0.5, color: 'CCCCCC' }, align: 'left', valign: 'middle', colW: [1.5, 1.3, 6.2] });

    // SLA
    slide.addText('SLA Commitments', { x: 0.5, y: 4.1, w: 9, h: 0.4, fontSize: 16, bold: true, color: PRIMARY_BLUE, fontFace: 'Arial' });
    slide.addText('Critical: 15 min response, 4 hr resolution  |  High: 1 hr response, 8 hr resolution  |  Medium: 4 hr response, 24 hr resolution',
        { x: 0.5, y: 4.5, w: 9, h: 0.4, fontSize: 12, color: DARK_TEXT, fontFace: 'Arial' });

    // ==================== SLIDE 13: PRICING ====================
    slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: PRIMARY_BLUE } });
    slide.addText('Simple, Transparent Pricing', { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 32, bold: true, color: WHITE, fontFace: 'Arial' });

    // Main price
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 2.5, y: 1.5, w: 5, h: 1.2, fill: { color: ACCENT_TEAL }, rectRadius: 0.1 });
    slide.addText('Rs 500 / Student / Year', { x: 2.5, y: 1.5, w: 5, h: 0.7, fontSize: 28, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Arial' });
    slide.addText('EVERYTHING INCLUDED', { x: 2.5, y: 2.1, w: 5, h: 0.5, fontSize: 14, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Arial' });

    // What's included
    slide.addText("What's Included:", { x: 0.5, y: 2.9, w: 4.5, h: 0.4, fontSize: 14, bold: true, color: PRIMARY_BLUE, fontFace: 'Arial' });
    const included = ['All 20+ Modules', 'All 8 Portals', 'AI/ML Features', 'Mobile Apps (PWA)', 'Email/SMS Integration', '24/7 Support', 'Training & Onboarding', 'Regular Updates'];
    included.forEach((item, i) => {
        const col = i < 4 ? 0.7 : 2.8;
        const row = i % 4;
        slide.addText('✓ ' + item, { x: col, y: 3.3 + (row * 0.35), w: 2.3, h: 0.35, fontSize: 11, color: DARK_TEXT, fontFace: 'Arial' });
    });

    // Volume discounts
    slide.addText('Volume Discounts:', { x: 5.2, y: 2.9, w: 4.3, h: 0.4, fontSize: 14, bold: true, color: PRIMARY_BLUE, fontFace: 'Arial' });
    slide.addTable([
        [{ text: 'Students', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true, fontSize: 10 } },
         { text: 'Price', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true, fontSize: 10 } },
         { text: 'Annual', options: { fill: { color: PRIMARY_BLUE }, color: WHITE, bold: true, fontSize: 10 } }],
        ['1-5,000', 'Rs 500', 'Rs 25L'],
        ['5K-15K', 'Rs 450 (10% off)', 'Rs 45L'],
        ['15K-30K', 'Rs 400 (20% off)', 'Rs 80L'],
        ['30K+', 'Custom', 'Contact us']
    ], { x: 5.2, y: 3.3, w: 4.3, h: 1.7, fontSize: 10, border: { pt: 0.5, color: 'CCCCCC' }, align: 'center', valign: 'middle', colW: [1.2, 1.7, 1.4] });

    // ==================== SLIDE 14: NEXT STEPS ====================
    slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: PRIMARY_BLUE } });
    slide.addText('Next Steps', { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 32, bold: true, color: WHITE, fontFace: 'Arial' });

    // Steps
    const steps = [
        { num: '1', title: 'Schedule Demo', desc: 'See EduNexus in action with your college data (60 min, Free)' },
        { num: '2', title: 'Pilot Program', desc: 'Free 30-day pilot with 100 students' },
        { num: '3', title: 'Full Rollout', desc: 'Go live in 6 weeks with complete support' }
    ];
    steps.forEach((s, i) => {
        const y = 1.5 + (i * 1.1);
        slide.addShape(pptx.shapes.OVAL, { x: 0.5, y: y, w: 0.6, h: 0.6, fill: { color: ACCENT_TEAL } });
        slide.addText(s.num, { x: 0.5, y: y, w: 0.6, h: 0.6, fontSize: 20, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Arial' });
        slide.addText(s.title, { x: 1.3, y: y, w: 3, h: 0.35, fontSize: 16, bold: true, color: PRIMARY_BLUE, fontFace: 'Arial' });
        slide.addText(s.desc, { x: 1.3, y: y + 0.35, w: 7, h: 0.35, fontSize: 12, color: DARK_TEXT, fontFace: 'Arial' });
    });

    // Demo Access
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.3, w: 4.3, h: 0.8, fill: { color: LIGHT_BG }, line: { color: ACCENT_TEAL, width: 1 }, rectRadius: 0.1 });
    slide.addText('Live Demo: http://15.206.243.177', { x: 0.7, y: 4.4, w: 4, h: 0.3, fontSize: 12, bold: true, color: ACCENT_TEAL, fontFace: 'Arial' });
    slide.addText('Password: Nexus@1104', { x: 0.7, y: 4.7, w: 4, h: 0.3, fontSize: 11, color: DARK_TEXT, fontFace: 'Arial' });

    // Contact
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 5, y: 4.3, w: 4.5, h: 0.8, fill: { color: PRIMARY_BLUE }, rectRadius: 0.1 });
    slide.addText('Contact: sales@edunexus.in', { x: 5.2, y: 4.4, w: 4, h: 0.3, fontSize: 12, bold: true, color: WHITE, fontFace: 'Arial' });
    slide.addText('www.edunexus.in', { x: 5.2, y: 4.7, w: 4, h: 0.3, fontSize: 11, color: WHITE, fontFace: 'Arial' });

    // ==================== SLIDE 15: CLOSING ====================
    slide = pptx.addSlide();
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: PRIMARY_BLUE } });
    slide.addText('Why Choose EduNexus?', { x: 0.5, y: 0.8, w: 9, h: 0.6, fontSize: 36, bold: true, color: WHITE, align: 'center', fontFace: 'Arial' });

    const reasons = [
        'Student-Centric - Built for engineering colleges, not adapted',
        'AI-First - Predictions and recommendations, not just reports',
        'Mobile-First - Works on any device, anywhere',
        'All-Inclusive - One price, all features, no surprises',
        'India-Built - Data stays in India, AICTE compliant',
        'Rapid Deployment - Live in 6 weeks, not 6 months',
        'Proven ROI - 1,000%+ return on investment'
    ];
    reasons.forEach((item, i) => {
        slide.addText('✓ ' + item, { x: 1, y: 1.6 + (i * 0.45), w: 8, h: 0.4, fontSize: 14, color: WHITE, fontFace: 'Arial' });
    });

    slide.addText('"Your Students\' Success is Our Mission"', { x: 0.5, y: 4.6, w: 9, h: 0.5, fontSize: 20, italic: true, color: ACCENT_TEAL, align: 'center', fontFace: 'Arial' });

    // Save
    const outputPath = '/Users/sriramvenkatg/edunexus/docs/sales/EduNexus_Sales_Pitch.pptx';
    await pptx.writeFile({ fileName: outputPath });
    console.log('PowerPoint created successfully:', outputPath);
    return outputPath;
}

createPresentation().catch(console.error);
