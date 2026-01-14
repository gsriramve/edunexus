# EduNexus Deployment Safety & Auto-Remediation System

> **Document Version:** 1.0
> **Created:** 2026-01-14
> **Last Updated:** 2026-01-14
> **Author:** DevOps Team
> **Status:** Implementation In Progress

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Solution Architecture](#solution-architecture)
4. [Component Details](#component-details)
5. [Implementation Guide](#implementation-guide)
6. [Operations Runbook](#operations-runbook)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Cost Analysis](#cost-analysis)
9. [Appendix](#appendix)

---

## Executive Summary

This document describes the **Deployment Safety & Auto-Remediation System** implemented for EduNexus infrastructure. The system prevents server crashes during deployments by:

- Automatically cleaning up Docker resources before/after deployments
- Monitoring Docker-specific metrics (build cache, images, disk usage)
- Auto-remediating when resource thresholds are exceeded
- Capturing system vitals for audit and debugging

### Key Benefits
| Benefit | Impact |
|---------|--------|
| Zero-downtime deployments | Prevents OOM crashes during builds |
| Automatic recovery | Self-healing within 5 minutes of alarm |
| Full audit trail | Vitals captured before/after every deployment |
| Cost efficient | <$1/month additional infrastructure cost |

---

## Problem Statement

### Incident: 2026-01-14

**What Happened:**
- EC2 instance (t3.medium, 4GB RAM) became unresponsive during Docker build
- Docker build cache had accumulated to 17GB
- No swap space configured, leading to OOM condition
- Server required manual force-stop/start to recover

**Root Causes:**
1. No swap space on EC2 instance
2. Docker build cache never cleaned (accumulated over time)
3. `docker build --no-cache` consumed all available RAM
4. No automatic remediation when resources exhausted
5. No pre-deployment safety checks

**Impact:**
- ~30 minutes of downtime
- Manual intervention required
- Lost deployment in progress

---

## Solution Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT SAFETY SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     DEPLOYMENT PIPELINE                           │   │
│  │                                                                   │   │
│  │   GitHub Push ──▶ Pre-Cleanup ──▶ Build/Deploy ──▶ Post-Cleanup  │   │
│  │                        │                               │          │   │
│  │                        ▼                               ▼          │   │
│  │              [Vitals: Before]                  [Vitals: After]    │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                   CONTINUOUS MONITORING                           │   │
│  │                                                                   │   │
│  │   docker-metrics.sh ──▶ CloudWatch Metrics ──▶ Alarms            │   │
│  │         (60s)              │                      │               │   │
│  │                            ▼                      ▼               │   │
│  │                    [Dashboard]           [SNS + Lambda]           │   │
│  │                                                   │               │   │
│  │                                                   ▼               │   │
│  │                                      [Auto-Remediation]           │   │
│  │                                      emergency-cleanup.sh         │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                   SCHEDULED MAINTENANCE                           │   │
│  │                                                                   │   │
│  │   Weekly Timer (Sunday 3 AM IST) ──▶ docker-cleanup.sh           │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
                                    ┌─────────────┐
                                    │   GitHub    │
                                    │   Actions   │
                                    └──────┬──────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
           ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
           │ Pre-Cleanup   │      │    Deploy     │      │ Post-Cleanup  │
           │    Script     │      │   (docker     │      │    Script     │
           │               │      │   compose)    │      │               │
           └───────┬───────┘      └───────────────┘      └───────┬───────┘
                   │                                              │
                   ▼                                              ▼
           ┌───────────────┐                              ┌───────────────┐
           │ Vitals Log    │                              │ Vitals Log    │
           │ (Before)      │                              │ (After)       │
           └───────────────┘                              └───────────────┘


   ┌─────────────────────────────────────────────────────────────────┐
   │                    MONITORING LOOP (Every 60s)                   │
   └─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  docker-metrics.sh  │
                         │  - Build Cache Size │
                         │  - Image Count      │
                         │  - Disk Usage %     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  CloudWatch Metrics │
                         │  (Custom Namespace) │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
     ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
     │ BuildCache >5GB │   │ Disk Usage >75% │   │ Dangling >2GB   │
     │     ALARM       │   │     ALARM       │   │     ALARM       │
     └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
           ┌───────────────┐               ┌───────────────┐
           │      SNS      │               │    Lambda     │
           │ (Email Alert) │               │ (SSM Command) │
           └───────────────┘               └───────┬───────┘
                                                   │
                                                   ▼
                                          ┌───────────────┐
                                          │  Emergency    │
                                          │  Cleanup.sh   │
                                          └───────────────┘
```

---

## Component Details

### 1. Deployment Scripts

| Script | Location | Purpose | Trigger |
|--------|----------|---------|---------|
| `deployment-vitals.sh` | `/usr/local/bin/` | Capture system state | Pre/Post deploy |
| `pre-deployment-cleanup.sh` | `/usr/local/bin/` | Safety cleanup before deploy | GitHub Actions |
| `post-deployment-cleanup.sh` | `/usr/local/bin/` | Cleanup after deploy | GitHub Actions |
| `emergency-cleanup.sh` | `/usr/local/bin/` | Aggressive cleanup | Lambda/Manual |
| `docker-metrics.sh` | `/usr/local/bin/` | Publish Docker metrics to CW | Cron (60s) |
| `docker-cleanup.sh` | `/usr/local/bin/` | Weekly full cleanup | Systemd timer |

### 2. CloudWatch Alarms

| Alarm Name | Metric | Threshold | Action |
|------------|--------|-----------|--------|
| `edunexus-docker-build-cache-high` | BuildCacheSize | >5 GB | SNS + Lambda |
| `edunexus-docker-disk-high` | DiskUsagePercent | >75% | SNS + Lambda |
| `edunexus-docker-image-bloat` | DanglingImageSize | >2 GB | SNS + Lambda |
| `edunexus-ec2-memory-high` | mem_used_percent | >80% | SNS |
| `edunexus-ec2-cpu-high` | CPUUtilization | >80% | SNS |

### 3. Lambda Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `edunexus-auto-remediation` | Run emergency cleanup via SSM | CloudWatch Alarm |
| `edunexus-ec2-start` | Start EC2 instance | CloudWatch Events (8 AM IST) |
| `edunexus-ec2-stop` | Stop EC2 instance | CloudWatch Events (10 PM IST) |

### 4. Infrastructure Hardening

| Component | Configuration | Purpose |
|-----------|---------------|---------|
| Swap Space | 4 GB at `/swapfile` | Prevent OOM during builds |
| Weekly Timer | Sunday 3 AM IST | Scheduled maintenance |
| Log Rotation | 7 days retention | Prevent log bloat |

---

## Implementation Guide

### Prerequisites
- AWS CLI configured with appropriate permissions
- Terraform >= 1.0
- SSH access to EC2 instance
- GitHub repository access

### Step-by-Step Implementation

#### Phase 1: Deployment Scripts
```bash
# 1. SSH to EC2
ssh -i key.pem ec2-user@edu-nexus.co.in

# 2. Create scripts (see Appendix A for full scripts)
sudo nano /usr/local/bin/deployment-vitals.sh
sudo nano /usr/local/bin/pre-deployment-cleanup.sh
sudo nano /usr/local/bin/post-deployment-cleanup.sh
sudo nano /usr/local/bin/emergency-cleanup.sh
sudo nano /usr/local/bin/docker-metrics.sh

# 3. Make executable
sudo chmod +x /usr/local/bin/*.sh

# 4. Test scripts
/usr/local/bin/pre-deployment-cleanup.sh
/usr/local/bin/post-deployment-cleanup.sh
```

#### Phase 2: CloudWatch Metrics
```bash
# 1. Create cron for docker-metrics.sh
echo "* * * * * root /usr/local/bin/docker-metrics.sh" | sudo tee /etc/cron.d/docker-metrics

# 2. Verify metrics in CloudWatch console
aws cloudwatch list-metrics --namespace "EduNexus/Docker"
```

#### Phase 3: Terraform Infrastructure
```bash
cd infrastructure/terraform

# 1. Apply new Terraform configs
terraform plan -out=tfplan
terraform apply tfplan

# 2. Verify alarms created
aws cloudwatch describe-alarms --alarm-name-prefix "edunexus-docker"
```

#### Phase 4: Update CI/CD
```bash
# 1. Update .github/workflows/deploy.yml
# 2. Commit and push
git add .github/workflows/deploy.yml
git commit -m "feat: Add pre/post deployment cleanup steps"
git push
```

---

## Operations Runbook

### Scenario 1: High Disk Usage Alert

**Symptoms:** Email alert "edunexus-docker-disk-high in ALARM"

**Auto-Response:** Lambda triggers `emergency-cleanup.sh`

**Manual Verification:**
```bash
ssh ec2-user@edu-nexus.co.in
df -h /
docker system df
cat /var/log/edunexus/emergency-cleanup.log
```

### Scenario 2: Build Cache Alert

**Symptoms:** Email alert "edunexus-docker-build-cache-high in ALARM"

**Auto-Response:** Lambda triggers `emergency-cleanup.sh`

**Manual Verification:**
```bash
ssh ec2-user@edu-nexus.co.in
docker system df
docker builder prune --dry-run
```

### Scenario 3: Deployment Failure

**Symptoms:** GitHub Actions deploy job failed

**Investigation:**
```bash
# Check vitals logs
ssh ec2-user@edu-nexus.co.in
ls -la /var/log/edunexus/
cat /var/log/edunexus/deployment-vitals-before-*.log
cat /var/log/edunexus/deployment-vitals-after-*.log

# Check Docker status
docker ps -a
docker logs edunexus-web
docker logs edunexus-api
```

### Scenario 4: Manual Emergency Cleanup

**When:** Server is slow but accessible

```bash
ssh ec2-user@edu-nexus.co.in
sudo /usr/local/bin/emergency-cleanup.sh
```

---

## Monitoring & Alerts

### CloudWatch Dashboard

**URL:** `https://ap-south-1.console.aws.amazon.com/cloudwatch/home?region=ap-south-1#dashboards:name=edunexus-demo-dashboard`

**Widgets:**
- EC2 CPU, Memory, Disk
- Docker Build Cache Size
- Docker Disk Usage
- Alarm Status

### Alert Recipients

| Alert Type | Recipients | Method |
|------------|------------|--------|
| All Alarms | DevOps Team | Email via SNS |
| Critical (Disk >90%) | On-Call | Email + SMS (future) |

### Log Locations

| Log | Path | Retention |
|-----|------|-----------|
| Deployment Vitals | `/var/log/edunexus/deployment-vitals-*.log` | 30 days |
| Emergency Cleanup | `/var/log/edunexus/emergency-cleanup.log` | 30 days |
| Docker Cleanup | `/var/log/docker-cleanup.log` | 30 days |
| System Logs | CloudWatch `/edunexus/ec2/system` | 7 days |
| Docker Logs | CloudWatch `/edunexus/ec2/docker` | 7 days |

---

## Cost Analysis

### Monthly Cost Breakdown

| Component | Cost | Notes |
|-----------|------|-------|
| CloudWatch Custom Metrics | $0.30 | 3 metrics × $0.10 |
| Lambda Invocations | $0.00 | Free tier (rare triggers) |
| SSM Commands | $0.00 | Included |
| CloudWatch Logs | $0.50 | ~1 GB/month |
| SNS Notifications | $0.00 | Free tier |
| **Total** | **~$0.80/month** | |

### Cost Savings

| Savings Source | Monthly Savings |
|----------------|-----------------|
| Prevented Downtime | ~$50 (estimated) |
| Reduced Manual Intervention | ~$100 (ops time) |
| EC2 Scheduler (existing) | ~$20 (60% off-hours) |

---

## Appendix

### Appendix A: Script Templates

See individual script files in `/usr/local/bin/` on EC2 instance.

### Appendix B: Terraform Files

| File | Purpose |
|------|---------|
| `cloudwatch-docker.tf` | Docker-specific alarms |
| `auto-remediation.tf` | Lambda for auto-cleanup |
| `cloudwatch.tf` | Base CloudWatch config |
| `ec2-scheduler.tf` | EC2 start/stop scheduler |

### Appendix C: Related Documents

| Document | Location |
|----------|----------|
| Implementation Tracker | `docs/IMPLEMENTATION-TRACKER.md` |
| AWS Architecture | `docs/AWS-ARCHITECTURE.md` |
| Runbook | `docs/RUNBOOK.md` |
| CI/CD Pipeline | `.github/workflows/deploy.yml` |

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-14 | DevOps | Initial document |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Author | Claude (AI Assistant) | 2026-01-14 | ✓ |
| Reviewer | - | - | - |
| Approver | - | - | - |
