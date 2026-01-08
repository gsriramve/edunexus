# EduNexus Test Accounts

## Quick Reference

**Password for ALL test accounts:** `Nexus@1104`

---

## Platform Owner (Super Admin)

| Email | Password | Access |
|-------|----------|--------|
| `sriram.venkat@quantumlayerplatform.com` | `Nexus@1104` | Full platform access |

---

## College 1: Nexus Engineering College

| Role | Email | Password |
|------|-------|----------|
| Principal | `principal@nexus-ec.edu` | `Nexus@1104` |
| HOD (CSE) | `hod.cse@nexus-ec.edu` | `Nexus@1104` |
| Admin Staff | `admin@nexus-ec.edu` | `Nexus@1104` |
| Teacher | `teacher@nexus-ec.edu` | `Nexus@1104` |
| Lab Assistant | `lab@nexus-ec.edu` | `Nexus@1104` |
| Student | `student@nexus-ec.edu` | `Nexus@1104` |
| Parent | `parent@nexus-ec.edu` | `Nexus@1104` |

---

## College 2: Quantum Institute of Technology

| Role | Email | Password |
|------|-------|----------|
| Principal | `principal@quantum-it.edu` | `Nexus@1104` |
| HOD (CSE) | `hod.cse@quantum-it.edu` | `Nexus@1104` |
| Admin Staff | `admin@quantum-it.edu` | `Nexus@1104` |
| Teacher | `teacher@quantum-it.edu` | `Nexus@1104` |
| Lab Assistant | `lab@quantum-it.edu` | `Nexus@1104` |
| Student | `student@quantum-it.edu` | `Nexus@1104` |
| Parent | `parent@quantum-it.edu` | `Nexus@1104` |

---

## College 3: Careerfied Academy

| Role | Email | Password |
|------|-------|----------|
| Principal | `principal@careerfied.edu` | `Nexus@1104` |
| HOD (CSE) | `hod.cse@careerfied.edu` | `Nexus@1104` |
| Admin Staff | `admin@careerfied.edu` | `Nexus@1104` |
| Teacher | `teacher@careerfied.edu` | `Nexus@1104` |
| Lab Assistant | `lab@careerfied.edu` | `Nexus@1104` |
| Student | `student@careerfied.edu` | `Nexus@1104` |
| Parent | `parent@careerfied.edu` | `Nexus@1104` |

---

## Test Data Included

Each college has been seeded with:

### Academic Structure
- 1 Department: Computer Science & Engineering (CSE)
- 1 Course: B.Tech CSE (4 years)
- 6 Subjects: Data Structures, DS Lab, DBMS, DBMS Lab, Operating Systems, Computer Networks
- Teacher-subject and Lab Assistant-subject assignments

### Student Data
- 1 Student per college with full profile
- Parent linked to student
- 30 days of attendance records (85% attendance rate)
- Exam results for internal assessments

### Financial Data
- Fee structures: Tuition (paid), Hostel (pending), Transport (partial), Exam (overdue)
- Payment history

### Campus Facilities
- Transport: 1 route with 4 stops, 1 bus, student pass
- Hostel: 1 block with 80 rooms, student room allocation
- Library: Book categories, 4 CS books, student library card

---

## Role Access Summary

| Role | Dashboard URL | Key Features |
|------|---------------|--------------|
| Platform Owner | `/platform` | Manage all colleges, subscriptions |
| Principal | `/principal` | College-wide oversight, staff management |
| HOD | `/hod` | Department management, curriculum |
| Admin Staff | `/admin` | Fees, students, transport, hostel |
| Teacher | `/teacher` | Attendance, marks, class management |
| Lab Assistant | `/lab` | Lab sessions, equipment |
| Student | `/student` | Academics, fees, AI insights |
| Parent | `/parent` | Child progress, fee payment |

---

## Re-seeding Data

```bash
# Navigate to database package
cd packages/database

# Run test data seed
npm run db:seed:test

# Or reset and reseed (WARNING: deletes all data)
npm run db:reset:test
```

---

## Notes

- All users are created in Clerk with real authentication
- Password can be changed by users after login
- Test data is idempotent - running seed again won't create duplicates
- Each tenant (college) has completely isolated data
