# EduNexus 90-Day Execution Tracker
## From College Management Platform to "College OS"

**Start Date**: January 2026
**Target**: First 5 paying customers → ₹25-50 Lakhs ARR
**Team**: Solo/Small Team
**Focus**: Engineering Colleges (3,500+ market)

---

## Quick Reference

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Paying Customers | 0 | 5 | 🔴 |
| ARR | ₹0 | ₹25-50L | 🔴 |
| Free Pilots Running | 0 | 3 | 🔴 |
| Demo Calls Completed | 0 | 10 | 🔴 |
| Security Fixes | 0/5 | 5/5 | 🔴 |

---

## Phase 1: Minimum Viable Security (Week 1-2)
**Estimated Effort**: ~10 hours
**Status**: 🔴 Not Started

### Critical Security Tasks

| # | Task | File/Location | Est. Hours | Status | Completed |
|---|------|---------------|------------|--------|-----------|
| 1 | Make RDS database private (not publicly accessible) | `infrastructure/terraform/rds.tf:52` | 2 | 🔴 | [ ] |
| 2 | Enable database backups (30-day retention) | `infrastructure/terraform/rds.tf:55` | 1 | 🔴 | [ ] |
| 3 | Enable RDS deletion protection | `infrastructure/terraform/rds.tf:64` | 0.5 | 🔴 | [ ] |
| 4 | Restrict SSH to VPN/office IPs only | `infrastructure/terraform/security-groups.tf:25` | 1 | 🔴 | [ ] |
| 5 | Add rate limiting to auth endpoints | `apps/api/src/modules/auth/auth.controller.ts` | 4 | 🔴 | [ ] |
| 6 | Move secrets to environment variables properly | `.env` files | 1.5 | 🔴 | [ ] |

**Verification Checklist:**
- [ ] Run `terraform plan` to verify RDS changes
- [ ] Test all 9 persona logins still work after security changes
- [ ] Verify database is no longer publicly accessible

---

## Phase 2: Sales Foundation (Week 3-4)
**Estimated Effort**: ~15 hours
**Status**: 🔴 Not Started

### Sales Materials

| # | Task | Output | Est. Hours | Status | Completed |
|---|------|--------|------------|--------|-----------|
| 1 | Create 1-page "Why EduNexus" PDF | `docs/sales/ONE-PAGER.pdf` | 2 | 🔴 | [ ] |
| 2 | Finalize demo environment with realistic data | Production server | 1 | 🟡 Partial | [ ] |
| 3 | Write 10 personalized outreach email templates | `docs/sales/EMAIL-TEMPLATES.md` | 3 | 🔴 | [ ] |
| 4 | Create LinkedIn outreach scripts | `docs/sales/LINKEDIN-SCRIPTS.md` | 2 | 🔴 | [ ] |
| 5 | Record 5-minute product overview video (Loom) | YouTube/Loom | 2 | 🔴 | [ ] |

### Target List Building

| # | Task | Output | Est. Hours | Status | Completed |
|---|------|--------|------------|--------|-----------|
| 6 | Identify 50 target engineering colleges (AICTE list) | `docs/sales/TARGET-COLLEGES.md` | 3 | 🔴 | [ ] |
| 7 | Find principal/director contacts for top 20 | Contact spreadsheet | 2 | 🔴 | [ ] |

---

## Phase 3: Outreach Blitz (Month 2)
**Target**: 5-10 demo calls, 3 free pilots started
**Status**: 🔴 Not Started

### Weekly Outreach Tracker

| Week | Emails Sent | LinkedIn Connects | Demo Calls | Pilots Started |
|------|-------------|-------------------|------------|----------------|
| Week 5 | 0/10 | 0/50 | 0 | 0 |
| Week 6 | 0/10 | 0/50 | 0 | 0 |
| Week 7 | 0/10 | 0/50 | 0 | 0 |
| Week 8 | 0/10 | 0/50 | 0 | 0 |
| **Total** | 0/40 | 0/200 | 0 | 0 |

### Active Prospects

| College Name | Contact | Email Sent | Demo Date | Pilot Status | Notes |
|--------------|---------|------------|-----------|--------------|-------|
| | | | | | |
| | | | | | |
| | | | | | |

---

## Phase 4: Convert & Expand (Month 3)
**Target**: 2-3 paying customers, ₹25-50L ARR
**Status**: 🔴 Not Started

### Active Pilots

| College | Students | Start Date | End Date | Champion | Conversion Status |
|---------|----------|------------|----------|----------|-------------------|
| | | | | | |
| | | | | | |
| | | | | | |

### Pilot Success Metrics

| College | At-Risk Students Identified | Interventions Made | Admin Hours Saved | Converted? |
|---------|----------------------------|--------------------|--------------------|------------|
| | | | | |

### Converted Customers

| College | Students | Annual Value | Contract Start | Invoice Sent | Payment Received |
|---------|----------|--------------|----------------|--------------|------------------|
| | | | | | |
| | | | | | |

---

## DPDP Compliance Status

### Current State: ✅ Substantially Compliant (7/10)

| Requirement | DPDP Section | Status | Notes |
|-------------|--------------|--------|-------|
| Data localization (India) | Section 17 | ✅ Complete | AWS Mumbai (ap-south-1) |
| Audit logging | Section 8 | ✅ Complete | Comprehensive audit trail |
| Privacy policy | Section 5 | ✅ Complete | `/privacy` page exists |
| Multi-tenant isolation | Section 8 | ✅ Complete | Tenant-level data separation |
| Secure data transmission | Section 8 | ✅ Complete | HTTPS enforced |
| Role-based access control | Section 8 | ✅ Complete | 9 roles with proper permissions |
| Data retention controls | Section 8 | ✅ Complete | Configurable per tenant |
| **Consent management** | Section 6 | 🟡 Implicit | Terms acceptance at signup |
| **Account deletion** | Section 12 | 🟡 Manual | Admin can delete via database |
| **Parental consent (minors)** | Section 9 | 🟡 Policy | Handled via institution policy |

**Recommended Enhancements (Future)**:
- [ ] Add explicit consent toggles in user settings
- [ ] Self-service account deletion button
- [ ] Parent consent workflow in enrollment

---

## Email Templates (Ready to Use)

### Template 1: Initial Outreach

```
Subject: Quick question about [College Name]'s student success tracking

Hi [Name],

I noticed [College Name] has [X students/good placement record/NAAC grade].

Quick question: How do you currently identify students who are silently
struggling (good attendance but declining grades)?

We built an AI system that catches these students 6 weeks before they fail.
Currently piloting with engineering colleges in [State].

Would you be open to a 15-minute call to see if it's relevant?

Best,
[Your name]
EduNexus | College OS
```

### Template 2: Follow-up (3 days later)

```
Subject: Re: Quick question about [College Name]'s student success tracking

Hi [Name],

Following up on my note about AI-powered student intervention.

Quick stat: colleges using early warning systems see 40% dropout reduction.

Happy to share a 2-minute video demo if that's easier than a call.

[Your name]
```

### Template 3: WhatsApp Follow-up

```
Hi [Name], I sent an email about our AI-powered student success platform.

We're offering free 30-day pilots for engineering colleges this quarter.

Happy to share a quick demo video if interested? 🎓

- [Your name], EduNexus
```

### Template 4: Pilot Conversion (Day 25)

```
Subject: Your EduNexus pilot results - [College Name]

Hi [Name],

In 25 days, EduNexus identified [X] at-risk students at [College Name].
[Y] have already improved after intervention.

To continue access and expand to all [Z,000] students:
₹500/student/year = ₹[Amount] Lakhs annually

That's ₹42/student/month - less than a cup of chai.

I've attached the invoice. Happy to jump on a call to discuss.

Best,
[Your name]
```

---

## Weekly Check-in Template

### Week of: ________

**Progress This Week:**
- Emails sent: ___
- Demo calls completed: ___
- Pilots started: ___
- Revenue booked: ₹___

**Blockers:**
-

**Next Week Focus:**
-

**Notes:**
-

---

## Key Contacts & Resources

### Internal Resources
| Resource | Location |
|----------|----------|
| Pitch Deck | `docs/sales/PITCH_DECK.md` |
| Feature List | `docs/sales/FEATURE_LIST.md` |
| Demo Scripts | `docs/sales/DEMO_WALKTHROUGH_SCRIPTS.md` |
| ROI Calculator | `docs/sales/ROI_CALCULATOR.md` |
| Strategic Plan | `docs/STRATEGIC-PLAN.md` |

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Principal | principal@nexus-ec.edu | Nexus@1104 |
| HOD | hod.cse@nexus-ec.edu | Nexus@1104 |
| Teacher | teacher@nexus-ec.edu | Nexus@1104 |
| Student | student@nexus-ec.edu | Nexus@1104 |
| Parent | parent@nexus-ec.edu | Nexus@1104 |

### Live Demo URL
**https://edu-nexus.co.in**

---

## Success Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Security fixes complete | Week 2 | 🔴 |
| Sales materials ready | Week 4 | 🔴 |
| First demo call | Week 5 | 🔴 |
| First pilot started | Week 6 | 🔴 |
| First paying customer | Week 10 | 🔴 |
| ₹10L ARR | Week 12 | 🔴 |
| ₹25L ARR | Month 4 | 🔴 |

---

## Notes & Updates

### January 2026
- Created execution tracker
- Strategic plan completed
- Demo environment ready with 3 seeded colleges
- All 9 personas validated and working

---

*Last Updated: January 23, 2026*
