# EduNexus Project Context

## Product Overview
- **Product**: EduNexus - AI-Powered College Management Platform
- **Owner**: Quantumlayer Platform
- **Live URL**: https://edu-nexus.co.in
- **Repository**: https://github.com/gsriramve/edunexus

## Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: NestJS, Node.js, REST APIs
- **Database**: PostgreSQL (RDS), Prisma ORM, Redis Cache
- **AI/ML**: Python, FastAPI, OpenAI, AWS Rekognition
- **Cloud**: AWS (ECS, RDS ap-south-1, S3, CloudFront, ALB)
- **Auth**: Clerk

## Architecture
- Multi-tenant SaaS platform
- 9 role-based portals: Platform Owner, Principal, HOD, Admin Staff, Teacher, Lab Assistant, Student, Parent, Alumni
- 3 demo colleges seeded: Nexus Engineering, Quantum IT, Careerfied

## Test Accounts (All use password: Nexus@1104)
| Role | Email |
|------|-------|
| Platform Owner | admin@edunexus.io |
| Principal | principal@nexus-ec.edu |
| HOD | hod.cse@nexus-ec.edu |
| Admin Staff | admin@nexus-ec.edu |
| Teacher | teacher@nexus-ec.edu |
| Lab Assistant | lab@nexus-ec.edu |
| Student | student@nexus-ec.edu |
| Parent | parent@nexus-ec.edu |
| Alumni | alumni@nexus-ec.edu |

## Current Status (as of Jan 2026)

### Production Readiness: 55%
**Critical issues to fix:**
- Database publicly accessible (`infrastructure/terraform/rds.tf:52`)
- No database backups (`backup_retention_period = 0`)
- No deletion protection on RDS
- SSH open to 0.0.0.0/0
- ~1% test coverage (target: 60%+)

### DPDP Compliance: 7/10 (Substantially Compliant)
**What's in place:**
- Data localization (AWS Mumbai ap-south-1) ✅
- Comprehensive audit logging ✅
- Privacy policy page ✅
- Multi-tenant data isolation ✅
- HTTPS enforced ✅
- Role-based access control (9 roles) ✅
- Data retention controls ✅

**Recommended enhancements (future):**
- Explicit consent toggles in user settings
- Self-service account deletion button
- Parent consent workflow in enrollment

### What's Working Well
- Strong RBAC with 9 roles
- Multi-tenant isolation
- Excellent audit logging system
- Data localization (AWS Mumbai)
- All 9 personas login and navigate successfully
- Page load times under 2 seconds

## Key Files
| Purpose | Path |
|---------|------|
| RDS Config | `infrastructure/terraform/rds.tf` |
| Security Groups | `infrastructure/terraform/security-groups.tf` |
| Auth Service | `apps/api/src/modules/auth/auth.service.ts` |
| Prisma Schema | `packages/database/prisma/schema.prisma` |
| Privacy Policy | `apps/web/src/app/privacy/page.tsx` |
| Face Recognition | `apps/api/src/modules/face-recognition/` |
| Production Roadmap | `PRODUCTION-ROADMAP.md` |

## Deployment
- **Docker Compose**: `docker-compose --profile app up -d`
- **Server**: EC2 with Docker
- **API URL Detection**: Dynamic from `window.location` (fixed SSL issue by removing `NEXT_PUBLIC_API_URL` from build args)

## Recent Fixes (Jan 2026)
1. Fixed data loading issue - API calls were going to port 3001 without SSL
2. Ran QA tests for all 9 personas - 8/9 passed
3. Seeded test data across 3 colleges
4. Created sales deck (12 slides) with Quantumlayer branding

## Current Readiness (Updated Jan 23, 2026)
| Use Case | Status |
|----------|--------|
| Sales demos | ✅ READY |
| Pilot with test data | ✅ READY |
| Production with real data | 🟡 NEEDS SECURITY HARDENING |
| DPDP compliant | ✅ SUBSTANTIALLY COMPLIANT |

## Business Planning Documents
| Document | Path |
|----------|------|
| Strategic Plan | `docs/STRATEGIC-PLAN.md` |
| Execution Tracker | `docs/EXECUTION-TRACKER.md` |
| Sales Materials | `docs/sales/` |

## Prioritized Next Steps (TO DO LATER)

### Phase 1: Critical Security Fixes (Week 1) - ~15 hours
| Task | File | Priority |
|------|------|----------|
| Make DB private | `infrastructure/terraform/rds.tf:52` | CRITICAL |
| Enable DB backups (30 days) | `infrastructure/terraform/rds.tf:55` | CRITICAL |
| Enable deletion protection | `infrastructure/terraform/rds.tf:64` | CRITICAL |
| Restrict SSH to VPN/office IPs | `infrastructure/terraform/security-groups.tf:25` | HIGH |
| Add rate limiting on auth | `apps/api/src/modules/auth/auth.controller.ts` | HIGH |
| Rotate all API keys | `.env`, Secrets Manager | HIGH |

### Phase 2: DPDP Enhancements (Optional) - ~30 hours
| Task | DPDP Section | Priority | Hours |
|------|--------------|----------|-------|
| Explicit consent toggles | Section 6 | LOW | 8-10 |
| Self-service account deletion | Section 12 | LOW | 8-10 |
| Parent consent workflow | Section 9 | MEDIUM | 10-12 |

Note: Core DPDP requirements are already met (data localization, audit logging, privacy policy, RBAC, encryption).

### Phase 3: Testing (Week 3-4) - ~55 hours
| Task | Target | Hours |
|------|--------|-------|
| Unit tests (auth, payment, consent) | 60% coverage | 30-40 |
| Integration tests (multi-tenant, payments) | Critical flows | 15-20 |

### Phase 4: Documentation & Monitoring (Week 4-5) - ~30 hours
| Task | Hours |
|------|-------|
| API documentation (Swagger) | 8-10 |
| Operational runbooks | 12-15 |
| CloudWatch monitoring & alerts | 10-12 |

**Total Estimated Effort: 140-200 hours (3-5 weeks)**

See `PRODUCTION-ROADMAP.md` for detailed implementation guides.

## Commands
```bash
# Local development
docker-compose up -d                    # Infrastructure only
docker-compose --profile app up -d      # Full stack

# Database
npx prisma migrate dev                  # Run migrations
npx prisma db seed                      # Seed data

# QA Testing
node scripts/qa-test-personas.js        # Run all persona tests

# Deploy to server
ssh -i key.pem ec2-user@<server>
cd edunexus && docker-compose --profile app up -d --build
```
