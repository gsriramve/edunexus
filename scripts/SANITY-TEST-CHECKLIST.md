# EduNexus Production Sanity Test Checklist

## Test Criteria

| # | Criterion | Description | Threshold |
|---|-----------|-------------|-----------|
| 1 | Login Success | User can authenticate with valid credentials | Must succeed |
| 2 | Navigation | All menu items and features accessible | No broken links |
| 3 | Data Load Time | Pages and data load quickly | < 2-3 seconds |
| 4 | No HTTP Errors | No 400, 401, 404 errors during navigation | Zero errors |
| 5 | Contact Form | Lead submission works correctly | HTTP 201 |

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Platform Owner | admin@edunexus.io | Nexus@1104 |
| Principal | principal@nexus-ec.edu | Nexus@1104 |
| HOD | hod.cse@nexus-ec.edu | Nexus@1104 |
| Admin Staff | admin@nexus-ec.edu | Nexus@1104 |
| Teacher | teacher@nexus-ec.edu | Nexus@1104 |
| Lab Assistant | lab@nexus-ec.edu | Nexus@1104 |
| Student | student@nexus-ec.edu | Nexus@1104 |
| Parent | parent@nexus-ec.edu | Nexus@1104 |
| Alumni | alumni@nexus-ec.edu | Nexus@1104 |

---

## How to Run Tests

### Automated (Recommended)
```bash
# Run all persona tests
npm run test:sanity

# Results saved to:
# - QA-Test-Report.md (human readable)
# - QA-Test-Results.json (programmatic)
```

### GitHub Actions
- **Manual**: Actions > Sanity Test > Run workflow
- **Scheduled**: Runs daily at 8:30 AM IST

### Contact Form Test
```bash
curl -X POST https://edu-nexus.co.in/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "institutionName": "Test College",
    "message": "Test message"
  }'
# Expected: HTTP 201 with lead object
```

---

## Pages Tested Per Persona

### Platform Owner (3 pages)
- Dashboard (`/platform`)
- Colleges (`/platform/colleges`)
- Help & Support (`/help`)

### Principal (8 pages)
- Dashboard (`/principal`)
- Departments (`/principal/departments`)
- Faculty (`/principal/faculty`)
- Students (`/principal/students`)
- Academics (`/principal/academics`)
- Reports (`/principal/reports`)
- Fee Overview (`/principal/fees`)
- Help & Support (`/help`)

### HOD (10 pages)
- Dashboard (`/hod`)
- Faculty (`/hod/faculty`)
- Students (`/hod/students`)
- Subjects (`/hod/subjects`)
- Time Table (`/hod/timetable`)
- Attendance (`/hod/attendance`)
- Results (`/hod/results`)
- At-Risk Students (`/hod/at-risk`)
- Skill Gaps (`/hod/skill-gaps`)
- Help & Support (`/help`)

### Admin Staff (6 pages)
- Dashboard (`/admin`)
- Records (`/admin/records`)
- Fee Management (`/admin/fees`)
- Attendance (`/admin/attendance`)
- Announcements (`/admin/announcements`)
- Help & Support (`/help`)

### Teacher (7 pages)
- Dashboard (`/teacher`)
- Classes (`/teacher/classes`)
- Attendance (`/teacher/attendance`)
- Results (`/teacher/results`)
- Materials (`/teacher/materials`)
- Feedback (`/teacher/feedback`)
- Help & Support (`/help`)

### Lab Assistant (6 pages)
- Dashboard (`/lab`)
- Labs (`/lab/labs`)
- Attendance (`/lab/attendance`)
- Equipment (`/lab/equipment`)
- Marks Entry (`/lab/marks`)
- Help & Support (`/help`)

### Student (9 pages)
- Dashboard (`/student`)
- Academics (`/student/academics`)
- Attendance (`/student/attendance`)
- Results (`/student/results`)
- Fee Details (`/student/fees`)
- ID Card (`/student/id-card`)
- Career (`/student/career`)
- Insights (`/student/insights`)
- Help & Support (`/help`)

### Parent (6 pages)
- Dashboard (`/parent`)
- Academics (`/parent/academics`)
- Attendance (`/parent/attendance`)
- Fee Details (`/parent/fees`)
- Communications (`/parent/communications`)
- Help & Support (`/help`)

### Alumni (6 pages)
- Dashboard (`/alumni`)
- Events (`/alumni/events`)
- Jobs (`/alumni/jobs`)
- Mentorship (`/alumni/mentorship`)
- Directory (`/alumni/directory`)
- Help & Support (`/help`)

---

## Pass/Fail Criteria

| Status | Condition |
|--------|-----------|
| PASS | Login succeeds AND all pages load AND no 404 errors AND load time < 2s |
| WARN | Login succeeds AND some pages slow (> 2s) but functional |
| FAIL | Login fails OR pages return 404 OR critical errors |

---

## Latest Test Results

**Date**: January 18, 2026
**Domain**: https://edu-nexus.co.in

| Persona | Login | Pages | 404 Errors | Load < 2s | Status |
|---------|-------|-------|------------|-----------|--------|
| Platform Owner | PASS | 2/3 | NO | YES | WARN |
| Principal | PASS | 8/8 | NO | YES | PASS |
| HOD | PASS | 10/10 | NO | YES | PASS |
| Admin Staff | PASS | 6/6 | NO | YES | PASS |
| Teacher | PASS | 7/7 | NO | YES | PASS |
| Lab Assistant | PASS | 6/6 | NO | YES | PASS |
| Student | PASS | 9/9 | NO | YES | PASS |
| Parent | PASS | 6/6 | NO | YES | PASS |
| Alumni | PASS | 6/6 | NO | YES | PASS |

**Contact Form**: PASS (HTTP 201, 109ms response time)

**Overall**: 8/9 personas passed (Platform Owner has /platform/colleges timeout issue)

---

## Known Issues

1. **Platform Owner - Colleges Page Timeout**: `/platform/colleges` times out after 30s
   - Impact: Low (affects only Platform Owner role)
   - Status: Under investigation

---

## Troubleshooting

### Test Fails to Run
```bash
# Install Playwright
npx playwright install chromium

# Verify installation
npx playwright --version
```

### Login Fails
- Check if Clerk is configured correctly
- Verify test accounts exist in Clerk dashboard
- Check API health: `curl https://edu-nexus.co.in/api/health`

### Pages Return 404
- Check if routes exist in Next.js app
- Verify role-based routing is correct
- Check for typos in PERSONA_PAGES config

### Slow Load Times
- Check EC2 instance CPU/memory
- Verify Docker containers are healthy
- Check database query performance
