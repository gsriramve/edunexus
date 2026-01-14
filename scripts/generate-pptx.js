const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://edu-nexus.co.in';
const PASSWORD = 'Nexus@1104';

// Create presentation
const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';
pptx.title = 'EduNexus Sales Pitch';
pptx.author = 'EduNexus Team';

// Define colors
const BLUE = '2563eb';
const DARK_BLUE = '1a365d';
const GRAY = '64748b';
const WHITE = 'FFFFFF';
const LIGHT_BG = 'f8fafc';

// Slide 1: Title
let slide = pptx.addSlide();
slide.addText('EduNexus', { x: 0.5, y: 2, w: '90%', h: 1.2, fontSize: 54, bold: true, color: DARK_BLUE, align: 'center' });
slide.addText('AI-Powered College Management Platform', { x: 0.5, y: 3.2, w: '90%', h: 0.6, fontSize: 24, color: GRAY, align: 'center' });
slide.addText(DOMAIN, { x: 0.5, y: 4.2, w: '90%', h: 0.5, fontSize: 20, color: BLUE, align: 'center', hyperlink: { url: DOMAIN } });

// Slide 2: The Problem
slide = pptx.addSlide();
slide.addText('The Problem', { x: 0.5, y: 0.3, w: '90%', h: 0.8, fontSize: 36, bold: true, color: DARK_BLUE });
slide.addText([
  { text: '• ', options: { color: 'dc2626' } }, { text: 'Manual attendance takes 5-10 minutes per class\n', options: { color: '374151' } },
  { text: '• ', options: { color: 'dc2626' } }, { text: 'Report generation takes weeks of manual work\n', options: { color: '374151' } },
  { text: '• ', options: { color: 'dc2626' } }, { text: 'At-risk students identified only after they fail\n', options: { color: '374151' } },
  { text: '• ', options: { color: 'dc2626' } }, { text: 'Parents only get updates at PTM meetings\n', options: { color: '374151' } },
  { text: '• ', options: { color: 'dc2626' } }, { text: 'One-size-fits-all dashboards frustrate users\n', options: { color: '374151' } },
], { x: 0.5, y: 1.3, w: '90%', h: 3.5, fontSize: 22, lineSpacing: 32 });

// Slide 3: The Solution
slide = pptx.addSlide();
slide.addText('The EduNexus Solution', { x: 0.5, y: 0.3, w: '90%', h: 0.8, fontSize: 36, bold: true, color: DARK_BLUE });
slide.addText([
  { text: '✓ ', options: { color: '16a34a' } }, { text: 'AI Face Recognition Attendance (30 seconds)\n', options: { color: '374151' } },
  { text: '✓ ', options: { color: '16a34a' } }, { text: 'Auto-generated Reports (minutes, not weeks)\n', options: { color: '374151' } },
  { text: '✓ ', options: { color: '16a34a' } }, { text: 'Predictive Analytics for At-Risk Students\n', options: { color: '374151' } },
  { text: '✓ ', options: { color: '16a34a' } }, { text: 'Real-time Parent Notifications\n', options: { color: '374151' } },
  { text: '✓ ', options: { color: '16a34a' } }, { text: '9 Role-Specific Dashboards\n', options: { color: '374151' } },
], { x: 0.5, y: 1.3, w: '90%', h: 3.5, fontSize: 22, lineSpacing: 32 });

// Slide 4: Landing Page Screenshot
slide = pptx.addSlide();
slide.addText('Modern, Intuitive Interface', { x: 0.5, y: 0.2, w: '90%', h: 0.6, fontSize: 28, bold: true, color: DARK_BLUE });
const landingImg = path.join(__dirname, '../pptx-assets/landing-page.png');
if (fs.existsSync(landingImg)) {
  slide.addImage({ path: landingImg, x: 0.5, y: 0.9, w: 9, h: 4.3 });
}
slide.addText(DOMAIN, { x: 0.5, y: 5.1, w: '90%', h: 0.3, fontSize: 14, color: BLUE, align: 'center' });

// Slide 5: 9 Personas
slide = pptx.addSlide();
slide.addText('9 Role-Specific Dashboards', { x: 0.5, y: 0.3, w: '90%', h: 0.8, fontSize: 36, bold: true, color: DARK_BLUE });

const personas = [
  ['Platform Owner', 'Principal', 'HOD'],
  ['Admin Staff', 'Teacher', 'Lab Assistant'],
  ['Student', 'Parent', 'Alumni']
];

personas.forEach((row, rowIdx) => {
  row.forEach((persona, colIdx) => {
    const x = 0.5 + colIdx * 3.2;
    const y = 1.2 + rowIdx * 1.4;
    slide.addShape('rect', { x, y, w: 3, h: 1.1, fill: { color: 'e0e7ff' }, line: { color: BLUE, pt: 1 } });
    slide.addText(persona, { x, y: y + 0.35, w: 3, h: 0.4, fontSize: 16, bold: true, color: DARK_BLUE, align: 'center' });
  });
});

// Slide 6: Admin Dashboard
slide = pptx.addSlide();
slide.addText('Admin Staff Dashboard', { x: 0.5, y: 0.2, w: '90%', h: 0.6, fontSize: 28, bold: true, color: DARK_BLUE });
const adminImg = path.join(__dirname, '../pptx-assets/admin-dashboard.png');
if (fs.existsSync(adminImg)) {
  slide.addImage({ path: adminImg, x: 0.5, y: 0.9, w: 9, h: 4.3 });
}
slide.addText('Login: admin@nexus-ec.edu', { x: 0.5, y: 5.1, w: '90%', h: 0.3, fontSize: 14, color: BLUE, align: 'center' });

// Slide 7: Student Dashboard
slide = pptx.addSlide();
slide.addText('Student Dashboard', { x: 0.5, y: 0.2, w: '90%', h: 0.6, fontSize: 28, bold: true, color: DARK_BLUE });
const studentImg = path.join(__dirname, '../pptx-assets/student-dashboard.png');
if (fs.existsSync(studentImg)) {
  slide.addImage({ path: studentImg, x: 0.5, y: 0.9, w: 9, h: 4.3 });
}
slide.addText('Login: student@nexus-ec.edu', { x: 0.5, y: 5.1, w: '90%', h: 0.3, fontSize: 14, color: BLUE, align: 'center' });

// Slide 8: AI Features
slide = pptx.addSlide();
slide.addText('AI-Powered Features', { x: 0.5, y: 0.3, w: '90%', h: 0.8, fontSize: 36, bold: true, color: DARK_BLUE });

const aiFeatures = [
  { title: 'Face Recognition', desc: 'Attendance in 30 seconds with anti-spoofing' },
  { title: 'Predictive Analytics', desc: 'Identify at-risk students weeks ahead' },
  { title: 'Smart Reports', desc: 'Auto-generated accreditation reports' },
  { title: 'Career AI', desc: 'Personalized career path recommendations' },
];

aiFeatures.forEach((feature, idx) => {
  const x = idx % 2 === 0 ? 0.5 : 5;
  const y = idx < 2 ? 1.3 : 3.2;
  slide.addShape('rect', { x, y, w: 4.5, h: 1.5, fill: { color: 'f0fdf4' }, line: { color: '16a34a', pt: 1 } });
  slide.addText(feature.title, { x: x + 0.2, y: y + 0.2, w: 4.1, h: 0.5, fontSize: 18, bold: true, color: DARK_BLUE });
  slide.addText(feature.desc, { x: x + 0.2, y: y + 0.7, w: 4.1, h: 0.6, fontSize: 14, color: GRAY });
});

// Slide 9: ROI
slide = pptx.addSlide();
slide.addText('Return on Investment', { x: 0.5, y: 0.3, w: '90%', h: 0.8, fontSize: 36, bold: true, color: DARK_BLUE });

const roiData = [
  ['Metric', 'Before', 'After', 'Savings'],
  ['Attendance Time', '5-10 min/class', '30 seconds', '90%'],
  ['Report Generation', 'Weeks', 'Minutes', '95%'],
  ['Fee Follow-ups', 'Manual calls', 'Auto-reminders', '70%'],
  ['Student Retention', 'Reactive', 'Predictive +15%', '15%'],
];

roiData.forEach((row, rowIdx) => {
  row.forEach((cell, colIdx) => {
    const x = 0.5 + colIdx * 2.3;
    const y = 1.2 + rowIdx * 0.7;
    const isHeader = rowIdx === 0;
    const isLastCol = colIdx === 3;
    slide.addShape('rect', { x, y, w: 2.2, h: 0.6, fill: { color: isHeader ? BLUE : (isLastCol ? 'dcfce7' : WHITE) }, line: { color: 'e5e7eb', pt: 0.5 } });
    slide.addText(cell, { x, y: y + 0.15, w: 2.2, h: 0.3, fontSize: 12, bold: isHeader || isLastCol, color: isHeader ? WHITE : (isLastCol ? '16a34a' : '374151'), align: 'center' });
  });
});

// Slide 10: Demo Credentials
slide = pptx.addSlide();
slide.addText('Try the Live Demo', { x: 0.5, y: 0.3, w: '90%', h: 0.8, fontSize: 36, bold: true, color: DARK_BLUE });
slide.addText(DOMAIN, { x: 0.5, y: 1.2, w: '90%', h: 0.6, fontSize: 28, bold: true, color: BLUE, align: 'center', hyperlink: { url: DOMAIN } });
slide.addText(`Password: ${PASSWORD}`, { x: 0.5, y: 1.9, w: '90%', h: 0.5, fontSize: 20, color: GRAY, align: 'center' });

const credentials = [
  ['Platform Owner', 'admin@edunexus.io'],
  ['Principal', 'principal@nexus-ec.edu'],
  ['HOD', 'hod.cse@nexus-ec.edu'],
  ['Admin Staff', 'admin@nexus-ec.edu'],
  ['Teacher', 'teacher@nexus-ec.edu'],
  ['Lab Assistant', 'lab@nexus-ec.edu'],
  ['Student', 'student@nexus-ec.edu'],
  ['Parent', 'parent@nexus-ec.edu'],
  ['Alumni', 'alumni@nexus-ec.edu'],
];

credentials.forEach((cred, idx) => {
  const col = idx % 3;
  const row = Math.floor(idx / 3);
  const x = 0.5 + col * 3.2;
  const y = 2.6 + row * 0.8;
  slide.addText(cred[0], { x, y, w: 1.5, h: 0.4, fontSize: 12, bold: true, color: DARK_BLUE });
  slide.addText(cred[1], { x: x + 1.5, y, w: 1.6, h: 0.4, fontSize: 11, color: BLUE });
});

// Slide 11: Call to Action
slide = pptx.addSlide();
slide.addText('Ready to Transform\nYour Institution?', { x: 0.5, y: 1.5, w: '90%', h: 1.5, fontSize: 44, bold: true, color: DARK_BLUE, align: 'center' });
slide.addText('Schedule a personalized demo today', { x: 0.5, y: 3.3, w: '90%', h: 0.6, fontSize: 24, color: GRAY, align: 'center' });
slide.addShape('rect', { x: 3, y: 4.2, w: 4, h: 0.8, fill: { color: BLUE }, line: { color: BLUE } });
slide.addText(DOMAIN, { x: 3, y: 4.35, w: 4, h: 0.5, fontSize: 20, bold: true, color: WHITE, align: 'center', hyperlink: { url: DOMAIN } });

// Save presentation
pptx.writeFile({ fileName: 'EduNexus-Sales-Pitch.pptx' })
  .then(() => console.log('PowerPoint created: EduNexus-Sales-Pitch.pptx'))
  .catch(err => console.error('Error:', err));
