# EduNexus Documentation

Welcome to the EduNexus documentation. This documentation provides comprehensive information about the EduNexus platform, a multi-tenant college management system built with modern technologies.

## Quick Links

### Getting Started
- [Installation Guide](./GETTING_STARTED.md)
- [Development Setup](./DEVELOPMENT.md)
- [Test Accounts & Seeding](./testing/TEST_ACCOUNTS.md)

### Architecture
- [System Architecture](./architecture/SYSTEM_ARCHITECTURE.md) - High-level system design
- [Multi-Tenancy](./architecture/MULTI_TENANCY.md) - Tenant isolation patterns
- [Data Flow Diagrams](./architecture/DATA_FLOW_DIAGRAMS.md) - API request flows
- [API Documentation](./architecture/API_DOCUMENTATION.md) - Endpoint reference

### Product Features
- [Feature Matrix](./product/FEATURE_MATRIX.md) - Features by persona
- [Feature Dependencies](./product/FEATURE_DEPENDENCIES.md) - Module relationships
- [Tenant Configuration](./product/TENANT_CONFIGURATION.md) - Customization options

### Personas & Permissions
- [Personas Guide](./personas/PERSONAS.md) - All 9 user personas
- [Data Ownership Matrix](./personas/DATA_OWNERSHIP_MATRIX.md) - CRUD permissions
- [Permission Hierarchy](./personas/PERMISSION_HIERARCHY.md) - Role hierarchy

### User Journeys
- [User Journey Flows](./journeys/USER_JOURNEY_FLOWS.md) - Visual journey maps
- [API Touchpoints](./journeys/API_TOUCHPOINTS.md) - Journey-to-API mapping
- [E2E Test Cases](./testing/E2E_USER_JOURNEYS.md) - End-to-end scenarios

### User Guides
- [Principal Guide](./user-guides/PRINCIPAL_USER_GUIDE.md)
- [HOD Guide](./user-guides/HOD_USER_GUIDE.md)
- [Admin Staff Guide](./user-guides/ADMIN_USER_GUIDE.md)
- [Teacher Guide](./user-guides/TEACHER_USER_GUIDE.md)
- [Lab Assistant Guide](./user-guides/LAB_ASSISTANT_USER_GUIDE.md)
- [Student Guide](./user-guides/STUDENT_USER_GUIDE.md)
- [Parent Guide](./user-guides/PARENT_USER_GUIDE.md)
- [Alumni Guide](./user-guides/ALUMNI_USER_GUIDE.md)

### Sales & Marketing
- [Feature List](./sales/FEATURE_LIST.md) - Complete feature catalog
- [Demo Walkthrough](./sales/DEMO_WALKTHROUGH_SCRIPTS.md) - Sales demo scripts

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, TailwindCSS, shadcn/ui |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL (multi-tenant) |
| Authentication | Clerk |
| State Management | React Query |
| Monorepo | pnpm workspaces |

## Project Structure

```
edunexus/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # NestJS backend API
├── packages/
│   └── database/     # Prisma schema and migrations
├── docs/             # Documentation (you are here)
└── package.json      # Root workspace configuration
```

## Test Accounts

All test accounts use password: `Nexus@1104`

### Colleges
| College | Domain | Description |
|---------|--------|-------------|
| Nexus Engineering College | nexus-ec | Primary test college |
| Quantum Institute of Technology | quantum-it | Secondary test college |
| Careerfied Academy | careerfied | Tertiary test college |

### Personas (per college)
| Persona | Email Pattern |
|---------|---------------|
| Principal | principal@{domain}.edu |
| HOD | hod.cse@{domain}.edu |
| Admin Staff | admin@{domain}.edu |
| Teacher | teacher@{domain}.edu |
| Lab Assistant | lab@{domain}.edu |
| Student | student@{domain}.edu |
| Parent | parent@{domain}.edu |
| Alumni | alumni@{domain}.edu |

## Running the Application

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Run database migrations
cd packages/database && pnpm db:migrate

# Seed test data
cd packages/database && pnpm db:seed
```

## Support

For issues and feature requests, please create an issue in the repository.
