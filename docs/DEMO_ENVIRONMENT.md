# EduNexus Demo Environment Guide

**Last Updated:** January 2026
**Environment URL:** http://15.206.243.177

---

## Executive Summary

This document covers the EduNexus demo environment setup, costs, and usage guidelines for sales demos and college playground access.

---

## Environment Details

| Component | Specification | Status |
|-----------|--------------|--------|
| **Server** | AWS EC2 t3.small (2 vCPU, 2GB RAM) | Running |
| **Database** | AWS RDS PostgreSQL db.t3.micro | Running |
| **Region** | ap-south-1 (Mumbai) | Active |
| **URL** | http://15.206.243.177 | Live |
| **SSL/HTTPS** | Pending domain configuration | - |

---

## Monthly Cost Breakdown

### Current Costs (Demo Environment)

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| EC2 (t3.small) | $15-18 | Running 24/7 |
| RDS (db.t3.micro) | $0 | Free Tier (first 12 months) |
| S3 Storage | $1-2 | Minimal usage |
| Data Transfer | $2-5 | Light demo traffic |
| AI Services | $0 | Not enabled |
| **TOTAL** | **$20-25/month** | Maximum estimate |

### After Free Tier (12+ months)

| Service | Additional Cost |
|---------|----------------|
| RDS | +$15/month |
| **New Total** | ~$35-40/month |

### AI Services (If Enabled Later)

| Service | Pricing | Estimated Usage |
|---------|---------|-----------------|
| OpenAI GPT-4 Turbo | $0.01-0.03/1K tokens | $50-200/month |
| Anthropic Claude | $0.003-0.015/1K tokens | $20-100/month |
| AWS Rekognition | $1/1K images | $30-100/month |

**Current Status:** AI features are disabled. No AI costs are incurred.

---

## Test Colleges & Accounts

### College 1: Nexus Engineering College

| Role | Email | Password |
|------|-------|----------|
| Principal | principal@nexus-ec.edu | Nexus@1104 |
| HOD (CSE) | hod.cse@nexus-ec.edu | Nexus@1104 |
| Admin Staff | admin@nexus-ec.edu | Nexus@1104 |
| Teacher | teacher@nexus-ec.edu | Nexus@1104 |
| Lab Assistant | lab@nexus-ec.edu | Nexus@1104 |
| Student | student@nexus-ec.edu | Nexus@1104 |
| Parent | parent@nexus-ec.edu | Nexus@1104 |

### College 2: Quantum Institute of Technology

| Role | Email | Password |
|------|-------|----------|
| Principal | principal@quantum-it.edu | Nexus@1104 |
| HOD (CSE) | hod.cse@quantum-it.edu | Nexus@1104 |
| Admin Staff | admin@quantum-it.edu | Nexus@1104 |
| Teacher | teacher@quantum-it.edu | Nexus@1104 |
| Lab Assistant | lab@quantum-it.edu | Nexus@1104 |
| Student | student@quantum-it.edu | Nexus@1104 |
| Parent | parent@quantum-it.edu | Nexus@1104 |

### College 3: Careerfied Academy

| Role | Email | Password |
|------|-------|----------|
| Principal | principal@careerfied.edu | Nexus@1104 |
| HOD (CSE) | hod.cse@careerfied.edu | Nexus@1104 |
| Admin Staff | admin@careerfied.edu | Nexus@1104 |
| Teacher | teacher@careerfied.edu | Nexus@1104 |
| Lab Assistant | lab@careerfied.edu | Nexus@1104 |
| Student | student@careerfied.edu | Nexus@1104 |
| Parent | parent@careerfied.edu | Nexus@1104 |

---

## Test Data Summary

| Metric | Value |
|--------|-------|
| Total Colleges | 3 |
| Total Users | 958 |
| Total Students | 900 (300 per college) |
| Departments per College | 5 (CSE, IT, ECE, EEE, MECH) |
| Batches | 4 per college |
| Test Accounts | 21 (7 roles × 3 colleges) |

---

## Tenant Isolation (Verified)

Each college's data is completely isolated:

| Data Type | Isolation Status |
|-----------|------------------|
| Students | ✅ Isolated per college |
| Staff | ✅ Isolated per college |
| Fees | ✅ Isolated per college |
| Attendance | ✅ Isolated per college |
| Reports | ✅ Isolated per college |

**Verification:** E2E tests confirmed that logging in as Principal from different colleges shows completely different student lists.

---

## Playground Usage Guidelines

### Who Can Use This Environment?

- ✅ Sales team for demos
- ✅ Prospective colleges for evaluation
- ✅ Internal testing and training
- ✅ Feature demonstrations

### Capacity Limits

| Resource | Limit | Recommendation |
|----------|-------|----------------|
| Concurrent Users | 10-20 | Sufficient for demos |
| Data Storage | 20GB | Plenty for test data |
| API Requests | Unlimited | Fair use |

### Best Practices

1. **Don't delete test accounts** - They're linked to Clerk authentication
2. **Use test data freely** - Add students, fees, attendance as needed
3. **Each college is independent** - Changes in one don't affect others
4. **Reset if needed** - Contact admin to reseed data

---

## Features Available for Demo

### Working Features (No AI Required)

| Module | Features |
|--------|----------|
| **Principal Dashboard** | College overview, departments, staff, students, fees |
| **HOD Dashboard** | Department management, faculty, curriculum |
| **Admin Dashboard** | Admissions, fees, documents, library, transport |
| **Teacher Dashboard** | Classes, attendance, marks, assignments |
| **Student Dashboard** | Academics, attendance, fees, timetable |
| **Parent Dashboard** | Child's academics, attendance, fees, communication |
| **Lab Assistant** | Equipment, attendance, marks |

### Features Requiring AI (Currently Disabled)

| Feature | Service Required | Status |
|---------|-----------------|--------|
| AI Question Generation | OpenAI/Anthropic | Disabled |
| AI Career Insights | OpenAI/Anthropic | Disabled |
| Face Recognition Attendance | AWS Rekognition | Disabled |

---

## Security Notes

### Current Security Status (Demo)

| Item | Status | Production Recommendation |
|------|--------|--------------------------|
| HTTPS/SSL | ❌ Not configured | Required |
| RDS Public Access | ⚠️ Enabled | Disable |
| SSH Access | ⚠️ Open (0.0.0.0/0) | Restrict to VPN |
| Clerk Mode | Development | Production mode |

### Acceptable for Demo

The current security configuration is acceptable for:
- Internal demos
- Controlled playground access
- Sales presentations

**NOT recommended for:**
- Real student data
- Production workloads
- Public access without SSL

---

## Pending Items

### Before Production

1. [ ] Configure custom domain
2. [ ] Enable SSL/HTTPS
3. [ ] Disable RDS public access
4. [ ] Restrict SSH to VPN
5. [ ] Upgrade Clerk to production
6. [ ] Configure real API keys (if AI needed)
7. [ ] Set up monitoring and alerts
8. [ ] Enable RDS backups

### Optional Enhancements

1. [ ] Custom email domain
2. [ ] CDN for static assets
3. [ ] Auto-scaling configuration
4. [ ] Disaster recovery setup

---

## Support & Contacts

| Issue | Action |
|-------|--------|
| Can't login | Check email/password, clear cookies |
| Data issues | Contact admin for reseed |
| Performance issues | Reduce concurrent users |
| Feature questions | Refer to user documentation |

---

## AWS Infrastructure Details

| Resource | Identifier |
|----------|------------|
| EC2 Instance | 15.206.243.177 |
| RDS Endpoint | edunexus-demo-postgres.cvi02c06krh6.ap-south-1.rds.amazonaws.com |
| S3 Uploads | edunexus-demo-uploads-* |
| S3 Backups | edunexus-demo-backups-* |
| Region | ap-south-1 (Mumbai) |

---

## Quick Start for Sales Team

1. **Open browser:** http://15.206.243.177
2. **Click "Sign In"**
3. **Use any test account** (see credentials above)
4. **Explore the role-specific dashboard**
5. **Switch colleges** by logging out and using different college credentials

### Demo Flow Suggestion

1. Start as **Principal** (show college overview)
2. Switch to **HOD** (show department management)
3. Switch to **Teacher** (show attendance, marks)
4. Switch to **Student** (show student experience)
5. Switch to **Parent** (show parent portal)
6. Emphasize **tenant isolation** (different colleges = different data)

---

*Document generated: January 2026*
*Environment maintained by: DevOps Team*
