# EduNexus

AI-First College Management Platform for Indian Engineering Colleges

[![Progress](https://img.shields.io/badge/Progress-74%25-green.svg)](docs/PLAN.md)
[![Phase](https://img.shields.io/badge/Phase%203-Complete-success.svg)](docs/PLAN.md)
[![License](https://img.shields.io/badge/License-Private-red.svg)]()

## Overview

EduNexus is a comprehensive B2B SaaS platform designed to manage the complete lifecycle of engineering college operations - from student admission to placement. Built with modern technologies and AI-first approach.

## Current Status

| Phase | Description | Status | Progress |
|-------|-------------|--------|----------|
| Phase 1 | Foundation & Setup | Mostly Complete | 80% |
| Phase 2 | Core Modules | Mostly Complete | 85% |
| Phase 3 | Advanced Modules | **Complete** | 100% |
| Phase 4 | AI Features | Not Started | 0% |
| Phase 5 | Polish & Launch | Not Started | 0% |

**Overall Progress: 74% Complete (51/69 tasks)**

## Key Features

### Completed Modules

#### Core Platform
- Multi-Tenant Architecture with isolated data per college
- 8 User Portals: Platform Owner, Principal, HOD, Admin Staff, Teacher, Lab Assistant, Student, Parent
- Clerk Authentication with RBAC (Role-Based Access Control)
- PWA Support for mobile access

#### Academic Management
- Student & Staff Management
- Department & Course Management
- Attendance Tracking (Teacher, Student, Parent views)
- Exam Management with CGPA/SGPA calculation
- Bulk marks entry with grade auto-calculation

#### Financial
- Fee Management with Razorpay Integration
- Payment tracking with receipts
- Fee reminders and overdue notifications

#### Operations
- Transport Management with route tracking
- Hostel Management (blocks, rooms, allocations, mess menu)
- Library Management (books, e-resources, issues/returns)
- Sports & Clubs with activity credits

#### Communication
- Email Notifications (SendGrid)
- SMS Notifications (MSG91)
- Announcements & Bulk messaging
- Document Management (S3)

#### Administration
- Advanced Reports Engine (PDF/Excel export)
- Bulk Import/Export (Excel)
- Audit Logging System
- Report templates and scheduling

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix Primitives
- **State**: React Query (TanStack)

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL (Prisma ORM)
- **Cache**: Redis
- **Queue**: Bull MQ

### Infrastructure
- **Cloud**: AWS (Mumbai Region)
- **Container**: Docker + Kubernetes (EKS)
- **IaC**: Terraform
- **Storage**: AWS S3

### Integrations
- **Auth**: Clerk
- **Payments**: Razorpay
- **Email**: SendGrid
- **SMS**: MSG91

## Project Structure

```
edunexus/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── app/
│   │   │   ├── (auth)/         # Authentication pages
│   │   │   ├── (dashboard)/    # Role-based dashboards
│   │   │   │   ├── student/    # Student portal (6 pages)
│   │   │   │   ├── teacher/    # Teacher portal (6 pages)
│   │   │   │   ├── parent/     # Parent portal (5 pages)
│   │   │   │   ├── admin/      # Admin portal (12 pages)
│   │   │   │   ├── hod/        # HOD portal (5 pages)
│   │   │   │   ├── principal/  # Principal portal (4 pages)
│   │   │   │   ├── lab-assistant/  # Lab Assistant portal
│   │   │   │   └── platform/   # Platform owner dashboard
│   │   │   └── api/            # Next.js API routes
│   │   ├── components/         # Reusable components
│   │   └── lib/                # Utilities & API client
│   │
│   └── api/                    # NestJS Backend
│       └── src/modules/
│           ├── tenants/        # Multi-tenancy
│           ├── students/       # Student management
│           ├── staff/          # Staff management
│           ├── departments/    # Department management
│           ├── attendance/     # Attendance tracking
│           ├── payments/       # Razorpay integration
│           ├── fees/           # Fee management
│           ├── exams/          # Exam scheduling
│           ├── exam-results/   # Results & grades
│           ├── transport/      # Transport management
│           ├── hostel/         # Hostel management
│           ├── library/        # Library management
│           ├── sports/         # Sports & clubs
│           ├── communication/  # Announcements
│           ├── documents/      # Document management
│           ├── notifications/  # Email/SMS
│           ├── reports/        # Report generation
│           ├── import-export/  # Bulk operations
│           └── audit/          # Audit logging
│
├── packages/
│   └── database/               # Prisma schema & client
│
├── infrastructure/
│   ├── terraform/              # AWS infrastructure
│   └── kubernetes/             # K8s manifests
│
└── docs/
    └── PLAN.md                 # Detailed project plan
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/edunexus.git
cd edunexus

# Install dependencies
npm install

# Start infrastructure (PostgreSQL, Redis)
docker-compose up -d

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed

# Start development servers
npm run dev
```

### Environment Variables

Create `.env` files in `apps/api/` and `apps/web/`:

```bash
# apps/api/.env
DATABASE_URL="postgresql://user:password@localhost:5432/edunexus"
REDIS_URL="redis://localhost:6379"
CLERK_SECRET_KEY="sk_..."
SENDGRID_API_KEY="SG...."
MSG91_AUTH_KEY="..."
RAZORPAY_KEY_ID="rzp_..."
RAZORPAY_KEY_SECRET="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="..."

# apps/web/.env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### Running the Application

```bash
# Start all services
npm run dev

# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

## API Documentation

The API follows RESTful conventions with multi-tenant support via `x-tenant-id` header.

### Key Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| Students | `/students` | Student CRUD operations |
| Attendance | `/attendance` | Mark and view attendance |
| Fees | `/fees` | Fee management |
| Payments | `/payments` | Razorpay integration |
| Exams | `/exams` | Exam scheduling |
| Results | `/exam-results` | Marks and grades |
| Transport | `/transport` | Routes and tracking |
| Hostel | `/hostel` | Room management |
| Library | `/library` | Book catalog and issues |
| Reports | `/reports` | Report generation |

## Business Model

- **Pricing**: ₹500/student/year
- **Target**: Engineering colleges in India
- **Pilot**: 2-3 colleges (~15K students)

## Documentation

- [Complete Plan & Architecture](./docs/PLAN.md)
- [API Documentation](./docs/api/)

## Upcoming Features (Phase 4)

- ML Pipeline Setup (Python FastAPI)
- Score Prediction Model
- Placement Prediction
- AI Resume Builder
- AI Chatbot for Support
- AICTE Report Auto-generation

## Contributing

This is a private project. For questions or contributions, please contact the project owner.

## License

Private - All rights reserved

---

Built with ❤️ for Indian Engineering Education
