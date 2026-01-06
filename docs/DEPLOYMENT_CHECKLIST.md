# EduNexus Deployment Checklist

> **Last Updated:** January 2026
> **Target Cloud:** AWS (ap-south-1 Mumbai)

---

## Pre-Deployment Checklist

### 1. Code & Repository

- [ ] All tests passing in CI (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] No merge conflicts with target branch
- [ ] PR approved by at least one reviewer
- [ ] Security scan completed (no critical vulnerabilities)

### 2. Database Migrations

- [ ] All migrations tested on staging first
- [ ] Migration files present in `packages/database/prisma/migrations/`
- [ ] `prisma migrate status` shows no pending migrations on staging
- [ ] Migration rollback SQL documented (see `MIGRATIONS.md`)
- [ ] Database backup created before production migration

### 3. Environment Configuration

- [ ] All required environment variables set in AWS Secrets Manager
- [ ] `.env.example` up to date with new variables
- [ ] Clerk authentication configured for environment
- [ ] Razorpay keys configured (test vs production)
- [ ] SendGrid API key configured
- [ ] MSG91 credentials configured
- [ ] Firebase credentials configured

### 4. Infrastructure

- [ ] AWS resources provisioned via Terraform
- [ ] Kubernetes namespace exists
- [ ] Load balancer configured
- [ ] SSL certificates valid
- [ ] DNS records updated (if needed)
- [ ] Redis cluster healthy
- [ ] PostgreSQL RDS available

### 5. Monitoring & Alerting

- [ ] CloudWatch alarms configured
- [ ] Error tracking (Sentry) configured
- [ ] Log aggregation working
- [ ] Health check endpoints responding

---

## Deployment Steps

### Step 1: Notify Stakeholders

```bash
# Send notification to team
# - Expected downtime (if any)
# - Features/fixes being deployed
# - Rollback plan
```

### Step 2: Database Migration (if needed)

```bash
# 1. Create database backup
aws rds create-db-snapshot \
  --db-instance-identifier edunexus-production \
  --db-snapshot-identifier edunexus-pre-deploy-$(date +%Y%m%d)

# 2. Verify backup completed
aws rds describe-db-snapshots \
  --db-snapshot-identifier edunexus-pre-deploy-$(date +%Y%m%d)

# 3. Run migrations
cd packages/database
DATABASE_URL=$PRODUCTION_DATABASE_URL npx prisma migrate deploy

# 4. Verify migrations applied
DATABASE_URL=$PRODUCTION_DATABASE_URL npx prisma migrate status
```

### Step 3: Deploy Application

```bash
# Option A: GitHub Actions (Recommended)
# Push to main branch or trigger workflow_dispatch

# Option B: Manual kubectl
cd infrastructure/kubernetes/overlays/production
kustomize build . | kubectl apply -f -
```

### Step 4: Verify Deployment

```bash
# 1. Check pod status
kubectl get pods -n edunexus-production

# 2. Check deployment rollout
kubectl rollout status deployment/edunexus-api -n edunexus-production
kubectl rollout status deployment/edunexus-web -n edunexus-production

# 3. Check logs for errors
kubectl logs -l app=edunexus-api -n edunexus-production --tail=100

# 4. Test health endpoints
curl https://api.edunexus.io/health
curl https://app.edunexus.io/api/health
```

### Step 5: Smoke Tests

- [ ] Platform admin can login
- [ ] Can access platform dashboard
- [ ] Can view tenant list
- [ ] Student can login to demo tenant
- [ ] Fee payment flow works (use test card)
- [ ] Email notifications sending
- [ ] Push notifications working

---

## Post-Deployment Checklist

### Immediate (0-15 minutes)

- [ ] All health checks passing
- [ ] No error spikes in monitoring
- [ ] API response times normal (<500ms p99)
- [ ] No increase in error rates

### Short-term (15-60 minutes)

- [ ] Monitor error logs for new issues
- [ ] Check database connection pool utilization
- [ ] Verify background job processing (Bull queues)
- [ ] Test critical user flows

### Follow-up (1-24 hours)

- [ ] Review performance metrics
- [ ] Address any reported issues
- [ ] Update deployment documentation if needed
- [ ] Close deployment ticket/PR

---

## Rollback Procedure

### Quick Rollback (Kubernetes)

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/edunexus-api -n edunexus-production
kubectl rollout undo deployment/edunexus-web -n edunexus-production

# Verify rollback
kubectl rollout status deployment/edunexus-api -n edunexus-production
```

### Database Rollback (if needed)

See `docs/ROLLBACK_PROCEDURES.md` for detailed database rollback steps.

---

## Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| Technical Lead | [TBD] | On-call |
| DBA | [TBD] | On-call |
| DevOps | [TBD] | On-call |
| Product Owner | [TBD] | Business hours |

---

## Deployment Log Template

```markdown
## Deployment: [Date]

**Deployer:** [Name]
**Environment:** Production
**Version:** [Tag/Commit SHA]
**Start Time:** HH:MM
**End Time:** HH:MM

### Changes Deployed
- Feature: [Description]
- Fix: [Description]

### Issues Encountered
- None / [Description and resolution]

### Post-Deployment Status
- [ ] Health checks passing
- [ ] Smoke tests passing
- [ ] No error spikes
```
