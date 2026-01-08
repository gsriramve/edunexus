# EduNexus - Engineering College Management Platform
## Comprehensive SaaS Platform Plan

**Document Version:** 1.0
**Last Updated:** January 2026
**Status:** Planning Complete - Ready for Implementation

---

# PART A: EXECUTION TRACKER
*(Update this section across sessions to track progress)*

## Overall Progress: ~93% Complete (Core ERP) + Phase 6 Student-Centric (57%)

### Phase-wise Status

| Phase | Description | Status | Progress | Target |
|-------|-------------|--------|----------|--------|
| **Phase 1** | Foundation & Setup | 🟢 Mostly Complete | 13/15 tasks (87%) | Month 1-2 |
| **Phase 2** | Core Modules | 🟢 Mostly Complete | 19/20 tasks (95%) | Month 3-4 |
| **Phase 3** | Advanced Modules | 🟢 **COMPLETE** | 18/18 tasks (100%) | Month 5-6 |
| **Phase 4** | AI Features | 🟢 **COMPLETE** | 12/12 tasks (100%) | Month 6-7 |
| **Phase 5** | Polish & Launch | 🔴 Not Started | 0/10 tasks (0%) | Month 7-8 |
| **Phase 6** | Student-Centric Platform | 🟡 In Progress | 4/7 modules + Frontend (57%) | Month 9-12 |

### Pending Tasks Summary (5 remaining + Phase 6)

**Phase 1 (2 pending):**
- 1.10: Setup CI/CD with GitHub Actions
- 1.15: Setup billing integration for tenants

**Phase 2 (1 pending):**
- 2.18: WhatsApp integration

**Phase 5 (10 pending):**
- All polish & launch tasks pending

### Detailed Task Tracker

#### Phase 1: Foundation (Month 1-2)

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1.1 | Initialize Turborepo monorepo | Claude | ✅ Completed | apps/web, apps/api, packages structure |
| 1.2 | Setup Next.js 14 frontend app | Claude | ✅ Completed | App router, Tailwind, shadcn/ui |
| 1.3 | Setup NestJS backend API | Claude | ✅ Completed | Modules: tenants, students, staff, departments |
| 1.4 | Setup Python FastAPI (ML inference only) | Claude | ✅ Completed | Full AI/ML service with OpenAI/Claude integration |
| 1.5 | Configure PostgreSQL with multi-tenant schemas | Claude | ✅ Completed | Docker Compose, init scripts |
| 1.6 | Setup Redis for caching/sessions | Claude | ✅ Completed | Docker Compose config |
| 1.7 | Configure Auth0/Clerk authentication | Claude | ✅ Completed | Clerk integration, middleware |
| 1.8 | Implement RBAC (8 roles) | Claude | ✅ Completed | roles.ts with all 8 roles |
| 1.9 | Create base UI component library (shadcn) | Claude | ✅ Completed | 20+ components installed |
| 1.10 | Setup CI/CD with GitHub Actions | - | ⬜ Pending | |
| 1.11 | Configure AWS infrastructure (Terraform) | Claude | ✅ Completed | Basic Terraform files created |
| 1.12 | Build Platform Owner Dashboard (tenant mgmt) | Claude | ✅ Completed | /platform + /platform/colleges |
| 1.13 | Build college onboarding flow | Claude | ✅ Completed | Add tenant dialog |
| 1.14 | Implement department & staff management | Claude | ✅ Completed | Principal portal with dept/staff pages |
| 1.15 | Setup billing integration for tenants | - | ⬜ Pending | |

#### Phase 2: Core Modules (Month 3-4)

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 2.1 | Student portal - Dashboard | Claude | ✅ Completed | /student with AI insights, schedule |
| 2.2 | Student portal - Profile & Documents | Claude | ✅ Completed | /student/profile with tabs |
| 2.3 | Student portal - Academics view | Claude | ✅ Completed | /student/academics + attendance + fees + exams |
| 2.4 | Teacher portal - Dashboard | Claude | ✅ Completed | /teacher with schedule, tasks |
| 2.5 | Teacher portal - Student management | Claude | ✅ Completed | /teacher/students + marks + assignments + materials |
| 2.6 | Lab Assistant portal | Claude | ✅ Completed | /lab-assistant: dashboard, attendance, marks, equipment |
| 2.7 | HOD portal - Department view | Claude | ✅ Completed | /hod: dashboard, faculty, students, curriculum, reports |
| 2.8 | Principal portal - College overview | Claude | ✅ Completed | /principal with dept/staff management |
| 2.9 | Parent portal - Dashboard | Claude | ✅ Completed | /parent with multi-child support |
| 2.10 | Admin Staff portal - Operations | Claude | ✅ Completed | /admin: dashboard, fees, admissions, records, communication |
| 2.11 | Attendance module (mark & view) | Claude | ✅ Completed | Teacher + Parent + Student views |
| 2.12 | Fee management - Student view | Claude | ✅ Completed | Student + Parent fee pages |
| 2.13 | Fee management - Admin & collection | Claude | ✅ Completed | Admin fees page with collection, dues, transactions |
| 2.14 | Razorpay payment gateway integration | Claude | ✅ Completed | Student + Parent fees, API + frontend |
| 2.15 | Email notification system (SendGrid) | Claude | ✅ Completed | Templates, Bull queue, payment integration |
| 2.16 | SMS notification system (MSG91) | Claude | ✅ Completed | Templates, Bull queue, combined notifications |
| 2.17 | Push notifications (FCM) | Claude | ✅ Completed | Firebase Admin SDK backend + frontend FCM integration |
| 2.18 | WhatsApp integration | - | ⬜ Pending | |
| 2.19 | PWA configuration | Claude | ✅ Completed | manifest, icons, service worker, offline page |
| 2.20 | Basic reports module | Claude | ✅ Completed | Superseded by 3.16 Advanced Reports |

#### Phase 3: Advanced Modules (Month 5-6) - **COMPLETE**

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 3.1 | Exam management - Scheduling | Claude | ✅ Completed | Backend API, CRUD, upcoming exams, filtering |
| 3.2 | Exam management - Results & Grades | Claude | ✅ Completed | Bulk marks entry, grade calc, CGPA/SGPA, student view |
| 3.3 | Transport - Route management | Claude | ✅ Completed | Routes, stops, vehicles, passes API + Admin UI |
| 3.4 | Transport - Live tracking (Google Maps) | Claude | ✅ Completed | Tracking API, Student transport page, map placeholder |
| 3.5 | Hostel - Block & room management | Claude | ✅ Completed | HostelBlock, HostelRoom models, bulk room creation, Admin UI |
| 3.6 | Hostel - Allocation & fees | Claude | ✅ Completed | Allocations, HostelFee, room transfers, occupancy tracking |
| 3.7 | Hostel - Mess menu & complaints | Claude | ✅ Completed | MessMenu, HostelComplaint, weekly menu, student view |
| 3.8 | Library - Catalog management | Claude | ✅ Completed | Categories, books CRUD, search, filters, Admin UI |
| 3.9 | Library - Issue/Return system | Claude | ✅ Completed | Cards, issues, returns, renewals, fines, reservations |
| 3.10 | Library - E-resources | Claude | ✅ Completed | EResource model, CRUD, view/download tracking, Student UI |
| 3.11 | Sports - Teams & clubs | Claude | ✅ Completed | SportsTeam, Club, ClubMember models, Admin sports page, Student sports page |
| 3.12 | Sports - Events & achievements | Claude | ✅ Completed | SportsEvent, ClubEvent, Achievement, ActivityCredit models |
| 3.13 | Communication - Announcements | Claude | ✅ Completed | Announcement model, CRUD, publish/archive, recipients, comments |
| 3.14 | Communication - Bulk SMS/Email | Claude | ✅ Completed | MessageTemplate, BulkCommunication, CommunicationLog models |
| 3.15 | Document management (S3) | Claude | ✅ Completed | S3 service, folders, upload/download, shares, Admin + Student UI |
| 3.16 | Advanced reports engine | Claude | ✅ Completed | ReportTemplate, ReportJob, ScheduledReport, PDF/Excel generation |
| 3.17 | Bulk import/export (Excel) | Claude | ✅ Completed | ExcelJS, ImportJob/ExportJob/ImportTemplate models, Admin UI |
| 3.18 | Audit logging system | Claude | ✅ Completed | AuditLog/Settings/Summary, interceptor, admin UI, auto-logging |

#### Phase 4: AI Features (Month 6-7) - **COMPLETE**

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 4.1 | ML pipeline setup (Python) | Claude | ✅ Completed | FastAPI with OpenAI/Claude LLM integration |
| 4.2 | Score prediction model | Claude | ✅ Completed | LSTM-based predictor with weighted scoring |
| 4.3 | Weak topic identification | Claude | ✅ Completed | Topic analysis, study plans, recommendations |
| 4.4 | Practice zone - Sample paper generator | Claude | ✅ Completed | Multi-type questions, difficulty levels |
| 4.5 | Mock test engine (adaptive difficulty) | Claude | ✅ Completed | Adaptive tests based on student level |
| 4.6 | Placement prediction model | Claude | ✅ Completed | XGBoost predictor, salary bands, company matching |
| 4.7 | Career Hub - Student dashboard | Claude | ✅ Completed | Simple UI: drives, applications, preparation |
| 4.8 | Career Hub - Placement cell admin | Claude | ✅ Completed | Drive management, statistics, student tracking |
| 4.9 | AI Resume builder | Claude | ✅ Completed | ATS-optimized, multiple formats, suggestions |
| 4.10 | AI Chatbot (support) | Claude | ✅ Completed | FAQ-based + LLM, category classification |
| 4.11 | Predictive analytics dashboards | Claude | ✅ Completed | Student/batch analytics, risk identification |
| 4.12 | AICTE report auto-generation | Claude | ✅ Completed | Regulatory report data compilation |

#### Phase 5: Polish & Launch (Month 7-8)

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 5.1 | Performance optimization | - | ⬜ Pending | |
| 5.2 | Security audit | - | ⬜ Pending | |
| 5.3 | Penetration testing | - | ⬜ Pending | |
| 5.4 | Load testing | - | ⬜ Pending | |
| 5.5 | User documentation | - | ⬜ Pending | |
| 5.6 | Admin training materials | - | ⬜ Pending | |
| 5.7 | Pilot deployment - College 1 | - | ⬜ Pending | |
| 5.8 | Pilot deployment - College 2 | - | ⬜ Pending | |
| 5.9 | Bug fixes from pilot | - | ⬜ Pending | |
| 5.10 | Production launch | - | ⬜ Pending | |

#### Phase 6: Student-Centric Platform (Month 9-12) - **IN PROGRESS**

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 6.1 | Student Growth Index (SGI) API Module | Claude | ✅ Completed | SGI calculator, trend analysis, component breakdown |
| 6.2 | Career Readiness Index (CRI) API Module | Claude | ✅ Completed | CRI calculator, placement probability, skill gaps |
| 6.3 | 360° Feedback System | Claude | ✅ Completed | Cycles, entries, summaries, bias normalization |
| 6.4 | AI-Driven Guidance Module | Claude | ✅ Completed | Recommendations, goals, disengagement alerts |
| 6.5 | **Student Growth Page (Frontend)** | Claude | ✅ **Completed** | SGI components, charts, trend visualization |
| 6.6 | Student Journey Timeline | - | ⬜ Pending | Milestones, semester snapshots, longitudinal tracking |
| 6.7 | Face Recognition Attendance | - | ⬜ Pending | AWS Rekognition, enrollment, class photo processing |
| 6.8 | Alumni Management Module | - | ⬜ Pending | Registration, mentorship, contributions, events |
| 6.9 | Accreditation Dashboards | - | ⬜ Pending | NBA, NAAC, NIRF metric tracking |

**Phase 6 Database Schema:** 20+ new models added to `packages/database/prisma/schema.prisma`
- StudentGrowthIndex, CareerReadinessIndex, IndexConfiguration
- FeedbackCycle, FeedbackEntry, FeedbackSummary
- AiGuidance, StudentGoal, DisengagementAlert
- JourneyMilestone, SemesterSnapshot
- AlumniProfile, AlumniEmployment, AlumniMentorship, AlumniContribution, AlumniTestimonial, AlumniEvent
- AccreditationMetric, AccreditationValue

**Phase 6 Frontend Hooks:** Created in `apps/web/src/hooks/`
- `use-student-indices.ts` - SGI/CRI data fetching
- `use-student-growth.ts` - SGI visualization hooks and utilities
- `use-feedback.ts` - Feedback operations
- `use-ai-guidance.ts` - Guidance, goals, alerts

**Phase 6 Frontend Components:** Created in `apps/web/src/components/indices/`
- `SGICard.tsx` - Score card with trend indicator
- `SGITrendChart.tsx` - Line chart for trend visualization
- `SGIBreakdownRadar.tsx` - Radar chart for component breakdown

### Status Legend
- ⬜ Pending
- 🟡 In Progress
- ✅ Completed
- ❌ Blocked
- ⏸️ On Hold

### Session Log
*(Add entry after each session)*

| Date | Session | Tasks Completed | Notes |
|------|---------|-----------------|-------|
| Jan 2026 | Session 1 | Planning document created | Architecture, DB schema, folder structure |
| Jan 2026 | Session 2 | Phase 1 Foundation | Turborepo, Next.js, NestJS, Clerk auth, RBAC |
| Jan 2026 | Session 3 | Platform + Principal portals | Tenant mgmt, dept/staff management |
| Jan 6, 2026 | Session 4 | Student Portal complete | 6 pages: dashboard, profile, academics, attendance, fees, exams |
| Jan 6, 2026 | Session 4 | Teacher Portal complete | 6 pages: dashboard, attendance, students, marks, assignments, materials |
| Jan 6, 2026 | Session 4 | Parent Portal complete | 5 pages: dashboard, academics, fees, attendance, communication |
| Jan 6, 2026 | Session 5 | HOD Portal complete | 5 pages: dashboard, faculty, students, curriculum, reports |
| Jan 6, 2026 | Session 5 | Lab Assistant Portal complete | 4 pages: dashboard, attendance, marks, equipment |
| Jan 6, 2026 | Session 5 | Admin Staff Portal complete | 5 pages: dashboard, fees, admissions, records, communication |
| Jan 6, 2026 | Session 6 | Student CRUD + Razorpay Planning | Principal students page, Razorpay integration plan |
| Jan 6, 2026 | Session 7 | Razorpay Integration Complete | Backend payments module, Student + Parent fees pages |
| Jan 6, 2026 | Session 7 | PWA Configuration Complete | manifest.json, icons, service worker, offline page |
| Jan 6, 2026 | Session 7 | Email Notifications Complete | SendGrid, templates, Bull queue, payment integration |
| Jan 6, 2026 | Session 7 | SMS Notifications Complete | MSG91, templates, Bull queue, combined notifications |
| Jan 6, 2026 | Session 8 | Exam Management Module Complete | Backend: exams + exam-results modules, Frontend: API hooks |
| Jan 6, 2026 | Session 9 | Transport Module Complete | Database schema (5 models), Backend API, Admin + Student pages |
| Jan 6, 2026 | Session 10 | Hostel Module Complete | Database schema (6 models), Backend API, Admin + Student pages |
| Jan 6, 2026 | Session 11 | Library Module Complete | Database schema (7 models), Backend API, Admin + Student pages |
| Jan 6, 2026 | Session 12 | Document Management Complete | S3 service, Documents API, Admin + Student UI |
| Jan 6, 2026 | Session 13 | Sports & Clubs Module Complete | Teams, clubs, events, achievements, activity credits |
| Jan 6, 2026 | Session 14 | Communication Module Complete | Announcements, templates, bulk comms |
| Jan 6, 2026 | Session 15 | Bulk Import/Export Module Complete | ExcelJS, import/export jobs, Admin UI |
| Jan 6, 2026 | Session 16 | Audit Logging System Complete | AuditLog models, interceptor, admin UI |
| Jan 7, 2026 | Session 17 | Advanced Reports Engine Complete | PDF/Excel generation, templates, **Phase 3 100% Complete** |
| Jan 7, 2026 | Session 18 | Push Notifications (FCM) Complete | Firebase SDK frontend, service worker, hooks, UI components |
| Jan 7, 2026 | Session 19 | **Phase 4 AI Features Complete** | ML service: score/placement prediction, weak topics, content gen, resume builder, chatbot, analytics; Frontend: Career Hub, Placements Admin |
| Jan 8, 2026 | Session 20 | **Phase 6 Started** | Database schema: 20+ Student-Centric models (SGI, CRI, Feedback, Alumni, Accreditation) |
| Jan 8, 2026 | Session 21 | Student-Indices Module Complete | SGI/CRI API module, calculators, frontend hooks |
| Jan 8, 2026 | Session 22 | Feedback Module Complete | 360° feedback with cycles, bias normalization, summaries |
| Jan 8, 2026 | Session 23 | AI Guidance Module Complete | Recommendations engine, alert detection, goals tracking, frontend hooks |
| Jan 8, 2026 | Session 24 | **Student Growth Page Complete** | SGI components (SGICard, SGITrendChart, SGIBreakdownRadar), recharts, enhanced growth page (57% Phase 6) |

---

# PART B: ARCHITECTURE DOCUMENT

---

## Executive Summary

**Vision:** AI-first, student-centric college management platform for Indian engineering colleges.

**Business Model:** B2B SaaS - Sold to college groups at ₹500/student/year

**Scope:**
- 7 User Personas (see hierarchy below)
- Multi-tenant SaaS with white-label branding per institution
- Web + PWA deployment
- Full AI capabilities from MVP
- 6-8 month timeline
- Platform Owner Dashboard for managing all colleges

**Target:** Engineering colleges in India, pilot with 2-3 institutions (~15K students)

---

## User Persona Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                  PLATFORM LEVEL (You)                        │
├─────────────────────────────────────────────────────────────┤
│  PLATFORM OWNER                                              │
│  ├── Manage all college tenants                             │
│  ├── Billing & subscription management                      │
│  ├── Platform-wide analytics                                │
│  ├── Feature flag management                                │
│  └── Support & escalations                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  COLLEGE LEVEL (Per Tenant)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PRINCIPAL / SUPER ADMIN                                    │
│  └── Full college access, all modules, all reports          │
│                                                             │
│       ├── HODs (Department Heads)                           │
│       │   └── Department-level management & reports         │
│       │                                                     │
│       ├── ADMIN STAFF                                       │
│       │   └── Fee collection, admissions, operations        │
│       │                                                     │
│       ├── TEACHERS                                          │
│       │   └── Subject-wise: attendance, marks, content      │
│       │                                                     │
│       └── LAB ASSISTANTS                                    │
│           └── Lab attendance + practical marks entry        │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  STUDENT                                                    │
│  └── View own data, practice, career hub                    │
│                                                             │
│  PARENT                                                     │
│  └── View child's data, fee payment, communication          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. SYSTEM ARCHITECTURE

### 1.1 High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENTS                                        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐  │
│    │   Student   │     │   Teacher   │     │   Parent    │     │   Admin     │  │
│    │   (PWA)     │     │   (PWA)     │     │   (PWA)     │     │   (Web)     │  │
│    └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘  │
│           │                   │                   │                   │          │
│           └───────────────────┴───────────────────┴───────────────────┘          │
│                                       │                                          │
└───────────────────────────────────────┼──────────────────────────────────────────┘
                                        │ HTTPS
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              AWS CLOUD (ap-south-1)                              │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │                           EDGE LAYER                                        │  │
│  │  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │  │
│  │  │  CloudFront  │     │    WAF       │     │  Route 53    │               │  │
│  │  │    (CDN)     │     │  (Security)  │     │    (DNS)     │               │  │
│  │  └──────────────┘     └──────────────┘     └──────────────┘               │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                       │                                          │
│                                       ▼                                          │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │                      APPLICATION LOAD BALANCER (ALB)                        │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                    │                  │                   │                      │
│                    ▼                  ▼                   ▼                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │                     KUBERNETES CLUSTER (EKS)                                │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │  │
│  │  │                  │  │                  │  │                  │         │  │
│  │  │   FRONTEND       │  │   BACKEND API    │  │   AI SERVICES    │         │  │
│  │  │   Next.js 14     │  │   NestJS         │  │   FastAPI        │         │  │
│  │  │   (3 replicas)   │  │   (5 replicas)   │  │   (3 replicas)   │         │  │
│  │  │                  │  │                  │  │                  │         │  │
│  │  └──────────────────┘  └────────┬─────────┘  └────────┬─────────┘         │  │
│  │                                 │                     │                    │  │
│  └─────────────────────────────────┼─────────────────────┼────────────────────┘  │
│                                    │                     │                       │
│                                    ▼                     ▼                       │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │                          DATA LAYER                                         │  │
│  │                                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │  PostgreSQL  │  │    Redis     │  │   MongoDB    │  │ Elasticsearch │   │  │
│  │  │   (RDS)      │  │(ElastiCache) │  │  (DocumentDB)│  │   (OpenSearch)│   │  │
│  │  │  Multi-tenant│  │   Cache +    │  │   AI/ML Data │  │    Search     │   │  │
│  │  │   Schemas    │  │   Sessions   │  │   + Logs     │  │   + Analytics │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                                             │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │                         STORAGE & MESSAGING                                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │      S3      │  │     SQS      │  │     SNS      │  │   Qdrant     │   │  │
│  │  │  (Documents, │  │   (Message   │  │   (Push      │  │  (Vector DB  │   │  │
│  │  │   Media)     │  │   Queues)    │  │   Notifs)    │  │  self-hosted)│   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

                                    EXTERNAL SERVICES
┌──────────────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Auth0/     │  │   Razorpay   │  │    MSG91/    │  │   OpenAI/    │         │
│  │   Clerk      │  │  (Payments)  │  │   Twilio     │  │   Claude     │         │
│  │   (Auth)     │  │              │  │   (SMS)      │  │   (AI APIs)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   SendGrid   │  │   WhatsApp   │  │ Google Maps  │  │   Firebase   │         │
│  │   (Email)    │  │   Business   │  │  (Tracking)  │  │   (FCM)      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Multi-Tenant Data Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         POSTGRESQL MULTI-TENANT DESIGN                           │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │                          PUBLIC SCHEMA (Shared)                             │  │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                  │  │
│  │  │   tenants     │  │ subscriptions │  │  platform_    │                  │  │
│  │  │  (colleges)   │  │   (billing)   │  │    admins     │                  │  │
│  │  └───────────────┘  └───────────────┘  └───────────────┘                  │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                     │
│  │                │  │                │  │                │                     │
│  │  tenant_abc    │  │  tenant_xyz    │  │  tenant_pqr    │     ...            │
│  │  (College A)   │  │  (College B)   │  │  (College C)   │                     │
│  │                │  │                │  │                │                     │
│  │  ┌──────────┐  │  │  ┌──────────┐  │  │  ┌──────────┐  │                     │
│  │  │ students │  │  │  │ students │  │  │  │ students │  │                     │
│  │  │ staff    │  │  │  │ staff    │  │  │  │ staff    │  │                     │
│  │  │ fees     │  │  │  │ fees     │  │  │  │ fees     │  │                     │
│  │  │ exams    │  │  │  │ exams    │  │  │  │ exams    │  │                     │
│  │  │ ...      │  │  │  │ ...      │  │  │  │ ...      │  │                     │
│  │  └──────────┘  │  │  └──────────┘  │  │  └──────────┘  │                     │
│  │                │  │                │  │                │                     │
│  └────────────────┘  └────────────────┘  └────────────────┘                     │
│                                                                                  │
│  BENEFITS:                                                                       │
│  ✓ Complete data isolation between colleges                                     │
│  ✓ Easy per-tenant backup/restore                                               │
│  ✓ Regulatory compliance (data never mixes)                                     │
│  ✓ Per-tenant schema migrations possible                                        │
│  ✓ Easy to offboard a tenant (drop schema)                                      │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Application Architecture (Hybrid Microservices)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                       HYBRID MICROSERVICES ARCHITECTURE                          │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                        API GATEWAY (NestJS)                               │   │
│  │  • Authentication middleware    • Rate limiting                          │   │
│  │  • Tenant resolution           • Request logging                         │   │
│  │  • RBAC enforcement            • API versioning                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                          │
│     ┌─────────────┬──────────────┬────┴────┬──────────────┬─────────────┐       │
│     ▼             ▼              ▼         ▼              ▼             ▼       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  User    │ │ Academic │ │   Fee    │ │Placement │ │   AI     │ │   ML     │ │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Inference│ │
│  │ (NestJS) │ │ (NestJS) │ │ (NestJS) │ │ (NestJS) │ │ (NestJS) │ │ (Python) │ │
│  │          │ │          │ │          │ │          │ │          │ │          │ │
│  │ • Auth   │ │ • Students│ │ • Billing│ │• Companies│ │• Claude  │ │• Score   │ │
│  │ • Profile│ │ • Attend. │ │ • Payments│ │• Drives  │ │  SDK     │ │  Predict │ │
│  │ • Roles  │ │ • Exams  │ │ • Receipts│ │• Analytics│ │• Llama-  │ │• Place-  │ │
│  │ • Staff  │ │ • Results│ │ • Reports│ │• Matching│ │  Index.TS│ │  ment    │ │
│  │          │ │          │ │          │ │          │ │• Qdrant  │ │  Predict │ │
│  │          │ │          │ │          │ │          │ │• Chatbot │ │          │ │
│  │          │ │          │ │          │ │          │ │• RAG     │ │(PyTorch/ │ │
│  │          │ │          │ │          │ │          │ │• Q&A Gen │ │ XGBoost) │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│     │             │              │           │              │            │      │
│     └─────────────┴──────────────┴───────────┴──────────────┴────────────┘      │
│                                       │                                          │
│                                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                        MESSAGE QUEUE (Bull MQ)                            │   │
│  │  • Email queue      • SMS queue       • Report generation                │   │
│  │  • Push notifications • Bulk operations • AI processing                  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  HYBRID APPROACH:                                                               │
│  • NestJS AI Service: LLM calls (Claude SDK), RAG (LlamaIndex.TS), Chatbot     │
│  • Python ML Service: Score prediction (PyTorch), Placement prediction (XGBoost)│
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.4 Authentication & Authorization Flow

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION & RBAC FLOW                                │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  USER LOGIN                                                                      │
│      │                                                                           │
│      ▼                                                                           │
│  ┌────────────────┐                                                             │
│  │   Auth0/Clerk  │ ◄─── Social Login (Google), Email/Password                  │
│  └───────┬────────┘                                                             │
│          │                                                                       │
│          ▼                                                                       │
│  ┌────────────────┐     ┌────────────────┐                                      │
│  │  JWT Token     │ ──► │  API Gateway   │                                      │
│  │  (with claims) │     │                │                                      │
│  └────────────────┘     └───────┬────────┘                                      │
│                                 │                                                │
│                                 ▼                                                │
│                    ┌────────────────────────┐                                   │
│                    │  TENANT RESOLUTION     │                                   │
│                    │  (from subdomain/JWT)  │                                   │
│                    └───────────┬────────────┘                                   │
│                                │                                                │
│                                ▼                                                │
│                    ┌────────────────────────┐                                   │
│                    │  ROLE CHECK (CASL.js)  │                                   │
│                    │                        │                                   │
│                    │  Roles:                │                                   │
│                    │  ├── platform_owner    │                                   │
│                    │  ├── principal         │                                   │
│                    │  ├── hod               │                                   │
│                    │  ├── admin_staff       │                                   │
│                    │  ├── teacher           │                                   │
│                    │  ├── lab_assistant     │                                   │
│                    │  ├── student           │                                   │
│                    │  └── parent            │                                   │
│                    └───────────┬────────────┘                                   │
│                                │                                                │
│                                ▼                                                │
│                    ┌────────────────────────┐                                   │
│                    │  PERMISSION CHECK      │                                   │
│                    │  (Resource + Action)   │                                   │
│                    │                        │                                   │
│                    │  can('read', 'Student')│                                   │
│                    │  can('update', 'Fees') │                                   │
│                    │  can('delete', 'Exam') │                                   │
│                    └───────────┬────────────┘                                   │
│                                │                                                │
│                                ▼                                                │
│                         ┌────────────┐                                          │
│                         │  ALLOWED   │ ───► Proceed to Service                  │
│                         └────────────┘                                          │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.5 Recommended Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                                │
├─────────────────────────────────────────────────────────────┤
│  Next.js 14 (App Router) + TypeScript + Tailwind CSS        │
│  PWA: Service Workers + Workbox                              │
│  State: Zustand + React Query (TanStack)                     │
│  UI: shadcn/ui + Radix Primitives                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (HYBRID)                        │
├─────────────────────────────────────────────────────────────┤
│  Node.js + NestJS (TypeScript) - Main API + LLM Integration │
│  ├── @anthropic-ai/sdk - Claude API calls                   │
│  ├── llamaindex (TS) - RAG & document Q&A                   │
│  └── @qdrant/js-client - Vector search                      │
│  Python + FastAPI - ML Model Inference ONLY                 │
│  ├── PyTorch - Score prediction model                       │
│  └── XGBoost - Placement prediction model                   │
│  GraphQL (Apollo) + REST APIs                               │
│  Bull MQ - Background Jobs & Queues                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL - Primary DB (Multi-tenant schemas)             │
│  Redis - Caching, Sessions, Real-time                       │
│  Qdrant - Vector DB for RAG (self-hosted on EKS)            │
│  Elasticsearch - Search & Analytics                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      AI/ML LAYER (HYBRID)                    │
├─────────────────────────────────────────────────────────────┤
│  NestJS Service:                                            │
│  ├── Claude SDK (Node.js) - Content generation, chatbot     │
│  ├── LlamaIndex.TS - RAG pipeline                           │
│  └── Qdrant Client - Vector similarity search               │
│  Python Microservice (minimal):                             │
│  ├── Score Prediction - PyTorch LSTM model                  │
│  └── Placement Prediction - XGBoost ensemble                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                          │
├─────────────────────────────────────────────────────────────┤
│  AWS Mumbai Region (Data Localization)                      │
│  Docker + Kubernetes (EKS)                                  │
│  Terraform - IaC                                            │
│  GitHub Actions - CI/CD                                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Multi-Tenant Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    TENANT ISOLATION                         │
├────────────────────────────────────────────────────────────┤
│  Strategy: Schema-per-tenant in PostgreSQL                  │
│                                                             │
│  public schema → Shared tables (tenants, plans, features)   │
│  tenant_abc   → College ABC data (students, fees, etc.)    │
│  tenant_xyz   → College XYZ data                           │
│                                                             │
│  Benefits:                                                  │
│  ✓ Strong data isolation                                   │
│  ✓ Easy per-tenant backup/restore                          │
│  ✓ Per-tenant customization                                │
│  ✓ Regulatory compliance friendly                          │
└────────────────────────────────────────────────────────────┘
```

### 1.3 Security Architecture

- **Authentication:** Auth0/Clerk with RBAC (Role-Based Access Control)
- **Authorization:** CASL.js for fine-grained permissions
- **Data Encryption:** AES-256 at rest, TLS 1.3 in transit
- **API Security:** Rate limiting, JWT with refresh tokens, API versioning
- **Audit Logging:** Complete audit trail for compliance
- **PII Protection:** Field-level encryption for sensitive data

### 1.4 Scalability Design

- Horizontal scaling with Kubernetes auto-scaling
- Database read replicas for heavy read operations
- CDN (CloudFront) for static assets
- Event-driven architecture for async operations
- Microservices for AI/ML workloads (independent scaling)

---

## 2. Product & BA Team Perspective - Feature Modules

### 2.1 Core Modules by Persona

#### 🏢 PLATFORM OWNER PORTAL (Your Dashboard)

| Module | Features |
|--------|----------|
| **Tenant Management** | Add/manage colleges, onboarding, branding setup |
| **Billing & Revenue** | ₹500/student billing, invoices, payment tracking, revenue analytics |
| **Platform Analytics** | Cross-college metrics, usage stats, growth dashboards |
| **Feature Management** | Enable/disable features per tenant, rollout control |
| **Support Center** | Ticket management, escalations from colleges |
| **System Health** | Server monitoring, performance metrics, alerts |
| **User Management** | Platform-level admins, access control |

#### 🎓 PRINCIPAL / SUPER ADMIN PORTAL

| Module | Features | AI Enhancement |
|--------|----------|----------------|
| **Dashboard** | College overview, KPIs, alerts | Anomaly detection |
| **Department Management** | HOD assignments, dept-wise reports | - |
| **Staff Management** | All staff profiles, roles, permissions | - |
| **Student Overview** | All students, batch-wise, branch-wise | At-risk student alerts |
| **Financial Reports** | Revenue, collections, outstanding | Forecasting |
| **Academic Calendar** | Events, exams, holidays | - |
| **Compliance** | AICTE reports, statutory compliance | Auto-report generation |
| **All Module Access** | Full access to all modules below | - |

#### 📚 HOD (Department Head) PORTAL

| Module | Features | AI Enhancement |
|--------|----------|----------------|
| **Department Dashboard** | Dept metrics, faculty performance | - |
| **Faculty Management** | Teachers in dept, workload, timetable | Workload optimization |
| **Student Management** | Dept students, progress tracking | Performance insights |
| **Curriculum** | Syllabus, subjects, lab assignments | - |
| **Department Reports** | Attendance, results, placement | Trend analysis |

#### 🧾 ADMIN STAFF PORTAL

| Module | Features | AI Enhancement |
|--------|----------|----------------|
| **Fee Collection** | Accept payments, receipts, reports | Collection predictions |
| **Admissions** | Applications, document verification | - |
| **Student Records** | Profile management, certificates | - |
| **Transport Management** | Route management, pass issuance | - |
| **Hostel Operations** | Room allocation, mess, complaints | - |
| **Library Operations** | Issue/return, fines, inventory | - |
| **Communication** | Bulk SMS, notices, circulars | - |

#### 👨‍🏫 TEACHER PORTAL

| Module | Features | AI Enhancement |
|--------|----------|----------------|
| **Dashboard** | Classes today, pending tasks | Priority suggestions |
| **Attendance** | Mark class attendance | Pattern detection |
| **Assignments** | Create, collect, grade | Auto-grading suggestions |
| **Marks Entry** | Internal, external, projects | - |
| **Content Upload** | Notes, PPTs, videos | - |
| **Student Interaction** | Messages, doubts, feedback | - |
| **Reports** | Subject-wise performance | Weak topic identification |

#### 🔬 LAB ASSISTANT PORTAL

| Module | Features |
|--------|----------|
| **Lab Attendance** | Mark lab/practical attendance |
| **Practical Marks** | Enter practical exam scores |
| **Lab Schedule** | View assigned labs, batches |
| **Equipment** | View lab equipment status |

#### 👨‍🎓 STUDENT PORTAL

| Module | Features | AI Enhancement |
|--------|----------|----------------|
| **Dashboard** | Personalized home, notifications, quick actions | AI-curated daily insights |
| **Academics** | Timetable, subjects, syllabus, materials | Smart content recommendations |
| **Attendance** | View attendance, leave requests | Attendance pattern analysis |
| **Fees** | View dues, payment history, receipts | Payment reminder predictions |
| **Exams** | Schedule, results, grade history | Score predictions, weak area identification |
| **Practice Zone** | Sample papers, mock tests, quizzes | AI-generated personalized questions |
| **Career Hub** | Placement info, company visits, applications | Placement probability, skill gap analysis |
| **Transport** | Bus routes, tracking, pass management | ETA predictions |
| **Support** | Raise tickets, grievances, feedback | AI chatbot for quick queries |
| **My Profile** | Personal details, photo, address, documents | Profile completion suggestions |
| **Hostel** | Room details, mess menu, complaints | - |
| **Library** | Browse catalog, borrowed books, e-resources | Smart book recommendations |
| **Sports & Activities** | Teams, clubs, events, achievements | Activity recommendations |

#### 🏆 SPORTS & EXTRACURRICULAR MODULE

| Feature | Student Access | Admin Access |
|---------|---------------|--------------|
| **Sports Teams** | Join teams, view schedules, matches | Manage teams, coaches, selections |
| **Clubs & Societies** | Browse, join, participate | Create clubs, assign faculty advisors |
| **Events** | Register, view calendar | Create events, manage registrations |
| **Achievements** | View certificates, medals | Award achievements, generate certificates |
| **Inter-College** | Competition schedules | Register for external competitions |
| **Activity Credits** | View earned credits | Configure credit rules for academics |

#### 🎯 CAREER HUB - PLACEMENT MODULE (Final Year Focus)

**Student Career Dashboard:**
```
PROFILE & READINESS
├── Career Profile (AI-powered Resume builder)
├── Skills Assessment & Gap Analysis
├── Placement Readiness Score (AI-calculated %)
├── LinkedIn/Portfolio integration
└── Certifications & Achievements tracker

AI-POWERED PREDICTIONS
├── Placement Probability (%)
├── Expected Salary Band (₹X - ₹Y LPA)
├── Best-fit Companies (matching algorithm)
├── Role Recommendations (based on skills)
└── Personalized 90-day Preparation Roadmap

PLACEMENT DRIVES
├── Upcoming Companies (auto eligibility check)
├── Apply to Drives (one-click)
├── Track Application Status (Applied → Shortlisted → Interview → Offer)
├── Interview Schedules & Reminders
└── Offer Letters & Acceptance

PREPARATION ZONE
├── Company-wise Prep Materials (past papers, patterns)
├── Mock Interviews (AI-powered video interviews)
├── Aptitude Practice Tests (quant, verbal, reasoning)
├── Coding Practice (LeetCode-style problems)
├── Group Discussion Topics & Tips
└── HR Interview Q&A Bank

HIGHER STUDIES TRACK
├── GATE/GRE/CAT Preparation Resources
├── University Recommendations (AI-based)
└── Application Tracking
```

**Placement Cell Admin Dashboard:**
```
COMPANY MANAGEMENT
├── Company Database (profiles, packages, roles, history)
├── Relationship Management (POCs, communication log)
├── JD Management (job descriptions, requirements)
└── Eligibility Criteria Configuration (CGPA, backlogs, branches)

DRIVE MANAGEMENT
├── Schedule & Publish Drives
├── Auto Eligibility Filtering (shortlist eligible students)
├── Round Management (aptitude → technical → HR)
├── Interview Slot Allocation
└── Result Declaration & Offer Management

ANALYTICS & REPORTS
├── Live Placement Dashboard (placed vs unplaced)
├── Package Analysis (highest, average, median LPA)
├── Branch-wise Placement Percentage
├── Company-wise Hiring Numbers
├── Year-on-Year Comparison
└── AICTE Placement Report Generator (1-click)

AI INSIGHTS FOR PLACEMENT CELL
├── At-Risk Students (low placement probability)
├── Batch-level Skill Gap Analysis
├── Company Visit Predictions
└── Package Trend Forecasting
```

#### 👨‍🏫 TEACHER/ADMIN PORTAL

| Module | Features | AI Enhancement |
|--------|----------|----------------|
| **Dashboard** | Overview, pending tasks, alerts | Anomaly detection, priority suggestions |
| **Student Management** | Admission to exit lifecycle | Risk identification (dropout prediction) |
| **Attendance Management** | Mark, reports, bulk operations | Pattern analysis, alert triggers |
| **Academic Management** | Curriculum, assignments, grading | Auto-grading suggestions |
| **Fee Management** | Collection, dues, reports, waivers | Collection forecasting |
| **Exam Management** | Scheduling, evaluation, results | Question paper generation |
| **Placement Cell** | Company management, drives, analytics | Success prediction models |
| **Reports & Analytics** | Custom reports, dashboards | Predictive analytics |
| **Communication** | Announcements, messages, bulk SMS | Smart scheduling |
| **Transport Management** | Routes, drivers, vehicle tracking | Route optimization |
| **Hostel Management** | Room allocation, mess management, fees, complaints | Occupancy optimization |
| **Library Management** | Catalog, issue/return, fines, e-resources | Usage analytics |
| **Staff Management** | Staff profiles, documents, departments | - |
| **Student Profiles** | Complete student info, photos, addresses, documents | Data completeness tracking |

#### 👨‍👩‍👦 PARENT PORTAL

| Module | Features | AI Enhancement |
|--------|----------|----------------|
| **Dashboard** | Child overview, key metrics | AI insights on progress |
| **Academic Progress** | Grades, attendance, teacher notes | Trend analysis, early warnings |
| **Fee Management** | View, pay, download receipts | Smart payment reminders |
| **Communication** | Message teachers, view announcements | Sentiment analysis |
| **Transport Tracking** | Real-time bus location, ETA | Delay predictions |
| **Calendar** | Events, exams, PTM schedules | Smart reminders |

### 2.2 AI-First Features (Detailed)

#### 🧠 Score Prediction & Improvement Engine

```
INPUT:
├── Historical exam scores
├── Assignment submissions
├── Attendance patterns
├── Practice test performance
├── Time spent on learning materials
└── Peer comparison data

PROCESSING:
├── Time-series analysis (LSTM/Transformer)
├── Feature engineering
└── Ensemble model (XGBoost + Neural Net)

OUTPUT:
├── Predicted scores (next exam)
├── Confidence intervals
├── Weak topic identification
├── Personalized improvement plan
└── Resource recommendations
```

#### 📝 Smart Content Generation

- **Sample Paper Generator:** Creates papers aligned to syllabus, AICTE patterns
- **Mock Test Engine:** Adaptive difficulty based on student level
- **Explanation Generator:** AI explains solutions step-by-step
- **Doubt Resolution:** RAG-based Q&A from course materials

#### 🎯 Placement Prediction System

```
FACTORS ANALYZED:
├── Academic performance (CGPA, backlogs)
├── Skill assessments (coding, aptitude)
├── Internship experience
├── Certifications
├── Extra-curriculars
├── Historical placement data
└── Company requirements

OUTPUTS:
├── Placement probability score
├── Likely salary band
├── Company-student matching
├── Skill gap analysis
├── Preparation roadmap
```

### 2.3 Student Journey Flow

```
ADMISSION → ONBOARDING → ACTIVE STUDY → ASSESSMENT → GRADUATION → PLACEMENT
    │            │            │             │            │           │
    ▼            ▼            ▼             ▼            ▼           ▼
 Document     Profile      Daily        Exam        Alumni      Career
 Verification  Setup      Tracking    Analysis     Transition   Support
```

---

## 3. UI/UX Team Perspective - Design System

### 3.1 Design Principles

1. **Mobile-First:** 70%+ users will access via mobile
2. **Accessibility:** WCAG 2.1 AA compliance
3. **White-Label Ready:** Theming system for per-college branding
4. **Minimal Cognitive Load:** Role-based simplified interfaces
5. **Offline Capable:** PWA with offline data access

### 3.2 Design System Components

```
THEMING SYSTEM:
├── Primary Color (per tenant)
├── Secondary Color (per tenant)
├── Logo placement
├── Typography scale
└── Component variants

CORE COMPONENTS:
├── Navigation (responsive sidebar/bottom nav)
├── Data Tables (sortable, filterable, exportable)
├── Charts (attendance, grades, analytics)
├── Forms (multi-step, validation)
├── Modals & Sheets
├── Cards (student, course, notification)
└── Calendar views
```

### 3.3 Key Screen Wireframes (Conceptual)

**Student Dashboard:**
```
┌─────────────────────────────────────────┐
│ [Logo]  EduNexus      🔔  👤           │
├─────────────────────────────────────────┤
│ Welcome, Rahul! 👋                      │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │Attendance│ │  CGPA   │ │Fee Due  │    │
│ │   87%    │ │  8.2    │ │ ₹45,000 │    │
│ └─────────┘ └─────────┘ └─────────┘    │
├─────────────────────────────────────────┤
│ 🤖 AI Insights                          │
│ • Your Math scores show 15% improvement │
│ • Practice Physics Ch.5 (weak area)     │
│ • 85% placement probability             │
├─────────────────────────────────────────┤
│ 📅 Today's Schedule                     │
│ 09:00 - Data Structures (Room 301)      │
│ 11:00 - Physics Lab (Lab 2)             │
├─────────────────────────────────────────┤
│ [Home] [Academics] [Exams] [Career] [+] │
└─────────────────────────────────────────┘
```

---

## 4. CMO Team Perspective - Market & GTM

### 4.1 Value Propositions

| Stakeholder | Pain Point | Our Solution |
|-------------|------------|--------------|
| **College Admin** | Manual processes, fragmented systems | Unified platform, automation |
| **Students** | No career guidance, exam anxiety | AI predictions, personalized learning |
| **Parents** | Lack of visibility | Real-time updates, progress tracking |
| **Placement Cell** | Low placement rates | Predictive matching, skill gap analysis |

### 4.2 Competitive Differentiation

```
TRADITIONAL ERP          vs          EDUNEXUS
─────────────────                    ─────────────
Generic modules                      Student-centric
Reactive reporting                   Predictive AI
Desktop-first                        Mobile-first PWA
Fixed workflows                      Configurable
Basic analytics                      AI-powered insights
```

### 4.3 Pricing Model (B2B)

```
BASE PRICING: ₹500/student/year (sold to college groups)

For a college with 5,000 students:
├── Annual Revenue: ₹25,00,000 (₹25 Lakhs)
├── Per Month: ~₹2,08,333

VOLUME DISCOUNTS (for college groups):
├── 1-5,000 students:    ₹500/student/year
├── 5,001-15,000:        ₹450/student/year (10% off)
├── 15,001-30,000:       ₹400/student/year (20% off)
├── 30,001+:             Custom pricing

ADD-ON MODULES (Optional):
├── Advanced AI Suite:      +₹50/student/year
├── SMS/WhatsApp Bundle:    ₹0.20/message
├── Custom Integrations:    ₹50,000 - ₹2,00,000 one-time
├── On-premise Deployment:  Custom pricing
├── White-label Mobile App: ₹5,00,000 one-time

PILOT REVENUE PROJECTION (3 colleges × 5,000 students):
├── 15,000 students × ₹500 = ₹75,00,000/year (₹75 Lakhs)
```

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Month 1-2)
```
DELIVERABLES:
├── Project setup (monorepo, CI/CD, environments)
├── Multi-tenant database architecture
├── Authentication & RBAC system (7 roles)
├── Base UI component library
├── Platform Owner Dashboard (tenant management, billing)
├── College onboarding flow
├── Department & staff management
└── Core API structure
```

### Phase 2: Core Modules (Month 3-4)
```
DELIVERABLES:
├── Student portal (Dashboard, Profile, Academics)
├── Teacher portal (Dashboard, Student management)
├── Parent portal (Dashboard, View-only access)
├── Attendance module (all personas)
├── Fee management + Payment gateway integration
└── Notification system (Email, SMS, Push)
```

### Phase 3: Advanced Modules (Month 5-6)
```
DELIVERABLES:
├── Exam management & Results
├── Transport module with tracking
├── Communication module
├── Report generation engine
├── Document management
├── Hostel management (blocks, rooms, allocation, mess)
├── Library management (catalog, issue/return, e-resources)
├── Complete profile system (photos, addresses, documents)
└── Bulk operations & Import/Export
```

### Phase 4: AI Features (Month 6-7)
```
DELIVERABLES:
├── Score prediction model
├── Practice zone with AI question generation
├── Mock test engine
├── Placement prediction system
├── AI chatbot for support
└── Analytics dashboards with insights
```

### Phase 5: Polish & Launch (Month 7-8)
```
DELIVERABLES:
├── Performance optimization
├── Security audit & penetration testing
├── Documentation & training materials
├── Pilot deployment (2-3 colleges)
├── Bug fixes & refinements
└── Production launch
```

---

## 6. Database Schema (Key Entities)

```sql
-- Platform Level (Your Dashboard)
platform_admins (id, email, name, role, permissions)
tenant_subscriptions (id, tenant_id, plan, student_count, amount, start_date, end_date)
platform_invoices (id, tenant_id, amount, due_date, paid_at, status)
platform_support_tickets (id, tenant_id, subject, status, priority, assigned_to)

-- Multi-tenant core
tenants (id, name, domain, logo, theme, config, status, onboarded_at)
users (id, tenant_id, email, role, profile, department_id)
roles (id, tenant_id, name, permissions, hierarchy_level)
-- Roles: principal, hod, admin_staff, teacher, lab_assistant, student, parent

-- Student lifecycle
students (id, tenant_id, user_id, roll_no, batch, branch, status)
student_academics (student_id, semester, cgpa, subjects)
student_attendance (student_id, date, status, marked_by)
student_fees (student_id, fee_type, amount, due_date, paid_date)

-- Department & Staff
departments (id, tenant_id, name, code, hod_id)
staff (id, tenant_id, user_id, employee_id, designation, department_id, joining_date)
lab_assistants (id, staff_id, assigned_labs, specialization)
teacher_subjects (teacher_id, subject_id, section, academic_year)

-- Academic structure
courses (id, tenant_id, name, code, credits, duration_years)
subjects (id, course_id, semester, name, syllabus, is_lab)
faculty (id, tenant_id, user_id, department_id, subjects)

-- Assessments
exams (id, tenant_id, subject_id, type, date, total_marks)
exam_results (exam_id, student_id, marks, grade)
assignments (id, subject_id, title, due_date)
mock_tests (id, subject_id, questions, ai_generated)

-- AI/ML data
score_predictions (student_id, exam_id, predicted_score, confidence)
learning_analytics (student_id, topic_id, mastery_level, recommendations)
placement_predictions (student_id, probability, salary_band, companies)

-- Operations
transport_routes (id, tenant_id, route_name, stops, vehicle)
transport_tracking (route_id, timestamp, location)
notifications (id, user_id, type, content, read_at)

-- Profiles (Students & Staff)
user_profiles (user_id, photo_url, dob, gender, blood_group, nationality)
user_addresses (user_id, type, line1, line2, city, state, pincode)
user_contacts (user_id, type, phone, email, is_primary)
user_documents (user_id, doc_type, file_url, verified_at)
emergency_contacts (user_id, name, relationship, phone)

-- Hostel Management
hostel_blocks (id, tenant_id, name, type, capacity, warden_id)
hostel_rooms (id, block_id, room_no, floor, capacity, amenities)
hostel_allocations (id, student_id, room_id, from_date, to_date, status)
hostel_fees (id, student_id, amount, period, paid_at)
mess_menu (id, tenant_id, day, meal_type, items)
hostel_complaints (id, student_id, room_id, category, description, status)

-- Library Management
library_books (id, tenant_id, isbn, title, author, category, copies)
book_issues (id, book_id, student_id, issue_date, due_date, return_date, fine)
e_resources (id, tenant_id, title, type, url, subject_id)
library_cards (id, student_id, card_no, valid_until, status)

-- Sports & Extracurricular
sports_teams (id, tenant_id, sport, team_name, coach_id, captain_id)
team_members (team_id, student_id, position, joined_at)
clubs (id, tenant_id, name, description, faculty_advisor_id, category)
club_memberships (club_id, student_id, role, joined_at)
events (id, tenant_id, name, type, date, venue, organizer_id)
event_registrations (event_id, student_id, status)
achievements (id, student_id, type, title, date, certificate_url)
activity_credits (student_id, activity_type, credits, academic_year)

-- Placement & Career
companies (id, tenant_id, name, industry, website, logo, tier)
company_contacts (company_id, name, email, phone, designation)
placement_drives (id, tenant_id, company_id, date, package_lpa, roles, eligibility)
drive_applications (drive_id, student_id, status, applied_at)
interview_rounds (id, drive_id, round_type, date, venue)
interview_results (round_id, student_id, status, feedback)
offers (id, student_id, company_id, role, package_lpa, status, accepted_at)
career_profiles (student_id, resume_url, linkedin, portfolio, skills)
placement_predictions (student_id, probability, salary_band, top_companies, updated_at)
skill_assessments (student_id, skill, score, assessed_at)
```

---

## 7. Integration Specifications

### 7.1 Payment Gateway
- **Primary:** Razorpay (UPI, Cards, NetBanking)
- **Backup:** PayU, CCAvenue
- **Features:** Recurring payments, EMI options, auto-reconciliation

### 7.2 Communication
- **SMS:** MSG91 / Twilio
- **WhatsApp:** WhatsApp Business API (360dialog)
- **Email:** SendGrid / AWS SES
- **Push:** Firebase Cloud Messaging

### 7.3 Third-Party
- **Maps:** Google Maps (transport tracking)
- **Storage:** AWS S3 (documents, media)
- **Analytics:** Mixpanel + Custom (student behavior)

---

## 8. Compliance & Security Checklist

- [ ] AICTE data formats support
- [ ] Data stored in AWS Mumbai (ap-south-1)
- [ ] Consent management for student data
- [ ] Parent consent for minors
- [ ] Right to data export
- [ ] Audit logs for all sensitive operations
- [ ] Role-based data access
- [ ] Regular security audits
- [ ] Backup & disaster recovery plan

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| System uptime | 99.9% |
| Page load time | < 2 seconds |
| User adoption (active users) | > 80% |
| Parent engagement | > 60% weekly |
| AI prediction accuracy | > 85% |
| Fee collection improvement | +20% |
| Support ticket reduction | -40% (via AI chatbot) |

---

## 10. AI/ML ARCHITECTURE (HYBRID)

### 10.1 Hybrid AI Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         HYBRID AI/ML PIPELINE ARCHITECTURE                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  DATA SOURCES                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Academic   │  │  Attendance  │  │   Exam       │  │  Placement   │        │
│  │    Data      │  │    Data      │  │   Results    │  │    History   │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                 │                 │                 │                  │
│         └─────────────────┴─────────────────┴─────────────────┘                  │
│                                    │                                             │
│  ┌─────────────────────────────────┴─────────────────────────────────┐          │
│  │                                                                    │          │
│  ▼                                                                    ▼          │
│  ┌────────────────────────────────────┐   ┌────────────────────────────────────┐│
│  │     NestJS AI SERVICE (Primary)    │   │    Python ML SERVICE (Minimal)     ││
│  │                                    │   │                                    ││
│  │  ┌──────────────────────────────┐  │   │  ┌──────────────────────────────┐  ││
│  │  │    CONTENT GENERATION        │  │   │  │     SCORE PREDICTION         │  ││
│  │  │  • @anthropic-ai/sdk (Claude)│  │   │  │   • PyTorch LSTM model       │  ││
│  │  │  • Sample paper generation   │  │   │  │   • Time-series analysis     │  ││
│  │  │  • Explanation generation    │  │   │  │   • Subject-wise patterns    │  ││
│  │  │  • Resume builder            │  │   │  │   • Historical data          │  ││
│  │  └──────────────────────────────┘  │   │  └──────────────────────────────┘  ││
│  │                                    │   │                                    ││
│  │  ┌──────────────────────────────┐  │   │  ┌──────────────────────────────┐  ││
│  │  │    RAG PIPELINE              │  │   │  │    PLACEMENT PREDICTION      │  ││
│  │  │  • LlamaIndex.TS             │  │   │  │   • XGBoost ensemble         │  ││
│  │  │  • Document indexing         │  │   │  │   • Feature engineering      │  ││
│  │  │  • @qdrant/js-client         │  │   │  │   • Probability scoring      │  ││
│  │  │  • Semantic search           │  │   │  │   • Salary band prediction   │  ││
│  │  └──────────────────────────────┘  │   │  └──────────────────────────────┘  ││
│  │                                    │   │                                    ││
│  │  ┌──────────────────────────────┐  │   │  REST API: /predict/score          ││
│  │  │    CHATBOT & Q&A             │  │   │            /predict/placement      ││
│  │  │  • Claude for responses      │  │   │                                    ││
│  │  │  • Qdrant for context        │  │   │  TECH: FastAPI + PyTorch + XGBoost ││
│  │  │  • Course material Q&A       │  │   │                                    ││
│  │  └──────────────────────────────┘  │   └────────────────────────────────────┘│
│  │                                    │                                          │
│  │  GraphQL/REST API endpoints        │                                          │
│  │  TECH: NestJS + Claude SDK +       │                                          │
│  │        LlamaIndex.TS + Qdrant      │                                          │
│  └────────────────────────────────────┘                                          │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         VECTOR DATABASE (Qdrant)                          │   │
│  │  • Self-hosted on EKS (AWS Mumbai)                                       │   │
│  │  • Document embeddings for RAG                                           │   │
│  │  • Course materials, Q&A pairs                                           │   │
│  │  • Accessed by NestJS via @qdrant/js-client                              │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ARCHITECTURE BENEFITS:                                                         │
│  ✓ Single language (TypeScript) for 90% of AI logic                            │
│  ✓ Python only for specialized ML inference                                     │
│  ✓ Simpler deployment & debugging                                               │
│  ✓ Better type safety for API contracts                                         │
│  ✓ Shared auth/tenant context in NestJS                                         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 AI Model Details (Hybrid Architecture)

#### NestJS AI Service (TypeScript)
| Model | Purpose | Tech Stack | Input | Output |
|-------|---------|------------|-------|--------|
| **Question Generator** | Practice papers | Claude SDK + LlamaIndex.TS | Syllabus, difficulty, past papers | Questions, Solutions |
| **Explanation Generator** | Step-by-step solutions | Claude SDK | Question, Topic | Detailed explanation |
| **AI Resume Builder** | Career profile | Claude SDK | Student data, job requirements | Formatted resume |
| **Chatbot** | Support & Q&A | LlamaIndex.TS + Qdrant + Claude | User query, Knowledge base | Response |
| **Weak Topic Identifier** | Find improvement areas | LlamaIndex.TS + Qdrant | Topic-wise scores, patterns | Topics list, Priority |
| **Company Matcher** | Student-company fit | Qdrant (vector similarity) | Student profile, company requirements | Top 10 companies, Match % |

#### Python ML Service (Minimal - Inference Only)
| Model | Purpose | Tech Stack | Input | Output |
|-------|---------|------------|-------|--------|
| **Score Predictor** | Predict exam scores | PyTorch LSTM | Past scores, attendance, assignments | Score (0-100), Confidence % |
| **Placement Predictor** | Campus hiring probability | XGBoost Ensemble | CGPA, skills, certifications, internships | Probability %, Salary band |

#### Service Communication
```
NestJS API ──► Python ML Service (HTTP/gRPC)
    │              │
    │              └── /predict/score
    │              └── /predict/placement
    │
    └── Direct: Claude SDK, LlamaIndex.TS, Qdrant client
```

---

## 11. FOLDER STRUCTURE (HYBRID ARCHITECTURE)

### 11.1 Monorepo Structure (Turborepo)

```
edunexus/
├── apps/
│   ├── web/                          # Next.js 14 Frontend
│   │   ├── app/
│   │   │   ├── (auth)/               # Auth pages (login, register)
│   │   │   ├── (platform)/           # Platform owner dashboard
│   │   │   ├── (tenant)/             # College-specific pages
│   │   │   │   ├── student/          # Student portal
│   │   │   │   ├── teacher/          # Teacher portal
│   │   │   │   ├── parent/           # Parent portal
│   │   │   │   ├── admin/            # Admin staff portal
│   │   │   │   ├── hod/              # HOD portal
│   │   │   │   ├── principal/        # Principal portal
│   │   │   │   └── lab-assistant/    # Lab assistant portal
│   │   │   └── api/                  # Next.js API routes
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn components
│   │   │   ├── forms/                # Form components
│   │   │   ├── tables/               # Data tables
│   │   │   ├── charts/               # Chart components
│   │   │   └── layout/               # Layout components
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Utilities
│   │   ├── stores/                   # Zustand stores
│   │   └── styles/                   # Global styles
│   │
│   ├── api/                          # NestJS Backend (Primary AI Host)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # Authentication
│   │   │   │   ├── users/            # User management
│   │   │   │   ├── tenants/          # Multi-tenancy
│   │   │   │   ├── students/         # Student module
│   │   │   │   ├── staff/            # Staff module
│   │   │   │   ├── attendance/       # Attendance
│   │   │   │   ├── fees/             # Fee management
│   │   │   │   ├── exams/            # Exams & results
│   │   │   │   ├── placement/        # Placement module
│   │   │   │   ├── transport/        # Transport
│   │   │   │   ├── hostel/           # Hostel
│   │   │   │   ├── library/          # Library
│   │   │   │   ├── sports/           # Sports & activities
│   │   │   │   ├── notifications/    # Notifications
│   │   │   │   ├── reports/          # Reports
│   │   │   │   └── ai/               # AI Module (NEW - Primary AI)
│   │   │   │       ├── ai.module.ts
│   │   │   │       ├── ai.controller.ts
│   │   │   │       ├── ai.service.ts
│   │   │   │       ├── claude/           # Claude SDK integration
│   │   │   │       │   ├── claude.service.ts
│   │   │   │       │   └── prompts/      # Prompt templates
│   │   │   │       ├── rag/              # RAG with LlamaIndex.TS
│   │   │   │       │   ├── rag.service.ts
│   │   │   │       │   ├── indexer.ts
│   │   │   │       │   └── retriever.ts
│   │   │   │       ├── qdrant/           # Qdrant vector client
│   │   │   │       │   └── qdrant.service.ts
│   │   │   │       ├── chatbot/          # AI Chatbot
│   │   │   │       │   └── chatbot.service.ts
│   │   │   │       ├── content/          # Content generation
│   │   │   │       │   ├── question-generator.service.ts
│   │   │   │       │   ├── explanation.service.ts
│   │   │   │       │   └── resume-builder.service.ts
│   │   │   │       └── ml-client/        # Client for Python ML service
│   │   │   │           └── ml-client.service.ts
│   │   │   ├── common/
│   │   │   │   ├── guards/           # Auth guards
│   │   │   │   ├── interceptors/     # Request interceptors
│   │   │   │   ├── decorators/       # Custom decorators
│   │   │   │   └── filters/          # Exception filters
│   │   │   ├── database/
│   │   │   │   ├── migrations/       # DB migrations
│   │   │   │   └── seeds/            # Seed data
│   │   │   └── config/               # Configuration
│   │   └── test/                     # Tests
│   │
│   └── ml-service/                   # Python ML Service (MINIMAL)
│       ├── app/
│       │   ├── main.py               # FastAPI entrypoint
│       │   ├── models/               # Trained ML models
│       │   │   ├── score_predictor/
│       │   │   │   ├── model.py      # PyTorch LSTM model
│       │   │   │   ├── predictor.py  # Inference logic
│       │   │   │   └── model.pt      # Trained weights
│       │   │   └── placement_predictor/
│       │   │       ├── model.py      # XGBoost model
│       │   │       ├── predictor.py  # Inference logic
│       │   │       └── model.pkl     # Trained weights
│       │   ├── routers/
│       │   │   ├── score.py          # /predict/score endpoint
│       │   │   └── placement.py      # /predict/placement endpoint
│       │   ├── schemas/              # Pydantic schemas
│       │   └── utils/                # Utilities
│       ├── training/                 # Model training scripts (offline)
│       │   ├── train_score.py
│       │   └── train_placement.py
│       ├── requirements.txt          # Minimal: fastapi, torch, xgboost
│       ├── Dockerfile
│       └── tests/
│
├── packages/
│   ├── ui/                           # Shared UI components
│   ├── database/                     # Prisma schema & client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   ├── types/                        # Shared TypeScript types
│   ├── utils/                        # Shared utilities
│   └── config/                       # Shared configs
│
├── infrastructure/
│   ├── terraform/                    # AWS infrastructure
│   │   ├── modules/
│   │   │   ├── vpc/
│   │   │   ├── eks/
│   │   │   ├── rds/
│   │   │   ├── elasticache/
│   │   │   ├── s3/
│   │   │   └── qdrant/              # Qdrant vector DB on EKS
│   │   ├── environments/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── prod/
│   │   └── main.tf
│   └── kubernetes/                   # K8s manifests
│       ├── base/
│       └── overlays/
│
├── docs/
│   ├── api/                          # API documentation
│   ├── architecture/                 # Architecture docs
│   └── user-guides/                  # User documentation
│
├── scripts/                          # Utility scripts
├── .github/                          # GitHub Actions
│   └── workflows/
│       ├── ci.yml
│       ├── cd-staging.yml
│       └── cd-prod.yml
│
├── turbo.json                        # Turborepo config
├── package.json
└── README.md
```

---

## 12. GIT REPOSITORY SETUP

```
Repository: github.com/<your-username>/edunexus (Private)
Platform:   GitHub
Structure:  Monorepo (Turborepo)

SETUP COMMANDS:
1. Create GitHub repository: edunexus (private)
2. Clone and initialize:
   git clone https://github.com/<username>/edunexus.git
   cd edunexus
   npx create-turbo@latest .

3. Initial structure will be created in Phase 1
```

---

## 13. Immediate Next Steps

1. **Git & Technical Setup**
   - Create GitHub repository (edunexus, private)
   - Initialize Turborepo monorepo
   - Set up development environment
   - Configure CI/CD pipelines (GitHub Actions)
   - Design database migrations

2. **Design Sprint**
   - Create Figma design system
   - Design key user flows
   - Prototype student dashboard

3. **AI Foundation**
   - Collect sample data requirements
   - Design ML pipeline architecture
   - Select and configure AI providers

---

## Files to Create (Initial)

```
/edunexus
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── api/                 # NestJS backend (with AI module)
│   └── ml-service/          # Python ML inference (minimal)
├── packages/
│   ├── ui/                  # Shared components
│   ├── database/            # Prisma schema
│   └── shared/              # Common utilities
├── infrastructure/
│   └── terraform/           # IaC
└── docs/
    └── api/                 # API documentation
```

---

*Plan created with perspectives from CTO, CMO, UI/UX, BA & Product teams*
*Target: Indian Engineering Colleges | Timeline: 6-8 months | Scale: Multi-tenant SaaS*
