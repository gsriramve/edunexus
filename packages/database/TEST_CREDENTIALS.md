# EduNexus Test Credentials

This document contains all test user credentials for validating the EduNexus platform.

## Quick Start

**Universal Password:** `Nexus@1104` (all test accounts)

**Production URL:** http://15.206.243.177

## Test Colleges

| College | Domain | Display Name |
|---------|--------|--------------|
| Nexus Engineering College | nexus-ec | nexus-ec.edu |
| Quantum Institute of Technology | quantum-it | quantum-it.edu |
| Careerfied Academy | careerfied | careerfied.edu |

## Test Users by Role

### 1. Principal (College Head)
Full administrative access to entire college.

| College | Email | Password | Dashboard |
|---------|-------|----------|-----------|
| Nexus EC | principal@nexus-ec.edu | Nexus@1104 | /principal |
| Quantum IT | principal@quantum-it.edu | Nexus@1104 | /principal |
| Careerfied | principal@careerfied.edu | Nexus@1104 | /principal |

**Permissions:** Full college management, analytics, all modules

---

### 2. Head of Department (HOD)
Department-level administrative access.

| College | Email | Password | Dashboard |
|---------|-------|----------|-----------|
| Nexus EC | hod@nexus-ec.edu | Nexus@1104 | /hod |
| Quantum IT | hod@quantum-it.edu | Nexus@1104 | /hod |
| Careerfied | hod@careerfied.edu | Nexus@1104 | /hod |

**Note:** Additional HODs created per department: `hod.cse@<domain>.internal`, `hod.ece@<domain>.internal`, etc.

**Permissions:** Department students, faculty, courses, attendance, results

---

### 3. Administrative Staff
Operational management (fees, transport, hostel, library).

| College | Email | Password | Dashboard |
|---------|-------|----------|-----------|
| Nexus EC | admin@nexus-ec.edu | Nexus@1104 | /admin |
| Quantum IT | admin@quantum-it.edu | Nexus@1104 | /admin |
| Careerfied | admin@careerfied.edu | Nexus@1104 | /admin |

**Permissions:** Fees management, transport, hostel, library, certificates, student records

---

### 4. Teacher / Faculty
Course and student management.

| College | Email | Password | Dashboard |
|---------|-------|----------|-----------|
| Nexus EC | teacher@nexus-ec.edu | Nexus@1104 | /teacher |
| Quantum IT | teacher@quantum-it.edu | Nexus@1104 | /teacher |
| Careerfied | teacher@careerfied.edu | Nexus@1104 | /teacher |

**Permissions:** Attendance marking, assignments, exam results, student feedback

---

### 5. Lab Assistant
Laboratory session management.

| College | Email | Password | Dashboard |
|---------|-------|----------|-----------|
| Nexus EC | labassistant@nexus-ec.edu | Nexus@1104 | /lab-assistant |
| Quantum IT | labassistant@quantum-it.edu | Nexus@1104 | /lab-assistant |
| Careerfied | labassistant@careerfied.edu | Nexus@1104 | /lab-assistant |

**Permissions:** Lab attendance, equipment tracking, practical sessions

---

### 6. Student
Student portal access.

| College | Email | Password | Dashboard |
|---------|-------|----------|-----------|
| Nexus EC | student@nexus-ec.edu | Nexus@1104 | /student |
| Quantum IT | student@quantum-it.edu | Nexus@1104 | /student |
| Careerfied | student@careerfied.edu | Nexus@1104 | /student |

**Permissions:** View attendance, fees, results, assignments, ID card, career hub

---

### 7. Parent / Guardian
Parent portal for monitoring child's progress.

| College | Email | Password | Dashboard |
|---------|-------|----------|-----------|
| Nexus EC | parent@nexus-ec.edu | Nexus@1104 | /parent |
| Quantum IT | parent@quantum-it.edu | Nexus@1104 | /parent |
| Careerfied | parent@careerfied.edu | Nexus@1104 | /parent |

**Permissions:** View child's attendance, fees, results, notifications

---

### 8. Alumni
Alumni network access.

| College | Email | Password | Dashboard |
|---------|-------|----------|-----------|
| Nexus EC | alumni@nexus-ec.edu | Nexus@1104 | /alumni |
| Quantum IT | alumni@quantum-it.edu | Nexus@1104 | /alumni |
| Careerfied | alumni@careerfied.edu | Nexus@1104 | /alumni |

**Permissions:** Alumni profile, mentorship, events, job referrals

---

### 9. Platform Owner (Super Admin)
Platform-level administration (cross-tenant).

| Email | Password | Dashboard |
|-------|----------|-----------|
| admin@edunexus.io | ChangeMe123! | /platform |

**Permissions:** Tenant management, platform analytics, billing, all colleges

---

## Test Data Summary

### Per College:
- **5 Departments:** CSE, ECE, EEE, MECH, IT
- **60 Students per Department:** 300 total students
- **15 Staff:** 5 HODs + 5 Professors + 5 Lab Assistants
- **8 Primary Test Users:** One per role (listed above)

### Fee Data (per college):
- **Fee Types:** tuition, exam, library, lab, hostel, transport
- **Status Distribution:** 60% paid, 25% pending, 10% partial, 5% overdue
- **~1,200+ fee records** per college

### Additional Data:
- Library books (25 per college)
- Alumni profiles with employment history
- Mentorship records
- SGI/CRI tracking records
- Feedback cycles

---

## Running the Seed Scripts

```bash
# Navigate to database package
cd packages/database

# Run all seeders
npm run db:seed

# Run only specific seeders
npm run db:seed -- --only=test-data,enhanced,fees

# Reset and reseed
npm run db:reset:test

# Run individual seeder
npx tsx prisma/seed-fees.ts
```

---

## Seed Scripts Order

1. `seed-superadmin.ts` - Platform super admin (required)
2. `seed-test-data.ts` - Tenants + 8 personas (required)
3. `seed-enhanced-data.ts` - 5 departments, 300 students
4. `seed-fees.ts` - Student fee records
5. `seed-alumni.ts` - Alumni profiles, mentorships
6. `seed-activities.ts` - Clubs, sports, achievements
7. `seed-services.ts` - Library, certificates, hostel fees
8. `seed-student-growth.ts` - SGI/CRI tracking
9. `seed-feedback.ts` - Feedback cycles
10. `seed-communications.ts` - Message templates

---

## Troubleshooting

### Login Issues
1. Ensure the database has been seeded: `npm run db:seed`
2. Check if using correct domain (nexus-ec, quantum-it, careerfied)
3. Password is case-sensitive: `Nexus@1104`

### Missing Data
1. Run enhanced data seeder: `npx tsx prisma/seed-enhanced-data.ts`
2. Run fees seeder: `npx tsx prisma/seed-fees.ts`

### Database Reset
```bash
# Full reset (destructive!)
npx prisma migrate reset --force
npm run db:seed
```

---

## Notes

- All test users have **no Clerk integration** (use internal JWT auth)
- Internal users (staff, additional students) use `@<domain>.internal` emails
- Primary test users use `@<domain>.edu` emails
- Fee amounts are in INR (Indian Rupees)
