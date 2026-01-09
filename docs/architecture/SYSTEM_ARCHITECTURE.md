# System Architecture

This document provides an overview of the EduNexus system architecture, including high-level design, component interactions, and deployment topology.

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Clients["Clients"]
        Web["Web Browser"]
        Mobile["Mobile App (Future)"]
    end

    subgraph CDN["Content Delivery"]
        Vercel["Vercel Edge"]
    end

    subgraph Frontend["Frontend (Next.js)"]
        NextJS["Next.js 14 App Router"]
        Clerk["Clerk Auth"]
        TanStack["React Query"]
    end

    subgraph Backend["Backend (NestJS)"]
        API["NestJS API"]
        Guards["Auth Guards"]
        Services["Business Services"]
        Modules["58+ Modules"]
    end

    subgraph Data["Data Layer"]
        Prisma["Prisma ORM"]
        PostgreSQL["PostgreSQL"]
        Redis["Redis (Future)"]
    end

    subgraph External["External Services"]
        ClerkAPI["Clerk API"]
        Email["Email (Resend)"]
        SMS["SMS Gateway"]
        Storage["File Storage (S3)"]
    end

    Web --> Vercel
    Mobile --> Vercel
    Vercel --> NextJS
    NextJS --> Clerk
    NextJS --> TanStack
    TanStack --> API
    API --> Guards
    Guards --> Services
    Services --> Modules
    Modules --> Prisma
    Prisma --> PostgreSQL
    API --> ClerkAPI
    API --> Email
    API --> SMS
    API --> Storage
```

## Technology Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | React framework with App Router | 14.x |
| React | UI library | 18.x |
| TypeScript | Type-safe JavaScript | 5.x |
| TailwindCSS | Utility-first CSS | 3.x |
| shadcn/ui | Component library | Latest |
| React Query | Server state management | 5.x |
| Clerk | Authentication | Latest |
| Lucide React | Icon library | Latest |
| Recharts | Chart library | 2.x |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| NestJS | Node.js framework | 10.x |
| TypeScript | Type-safe JavaScript | 5.x |
| Prisma | ORM | 5.x |
| PostgreSQL | Primary database | 15.x |
| Class Validator | DTO validation | Latest |
| Swagger | API documentation | Latest |

### DevOps
| Technology | Purpose |
|------------|---------|
| pnpm | Package manager |
| Turborepo | Monorepo build |
| Vercel | Frontend hosting |
| Docker | Containerization |
| GitHub Actions | CI/CD |

## Module Architecture

```mermaid
flowchart LR
    subgraph CoreModules["Core Modules"]
        Auth["Auth Module"]
        Users["Users Module"]
        Tenants["Tenants Module"]
    end

    subgraph AcademicModules["Academic Modules"]
        Departments["Departments"]
        Courses["Courses"]
        Subjects["Subjects"]
        Attendance["Attendance"]
        Exams["Exams"]
        Results["Results"]
    end

    subgraph StudentModules["Student Modules"]
        Students["Students"]
        Fees["Fees"]
        SGI["Student Growth Index"]
        CRI["Career Readiness"]
        Goals["Goals"]
        Journey["Journey"]
    end

    subgraph StaffModules["Staff Modules"]
        Staff["Staff"]
        Teachers["Teachers"]
        LabAssistants["Lab Assistants"]
    end

    subgraph AdminModules["Admin Modules"]
        Records["Records"]
        Certificates["Certificates"]
        Library["Library"]
        Hostel["Hostel"]
        Transport["Transport"]
    end

    subgraph CommunityModules["Community Modules"]
        Parents["Parents"]
        Alumni["Alumni"]
        Mentorship["Mentorship"]
    end

    subgraph SupportModules["Support Modules"]
        Feedback["360° Feedback"]
        Notifications["Notifications"]
        Communications["Communications"]
        Events["Events"]
    end

    CoreModules --> AcademicModules
    CoreModules --> StudentModules
    CoreModules --> StaffModules
    AcademicModules --> AdminModules
    StudentModules --> CommunityModules
    StaffModules --> SupportModules
```

## Database Schema Overview

The database contains 130+ models organized into functional groups:

### Core Models
- `Tenant` - Multi-tenant organization
- `User` - All user accounts
- `UserProfile` - Extended user information

### Academic Models
- `Department`, `Course`, `Subject`
- `Exam`, `ExamResult`
- `StudentAttendance`, `StudentFee`

### Growth & Career Models
- `StudentGrowthIndex` - SGI scores
- `CareerReadinessIndex` - CRI scores
- `StudentGoal`, `AiGuidance`
- `JourneyMilestone`, `SemesterSnapshot`

### Feedback Models
- `FeedbackCycle`, `FeedbackEntry`
- `FeedbackSummary`

### Campus Services
- `LibraryBook`, `BookIssue`, `LibraryCard`
- `HostelBlock`, `HostelRoom`, `HostelAllocation`
- `TransportRoute`, `TransportPass`
- `CertificateType`, `CertificateRequest`

### Alumni Models
- `AlumniProfile`, `AlumniEmployment`
- `AlumniMentorship`, `AlumniEvent`

## API Architecture

### Route Structure

```
/api/v1
├── /auth                    # Authentication
├── /users                   # User management
├── /tenants                 # Tenant operations
│
├── /principal-dashboard     # Principal APIs
├── /hod-dashboard          # HOD APIs
├── /admin-*                # Admin APIs
├── /teacher-*              # Teacher APIs
├── /lab-assistant          # Lab Assistant APIs
├── /student-*              # Student APIs
├── /parent-*               # Parent APIs
├── /alumni                 # Alumni APIs
│
├── /departments            # Academic
├── /courses
├── /subjects
├── /exams
│
├── /student-indices        # SGI/CRI
├── /student-journey        # Journey tracking
├── /student-goals          # Goal management
├── /feedback               # 360° Feedback
│
├── /library               # Library services
├── /hostel                # Hostel management
├── /transport             # Transport services
├── /certificates          # Certificate requests
│
├── /notifications         # Notifications
├── /communications        # Bulk communications
└── /events                # Event management
```

### Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant NextJS
    participant Clerk
    participant API
    participant Guards
    participant Service
    participant Prisma
    participant DB

    Client->>NextJS: Request
    NextJS->>Clerk: Validate Session
    Clerk-->>NextJS: User Info
    NextJS->>API: API Request + JWT
    API->>Guards: Authenticate
    Guards->>Guards: Validate Role
    Guards->>Service: Call Service
    Service->>Prisma: Database Query
    Prisma->>DB: SQL
    DB-->>Prisma: Results
    Prisma-->>Service: Entities
    Service-->>API: Response DTO
    API-->>NextJS: JSON Response
    NextJS-->>Client: Rendered Page
```

## Multi-Tenancy Architecture

See [Multi-Tenancy](./MULTI_TENANCY.md) for detailed patterns.

### Tenant Isolation

```mermaid
flowchart TB
    subgraph Shared["Shared Infrastructure"]
        API["API Server"]
        DB["PostgreSQL"]
    end

    subgraph Tenant1["Tenant: nexus-ec"]
        T1Data["Tenant 1 Data"]
    end

    subgraph Tenant2["Tenant: quantum-it"]
        T2Data["Tenant 2 Data"]
    end

    subgraph Tenant3["Tenant: careerfied"]
        T3Data["Tenant 3 Data"]
    end

    API --> DB
    DB --> T1Data
    DB --> T2Data
    DB --> T3Data
```

Every table has a `tenantId` column ensuring data isolation at the row level.

## Security Architecture

### Authentication Flow

```mermaid
flowchart TD
    A[User] --> B[Clerk Auth]
    B --> C{Authenticated?}
    C -->|No| D[Sign In]
    D --> B
    C -->|Yes| E[Get JWT]
    E --> F[API Request]
    F --> G[Validate Token]
    G --> H{Valid?}
    H -->|No| I[401 Unauthorized]
    H -->|Yes| J[Extract Claims]
    J --> K[Check Role]
    K --> L{Authorized?}
    L -->|No| M[403 Forbidden]
    L -->|Yes| N[Process Request]
```

### Authorization Layers

1. **Route-level**: Middleware checks role for route access
2. **Endpoint-level**: Guards validate specific permissions
3. **Data-level**: Tenant ID filtering on all queries

## Deployment Architecture

```mermaid
flowchart TB
    subgraph GitHub["GitHub"]
        Repo["Repository"]
    end

    subgraph CI["CI/CD"]
        Actions["GitHub Actions"]
        Lint["Lint & Type Check"]
        Test["Run Tests"]
        Build["Build"]
    end

    subgraph Vercel["Vercel"]
        Preview["Preview Deployments"]
        Production["Production"]
    end

    subgraph Backend["Backend Infrastructure"]
        Railway["Railway/Render"]
        DBHOST["Managed PostgreSQL"]
    end

    Repo --> Actions
    Actions --> Lint
    Lint --> Test
    Test --> Build
    Build --> Preview
    Build --> Production
    Production --> Railway
    Railway --> DBHOST
```

## Performance Considerations

### Frontend Optimization
- Next.js App Router with React Server Components
- Automatic code splitting
- Image optimization via next/image
- Static page generation where possible

### Backend Optimization
- Connection pooling with Prisma
- Pagination on all list endpoints
- Selective field loading
- Index optimization on frequently queried columns

### Caching Strategy (Future)
- Redis for session data
- Query result caching
- CDN for static assets

## Monitoring & Observability

| Aspect | Tool |
|--------|------|
| Error Tracking | Sentry |
| Analytics | Vercel Analytics |
| Logging | Console/CloudWatch |
| Uptime | Vercel |

## Scaling Considerations

1. **Horizontal Scaling**: Stateless API design allows multiple instances
2. **Database Scaling**: Read replicas for reporting queries
3. **Tenant Sharding**: Future consideration for very large tenants
4. **Microservices**: Potential split of heavy modules (notifications, reports)

---

## Related Documents

- [Multi-Tenancy](./MULTI_TENANCY.md)
- [Data Flow Diagrams](./DATA_FLOW_DIAGRAMS.md)
- [API Documentation](./API_DOCUMENTATION.md)
