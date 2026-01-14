# EduNexus Production Roadmap

**Document Version**: 1.0
**Created**: January 15, 2026
**Last Updated**: January 15, 2026
**Status**: Planning Phase

---

## Executive Summary

EduNexus is a feature-complete AI-powered college management platform with strong architectural foundations. However, before production deployment with real user data, critical security fixes and DPDP (Digital Personal Data Protection Act 2023) compliance gaps must be addressed.

| Area | Current State | Target State |
|------|---------------|--------------|
| Production Readiness | 55% | 95%+ |
| DPDP Compliance | 4/10 | 9/10 |
| Test Coverage | ~1% | 60%+ |
| Documentation | 40% | 90% |

**Estimated Total Effort**: 140-200 hours (3-5 weeks for 1 engineer)

---

## Table of Contents

1. [Critical Security Fixes](#1-critical-security-fixes-week-1)
2. [DPDP Compliance Implementation](#2-dpdp-compliance-implementation-week-2-3)
3. [Testing Infrastructure](#3-testing-infrastructure-week-3-4)
4. [Documentation & Monitoring](#4-documentation--monitoring-week-4-5)
5. [Pre-Launch Checklist](#5-pre-launch-checklist)
6. [Risk Register](#6-risk-register)

---

## 1. Critical Security Fixes (Week 1)

### 1.1 Database Security - CRITICAL

**File**: `infrastructure/terraform/rds.tf`

| Line | Current | Required | Risk |
|------|---------|----------|------|
| 52 | `publicly_accessible = true` | `publicly_accessible = false` | Data breach |
| 55 | `backup_retention_period = 0` | `backup_retention_period = 30` | Total data loss |
| 63 | `skip_final_snapshot = true` | `skip_final_snapshot = false` | Accidental data loss |
| 64 | `deletion_protection = false` | `deletion_protection = true` | Accidental destruction |

**Action Items**:
- [ ] Update `rds.tf` with secure values
- [ ] Apply Terraform changes to production
- [ ] Verify database is not publicly accessible
- [ ] Test backup creation and restoration

**Estimated Time**: 2-3 hours

---

### 1.2 Network Security - HIGH

**File**: `infrastructure/terraform/security-groups.tf`

| Issue | Current | Required |
|-------|---------|----------|
| SSH Access (Line 25) | `0.0.0.0/0` | Specific IP ranges |
| Port 3000 Exposure | Public | Behind ALB only |
| Port 3001 Exposure | Public | VPC internal only |

**Action Items**:
- [ ] Restrict SSH to office/VPN IP addresses
- [ ] Configure Application Load Balancer (ALB)
- [ ] Move API to internal subnet
- [ ] Enable AWS WAF on ALB

**Estimated Time**: 4-6 hours

---

### 1.3 Rate Limiting on Authentication - HIGH

**File**: `apps/api/src/modules/auth/auth.controller.ts`

**Current State**: ThrottlerModule configured but not applied to auth endpoints.

**Implementation**:
```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {

  @Throttle(5, 60)  // 5 requests per minute
  @Post('login')
  async login(@Body() dto: LoginDto) { ... }

  @Throttle(3, 60)  // 3 requests per minute
  @Post('register')
  async register(@Body() dto: RegisterDto) { ... }

  @Throttle(3, 300)  // 3 requests per 5 minutes
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) { ... }
}
```

**Action Items**:
- [ ] Add `@Throttle()` decorator to all auth endpoints
- [ ] Configure stricter limits for sensitive operations
- [ ] Add rate limit headers to responses
- [ ] Implement account lockout after failed attempts

**Estimated Time**: 2-3 hours

---

### 1.4 Global Exception Filter - HIGH

**File**: `apps/api/src/common/filters/http-exception.filter.ts` (create new)

**Purpose**: Prevent stack traces and internal errors from leaking to clients.

**Implementation**:
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Log full error internally
    this.logger.error(exception);

    // Return sanitized response
    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}
```

**Action Items**:
- [ ] Create GlobalExceptionFilter
- [ ] Register in `main.ts`
- [ ] Test error responses don't leak sensitive data

**Estimated Time**: 2 hours

---

### 1.5 Secrets Rotation - HIGH

**Issue**: API keys visible in `.env` files and docker-compose.yml

**Action Items**:
- [ ] Rotate all exposed API keys:
  - [ ] Resend API Key
  - [ ] Razorpay keys
  - [ ] OpenAI/Anthropic keys
  - [ ] Clerk keys
- [ ] Move all secrets to AWS Secrets Manager
- [ ] Remove hardcoded passwords from docker-compose.yml
- [ ] Add `.env` to `.gitignore` (verify not committed)

**Estimated Time**: 3-4 hours

---

## 2. DPDP Compliance Implementation (Week 2-3)

### 2.1 Consent Management Module - CRITICAL

**DPDP Requirement**: Section 6(1) - Explicit consent before processing personal data

**Database Schema** (`packages/database/prisma/schema.prisma`):
```prisma
model ConsentRecord {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  tenantId      String
  tenant        Tenant    @relation(fields: [tenantId], references: [id])

  consentType   String    // data_processing, marketing, analytics, biometric
  purpose       String    // Specific purpose description
  version       String    // Policy version consented to

  grantedAt     DateTime  @default(now())
  withdrawnAt   DateTime?
  expiresAt     DateTime? // For time-limited consent

  ipAddress     String?
  userAgent     String?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId])
  @@index([tenantId])
  @@index([consentType])
}
```

**API Endpoints**:
```
POST   /api/consent              # Grant consent
DELETE /api/consent/:type        # Withdraw consent
GET    /api/consent/me           # Get my consent status
GET    /api/consent/history      # Consent audit trail
```

**Frontend Components**:
- [ ] Consent banner on first visit
- [ ] Consent checkboxes during registration
- [ ] Consent preference center in user settings
- [ ] Consent withdrawal confirmation modal

**Action Items**:
- [ ] Add ConsentRecord model to Prisma schema
- [ ] Create consent.module.ts, consent.service.ts, consent.controller.ts
- [ ] Integrate consent check into registration flow
- [ ] Add consent UI components
- [ ] Block data processing without valid consent

**Estimated Time**: 16-20 hours

---

### 2.2 Right to Erasure (Account Deletion) - CRITICAL

**DPDP Requirement**: Section 12 - Right to erasure of personal data

**API Endpoints**:
```
POST   /api/me/request-erasure   # Request account deletion (starts grace period)
DELETE /api/me/account           # Confirm deletion
POST   /api/me/cancel-erasure    # Cancel during grace period
```

**Implementation Requirements**:
1. **Grace Period**: 7-day cooling-off period before deletion
2. **Notification**: Email user when deletion is requested and when executed
3. **Cascading Deletion**: Delete all associated data:
   - Personal information
   - Academic records
   - Fee transactions
   - Attendance records
   - Documents/files (S3)
   - Biometric data (face encodings)
   - Audit logs (anonymize, don't delete)
4. **Anonymization Option**: For data required for institutional records

**Data Deletion Checklist**:
- [ ] User profile and credentials
- [ ] Student/Staff records
- [ ] Contact information
- [ ] Addresses
- [ ] Documents (S3 files)
- [ ] Profile photos
- [ ] Biometric data (face encodings)
- [ ] Payment records (anonymize for accounting)
- [ ] Attendance records
- [ ] Academic records
- [ ] Notifications
- [ ] Audit logs (anonymize userId)

**Action Items**:
- [ ] Create account-deletion.service.ts
- [ ] Implement cascading deletion logic
- [ ] Add S3 file deletion
- [ ] Add email notifications
- [ ] Create deletion request UI
- [ ] Test complete data removal

**Estimated Time**: 12-16 hours

---

### 2.3 Children's Data Protection - CRITICAL

**DPDP Requirement**: Section 9 - Processing of children's personal data requires verifiable parental consent

**Current Risk**: Face recognition system processes minors' biometric data without consent.

**Database Schema**:
```prisma
model ParentalConsent {
  id            String    @id @default(cuid())
  studentId     String
  student       Student   @relation(fields: [studentId], references: [id])
  parentId      String
  parent        Parent    @relation(fields: [parentId], references: [id])
  tenantId      String

  consentType   String    // data_processing, biometric, communications, third_party
  grantedAt     DateTime  @default(now())
  expiresAt     DateTime? // Annual renewal recommended
  revokedAt     DateTime?

  verificationMethod String // email, otp, physical_form
  verifiedAt    DateTime?

  @@index([studentId])
  @@index([parentId])
}
```

**Implementation Requirements**:
1. **Age Verification**: Capture DOB during student registration
2. **Minor Detection**: Flag students under 18 years
3. **Parental Consent Flow**:
   - Send consent request to parent email
   - Parent must verify and approve
   - Store consent record
4. **Biometric Restrictions**:
   - Block face enrollment without parental consent
   - Add consent check in `face-recognition.service.ts`

**Action Items**:
- [ ] Add dateOfBirth field to Student model
- [ ] Create ParentalConsent model
- [ ] Implement age calculation utility
- [ ] Create parental consent request flow
- [ ] Add consent verification endpoint
- [ ] Block biometric enrollment for minors without consent
- [ ] Add annual consent renewal reminders

**Estimated Time**: 16-20 hours

---

### 2.4 Privacy Policy Updates - HIGH

**File**: `apps/web/src/app/privacy/page.tsx`

**Required Additions**:
1. **DPDP Compliance Statement**
2. **Data Categories Collected**:
   - Personal identifiers (name, email, phone)
   - Academic records
   - Financial information (fees)
   - Biometric data (face recognition)
   - Usage data
3. **Purpose Limitation**: Specific purposes for each data type
4. **Data Retention Schedule**:
   | Data Type | Retention Period |
   |-----------|------------------|
   | Academic records | 7 years after graduation |
   | Financial records | 8 years (tax compliance) |
   | Biometric data | Until withdrawal or graduation |
   | Audit logs | 3 years |
   | User accounts | Until deletion requested |
5. **Third-Party Disclosures**:
   - AWS (infrastructure)
   - Razorpay (payments)
   - Clerk (authentication)
   - SendGrid (emails)
   - Firebase (notifications)
6. **Data Subject Rights**: How to exercise rights
7. **Grievance Officer Contact**

**Action Items**:
- [ ] Draft updated privacy policy
- [ ] Legal review of policy
- [ ] Implement policy versioning
- [ ] Add policy acceptance tracking
- [ ] Create policy change notification system

**Estimated Time**: 8-10 hours

---

### 2.5 Grievance Redressal Mechanism - MEDIUM

**DPDP Requirement**: Section 13 - Grievance redressal

**Database Schema**:
```prisma
model DataProtectionGrievance {
  id                String    @id @default(cuid())

  // Complainant (can be anonymous)
  userId            String?
  user              User?     @relation(fields: [userId], references: [id])
  email             String    // Required even for anonymous

  // Grievance details
  type              String    // data_breach, unauthorized_access, consent, erasure, other
  description       String
  attachments       String[]  // S3 URLs

  // Resolution tracking
  status            String    @default("filed") // filed, acknowledged, investigating, resolved, closed
  assignedTo        String?   // DPO or staff member
  acknowledgedAt    DateTime?
  resolvedAt        DateTime?
  resolutionDetails String?

  tenantId          String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([status])
  @@index([type])
}
```

**API Endpoints**:
```
POST   /api/grievance            # File grievance
GET    /api/grievance/:id        # Check status
GET    /api/admin/grievances     # Admin: List all grievances
PATCH  /api/admin/grievances/:id # Admin: Update status
```

**Requirements**:
- Acknowledge within 48 hours
- Resolve within 30 days
- Email notifications at each stage
- Escalation path to Data Protection Board

**Action Items**:
- [ ] Create grievance module
- [ ] Design grievance filing UI
- [ ] Implement email notifications
- [ ] Create admin grievance dashboard
- [ ] Document escalation procedures

**Estimated Time**: 10-12 hours

---

### 2.6 Data Breach Notification System - MEDIUM

**DPDP Requirement**: Section 8 - Notify Data Protection Board and affected users within 72 hours

**Implementation**:
```typescript
// breach-notification.service.ts
@Injectable()
export class BreachNotificationService {
  async reportBreach(breach: BreachDetails) {
    // 1. Log breach internally
    await this.auditService.logSecurityIncident(breach);

    // 2. Notify Data Protection Board (when mechanism available)
    await this.notifyDPB(breach);

    // 3. Notify affected users
    await this.notifyAffectedUsers(breach);

    // 4. Alert internal security team
    await this.alertSecurityTeam(breach);
  }
}
```

**Action Items**:
- [ ] Create breach notification module
- [ ] Implement affected user identification
- [ ] Create breach notification email template
- [ ] Set up security incident logging
- [ ] Document incident response procedures
- [ ] Create breach notification UI for admins

**Estimated Time**: 8-10 hours

---

## 3. Testing Infrastructure (Week 3-4)

### 3.1 Unit Tests - HIGH

**Target Coverage**: 60%+ for critical modules

**Priority Modules**:
| Module | Priority | Target Coverage |
|--------|----------|-----------------|
| auth.service.ts | Critical | 90% |
| consent.service.ts | Critical | 90% |
| payment.service.ts | Critical | 95% |
| face-recognition.service.ts | High | 80% |
| student.service.ts | High | 70% |
| tenant.service.ts | High | 80% |

**Action Items**:
- [ ] Configure Jest with coverage thresholds
- [ ] Write auth service tests
- [ ] Write payment service tests
- [ ] Write consent service tests
- [ ] Write tenant isolation tests
- [ ] Set up CI to run tests on PR

**Estimated Time**: 30-40 hours

---

### 3.2 Integration Tests - HIGH

**Priority Test Scenarios**:
1. **Authentication Flow**:
   - Registration with consent
   - Login with rate limiting
   - Password reset
   - Token refresh

2. **Multi-Tenant Isolation**:
   - User from Tenant A cannot access Tenant B data
   - Cross-tenant API calls rejected
   - Cache isolation between tenants

3. **Payment Processing**:
   - Razorpay order creation
   - Webhook signature verification
   - Payment status updates

4. **Data Deletion**:
   - Account deletion cascades correctly
   - S3 files deleted
   - Audit logs anonymized

**Action Items**:
- [ ] Set up test database
- [ ] Write authentication integration tests
- [ ] Write tenant isolation tests
- [ ] Write payment integration tests
- [ ] Write data deletion tests

**Estimated Time**: 20-25 hours

---

### 3.3 E2E Tests - MEDIUM

**Priority Workflows**:
1. Student registration → consent → login → dashboard
2. Fee payment end-to-end
3. Face recognition enrollment (with consent)
4. Account deletion workflow
5. Admin user management

**Action Items**:
- [ ] Set up Playwright/Cypress
- [ ] Write critical workflow tests
- [ ] Integrate with CI/CD

**Estimated Time**: 15-20 hours

---

## 4. Documentation & Monitoring (Week 4-5)

### 4.1 API Documentation - HIGH

**Tool**: @nestjs/swagger

**Action Items**:
- [ ] Install and configure Swagger
- [ ] Add decorators to all controllers
- [ ] Document all DTOs
- [ ] Add authentication documentation
- [ ] Deploy Swagger UI at `/api/docs`

**Estimated Time**: 8-10 hours

---

### 4.2 Operational Runbooks - MEDIUM

**Documents to Create**:
1. **deployment-guide.md** - Step-by-step deployment
2. **troubleshooting-guide.md** - Common issues and solutions
3. **security-incident-response.md** - Breach response procedures
4. **backup-restore-guide.md** - Data recovery procedures
5. **scaling-guide.md** - How to scale infrastructure

**Action Items**:
- [ ] Create deployment guide
- [ ] Create troubleshooting guide
- [ ] Create security incident response plan
- [ ] Create backup/restore procedures
- [ ] Create scaling documentation

**Estimated Time**: 12-15 hours

---

### 4.3 Monitoring & Alerting - MEDIUM

**CloudWatch Metrics to Add**:
- API request rate
- Error rate (4xx, 5xx)
- Response latency (p50, p95, p99)
- Database connections
- Cache hit rate
- Authentication failures

**Alerts to Configure**:
| Metric | Threshold | Action |
|--------|-----------|--------|
| Error rate | >5% | Page on-call |
| Response latency p99 | >3s | Warning |
| Auth failures | >100/hour | Security alert |
| Database connections | >80% | Warning |
| Disk usage | >80% | Warning |

**Action Items**:
- [ ] Set up custom CloudWatch metrics
- [ ] Configure CloudWatch alarms
- [ ] Set up PagerDuty/Slack alerts
- [ ] Create monitoring dashboard
- [ ] Integrate error tracking (Sentry)

**Estimated Time**: 10-12 hours

---

## 5. Pre-Launch Checklist

### Security
- [ ] Database not publicly accessible
- [ ] Database backups enabled (30-day retention)
- [ ] Deletion protection enabled
- [ ] SSH restricted to known IPs
- [ ] All secrets in AWS Secrets Manager
- [ ] All API keys rotated
- [ ] Rate limiting on auth endpoints
- [ ] Global exception filter deployed
- [ ] HTTPS enforced
- [ ] Security headers configured

### DPDP Compliance
- [ ] Consent management implemented
- [ ] Consent collected during registration
- [ ] Account deletion working
- [ ] Parental consent for minors
- [ ] Privacy policy updated
- [ ] Grievance mechanism available
- [ ] Data breach notification ready
- [ ] Data retention policies documented

### Testing
- [ ] Unit test coverage >60%
- [ ] Integration tests passing
- [ ] E2E tests for critical flows
- [ ] Load testing completed
- [ ] Security penetration test completed

### Documentation
- [ ] API documentation live
- [ ] Deployment guide complete
- [ ] Runbooks created
- [ ] Architecture documented

### Monitoring
- [ ] CloudWatch metrics configured
- [ ] Alerts configured
- [ ] Error tracking enabled
- [ ] Log aggregation working

### Legal
- [ ] Privacy policy legal review
- [ ] Terms of service legal review
- [ ] Data processing agreements with vendors
- [ ] DPO appointed (or justified exemption)

---

## 6. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data breach due to public DB | High | Critical | Fix immediately (Week 1) |
| DPDP non-compliance fine | High | High | Implement consent before launch |
| Data loss (no backups) | Medium | Critical | Enable backups (Week 1) |
| Biometric data lawsuit | Medium | High | Parental consent system |
| Service outage | Medium | Medium | Add load balancer, auto-scaling |
| Performance degradation | Medium | Medium | Add database indexes, caching |

---

## Timeline Summary

| Week | Focus Area | Key Deliverables |
|------|------------|------------------|
| Week 1 | Security Fixes | DB security, network hardening, rate limiting |
| Week 2 | DPDP Core | Consent management, account deletion |
| Week 3 | DPDP Extended | Parental consent, privacy policy, grievance |
| Week 4 | Testing | Unit tests, integration tests |
| Week 5 | Polish | Documentation, monitoring, final review |

---

## Appendix A: Quick Reference - File Locations

| Component | File Path |
|-----------|-----------|
| RDS Configuration | `infrastructure/terraform/rds.tf` |
| Security Groups | `infrastructure/terraform/security-groups.tf` |
| Auth Controller | `apps/api/src/modules/auth/auth.controller.ts` |
| Auth Service | `apps/api/src/modules/auth/auth.service.ts` |
| Face Recognition | `apps/api/src/modules/face-recognition/` |
| Prisma Schema | `packages/database/prisma/schema.prisma` |
| Privacy Policy | `apps/web/src/app/privacy/page.tsx` |
| Main Bootstrap | `apps/api/src/main.ts` |
| Security Config | `apps/api/src/common/security/security.config.ts` |
| Audit Service | `apps/api/src/modules/audit/audit.service.ts` |

---

## Appendix B: DPDP Compliance Matrix

| DPDP Section | Requirement | Status | Implementation |
|--------------|-------------|--------|----------------|
| Section 4 | Lawful processing | ⚠️ Partial | Need consent mechanism |
| Section 5 | Notice before collection | ⚠️ Partial | Privacy policy exists |
| Section 6 | Consent | ❌ Missing | Consent module needed |
| Section 7 | Legitimate uses | ✅ OK | Audit logging in place |
| Section 8 | Data breach notification | ❌ Missing | Breach module needed |
| Section 9 | Children's data | ❌ Missing | Parental consent needed |
| Section 11 | Right to access | ⚠️ Partial | Need user-facing export |
| Section 12 | Right to erasure | ❌ Missing | Deletion module needed |
| Section 13 | Grievance redressal | ❌ Missing | Grievance module needed |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-15 | Claude/Quantumlayer | Initial document |

---

**Next Review Date**: January 22, 2026
**Document Owner**: Quantumlayer Platform Team
