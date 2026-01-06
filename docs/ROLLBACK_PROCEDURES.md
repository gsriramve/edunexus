# EduNexus Rollback Procedures

> **Last Updated:** January 2026
> **Critical Document:** Keep accessible during all deployments

---

## Quick Reference

| Rollback Type | Time to Complete | Risk Level | When to Use |
|---------------|------------------|------------|-------------|
| Kubernetes Rollback | 2-5 minutes | Low | Application bugs, crashes |
| Config Rollback | 5-10 minutes | Low | Environment variable issues |
| Database Rollback | 15-60 minutes | High | Migration failures, data corruption |
| Full Restore | 1-2 hours | Critical | Catastrophic failure |

---

## 1. Kubernetes Application Rollback

### Symptoms Requiring Rollback
- Pods crashing repeatedly (CrashLoopBackOff)
- Health checks failing
- Error rate spike > 5%
- Significant latency increase (> 2x baseline)

### Procedure

```bash
# Step 1: Check current deployment status
kubectl get deployments -n edunexus-production
kubectl rollout history deployment/edunexus-api -n edunexus-production

# Step 2: Rollback to previous version
kubectl rollout undo deployment/edunexus-api -n edunexus-production
kubectl rollout undo deployment/edunexus-web -n edunexus-production

# Step 3: Verify rollback
kubectl rollout status deployment/edunexus-api -n edunexus-production
kubectl get pods -n edunexus-production

# Step 4: Verify application health
curl https://api.edunexus.io/health
```

### Rollback to Specific Version

```bash
# List revision history
kubectl rollout history deployment/edunexus-api -n edunexus-production

# Rollback to specific revision
kubectl rollout undo deployment/edunexus-api --to-revision=3 -n edunexus-production
```

---

## 2. Database Migration Rollback

### Before Attempting Database Rollback

⚠️ **CRITICAL CHECKS:**
1. Is the migration data-destructive? (DROP, TRUNCATE, DELETE)
2. Have new records been created with new schema?
3. Is a point-in-time restore needed?

### Option A: Manual SQL Rollback (Preferred for Simple Migrations)

Each migration in `packages/database/MIGRATIONS.md` includes rollback SQL.

```bash
# Step 1: Connect to database
psql $DATABASE_URL

# Step 2: Execute rollback SQL for specific migration
# Example: Rolling back add_device_tokens migration

-- Remove foreign key
ALTER TABLE "device_tokens"
DROP CONSTRAINT IF EXISTS "device_tokens_userId_fkey";

-- Drop indexes
DROP INDEX IF EXISTS "device_tokens_token_key";
DROP INDEX IF EXISTS "device_tokens_tenantId_idx";
DROP INDEX IF EXISTS "device_tokens_userId_idx";

-- Drop table
DROP TABLE IF EXISTS "device_tokens";

-- Update Prisma migration table
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20260106122430_add_device_tokens';

# Step 3: Verify rollback
\dt device_tokens  # Should not exist

# Step 4: Generate Prisma client without the migration
cd packages/database
npx prisma generate
```

### Option B: Point-in-Time Recovery (for Data Loss)

```bash
# Step 1: Get available restore points
aws rds describe-db-cluster-snapshots \
  --db-cluster-identifier edunexus-production

# Step 2: Create new instance from snapshot
aws rds restore-db-cluster-to-point-in-time \
  --source-db-cluster-identifier edunexus-production \
  --db-cluster-identifier edunexus-recovery \
  --restore-to-time "2026-01-06T10:00:00Z" \
  --restore-type full-copy

# Step 3: Wait for instance to be available
aws rds wait db-cluster-available \
  --db-cluster-identifier edunexus-recovery

# Step 4: Update application to use recovery instance
# Update DATABASE_URL in AWS Secrets Manager

# Step 5: Verify data integrity
psql $RECOVERY_DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### Option C: Restore from Snapshot

```bash
# Step 1: List available snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier edunexus-production

# Step 2: Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier edunexus-restored \
  --db-snapshot-identifier edunexus-pre-deploy-20260106

# Step 3: Update DNS/connection strings
# This requires downtime
```

---

## 3. Configuration Rollback

### Environment Variables (AWS Secrets Manager)

```bash
# Step 1: List secret versions
aws secretsmanager list-secret-version-ids \
  --secret-id edunexus/production/api

# Step 2: Get previous version
aws secretsmanager get-secret-value \
  --secret-id edunexus/production/api \
  --version-stage AWSPREVIOUS

# Step 3: Restore previous version
aws secretsmanager update-secret \
  --secret-id edunexus/production/api \
  --secret-string '[previous secret value]'

# Step 4: Restart pods to pick up new config
kubectl rollout restart deployment/edunexus-api -n edunexus-production
```

---

## 4. Emergency Contacts & Escalation

### Severity Levels

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| P1 | Service down, data loss | 15 minutes | All hands |
| P2 | Major feature broken | 1 hour | Tech lead + DevOps |
| P3 | Minor issues | 4 hours | On-call engineer |
| P4 | Cosmetic issues | Next business day | Ticket queue |

### Escalation Path

```
1. On-call Engineer
   ↓ (15 min no response or P1)
2. Technical Lead
   ↓ (30 min no resolution)
3. CTO / Engineering Manager
   ↓ (Critical data breach)
4. CEO + Legal
```

---

## 5. Post-Rollback Checklist

After any rollback:

- [ ] Application health verified
- [ ] Error rates returned to baseline
- [ ] Incident documented
- [ ] Root cause identified
- [ ] Prevention measures planned
- [ ] Stakeholders notified
- [ ] Post-mortem scheduled (for P1/P2)

---

## 6. Common Rollback Scenarios

### Scenario: API Deployment Broke Authentication

```bash
# Quick check
curl -I https://api.edunexus.io/health
# Returns 500 or authentication errors

# Rollback
kubectl rollout undo deployment/edunexus-api -n edunexus-production

# Verify
curl -I https://api.edunexus.io/health
# Should return 200
```

### Scenario: Migration Added Column But App Doesn't Use It

```bash
# This is typically safe - no rollback needed
# New column is nullable, existing code ignores it
# Just fix forward in next deployment
```

### Scenario: Migration Dropped Required Column

```bash
# CRITICAL - Point-in-time recovery needed
# 1. Stop all writes immediately
kubectl scale deployment/edunexus-api --replicas=0 -n edunexus-production

# 2. Restore from pre-migration backup
# Follow "Option C: Restore from Snapshot" above

# 3. Re-deploy previous application version
kubectl rollout undo deployment/edunexus-api -n edunexus-production

# 4. Scale back up
kubectl scale deployment/edunexus-api --replicas=3 -n edunexus-production
```

### Scenario: Environment Variable Misconfigured

```bash
# Check current config
kubectl get secret edunexus-secrets -n edunexus-production -o yaml

# Update secret
kubectl edit secret edunexus-secrets -n edunexus-production
# OR
kubectl create secret generic edunexus-secrets \
  --from-env-file=.env.production \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart pods
kubectl rollout restart deployment/edunexus-api -n edunexus-production
```

---

## 7. Rollback Prevention Best Practices

1. **Always deploy to staging first** - Test migrations and changes
2. **Use feature flags** - Deploy code before enabling features
3. **Blue-green deployments** - Zero-downtime deployments
4. **Database backups before migrations** - Automated via CI/CD
5. **Canary releases** - Roll out to subset of traffic first
6. **Monitoring and alerting** - Catch issues before users report
