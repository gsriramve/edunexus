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

### DPDP Compliance: 4/10
**Critical gaps:**
- No consent management system
- No account deletion (right to erasure)
- No parental consent for minors (children's biometric data risk)
- No grievance redressal mechanism
- No data breach notification system

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

## Next Steps
See `PRODUCTION-ROADMAP.md` for detailed 5-week plan:
- Week 1: Security fixes
- Week 2-3: DPDP compliance (consent, erasure, parental consent)
- Week 3-4: Testing (60%+ coverage)
- Week 4-5: Documentation & monitoring

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
