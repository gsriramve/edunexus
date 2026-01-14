const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
        PageBreak, Header, Footer, PageNumber, LevelFormat, ExternalHyperlink } = require('docx');
const fs = require('fs');

// Domain configuration
const DOMAIN = 'https://edu-nexus.co.in';
const PASSWORD = 'Nexus@1104';

// Personas data
const personas = [
  {
    title: 'Platform Owner',
    subtitle: 'Multi-tenant SaaS Administration',
    email: 'admin@edunexus.io',
    features: [
      'Multi-college management from single interface',
      'Subscription & billing management',
      'Cross-institution analytics',
      'Feature flag management'
    ],
    aiFeatures: [
      'Benchmarking AI: Compare performance across all institutions',
      'Churn Prediction: Identify at-risk institutions for proactive engagement'
    ]
  },
  {
    title: 'Principal',
    subtitle: 'Strategic Institutional Leadership',
    email: 'principal@nexus-ec.edu',
    features: [
      'Institution-wide performance metrics & KPIs',
      'Department comparison & benchmarking',
      'NAAC/NBA accreditation dashboard',
      'Staff performance evaluation'
    ],
    aiFeatures: [
      'Predictive Analytics: Forecast dropout risks for proactive intervention',
      'Smart Reports: Auto-generated accreditation reports saving 100+ hours'
    ]
  },
  {
    title: 'HOD',
    subtitle: 'Department Management',
    email: 'hod.cse@nexus-ec.edu',
    features: [
      'Faculty workload & timetable optimization',
      'Subject-wise performance analytics',
      'Curriculum gap analysis',
      'Student skill gap identification'
    ],
    aiFeatures: [
      'Skill Gap AI: Identifies student weaknesses & recommends training',
      'Feedback Intelligence: NLP extracts actionable insights from feedback'
    ]
  },
  {
    title: 'Admin Staff',
    subtitle: 'Administrative Operations',
    email: 'admin@nexus-ec.edu',
    features: [
      'Student records with bulk import/export',
      'Fee collection with online payment',
      'Certificate generation (TC, Bonafide)',
      'Transport, hostel, library management'
    ],
    aiFeatures: [
      'Smart Search: Find any record in milliseconds with AI search',
      'Auto-Reminders: Personalized fee reminders based on history'
    ]
  },
  {
    title: 'Teacher',
    subtitle: 'Classroom Management',
    email: 'teacher@nexus-ec.edu',
    features: [
      'AI-powered face recognition attendance',
      'Digital assignment creation & grading',
      'Student performance with at-risk alerts',
      'Learning material repository'
    ],
    aiFeatures: [
      'Face Recognition: Attendance in 30 seconds with anti-spoofing',
      'At-Risk Alerts: Flag students needing attention before they fail'
    ]
  },
  {
    title: 'Lab Assistant',
    subtitle: 'Laboratory Management',
    email: 'lab@nexus-ec.edu',
    features: [
      'Lab session attendance tracking',
      'Equipment inventory management',
      'Practical marks entry',
      'Maintenance scheduling'
    ],
    aiFeatures: [
      'Predictive Maintenance: Predicts equipment failures before they occur',
      'Usage Analytics: Optimizes lab resource allocation'
    ]
  },
  {
    title: 'Student',
    subtitle: 'Academic Journey & Career',
    email: 'student@nexus-ec.edu',
    features: [
      'Academic performance & grade analytics',
      'Attendance monitoring with alerts',
      'Career readiness assessment',
      'Alumni mentorship connections'
    ],
    aiFeatures: [
      'Career AI: Personalized career paths based on skills & interests',
      'Smart Mentorship: AI matches with ideal alumni mentors'
    ]
  },
  {
    title: 'Parent',
    subtitle: 'Ward Monitoring & Engagement',
    email: 'parent@nexus-ec.edu',
    features: [
      'Live attendance tracking',
      'Academic performance reports',
      'Fee payment portal',
      'Direct teacher communication'
    ],
    aiFeatures: [
      'Smart Alerts: Instant notifications for attendance & grade issues',
      'Progress Insights: AI-generated monthly progress summaries'
    ]
  },
  {
    title: 'Alumni',
    subtitle: 'Lifelong Connection & Giving Back',
    email: 'alumni@nexus-ec.edu',
    features: [
      'Alumni directory with search filters',
      'Mentorship program management',
      'Event registration & networking',
      'Contribution & donation portal'
    ],
    aiFeatures: [
      'Smart Matching: AI pairs mentors with students by career goals',
      'Network AI: Suggests connections based on industry & interests'
    ]
  }
];

// Create Word Document
async function createWordDoc() {
  const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Title", name: "Title", basedOn: "Normal",
          run: { size: 56, bold: true, color: "1a365d", font: "Arial" },
          paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER } },
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, color: "2563eb", font: "Arial" },
          paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, color: "1a365d", font: "Arial" },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      ]
    },
    numbering: {
      config: [
        { reference: "bullet-list",
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: "feature-list",
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "✓", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: "ai-list",
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "→", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
      ]
    },
    sections: [{
      properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
      headers: {
        default: new Header({ children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "EduNexus Sales Pitch", italics: true, color: "666666", size: 18 })]
        })] })
      },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", size: 18 }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
            new TextRun({ text: " | ", size: 18 }),
            new TextRun({ text: DOMAIN, color: "2563eb", size: 18 })
          ]
        })] })
      },
      children: [
        // Title Page
        new Paragraph({ spacing: { before: 1200 } }),
        new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("EduNexus")] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [new TextRun({ text: "AI-Powered College Management Platform", size: 28, color: "666666" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Transform Your Institution with Intelligent Automation", size: 24, italics: true })]
        }),
        new Paragraph({ spacing: { before: 1200 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ExternalHyperlink({
              children: [new TextRun({ text: DOMAIN, color: "2563eb", size: 28, bold: true })],
              link: DOMAIN
            })
          ]
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // Executive Summary
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Executive Summary")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun("EduNexus is a comprehensive, AI-powered college management platform that serves 9 distinct user personas. Unlike traditional software that merely digitizes paper processes, EduNexus leverages artificial intelligence to provide predictive insights, automate routine tasks, and enable data-driven decision making at every level of the institution.")]
        }),

        // Key Differentiators
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Key Differentiators")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("9 Role-Specific Dashboards - Not one-size-fits-all")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("AI-Powered Face Recognition Attendance")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Predictive Analytics for Student Success")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Automated Accreditation Report Generation")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Real-time Parent Communication")] }),
        new Paragraph({ children: [new PageBreak()] }),

        // Demo Credentials
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Try the Live Demo")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun("Access the platform at: "),
            new ExternalHyperlink({
              children: [new TextRun({ text: DOMAIN, color: "2563eb", bold: true })],
              link: DOMAIN
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 400 },
          children: [new TextRun({ text: `Password for all accounts: ${PASSWORD}`, bold: true })]
        }),

        // Credentials Table
        new Table({
          columnWidths: [2500, 4000, 3000],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: "2563eb", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Role", bold: true, color: "FFFFFF" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: "2563eb", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Email", bold: true, color: "FFFFFF" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: "2563eb", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Dashboard", bold: true, color: "FFFFFF" })] })] })
              ]
            }),
            ...personas.map(p => new TableRow({
              children: [
                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: p.title, bold: true })] })] }),
                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: p.email, color: "2563eb" })] })] }),
                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun(p.subtitle)] })] })
              ]
            }))
          ]
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // Traditional vs EduNexus
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Traditional Software vs EduNexus")] }),
        new Table({
          columnWidths: [3000, 3200, 3200],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: "fee2e2", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Aspect", bold: true })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: "fee2e2", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Traditional", bold: true })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: "dcfce7", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "EduNexus", bold: true })] })] })
              ]
            }),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Attendance", bold: true })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Manual roll call (5-10 min)")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("AI Face Recognition (30 sec)")] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Reports", bold: true })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Manual compilation (weeks)")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Auto-generated (minutes)")] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "At-Risk Students", bold: true })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Discovered after failure")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Predicted weeks ahead")] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Parent Updates", bold: true })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("PTM meetings only")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Real-time notifications")] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "User Experience", bold: true })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("One dashboard for all")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("9 role-specific dashboards")] })] })
            ]})
          ]
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // Personas Detail
        ...personas.flatMap((persona, index) => [
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(`${index + 1}. ${persona.title}`)] }),
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: persona.subtitle, italics: true, color: "666666", size: 24 })]
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: `Login: ${persona.email}`, color: "2563eb" })]
          }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Key Features")] }),
          ...persona.features.map(f => new Paragraph({ numbering: { reference: "feature-list", level: 0 }, children: [new TextRun(f)] })),
          new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200 }, children: [new TextRun("AI-Powered Benefits")] }),
          ...persona.aiFeatures.map(f => new Paragraph({ numbering: { reference: "ai-list", level: 0 }, children: [new TextRun(f)] })),
          ...(index < personas.length - 1 ? [new Paragraph({ children: [new PageBreak()] })] : [])
        ]),
        new Paragraph({ children: [new PageBreak()] }),

        // ROI Section
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Return on Investment")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Time Savings")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Attendance: 90% reduction (5 min → 30 sec per class)")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Report Generation: 95% reduction (weeks → minutes)")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Fee Collection: 70% reduction in follow-ups")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Cost Savings")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Reduced administrative staff workload by 40%")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Improved student retention by 15% through early intervention")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Faster accreditation preparation saves consulting fees")] }),
        new Paragraph({ children: [new PageBreak()] }),

        // Call to Action
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Get Started Today")] }),
        new Paragraph({
          spacing: { after: 400 },
          children: [new TextRun({ text: "Experience the future of college management. Try our live demo and see how EduNexus can transform your institution.", size: 24 })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
          children: [
            new ExternalHyperlink({
              children: [new TextRun({ text: DOMAIN, color: "2563eb", size: 32, bold: true })],
              link: DOMAIN
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          children: [new TextRun({ text: `Password: ${PASSWORD}`, size: 24, bold: true })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 600 },
          children: [new TextRun({ text: "Contact us for a personalized demo and pricing.", italics: true, color: "666666" })]
        })
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('EduNexus-Sales-Pitch.docx', buffer);
  console.log('Word document created: EduNexus-Sales-Pitch.docx');
}

createWordDoc().catch(console.error);
