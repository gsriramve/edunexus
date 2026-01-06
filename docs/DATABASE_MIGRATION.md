# EduNexus Database Migration Guide

> **Last Updated:** January 2026
> **Version:** 1.0
> **Target:** Local Development → AWS Cloud (ap-south-1)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Migration Registry](#migration-registry)
4. [Local Development Setup](#local-development-setup)
5. [Cloud Migration Process](#cloud-migration-process)
6. [Environment Configuration](#environment-configuration)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Overview

### Purpose

This document provides a complete guide for managing EduNexus database migrations from local development through to production deployment on AWS.

### Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| ORM | Prisma | 6.x |
| Database | PostgreSQL | 15.x |
| Cache | Redis | 7.x |
| Cloud Provider | AWS | ap-south-1 |
| Container Orchestration | Kubernetes (EKS) | 1.29 |
| Infrastructure as Code | Terraform | 1.5+ |

### Multi-Tenant Architecture

EduNexus uses a **hybrid multi-tenant architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                     PUBLIC SCHEMA                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ platform_    │  │   tenants    │  │ tenant_      │      │
│  │ admins       │  │              │  │ subscriptions│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  All tenant data stored in public schema with tenantId FK   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    users     │  │   students   │  │    fees      │      │
│  │ (tenantId)   │  │ (tenantId)   │  │ (tenantId)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture

### Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EDUNEXUS DATABASE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PLATFORM LEVEL (Shared)                                            │
│  ├── platform_admins      - Platform super admins                   │
│  ├── tenants              - College/institution records             │
│  ├── tenant_subscriptions - Billing & subscription info             │
│  ├── platform_invoices    - Platform billing invoices               │
│  └── platform_support_tickets - Support tickets                     │
│                                                                      │
│  TENANT LEVEL (Per-tenant with tenantId FK)                         │
│  ├── users                - All user accounts (with roles)          │
│  ├── user_profiles        - Extended user information               │
│  ├── user_addresses       - Address records                         │
│  ├── user_contacts        - Phone numbers                           │
│  ├── user_documents       - ID proofs, certificates                 │
│  ├── emergency_contacts   - Emergency contact info                  │
│  ├── departments          - Academic departments                    │
│  ├── staff                - Staff members                           │
│  ├── students             - Student records                         │
│  ├── parents              - Parent records                          │
│  ├── courses              - Degree programs                         │
│  ├── subjects             - Subjects per course                     │
│  ├── teacher_subjects     - Teacher-subject assignments             │
│  ├── student_attendance   - Attendance records                      │
│  ├── student_fees         - Fee records                             │
│  ├── payment_transactions - Razorpay payment logs                   │
│  ├── exams                - Exam scheduling                         │
│  ├── exam_results         - Student results                         │
│  ├── career_profiles      - Placement profiles                      │
│  ├── notifications        - In-app notifications                    │
│  └── device_tokens        - FCM push notification tokens            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### User Roles (Enum)

```typescript
enum UserRole {
  principal      // College head - full access
  hod            // Department head
  admin_staff    // Administrative staff
  teacher        // Teaching faculty
  lab_assistant  // Lab assistants
  student        // Students
  parent         // Parents/guardians
}
```

---

## Migration Registry

### Current Migrations

| # | Migration ID | Name | Category | Date | Status |
|---|--------------|------|----------|------|--------|
| 1 | `20260106094338` | `init` | Foundation | Jan 6, 2026 | ✅ Applied |
| 2 | `20260106110719` | `add_razorpay_payment_fields` | Payment | Jan 6, 2026 | ✅ Applied |
| 3 | `20260106122430` | `add_device_tokens` | Notification | Jan 6, 2026 | ✅ Applied |

### Migration Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Foundation** | Core schema setup | Tables, enums, indexes |
| **Payment** | Payment integration | Razorpay fields, transactions |
| **Notification** | Notification support | Device tokens, push configs |
| **Academic** | Academic features | Exams, results, attendance |
| **Multi-Tenant** | Tenant management | Schema functions |

### Migration Details

#### M001: init (20260106094338)

**Purpose:** Initial database schema with all core tables.

**Tables Created (24):**
- Platform: `platform_admins`, `tenants`, `tenant_subscriptions`, `platform_invoices`, `platform_support_tickets`
- Identity: `users`, `user_profiles`, `user_addresses`, `user_contacts`, `user_documents`, `emergency_contacts`
- Academic: `departments`, `staff`, `students`, `parents`, `courses`, `subjects`, `teacher_subjects`
- Tracking: `student_attendance`, `student_fees`, `exams`, `exam_results`
- Other: `career_profiles`, `notifications`

**Enums Created:**
- `UserRole`: principal, hod, admin_staff, teacher, lab_assistant, student, parent

**Rollback:** Requires full database reset (destructive)

---

#### M002: add_razorpay_payment_fields (20260106110719)

**Purpose:** Integrate Razorpay payment gateway for fee collection.

**Changes:**
- Added columns to `student_fees`:
  - `razorpayOrderId` (TEXT)
  - `razorpayPaymentId` (TEXT)
  - `paymentMethod` (TEXT)
  - `transactionId` (TEXT)
  - `receiptNumber` (TEXT)
  - `failureReason` (TEXT)

- Created `payment_transactions` table:
  - Tracks complete payment lifecycle
  - Links to `student_fees` and `students`
  - Stores Razorpay webhook data

**Rollback SQL:**
```sql
-- Step 1: Remove foreign keys
ALTER TABLE "payment_transactions"
DROP CONSTRAINT IF EXISTS "payment_transactions_studentFeeId_fkey",
DROP CONSTRAINT IF EXISTS "payment_transactions_studentId_fkey";

-- Step 2: Drop indexes
DROP INDEX IF EXISTS "payment_transactions_tenantId_idx";
DROP INDEX IF EXISTS "payment_transactions_razorpayOrderId_idx";
DROP INDEX IF EXISTS "payment_transactions_studentId_idx";
DROP INDEX IF EXISTS "student_fees_razorpayOrderId_idx";

-- Step 3: Drop table
DROP TABLE IF EXISTS "payment_transactions";

-- Step 4: Remove columns from student_fees
ALTER TABLE "student_fees"
DROP COLUMN IF EXISTS "razorpayOrderId",
DROP COLUMN IF EXISTS "razorpayPaymentId",
DROP COLUMN IF EXISTS "paymentMethod",
DROP COLUMN IF EXISTS "transactionId",
DROP COLUMN IF EXISTS "receiptNumber",
DROP COLUMN IF EXISTS "failureReason";

-- Step 5: Update migration table
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20260106110719_add_razorpay_payment_fields';
```

---

#### M003: add_device_tokens (20260106122430)

**Purpose:** Support Firebase Cloud Messaging (FCM) push notifications.

**Changes:**
- Created `device_tokens` table:
  - `id`, `tenantId`, `userId` (FK to users)
  - `token` (UNIQUE) - FCM device token
  - `deviceType` - web, android, ios
  - `deviceName`, `deviceModel`, `appVersion`
  - `isActive`, `lastUsedAt`

**Rollback SQL:**
```sql
ALTER TABLE "device_tokens"
DROP CONSTRAINT IF EXISTS "device_tokens_userId_fkey";

DROP INDEX IF EXISTS "device_tokens_token_key";
DROP INDEX IF EXISTS "device_tokens_tenantId_idx";
DROP INDEX IF EXISTS "device_tokens_userId_idx";

DROP TABLE IF EXISTS "device_tokens";

DELETE FROM "_prisma_migrations"
WHERE migration_name = '20260106122430_add_device_tokens';
```

---

## Local Development Setup

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- npm 10+

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/gsriramve/edunexus.git
cd edunexus

# 2. Install dependencies
npm install

# 3. Start Docker services (PostgreSQL + Redis)
docker-compose up -d

# 4. Run database migrations
cd packages/database
DATABASE_URL="postgresql://edunexus:edunexus_dev_password@localhost:5432/edunexus?schema=public" npx prisma migrate dev

# 5. Seed the database
DATABASE_URL="postgresql://edunexus:edunexus_dev_password@localhost:5432/edunexus?schema=public" npm run db:seed

# 6. Generate Prisma client
npx prisma generate

# 7. Start development servers
cd ../..
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="postgresql://edunexus:edunexus_dev_password@localhost:5432/edunexus?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Payments (Razorpay)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

# Notifications
SENDGRID_API_KEY=SG.xxx
MSG91_AUTH_KEY=xxx
FIREBASE_PROJECT_ID=xxx
```

### Useful Commands

```bash
# Check migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database browser)
npx prisma studio

# Generate Prisma client
npx prisma generate
```

---

## Cloud Migration Process

### Phase 1: Infrastructure Setup (Terraform)

```bash
# 1. Navigate to Terraform environment
cd infrastructure/terraform/environments/staging  # or prod

# 2. Initialize Terraform
terraform init

# 3. Plan infrastructure changes
terraform plan -out=tfplan

# 4. Apply infrastructure
terraform apply tfplan

# 5. Note the outputs (RDS endpoint, Redis endpoint, etc.)
terraform output
```

### Phase 2: Database Migration

```bash
# 1. Set production DATABASE_URL
export DATABASE_URL="postgresql://edunexus:PASSWORD@edunexus-staging.xxx.ap-south-1.rds.amazonaws.com:5432/edunexus?schema=public"

# 2. Verify connection
npx prisma db execute --stdin <<< "SELECT 1"

# 3. Check migration status
npx prisma migrate status

# 4. Deploy migrations (production-safe, no prompts)
npx prisma migrate deploy

# 5. Verify migrations applied
npx prisma migrate status

# 6. Seed initial data (first deployment only)
npm run db:seed
```

### Phase 3: Application Deployment (Kubernetes)

```bash
# 1. Update kubeconfig
aws eks update-kubeconfig --name edunexus-staging --region ap-south-1

# 2. Create namespace
kubectl apply -f infrastructure/kubernetes/base/namespace.yaml

# 3. Deploy with Kustomize
cd infrastructure/kubernetes/overlays/staging
kustomize build . | kubectl apply -f -

# 4. Verify deployment
kubectl get pods -n edunexus-staging
kubectl rollout status deployment/edunexus-api -n edunexus-staging
```

### Phase 4: Verification

```bash
# 1. Test API health
curl https://api-staging.edunexus.io/health

# 2. Check logs
kubectl logs -l app=edunexus-api -n edunexus-staging --tail=100

# 3. Run smoke tests
# - Platform admin login
# - Tenant access
# - Fee payment flow
```

---

## Environment Configuration

### Local Development

```bash
DATABASE_URL="postgresql://edunexus:edunexus_dev_password@localhost:5432/edunexus?schema=public"
REDIS_URL="redis://localhost:6379"
NODE_ENV=development
```

### Staging (AWS)

```bash
DATABASE_URL="postgresql://edunexus:${DB_PASSWORD}@edunexus-staging.xxx.ap-south-1.rds.amazonaws.com:5432/edunexus?schema=public&connection_limit=10"
REDIS_URL="redis://edunexus-staging-redis.xxx.ap-south-1.cache.amazonaws.com:6379"
NODE_ENV=staging
```

### Production (AWS with RDS Proxy)

```bash
DATABASE_URL="postgresql://edunexus:${DB_PASSWORD}@edunexus-proxy.proxy-xxx.ap-south-1.rds.amazonaws.com:5432/edunexus?schema=public&pgbouncer=true&connection_limit=20"
REDIS_URL="redis://edunexus-prod-redis.xxx.ap-south-1.cache.amazonaws.com:6379"
NODE_ENV=production
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline automatically handles migrations:

```yaml
# .github/workflows/deploy.yml

jobs:
  migrate:
    name: Database Migrations
    steps:
      - name: Check Migration Status
        run: npx prisma migrate status
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Run Database Migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Verify Migration Success
        run: npx prisma migrate status
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Migration Validation in CI

```yaml
# .github/workflows/ci.yml

validate-migrations:
  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_DB: edunexus_test

  steps:
    - name: Validate Prisma Schema
      run: npx prisma validate

    - name: Apply Migrations (Test)
      run: npx prisma migrate deploy
      env:
        DATABASE_URL: postgresql://test:test@localhost:5432/edunexus_test
```

---

## Rollback Procedures

### Quick Reference

| Scenario | Rollback Method | Time | Risk |
|----------|-----------------|------|------|
| Application bug | Kubernetes rollback | 2-5 min | Low |
| Config issue | Update secrets | 5-10 min | Low |
| Migration failure | Manual SQL rollback | 15-60 min | High |
| Data corruption | RDS snapshot restore | 1-2 hr | Critical |

### Kubernetes Application Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/edunexus-api -n edunexus-production

# Rollback to specific revision
kubectl rollout undo deployment/edunexus-api --to-revision=3 -n edunexus-production

# Verify rollback
kubectl rollout status deployment/edunexus-api -n edunexus-production
```

### Database Migration Rollback

```bash
# 1. Identify migration to rollback
npx prisma migrate status

# 2. Execute rollback SQL (from MIGRATIONS.md)
psql $DATABASE_URL < rollback.sql

# 3. Remove migration record
psql $DATABASE_URL -c "DELETE FROM _prisma_migrations WHERE migration_name = 'migration_name';"

# 4. Regenerate Prisma client
npx prisma generate
```

### Point-in-Time Recovery (AWS RDS)

```bash
# 1. Restore to point in time
aws rds restore-db-cluster-to-point-in-time \
  --source-db-cluster-identifier edunexus-production \
  --db-cluster-identifier edunexus-recovery \
  --restore-to-time "2026-01-06T10:00:00Z"

# 2. Wait for availability
aws rds wait db-cluster-available --db-cluster-identifier edunexus-recovery

# 3. Update application connection
# Update DATABASE_URL in AWS Secrets Manager
```

---

## Troubleshooting

### Common Issues

#### Migration Stuck

```bash
# Check for locks
SELECT * FROM pg_locks WHERE granted = false;

# Release locks (CAUTION)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'edunexus' AND pid <> pg_backend_pid();
```

#### Schema Drift

```bash
# Detect drift
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma

# Create migration to fix drift
npx prisma migrate dev --name fix_drift
```

#### Connection Issues

```bash
# Test connection
npx prisma db execute --stdin <<< "SELECT 1"

# Check common issues:
# - DATABASE_URL format
# - Network/firewall rules
# - SSL requirements
# - Connection limits
```

#### Failed Migration Recovery

```bash
# 1. Check migration status
npx prisma migrate status

# 2. If migration partially applied, fix manually
psql $DATABASE_URL < fix_partial_migration.sql

# 3. Mark as resolved
npx prisma migrate resolve --applied "migration_name"

# 4. Or mark as rolled back
npx prisma migrate resolve --rolled-back "migration_name"
```

---

## Best Practices

### Migration Development

1. **Always test locally first**
   ```bash
   npx prisma migrate dev --name your_migration
   ```

2. **Review generated SQL**
   ```bash
   cat prisma/migrations/*/migration.sql
   ```

3. **Include rollback SQL** in migration documentation

4. **Use transactions** for data migrations

5. **Avoid destructive operations** without explicit approval

### Production Deployments

1. **Backup before migration**
   ```bash
   aws rds create-db-snapshot \
     --db-instance-identifier edunexus-production \
     --db-snapshot-identifier pre-migration-$(date +%Y%m%d)
   ```

2. **Deploy to staging first**

3. **Use maintenance windows** for breaking changes

4. **Monitor after deployment**
   - Error rates
   - Response times
   - Connection pool usage

5. **Keep rollback plan ready**

### Schema Design

1. **Always include `tenantId`** for multi-tenant tables
2. **Add indexes** for frequently queried columns
3. **Use appropriate data types** (DECIMAL for money, TEXT for variable strings)
4. **Document foreign key relationships**
5. **Consider query patterns** when designing indexes

---

## Support Contacts

| Role | Responsibility | Contact |
|------|----------------|---------|
| Technical Lead | Architecture decisions | [TBD] |
| DBA | Database operations | [TBD] |
| DevOps | Infrastructure | [TBD] |
| On-Call | Emergency response | PagerDuty |

---

## Appendix

### A. Database Connection Strings

```bash
# Local (Docker)
postgresql://edunexus:edunexus_dev_password@localhost:5432/edunexus?schema=public

# Staging (RDS)
postgresql://edunexus:PASSWORD@edunexus-staging.xxx.ap-south-1.rds.amazonaws.com:5432/edunexus?schema=public&connection_limit=10

# Production (RDS Proxy)
postgresql://edunexus:PASSWORD@edunexus-proxy.proxy-xxx.ap-south-1.rds.amazonaws.com:5432/edunexus?schema=public&pgbouncer=true&connection_limit=20
```

### B. Useful Prisma Commands

```bash
# Schema validation
npx prisma validate

# Format schema file
npx prisma format

# Generate client
npx prisma generate

# Push schema (dev only, no migration)
npx prisma db push

# Pull schema from database
npx prisma db pull

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio

# Execute raw SQL
npx prisma db execute --stdin <<< "SELECT * FROM tenants"
```

### C. AWS CLI Commands

```bash
# RDS snapshots
aws rds describe-db-snapshots --db-instance-identifier edunexus-production

# RDS status
aws rds describe-db-instances --db-instance-identifier edunexus-production

# ElastiCache status
aws elasticache describe-cache-clusters --cache-cluster-id edunexus-redis

# Secrets Manager
aws secretsmanager get-secret-value --secret-id edunexus-production/api
```

---

**Document Version:** 1.0
**Created:** January 2026
**Maintained by:** EduNexus Engineering Team
