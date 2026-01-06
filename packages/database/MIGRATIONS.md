# EduNexus Database Migrations

> **Last Updated:** January 6, 2026
> **Total Migrations:** 3
> **Database:** PostgreSQL 15+
> **ORM:** Prisma 5.x

---

## Quick Reference

| Migration ID | Name | Category | Tables | Status |
|-------------|------|----------|--------|--------|
| `20260106094338` | `init` | Foundation | 24 | ✅ Applied |
| `20260106110719` | `add_razorpay_payment_fields` | Payment | 1 (+ alterations) | ✅ Applied |
| `20260106122430` | `add_device_tokens` | Notification | 1 | ✅ Applied |

---

## Migration Categories

| Category | Description | Migrations |
|----------|-------------|------------|
| **Foundation** | Core schema setup (tables, relationships, indexes) | M001 |
| **Payment** | Razorpay integration, transactions, receipts | M002 |
| **Notification** | Email, SMS, Push notification support | M003 |

---

## Migration Details

### M001: init
**ID:** `20260106094338_init`
**Category:** Foundation
**Environment:** All (Development, Staging, Production)
**Breaking Changes:** No (Initial setup)
**Rollback:** Requires fresh database (DROP ALL)

#### Summary
Initial database schema establishing the multi-tenant EduNexus platform foundation.

#### Changes

**Enums Created:**
- `UserRole` - Defines user roles: `principal`, `hod`, `admin_staff`, `teacher`, `lab_assistant`, `student`, `parent`

**Tables Created (24):**

| Table | Category | Description |
|-------|----------|-------------|
| `platform_admins` | Platform | Super admin accounts for platform management |
| `tenants` | Platform | College/institution tenant records |
| `tenant_subscriptions` | Platform | Subscription plans per tenant |
| `platform_invoices` | Platform | Billing invoices for tenants |
| `platform_support_tickets` | Platform | Support tickets from tenants |
| `users` | Identity | All user accounts (multi-tenant) |
| `user_profiles` | Identity | Extended user profile information |
| `user_addresses` | Identity | User address records (permanent, current) |
| `user_contacts` | Identity | Phone numbers (primary, secondary) |
| `user_documents` | Identity | ID proofs, certificates |
| `emergency_contacts` | Identity | Emergency contact information |
| `departments` | Academic | Academic departments per tenant |
| `staff` | Academic | Staff members (teachers, HODs, lab assistants) |
| `students` | Academic | Student records with enrollment info |
| `parents` | Academic | Parent records linked to students |
| `courses` | Academic | Degree programs (B.Tech, M.Tech, etc.) |
| `subjects` | Academic | Subjects per course/semester |
| `teacher_subjects` | Academic | Teacher-subject assignments |
| `student_attendance` | Tracking | Daily attendance records |
| `student_fees` | Finance | Fee records per student |
| `exams` | Academic | Exam scheduling |
| `exam_results` | Academic | Student exam results |
| `career_profiles` | Placement | Student career/placement profiles |
| `notifications` | Communication | In-app notification records |

**Indexes Created:**
- Multi-tenant indexes on all tenant-scoped tables
- Unique constraints: `users(tenantId, email)`, `students(tenantId, rollNo)`, `staff(tenantId, employeeId)`
- Performance indexes on foreign keys

**Foreign Keys:**
- Cascade deletes configured for dependent records
- Tenant relationships established

#### Validation Queries
```sql
-- Verify all tables created
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Expected: 24

-- Verify enum created
SELECT enumlabel FROM pg_enum
WHERE enumtypid = 'UserRole'::regtype;
-- Expected: 7 values
```

---

### M002: add_razorpay_payment_fields
**ID:** `20260106110719_add_razorpay_payment_fields`
**Category:** Payment
**Environment:** All
**Breaking Changes:** No (Additive only)
**Rollback:** See rollback section below

#### Summary
Integrates Razorpay payment gateway support for fee collection.

#### Changes

**Altered Tables:**
- `student_fees` - Added columns:
  - `razorpayOrderId` (TEXT, nullable) - Razorpay order reference
  - `razorpayPaymentId` (TEXT, nullable) - Razorpay payment reference
  - `paymentMethod` (TEXT, nullable) - upi, card, netbanking, wallet
  - `transactionId` (TEXT, nullable) - Internal transaction reference
  - `receiptNumber` (TEXT, nullable) - Generated receipt number
  - `failureReason` (TEXT, nullable) - Payment failure details

**Tables Created (1):**
- `payment_transactions` - Complete payment transaction log
  - Links to `student_fees` and `students`
  - Stores Razorpay webhook data
  - Tracks payment lifecycle: created → authorized → captured → failed → refunded

**Indexes Created:**
- `payment_transactions_tenantId_idx`
- `payment_transactions_razorpayOrderId_idx`
- `payment_transactions_studentId_idx`
- `student_fees_razorpayOrderId_idx`

#### Rollback SQL
```sql
-- WARNING: This will delete payment data permanently
-- Backup payment_transactions table before rollback

-- Step 1: Remove foreign keys
ALTER TABLE "payment_transactions"
DROP CONSTRAINT "payment_transactions_studentFeeId_fkey",
DROP CONSTRAINT "payment_transactions_studentId_fkey";

-- Step 2: Drop indexes
DROP INDEX IF EXISTS "payment_transactions_tenantId_idx";
DROP INDEX IF EXISTS "payment_transactions_razorpayOrderId_idx";
DROP INDEX IF EXISTS "payment_transactions_studentId_idx";
DROP INDEX IF EXISTS "student_fees_razorpayOrderId_idx";

-- Step 3: Drop payment_transactions table
DROP TABLE IF EXISTS "payment_transactions";

-- Step 4: Remove columns from student_fees
ALTER TABLE "student_fees"
DROP COLUMN IF EXISTS "razorpayOrderId",
DROP COLUMN IF EXISTS "razorpayPaymentId",
DROP COLUMN IF EXISTS "paymentMethod",
DROP COLUMN IF EXISTS "transactionId",
DROP COLUMN IF EXISTS "receiptNumber",
DROP COLUMN IF EXISTS "failureReason";

-- Step 5: Update Prisma migration table
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20260106110719_add_razorpay_payment_fields';
```

#### Validation Queries
```sql
-- Verify payment_transactions table
SELECT COUNT(*) FROM information_schema.tables
WHERE table_name = 'payment_transactions';
-- Expected: 1

-- Verify student_fees columns added
SELECT column_name FROM information_schema.columns
WHERE table_name = 'student_fees'
AND column_name IN ('razorpayOrderId', 'razorpayPaymentId', 'paymentMethod');
-- Expected: 3 rows
```

---

### M003: add_device_tokens
**ID:** `20260106122430_add_device_tokens`
**Category:** Notification
**Environment:** All
**Breaking Changes:** No (Additive only)
**Rollback:** See rollback section below

#### Summary
Adds support for Firebase Cloud Messaging (FCM) push notifications by storing device tokens.

#### Changes

**Tables Created (1):**
- `device_tokens` - Stores FCM tokens per user device
  - `id` (TEXT, PK) - CUID identifier
  - `tenantId` (TEXT) - Multi-tenant scope
  - `userId` (TEXT, FK) - Links to users table
  - `token` (TEXT, UNIQUE) - FCM device token
  - `deviceType` (TEXT, default: 'web') - web, android, ios
  - `deviceName` (TEXT, nullable) - User-friendly device name
  - `deviceModel` (TEXT, nullable) - Device model info
  - `appVersion` (TEXT, nullable) - App version for token
  - `isActive` (BOOLEAN, default: true) - Token validity flag
  - `lastUsedAt` (TIMESTAMP) - Last notification sent
  - `createdAt` / `updatedAt` (TIMESTAMP) - Audit timestamps

**Indexes Created:**
- `device_tokens_token_key` (UNIQUE) - Ensures token uniqueness
- `device_tokens_tenantId_idx` - Multi-tenant queries
- `device_tokens_userId_idx` - User device lookups

**Foreign Keys:**
- `device_tokens_userId_fkey` → `users(id)` ON DELETE CASCADE

#### Rollback SQL
```sql
-- WARNING: This will delete all device tokens

-- Step 1: Remove foreign key
ALTER TABLE "device_tokens"
DROP CONSTRAINT IF EXISTS "device_tokens_userId_fkey";

-- Step 2: Drop indexes
DROP INDEX IF EXISTS "device_tokens_token_key";
DROP INDEX IF EXISTS "device_tokens_tenantId_idx";
DROP INDEX IF EXISTS "device_tokens_userId_idx";

-- Step 3: Drop table
DROP TABLE IF EXISTS "device_tokens";

-- Step 4: Update Prisma migration table
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20260106122430_add_device_tokens';
```

#### Validation Queries
```sql
-- Verify device_tokens table
SELECT COUNT(*) FROM information_schema.tables
WHERE table_name = 'device_tokens';
-- Expected: 1

-- Verify indexes
SELECT indexname FROM pg_indexes
WHERE tablename = 'device_tokens';
-- Expected: 3 indexes
```

---

## Deployment Guide

### Local Development
```bash
# Apply all pending migrations
cd packages/database
npx prisma migrate dev

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Staging / Production
```bash
# Apply migrations without prompts
npx prisma migrate deploy

# Validate schema matches
npx prisma validate

# Generate Prisma client after migration
npx prisma generate
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Run Database Migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}

- name: Validate Migration Success
  run: npx prisma migrate status
```

---

## Pre-Deployment Checklist

- [ ] Backup database before migration
- [ ] Test migration on staging first
- [ ] Verify migration files match between environments
- [ ] Review migration SQL for breaking changes
- [ ] Ensure sufficient database disk space
- [ ] Schedule maintenance window if needed
- [ ] Notify stakeholders of downtime

## Post-Deployment Checklist

- [ ] Verify all migrations applied (`prisma migrate status`)
- [ ] Check application connectivity
- [ ] Run smoke tests on API endpoints
- [ ] Verify data integrity with validation queries
- [ ] Monitor error logs for 30 minutes
- [ ] Document any issues encountered

---

## Troubleshooting

### Migration Failed Midway
```bash
# Check which migrations applied
npx prisma migrate status

# Manually apply remaining SQL if needed
psql $DATABASE_URL < migration.sql

# Mark migration as applied
npx prisma migrate resolve --applied "MIGRATION_NAME"
```

### Drift Detected
```bash
# If schema differs from migrations
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma

# Create migration to align
npx prisma migrate dev --name fix_drift
```

### Connection Issues
```bash
# Test database connection
npx prisma db execute --stdin <<< "SELECT 1"

# Common issues:
# - Check DATABASE_URL format
# - Verify network/firewall rules
# - Ensure database exists
# - Check SSL requirements
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DIRECT_URL` | No | Direct DB URL (bypasses connection pooler) |

### Connection String Format
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

# With connection pooling (PgBouncer)
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&pgbouncer=true

# With SSL
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&sslmode=require
```

---

## Version History

| Date | Migration | Author | Description |
|------|-----------|--------|-------------|
| 2026-01-06 | M001 | System | Initial schema setup |
| 2026-01-06 | M002 | System | Razorpay payment integration |
| 2026-01-06 | M003 | System | FCM push notification support |

---

## Contact

For migration issues or questions:
- **Technical Lead:** [Contact Info]
- **DBA Team:** [Contact Info]
- **On-Call:** Check PagerDuty rotation
