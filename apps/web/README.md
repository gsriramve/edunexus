# EduNexus Web Application

Next.js 14 frontend for the EduNexus college management platform.

## Overview

This is the web frontend for EduNexus, providing role-based dashboards for all user personas in an engineering college management system.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix Primitives
- **State Management**: React Query (TanStack)
- **Authentication**: Clerk
- **Icons**: Lucide React
- **Charts**: Recharts

## User Portals

### Platform Level
- **Platform Owner** (`/platform`) - Manage all college tenants, billing, analytics

### College Level
- **Principal** (`/principal`) - College overview, departments, staff management
- **HOD** (`/hod`) - Department view, faculty, students, curriculum, reports
- **Admin Staff** (`/admin`) - Fees, admissions, records, communication, operations
- **Teacher** (`/teacher`) - Attendance, marks, assignments, materials
- **Lab Assistant** (`/lab-assistant`) - Lab attendance, practical marks, equipment
- **Student** (`/student`) - Dashboard, academics, fees, exams, transport, hostel, library
- **Parent** (`/parent`) - Child overview, academics, fees, attendance, communication

## Project Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Authentication pages
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   │
│   │   ├── (dashboard)/            # Role-based dashboards
│   │   │   ├── student/            # Student portal
│   │   │   │   ├── page.tsx        # Dashboard
│   │   │   │   ├── academics/      # Academic info
│   │   │   │   ├── attendance/     # Attendance view
│   │   │   │   ├── fees/           # Fee payment
│   │   │   │   ├── exams/          # Exam results
│   │   │   │   ├── transport/      # Transport info
│   │   │   │   ├── hostel/         # Hostel info
│   │   │   │   ├── library/        # Library services
│   │   │   │   ├── sports/         # Sports & clubs
│   │   │   │   ├── documents/      # Document access
│   │   │   │   └── profile/        # Profile management
│   │   │   │
│   │   │   ├── teacher/            # Teacher portal
│   │   │   │   ├── page.tsx        # Dashboard
│   │   │   │   ├── attendance/     # Mark attendance
│   │   │   │   ├── students/       # Student list
│   │   │   │   ├── marks/          # Enter marks
│   │   │   │   ├── assignments/    # Manage assignments
│   │   │   │   └── materials/      # Upload materials
│   │   │   │
│   │   │   ├── parent/             # Parent portal
│   │   │   │   ├── page.tsx        # Dashboard
│   │   │   │   ├── academics/      # Child academics
│   │   │   │   ├── fees/           # Pay fees
│   │   │   │   ├── attendance/     # View attendance
│   │   │   │   └── communication/  # Messages
│   │   │   │
│   │   │   ├── admin/              # Admin staff portal
│   │   │   │   ├── page.tsx        # Dashboard
│   │   │   │   ├── fees/           # Fee collection
│   │   │   │   ├── admissions/     # Manage admissions
│   │   │   │   ├── records/        # Student records
│   │   │   │   ├── communication/  # Announcements
│   │   │   │   ├── transport/      # Transport management
│   │   │   │   ├── hostel/         # Hostel management
│   │   │   │   ├── library/        # Library management
│   │   │   │   ├── sports/         # Sports management
│   │   │   │   ├── documents/      # Document management
│   │   │   │   ├── reports/        # Report generation
│   │   │   │   ├── import-export/  # Bulk operations
│   │   │   │   └── audit-logs/     # Audit trail
│   │   │   │
│   │   │   ├── hod/                # HOD portal
│   │   │   │   ├── page.tsx        # Dashboard
│   │   │   │   ├── faculty/        # Faculty management
│   │   │   │   ├── students/       # Department students
│   │   │   │   ├── curriculum/     # Curriculum management
│   │   │   │   └── reports/        # Department reports
│   │   │   │
│   │   │   ├── principal/          # Principal portal
│   │   │   │   ├── page.tsx        # Dashboard
│   │   │   │   ├── departments/    # Department management
│   │   │   │   ├── staff/          # Staff management
│   │   │   │   └── students/       # All students
│   │   │   │
│   │   │   ├── lab-assistant/      # Lab assistant portal
│   │   │   │   ├── page.tsx        # Dashboard
│   │   │   │   ├── attendance/     # Lab attendance
│   │   │   │   ├── marks/          # Practical marks
│   │   │   │   └── equipment/      # Lab equipment
│   │   │   │
│   │   │   └── platform/           # Platform owner
│   │   │       ├── page.tsx        # Dashboard
│   │   │       └── colleges/       # Tenant management
│   │   │
│   │   ├── api/                    # API routes
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Landing page
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   └── layout/                 # Layout components
│   │
│   ├── lib/
│   │   ├── api.ts                  # API client with all endpoints
│   │   ├── utils.ts                # Utility functions
│   │   └── roles.ts                # RBAC configuration
│   │
│   └── hooks/                      # Custom React hooks
│
├── public/
│   ├── icons/                      # PWA icons
│   ├── manifest.json               # PWA manifest
│   └── sw.js                       # Service worker
│
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# From the monorepo root
npm install

# Or from this directory
cd apps/web
npm install
```

### Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## PWA Support

The application is configured as a Progressive Web App:

- **manifest.json**: App metadata for installation
- **Service Worker**: Offline support and caching
- **Icons**: Multiple sizes for different devices

## API Integration

The API client (`lib/api.ts`) provides typed functions for all backend endpoints:

```typescript
import { studentsApi, feesApi, examsApi } from '@/lib/api';

// Example usage
const students = await studentsApi.list(tenantId);
const fees = await feesApi.getStudentFees(tenantId, studentId);
const results = await examsApi.getStudentResults(tenantId, studentId);
```

## Component Library

Using shadcn/ui components with Tailwind CSS:

- Button, Card, Dialog, Dropdown
- Table, Tabs, Toast
- Form inputs, Select, Checkbox
- Calendar, Date Picker
- And more...

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Clerk Authentication](https://clerk.com/docs)
