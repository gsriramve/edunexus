# EduNexus API

NestJS backend API for the EduNexus college management platform.

## Overview

This is the backend API for EduNexus, providing RESTful endpoints for all college management operations with multi-tenant support.

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Cache**: Redis
- **Queue**: Bull MQ
- **Authentication**: Clerk (JWT validation)

## Features

### Core Modules

| Module | Description | Endpoints |
|--------|-------------|-----------|
| **Tenants** | Multi-tenancy management | `/tenants` |
| **Students** | Student CRUD operations | `/students` |
| **Staff** | Staff management | `/staff` |
| **Departments** | Department management | `/departments` |
| **Attendance** | Attendance tracking | `/attendance` |

### Academic Modules

| Module | Description | Endpoints |
|--------|-------------|-----------|
| **Exams** | Exam scheduling | `/exams` |
| **Exam Results** | Marks and grades | `/exam-results` |
| **Subjects** | Subject management | `/subjects` |

### Financial Modules

| Module | Description | Endpoints |
|--------|-------------|-----------|
| **Fees** | Fee management | `/fees` |
| **Payments** | Razorpay integration | `/payments` |

### Operations Modules

| Module | Description | Endpoints |
|--------|-------------|-----------|
| **Transport** | Route management, tracking | `/transport` |
| **Hostel** | Blocks, rooms, allocations | `/hostel` |
| **Library** | Books, issues, e-resources | `/library` |
| **Sports** | Teams, clubs, events | `/sports` |

### Communication Modules

| Module | Description | Endpoints |
|--------|-------------|-----------|
| **Notifications** | Email/SMS notifications | `/notifications` |
| **Communication** | Announcements, bulk messaging | `/communication` |
| **Documents** | S3 document management | `/documents` |

### Administration Modules

| Module | Description | Endpoints |
|--------|-------------|-----------|
| **Reports** | Report generation (PDF/Excel) | `/reports` |
| **Import/Export** | Bulk operations | `/import-export` |
| **Audit** | Audit logging | `/audit` |

## Project Structure

```
apps/api/
├── src/
│   ├── modules/
│   │   ├── tenants/
│   │   │   ├── tenants.module.ts
│   │   │   ├── tenants.service.ts
│   │   │   ├── tenants.controller.ts
│   │   │   └── dto/
│   │   │
│   │   ├── students/
│   │   │   ├── students.module.ts
│   │   │   ├── students.service.ts
│   │   │   ├── students.controller.ts
│   │   │   └── dto/
│   │   │
│   │   ├── staff/
│   │   ├── departments/
│   │   ├── attendance/
│   │   ├── fees/
│   │   ├── payments/
│   │   ├── exams/
│   │   ├── exam-results/
│   │   ├── transport/
│   │   ├── hostel/
│   │   ├── library/
│   │   ├── sports/
│   │   ├── notifications/
│   │   ├── communication/
│   │   ├── documents/
│   │   ├── reports/
│   │   ├── import-export/
│   │   └── audit/
│   │
│   ├── common/
│   │   ├── guards/
│   │   │   └── clerk-auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── audit.interceptor.ts
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   │
│   ├── config/
│   │   └── configuration.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env
├── nest-cli.json
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis

### Installation

```bash
# From the monorepo root
npm install

# Or from this directory
cd apps/api
npm install
```

### Environment Variables

Create a `.env` file:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/edunexus?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# Clerk Authentication
CLERK_SECRET_KEY="sk_test_..."

# SendGrid (Email)
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="noreply@edunexus.app"
SENDGRID_FROM_NAME="EduNexus"

# MSG91 (SMS)
MSG91_AUTH_KEY="..."
MSG91_SENDER_ID="EDUNEX"
MSG91_ROUTE="4"

# Razorpay (Payments)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."

# AWS S3 (Documents)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="edunexus-documents"

# Application
PORT=3001
NODE_ENV=development
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### Development

```bash
# Start in development mode
npm run start:dev

# API available at http://localhost:3001
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

## API Documentation

### Multi-Tenancy

All endpoints require the `x-tenant-id` header for tenant isolation:

```bash
curl -H "x-tenant-id: tenant_abc123" \
     -H "Authorization: Bearer <token>" \
     http://localhost:3001/students
```

### Authentication

Using Clerk for authentication. Include the JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer <clerk_jwt_token>" \
     http://localhost:3001/api/protected-endpoint
```

### Key Endpoints

#### Students
```
GET    /students           # List all students
GET    /students/:id       # Get student by ID
POST   /students           # Create student
PATCH  /students/:id       # Update student
DELETE /students/:id       # Delete student
```

#### Attendance
```
POST   /attendance/mark              # Mark attendance
GET    /attendance/student/:id       # Get student attendance
GET    /attendance/subject/:id/date  # Get class attendance
```

#### Exams & Results
```
GET    /exams                        # List exams
POST   /exams                        # Create exam
GET    /exam-results/student/:id     # Get student results
POST   /exam-results/bulk            # Bulk marks entry
```

#### Fees & Payments
```
GET    /fees/student/:id             # Get student fees
POST   /payments/create-order        # Create Razorpay order
POST   /payments/verify              # Verify payment
```

#### Reports
```
GET    /reports/templates            # List templates
POST   /reports/generate             # Generate report
GET    /reports/jobs/:id/download    # Download report
```

### Error Handling

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [...]
}
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Module Details

### Notifications Module

Handles email (SendGrid) and SMS (MSG91) notifications:

- Payment receipts
- Fee reminders
- Attendance alerts
- Welcome emails

### Reports Module

Generates reports in PDF and Excel formats:

- Student lists
- Attendance reports
- Fee collection reports
- Exam results

### Audit Module

Automatic audit logging for compliance:

- User actions tracking
- Data change logging
- Security events
- Configurable retention

## Integrations

| Service | Purpose | Package |
|---------|---------|---------|
| SendGrid | Email | `@sendgrid/mail` |
| MSG91 | SMS | Custom HTTP |
| Razorpay | Payments | `razorpay` |
| AWS S3 | Documents | `@aws-sdk/client-s3` |
| Redis | Cache/Queue | `ioredis`, `bull` |

## Learn More

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
