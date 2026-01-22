# EduNexus - E2E User Journey Test Plan

**Version:** 1.1
**Updated:** January 22, 2026
**Perspectives:** Product Team, BA, QA
**Test Type:** Manual E2E Testing

---

## Table of Contents

1. [Test Environment Setup](#1-test-environment-setup)
2. [Test Data Setup Scripts](#2-test-data-setup-scripts)
3. [Platform Owner Journey](#3-platform-owner-journey)
4. [Principal Journey](#4-principal-journey)
5. [HOD Journey](#5-hod-journey)
6. [Admin Staff Journey](#6-admin-staff-journey)
6.5. [Student Enrollment & Onboarding Journey](#65-student-enrollment--onboarding-journey)
7. [Teacher Journey](#7-teacher-journey)
8. [Lab Assistant Journey](#8-lab-assistant-journey)
9. [Student Journey](#9-student-journey)
10. [Parent Journey](#10-parent-journey)
11. [Role Setup Guide (Clerk Dashboard)](#11-role-setup-guide-clerk-dashboard)
12. [API Test Endpoints](#12-api-test-endpoints)
13. [Bug Report Template](#13-bug-report-template)
14. [Test Data Samples](#14-test-data-samples)

---

## 1. Test Environment Setup

### Prerequisites

```bash
# 1. Ensure services are running
cd /Users/sriramvenkatg/edunexus

# Start database
docker-compose up -d

# Start API server
cd apps/api && npm run dev

# Start web app
cd apps/web && npm run dev
```

### URLs
| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| API | http://localhost:3001 |
| Database | postgresql://localhost:5432/edunexus |

---

## 2. Test Data Setup Scripts

### 2.1 Create Test Users in Clerk

First, sign up 8 test users via the UI at http://localhost:3000/sign-up

| Email | Password | Role to Assign |
|-------|----------|----------------|
| platform.owner@test.edunexus.io | Test@123! | platform_owner |
| principal@test.edunexus.io | Test@123! | principal |
| hod@test.edunexus.io | Test@123! | hod |
| admin.staff@test.edunexus.io | Test@123! | admin_staff |
| teacher@test.edunexus.io | Test@123! | teacher |
| lab.assistant@test.edunexus.io | Test@123! | lab_assistant |
| student@test.edunexus.io | Test@123! | student |
| parent@test.edunexus.io | Test@123! | parent |

### 2.2 Assign Roles Script

After creating users, assign roles using the Clerk API:

```bash
# File: scripts/setup-test-users.sh

#!/bin/bash

# Load environment variables
source .env

# Get Clerk Secret Key from environment
CLERK_SECRET_KEY="${CLERK_SECRET_KEY}"

# Function to assign role to user
assign_role() {
    local USER_ID=$1
    local ROLE=$2
    local TENANT_ID=${3:-"test-tenant-001"}

    echo "Assigning role '$ROLE' to user '$USER_ID'..."

    curl -X PATCH "https://api.clerk.com/v1/users/${USER_ID}" \
        -H "Authorization: Bearer ${CLERK_SECRET_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"public_metadata\": {
                \"role\": \"${ROLE}\",
                \"tenantId\": \"${TENANT_ID}\"
            }
        }"

    echo ""
}

# Instructions:
# 1. Sign up users via UI
# 2. Get User IDs from Clerk Dashboard
# 3. Run: ./scripts/setup-test-users.sh

# Example usage (replace with actual User IDs from Clerk Dashboard):
# assign_role "user_2abc123..." "platform_owner"
# assign_role "user_2def456..." "principal" "test-tenant-001"
# assign_role "user_2ghi789..." "hod" "test-tenant-001"
# assign_role "user_2jkl012..." "admin_staff" "test-tenant-001"
# assign_role "user_2mno345..." "teacher" "test-tenant-001"
# assign_role "user_2pqr678..." "lab_assistant" "test-tenant-001"
# assign_role "user_2stu901..." "student" "test-tenant-001"
# assign_role "user_2vwx234..." "parent" "test-tenant-001"
```

### 2.3 Seed Test Tenant & Data

```bash
# Create test tenant and seed data
cd /Users/sriramvenkatg/edunexus

# Set environment
export DATABASE_URL="postgresql://edunexus:edunexus_dev_password@localhost:5432/edunexus?schema=public"

# Run seed script
npm run db:seed

# Or manually via API:
curl -X POST http://localhost:3001/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "Test Engineering College",
    "subdomain": "test-college",
    "settings": {
      "theme": "default",
      "features": ["all"]
    }
  }'
```

---

## 3. Platform Owner Journey

**Persona:** Super Admin managing all college tenants
**Portal:** `/platform/*`
**Pages:** Dashboard, Colleges

### TC-PO-001: Platform Dashboard Access

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | User logged in with `platform_owner` role |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to http://localhost:3000/platform | Platform dashboard loads |
| 2 | Verify dashboard components | See: Total Tenants, Active Users, Revenue, System Health cards |
| 3 | Check navigation sidebar | Links: Dashboard, Colleges visible |

### TC-PO-002: Manage College Tenants

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Platform Owner logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/platform/colleges` | College list page loads |
| 2 | Click "Add College" button | Add tenant modal/form opens |
| 3 | Fill college details (Name, Subdomain, Admin Email) | Form accepts input |
| 4 | Submit form | New tenant created, appears in list |
| 5 | Click on a college row | College details expand/navigate |
| 6 | Toggle college status (Active/Inactive) | Status updates |

### TC-PO-003: Role-Based Access Control

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Logged in with non-platform_owner role |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Login as `principal` user | Redirected to principal dashboard |
| 2 | Manually navigate to `/platform` | Redirected to `/unauthorized` |
| 3 | Login as `platform_owner` user | Can access `/platform` |

---

## 4. Principal Journey

**Persona:** College Super Admin
**Portal:** `/principal/*`
**Pages:** Dashboard, Departments, Staff, Students

### TC-PR-001: Principal Dashboard Access

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | User logged in with `principal` role |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/principal` | Principal dashboard loads |
| 2 | Verify overview cards | See: Total Students, Staff Count, Departments, Fee Collection |
| 3 | Check quick actions | Links to add staff, view reports |

### TC-PR-002: Department Management

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Principal logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/principal/departments` | Department list loads |
| 2 | Click "Add Department" | Add department form opens |
| 3 | Enter: Name (CSE), Code (CSE), HOD | Form validates |
| 4 | Submit | Department created |
| 5 | Edit existing department | Edit form opens with prefilled data |
| 6 | Delete department | Confirmation dialog, then deleted |

### TC-PR-003: Staff Management

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Principal logged in, at least 1 department exists |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/principal/staff` | Staff list loads |
| 2 | Click "Add Staff" | Add staff form opens |
| 3 | Fill: Name, Email, Department, Role (teacher/hod/admin_staff) | Form validates |
| 4 | Submit | Staff member created |
| 5 | Filter by department | List filters correctly |
| 6 | Search by name | Search works |

### TC-PR-004: Student Overview

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Principal logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/principal/students` | Student list loads |
| 2 | Filter by batch/branch | Filters work |
| 3 | View student details | Student profile opens |
| 4 | Export student list | CSV/Excel downloads |

---

## 5. HOD Journey

**Persona:** Department Head
**Portal:** `/hod/*`
**Pages:** Dashboard, Faculty, Curriculum, Students, Reports

### TC-HOD-001: HOD Dashboard Access

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | User logged in with `hod` role |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/hod` | HOD dashboard loads |
| 2 | Verify department-specific data | See only assigned department data |
| 3 | Check overview metrics | Faculty count, Student count, Attendance % |

### TC-HOD-002: Faculty Management

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | HOD logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/hod/faculty` | Faculty list (department-filtered) |
| 2 | View faculty workload | Subject assignments visible |
| 3 | Assign subject to faculty | Subject assignment modal works |
| 4 | View faculty attendance report | Report displays |

### TC-HOD-003: Curriculum Management

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | HOD logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/hod/curriculum` | Curriculum page loads |
| 2 | View semester subjects | Subjects list by semester |
| 3 | Add new subject | Subject form opens |
| 4 | Edit subject details | Edit works |
| 5 | Upload syllabus document | File uploads to S3 |

### TC-HOD-004: Department Students

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | HOD logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/hod/students` | Department students list |
| 2 | Filter by batch | Batch filter works |
| 3 | View student academic performance | CGPA, attendance visible |
| 4 | Identify at-risk students | AI insights display (if available) |

### TC-HOD-005: Department Reports

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | HOD logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/hod/reports` | Reports page loads |
| 2 | Generate attendance report | Report generates |
| 3 | Generate result analysis | Analysis displays |
| 4 | Export report (PDF/Excel) | File downloads |

---

## 6. Admin Staff Journey

**Persona:** Administrative Staff (Fees, Admissions, Records)
**Portal:** `/admin/*`
**Pages:** 15 pages covering all administrative functions

### TC-AS-001: Admin Dashboard

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | User logged in with `admin_staff` role |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/admin` | Admin dashboard loads |
| 2 | Verify quick stats | Pending fees, New applications, Active complaints |
| 3 | Check quick action buttons | All functional |

### TC-AS-002: Fee Collection

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Admin logged in, students exist |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/admin/fees` | Fees page with tabs |
| 2 | View "Collection" tab | Today's collections display |
| 3 | Collect fee for student | Search student, enter amount, generate receipt |
| 4 | View "Dues" tab | Outstanding dues list |
| 5 | Send payment reminder | SMS/Email sent |
| 6 | View "Transactions" tab | Transaction history |
| 7 | Export fee report | Excel/PDF downloads |

### TC-AS-003: Admissions Management

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Admin logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/admin/admissions` | Admissions page loads |
| 2 | View pending applications | Applications list |
| 3 | Review application | Application details open |
| 4 | Approve application | Status changes, student created |
| 5 | Reject application | Status changes, reason recorded |

### TC-AS-004: Student Records

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Admin logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/admin/records` | Records page loads |
| 2 | Search student by roll number | Student found |
| 3 | View/edit student profile | Profile editable |
| 4 | Generate bonafide certificate | Certificate PDF generated |
| 5 | Update student status | Status updates |

### TC-AS-005: Transport Management

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Admin logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/admin/transport` | Transport page with tabs |
| 2 | Manage routes | CRUD operations work |
| 3 | Manage stops | Add/edit/remove stops |
| 4 | Assign vehicles | Vehicle assignment works |
| 5 | Issue transport pass | Pass generated for student |

### TC-AS-006: Hostel Management

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Admin logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/admin/hostel` | Hostel page with tabs |
| 2 | Manage blocks | CRUD for hostel blocks |
| 3 | Manage rooms | Room creation, capacity setting |
| 4 | Allocate room to student | Allocation works |
| 5 | View mess menu | Menu displays |
| 6 | Handle complaints | Complaint workflow works |

### TC-AS-007: Library Management

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Admin logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/admin/library` | Library page loads |
| 2 | Manage book catalog | CRUD for books |
| 3 | Issue book to student | Issue recorded |
| 4 | Return book | Return with/without fine |
| 5 | View overdue books | Overdue list displays |

### TC-AS-008: Communication Hub

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Admin logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/admin/communication` | Communication page loads |
| 2 | Create announcement | Announcement form works |
| 3 | Send bulk SMS | SMS sent to selected group |
| 4 | Send bulk email | Email sent |
| 5 | View message history | History displays |

### TC-AS-009: Import/Export

| Field | Value |
|-------|-------|
| **Priority** | P3 - Medium |
| **Precondition** | Admin logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/admin/import-export` | Import/Export page loads |
| 2 | Download template | Excel template downloads |
| 3 | Upload student import file | File uploads, validation runs |
| 4 | View import status | Progress/results display |
| 5 | Export data | Selected data exports |

### TC-AS-010: Audit Logs

| Field | Value |
|-------|-------|
| **Priority** | P3 - Medium |
| **Precondition** | Admin logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/admin/audit-logs` | Audit logs page loads |
| 2 | Filter by action type | Filter works |
| 3 | Filter by user | Filter works |
| 4 | Filter by date range | Filter works |
| 5 | View log details | Details expand |

---

## 6.5 Student Enrollment & Onboarding Journey

**Feature:** Complete student enrollment workflow from initiation to credential generation
**Portal:** `/admin/enrollments/*`, `/enroll/[token]`, `/approvals/enrollments/*`
**Pages:** Enrollment List, New Enrollment, Enrollment Detail, Public Onboarding, Approval Pages

### TC-ENR-001: Enrollment List Page

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | User logged in as `admin_staff` or `principal` |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/admin/enrollments` | Enrollment list page loads |
| 2 | Verify page components | See: Title "Student Enrollments", "New Enrollment" button |
| 3 | Check status filter | Filter dropdown works |
| 4 | View enrollment statistics | Stats cards display (pending, approved, etc.) |

### TC-ENR-002: Initiate New Enrollment

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Admin logged in, departments exist |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/admin/enrollments/new` | New enrollment form loads |
| 2 | Verify form fields | First Name, Last Name, Email, Mobile, Department, Academic Year |
| 3 | Enter valid student data | Form accepts input |
| 4 | Select department from dropdown | Department selected |
| 5 | Click "Create Enrollment" | Enrollment created, redirected to detail page |
| 6 | Verify enrollment status | Status shows "INITIATED" |

### TC-ENR-003: Send Invitation Email

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Enrollment created with status "INITIATED" |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to enrollment detail page | Detail page loads |
| 2 | Click "Send Invitation" button | Confirmation dialog appears |
| 3 | Confirm send | Email sent, status changes to "INVITATION_SENT" |
| 4 | Check email (test inbox) | Invitation email received with link |
| 5 | Verify token in URL | Token is valid UUID |

### TC-ENR-004: Student Public Onboarding Page

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Invitation sent, have valid token |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/enroll/[token]` | Public onboarding page loads |
| 2 | Verify token validation | Student info displayed (name, email) |
| 3 | Check form sections | Personal Details, Academic Details, Documents sections |
| 4 | Fill personal details (DOB, gender, address) | Form validates |
| 5 | Fill academic details (previous education, marks) | Form validates |
| 6 | Upload documents (photo, certificates) | Documents upload to S3 |
| 7 | Click "Save Progress" | Progress saved |

### TC-ENR-005: Student Submits Application

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Student has completed profile |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Verify all sections completed | Checkmarks visible |
| 2 | Click "Submit for Review" | Confirmation dialog appears |
| 3 | Confirm submission | Application submitted |
| 4 | Verify status change | Status shows "SUBMITTED" |
| 5 | Check confirmation message | Success message displayed |

### TC-ENR-006: Admin Reviews Submission

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Application submitted, admin logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to enrollment detail page | Application details visible |
| 2 | Review student information | All submitted data displayed |
| 3 | View uploaded documents | Documents viewable/downloadable |
| 4 | Assign section | Section dropdown works |
| 5 | Add admin notes (optional) | Notes field accepts input |
| 6 | Click "Approve" | Status changes to "ADMIN_APPROVED" |

### TC-ENR-007: Admin Requests Changes

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Application submitted, admin reviewing |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Review application with issues | Issues identified |
| 2 | Click "Request Changes" | Dialog with notes field appears |
| 3 | Enter reason for changes | Notes entered |
| 4 | Submit request | Status changes to "CHANGES_REQUESTED" |
| 5 | Student receives notification | Email sent to student |

### TC-ENR-008: HOD/Principal Approval Page

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Application admin-approved, HOD logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/approvals/enrollments` | Pending approvals list loads |
| 2 | Filter by department | Filter works (HOD sees own dept only) |
| 3 | View pending count | Count badge visible |
| 4 | Click on enrollment | Detail view opens |
| 5 | Review complete application | All data and documents visible |

### TC-ENR-009: HOD Final Approval

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | HOD logged in, pending approvals exist |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Open pending enrollment | Enrollment detail loads |
| 2 | Click "Approve" | Confirmation dialog appears |
| 3 | Confirm approval | Status changes to "HOD_APPROVED" |
| 4 | Verify workflow continues | Moves to Principal queue OR completes |

### TC-ENR-010: Principal Final Approval

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Principal logged in, HOD-approved enrollments exist |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/approvals/enrollments` | Pending approvals list loads |
| 2 | Open HOD-approved enrollment | Enrollment detail loads |
| 3 | Click "Approve" | Confirmation dialog appears |
| 4 | Confirm approval | Status changes to "PRINCIPAL_APPROVED" → "COMPLETED" |

### TC-ENR-011: Credential Generation

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Enrollment completed (final approval given) |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Verify enrollment status | Status is "COMPLETED" |
| 2 | Check roll number generated | Format: YYDDDSSS (e.g., 26CSE001) |
| 3 | Check official email generated | Format: firstname.lastname@domain.edu |
| 4 | Verify student record created | Student appears in Students list |
| 5 | Verify welcome email sent | Email with credentials received |

### TC-ENR-012: Reject Enrollment

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | HOD/Principal reviewing enrollment |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Open enrollment for review | Detail page loads |
| 2 | Click "Reject" | Dialog with reason field appears |
| 3 | Enter rejection reason | Reason entered |
| 4 | Confirm rejection | Status changes to "REJECTED" |
| 5 | Student notified | Rejection email sent with reason |

### TC-ENR-013: Expired Invitation

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Invitation sent more than 7 days ago |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to expired token URL | Error page loads |
| 2 | Verify error message | "Invitation expired" message displayed |
| 3 | Admin resends invitation | New token generated, new email sent |

### TC-ENR-014: End-to-End Enrollment Flow

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Fresh test environment |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Login as Admin | Admin dashboard loads |
| 2 | Create new enrollment | Enrollment initiated |
| 3 | Send invitation | Email sent |
| 4 | Open email link | Public page loads |
| 5 | Complete profile | All sections filled |
| 6 | Submit application | Status: SUBMITTED |
| 7 | Login as Admin, approve | Status: ADMIN_APPROVED |
| 8 | Login as HOD, approve | Status: HOD_APPROVED |
| 9 | Login as Principal, approve | Status: COMPLETED |
| 10 | Verify credentials | Roll number + email generated |
| 11 | Student can login | New student accesses portal |

---

## 7. Teacher Journey

**Persona:** Faculty Member
**Portal:** `/teacher/*`
**Pages:** Dashboard, Attendance, Marks, Assignments, Materials, Students

### TC-TE-001: Teacher Dashboard

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | User logged in with `teacher` role |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/teacher` | Teacher dashboard loads |
| 2 | View today's schedule | Classes for today display |
| 3 | View pending tasks | Unmarked attendance, pending assignments |
| 4 | Check quick actions | Mark attendance, Enter marks buttons work |

### TC-TE-002: Mark Attendance

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Teacher logged in, assigned to subjects |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/teacher/attendance` | Attendance page loads |
| 2 | Select subject | Subject dropdown works |
| 3 | Select date | Date picker works |
| 4 | View student list | Students in section display |
| 5 | Mark Present/Absent for each | Checkboxes work |
| 6 | Submit attendance | Attendance saved, toast confirms |
| 7 | View attendance report | Report displays |

### TC-TE-003: Enter Marks

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Teacher logged in, exams exist |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/teacher/marks` | Marks entry page loads |
| 2 | Select exam | Exam dropdown works |
| 3 | View student list | Students display with mark input fields |
| 4 | Enter marks for each student | Validation works (max marks check) |
| 5 | Save marks | Marks saved, grades auto-calculated |
| 6 | View marks summary | Summary displays |

### TC-TE-004: Manage Assignments

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Teacher logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/teacher/assignments` | Assignments page loads |
| 2 | Create new assignment | Form opens |
| 3 | Fill title, description, due date | Form validates |
| 4 | Attach file (optional) | File uploads |
| 5 | Submit | Assignment created |
| 6 | View submissions | Submissions list |
| 7 | Grade submission | Grade/remarks saved |

### TC-TE-005: Upload Materials

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Teacher logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/teacher/materials` | Materials page loads |
| 2 | Create folder | Folder created |
| 3 | Upload file (PDF, PPT, etc.) | File uploads to S3 |
| 4 | Set visibility (all/section-specific) | Setting saved |
| 5 | Delete material | Material deleted |

### TC-TE-006: View Students

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Teacher logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/teacher/students` | Students page loads |
| 2 | Filter by subject/section | Filter works |
| 3 | View student details | Profile opens |
| 4 | View student attendance | Attendance data displays |
| 5 | View student performance | Marks/grades display |

---

## 8. Lab Assistant Journey

**Persona:** Laboratory Staff
**Portal:** `/lab-assistant/*`
**Pages:** Dashboard, Attendance, Marks, Equipment

### TC-LA-001: Lab Assistant Dashboard

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | User logged in with `lab_assistant` role |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/lab-assistant` | Dashboard loads |
| 2 | View today's lab schedule | Labs for today display |
| 3 | View pending tasks | Unmarked attendance, practical marks |

### TC-LA-002: Mark Lab Attendance

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Lab assistant logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/lab-assistant/attendance` | Lab attendance page loads |
| 2 | Select lab/batch | Dropdowns work |
| 3 | Select date | Date picker works |
| 4 | Mark attendance | Checkboxes work |
| 5 | Submit | Attendance saved |

### TC-LA-003: Enter Practical Marks

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Lab assistant logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/lab-assistant/marks` | Practical marks page loads |
| 2 | Select lab exam | Exam dropdown works |
| 3 | View student list | Students display |
| 4 | Enter marks | Validation works |
| 5 | Save | Marks saved |

### TC-LA-004: Equipment Management

| Field | Value |
|-------|-------|
| **Priority** | P3 - Medium |
| **Precondition** | Lab assistant logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/lab-assistant/equipment` | Equipment page loads |
| 2 | View equipment inventory | List displays |
| 3 | Update equipment status | Status updates |
| 4 | Report equipment issue | Issue logged |

---

## 9. Student Journey

**Persona:** Student User
**Portal:** `/student/*`
**Pages:** 14 pages covering all student functions

### TC-ST-001: Student Dashboard

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | User logged in with `student` role |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/student` | Student dashboard loads |
| 2 | View attendance percentage | Current attendance displays |
| 3 | View upcoming exams | Exam schedule displays |
| 4 | View fee status | Due amount displays |
| 5 | View AI insights (if available) | Personalized recommendations |

### TC-ST-002: View Academics

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Student logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/student/academics` | Academics page loads |
| 2 | View current semester subjects | Subject list displays |
| 3 | View timetable | Schedule displays |
| 4 | Download syllabus | PDF downloads |
| 5 | Access study materials | Materials link works |

### TC-ST-003: View Attendance

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Student logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/student/attendance` | Attendance page loads |
| 2 | View overall percentage | Percentage displays |
| 3 | View subject-wise attendance | Breakdown displays |
| 4 | View calendar view | Calendar with marked days |
| 5 | Apply for leave | Leave form works |

### TC-ST-004: View Exams & Results

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Student logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/student/exams` | Exams page loads |
| 2 | View upcoming exams | Exam schedule displays |
| 3 | View past results | Results table displays |
| 4 | View CGPA/SGPA | GPA calculated and displayed |
| 5 | Download result | PDF/transcript downloads |

### TC-ST-005: Fee Payment

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Student logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/student/fees` | Fees page loads |
| 2 | View fee structure | Breakdown displays |
| 3 | View pending dues | Amount displays |
| 4 | Click "Pay Now" | Razorpay modal opens |
| 5 | Complete payment | Payment processed |
| 6 | View/download receipt | Receipt available |

### TC-ST-006: Transport Info

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Student logged in, transport pass allocated |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/student/transport` | Transport page loads |
| 2 | View route info | Route, stops display |
| 3 | View bus pass | Pass details display |
| 4 | Track bus (if available) | Map/ETA displays |

### TC-ST-007: Hostel Info

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Student logged in, hostel allocated |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/student/hostel` | Hostel page loads |
| 2 | View room allocation | Room details display |
| 3 | View mess menu | Weekly menu displays |
| 4 | Raise complaint | Complaint form works |
| 5 | View complaint status | Status displays |

### TC-ST-008: Library Access

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Student logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/student/library` | Library page loads |
| 2 | Search book catalog | Search works |
| 3 | View issued books | Current issues display |
| 4 | View due dates | Dates/fines display |
| 5 | Access e-resources | E-resource links work |

### TC-ST-009: Sports & Clubs

| Field | Value |
|-------|-------|
| **Priority** | P3 - Medium |
| **Precondition** | Student logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/student/sports` | Sports page loads |
| 2 | View teams | Team list displays |
| 3 | Join team/club | Application works |
| 4 | View events | Events calendar displays |
| 5 | Register for event | Registration works |
| 6 | View achievements | Achievements display |

### TC-ST-010: Career Hub

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Student logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/student/career` | Career hub loads |
| 2 | View placement drives | Upcoming drives display |
| 3 | Check eligibility | Eligibility criteria shown |
| 4 | Apply to drive | Application submitted |
| 5 | View application status | Status displays |
| 6 | View placement predictions (AI) | Probability displays |

### TC-ST-011: Documents

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Student logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/student/documents` | Documents page loads |
| 2 | View uploaded documents | Document list displays |
| 3 | Upload new document | Upload works |
| 4 | Download document | Download works |

### TC-ST-012: Profile Management

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Student logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/student/profile` | Profile page loads |
| 2 | View personal info | Info displays |
| 3 | Edit allowed fields | Edit works |
| 4 | Upload photo | Photo uploads |
| 5 | Update contact info | Info saved |

---

## 10. Parent Journey

**Persona:** Parent/Guardian
**Portal:** `/parent/*`
**Pages:** Dashboard, Academics, Attendance, Fees, Communication

### TC-PA-001: Parent Dashboard

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | User logged in with `parent` role, linked to child |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/parent` | Parent dashboard loads |
| 2 | View child selector (if multiple) | Dropdown works |
| 3 | View child's attendance | Percentage displays |
| 4 | View child's recent marks | Marks display |
| 5 | View fee status | Due amount displays |

### TC-PA-002: View Child's Academics

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Parent logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/parent/academics` | Academics page loads |
| 2 | View subjects | Subject list displays |
| 3 | View marks by subject | Marks table displays |
| 4 | View CGPA | GPA displays |
| 5 | View performance trend | Chart displays |

### TC-PA-003: View Attendance

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Parent logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/parent/attendance` | Attendance page loads |
| 2 | View overall percentage | Percentage displays |
| 3 | View subject-wise breakdown | Breakdown displays |
| 4 | View calendar | Calendar displays |
| 5 | View absence alerts | Alerts display (if any) |

### TC-PA-004: Fee Payment

| Field | Value |
|-------|-------|
| **Priority** | P1 - Critical |
| **Precondition** | Parent logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/parent/fees` | Fees page loads |
| 2 | View fee structure | Breakdown displays |
| 3 | View pending dues | Amount displays |
| 4 | Pay fees | Razorpay flow works |
| 5 | Download receipts | Receipts download |

### TC-PA-005: Communication

| Field | Value |
|-------|-------|
| **Priority** | P2 - High |
| **Precondition** | Parent logged in |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/parent/communication` | Communication page loads |
| 2 | View announcements | Announcements display |
| 3 | View messages from teachers | Messages display |
| 4 | Send message to teacher | Message form works |
| 5 | View PTM schedule | Schedule displays |

---

## Quick Reference: Test Priority Summary

| Priority | Count | Description |
|----------|-------|-------------|
| **P1 - Critical** | 39 | Core user flows, must work for launch |
| **P2 - High** | 21 | Important features, needed for pilot |
| **P3 - Medium** | 5 | Nice-to-have features |

## Execution Checklist

- [ ] Test environment setup complete
- [ ] 8 test users created in Clerk
- [ ] Roles assigned to all test users
- [ ] Test tenant created with seed data
- [ ] Platform Owner journey complete
- [ ] Principal journey complete
- [ ] HOD journey complete
- [ ] Admin Staff journey complete
- [ ] **Student Enrollment & Onboarding journey complete**
- [ ] Teacher journey complete
- [ ] Lab Assistant journey complete
- [ ] Student journey complete
- [ ] Parent journey complete

---

## 11. Role Setup Guide (Clerk Dashboard)

### Step-by-Step Instructions for Setting Up Each Role

#### Prerequisites
- Access to Clerk Dashboard: https://dashboard.clerk.com
- Admin access to your Clerk application
- Test users already created via Sign Up

---

### 11.1 Access Clerk Dashboard

1. Go to https://dashboard.clerk.com
2. Sign in with your admin account
3. Select your EduNexus application

---

### 11.2 Locate User

1. Click **Users** in the left sidebar
2. Search for the user by email (e.g., `platform.owner@test.edunexus.io`)
3. Click on the user row to open their profile

---

### 11.3 Assign Role via Public Metadata

For each role, follow these steps:

1. In the user profile, scroll to **Public metadata**
2. Click **Edit** button
3. Enter the JSON below based on role:

#### Platform Owner
```json
{
  "role": "platform_owner"
}
```

#### Principal
```json
{
  "role": "principal",
  "tenantId": "test-tenant-001"
}
```

#### HOD
```json
{
  "role": "hod",
  "tenantId": "test-tenant-001",
  "departmentId": "dept-cse-001"
}
```

#### Admin Staff
```json
{
  "role": "admin_staff",
  "tenantId": "test-tenant-001"
}
```

#### Teacher
```json
{
  "role": "teacher",
  "tenantId": "test-tenant-001",
  "departmentId": "dept-cse-001"
}
```

#### Lab Assistant
```json
{
  "role": "lab_assistant",
  "tenantId": "test-tenant-001",
  "departmentId": "dept-cse-001"
}
```

#### Student
```json
{
  "role": "student",
  "tenantId": "test-tenant-001",
  "studentId": "student-001"
}
```

#### Parent
```json
{
  "role": "parent",
  "tenantId": "test-tenant-001",
  "childIds": ["student-001"]
}
```

4. Click **Save**
5. User will have role on next login

---

### 11.4 Verify Role Assignment

1. Sign out of the application
2. Sign in with the test user
3. Verify redirect to correct portal:

| Role | Expected Redirect |
|------|-------------------|
| platform_owner | `/platform` |
| principal | `/principal` |
| hod | `/hod` |
| admin_staff | `/admin` |
| teacher | `/teacher` |
| lab_assistant | `/lab-assistant` |
| student | `/student` |
| parent | `/parent` |

---

### 11.5 Alternative: Assign Roles via API

```bash
# Using Clerk Backend API
# Replace <USER_ID> and <CLERK_SECRET_KEY>

curl -X PATCH "https://api.clerk.com/v1/users/<USER_ID>" \
  -H "Authorization: Bearer <CLERK_SECRET_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "public_metadata": {
      "role": "principal",
      "tenantId": "test-tenant-001"
    }
  }'
```

---

## 12. API Test Endpoints

### Base URL
```
http://localhost:3001/api
```

### Headers Required
```bash
# For authenticated requests
-H "Authorization: Bearer <JWT_TOKEN>"
-H "x-tenant-id: test-tenant-001"
-H "Content-Type: application/json"
```

---

### 12.1 Authentication Endpoints

```bash
# Get current user (requires auth)
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"

# Response: { "id": "...", "email": "...", "role": "..." }
```

---

### 12.2 Tenant Endpoints (Platform Owner)

```bash
# List all tenants
curl http://localhost:3001/api/tenants \
  -H "Authorization: Bearer <PLATFORM_OWNER_TOKEN>"

# Create tenant
curl -X POST http://localhost:3001/api/tenants \
  -H "Authorization: Bearer <PLATFORM_OWNER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Engineering College",
    "subdomain": "test-college",
    "adminEmail": "principal@test.edunexus.io"
  }'

# Get tenant by ID
curl http://localhost:3001/api/tenants/test-tenant-001 \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 12.3 Department Endpoints (Principal/HOD)

```bash
# List departments
curl http://localhost:3001/api/departments \
  -H "Authorization: Bearer <TOKEN>" \
  -H "x-tenant-id: test-tenant-001"

# Create department
curl -X POST http://localhost:3001/api/departments \
  -H "Authorization: Bearer <PRINCIPAL_TOKEN>" \
  -H "x-tenant-id: test-tenant-001" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Computer Science",
    "code": "CSE",
    "hodId": "staff-001"
  }'

# Get department
curl http://localhost:3001/api/departments/dept-cse-001 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "x-tenant-id: test-tenant-001"
```

---

### 12.4 Staff Endpoints (Principal/Admin)

```bash
# List staff
curl http://localhost:3001/api/staff \
  -H "Authorization: Bearer <TOKEN>" \
  -H "x-tenant-id: test-tenant-001"

# Create staff
curl -X POST http://localhost:3001/api/staff \
  -H "Authorization: Bearer <PRINCIPAL_TOKEN>" \
  -H "x-tenant-id: test-tenant-001" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sharma",
    "email": "sharma@test.edunexus.io",
    "departmentId": "dept-cse-001",
    "role": "teacher"
  }'
```

---

### 12.5 Student Enrollment Endpoints

```bash
# Initiate enrollment (Admin)
curl -X POST http://localhost:3001/api/student-enrollment/initiate \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "x-tenant-id: test-tenant-001" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Rahul",
    "lastName": "Sharma",
    "email": "rahul.test@example.com",
    "mobileNumber": "9876543210",
    "departmentId": "dept-cse-001",
    "academicYear": "2025-26"
  }'

# List enrollments (Admin)
curl http://localhost:3001/api/student-enrollment \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "x-tenant-id: test-tenant-001"

# Send invitation (Admin)
curl -X POST http://localhost:3001/api/student-enrollment/<ID>/send-invitation \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "x-tenant-id: test-tenant-001"

# Verify token (Public)
curl http://localhost:3001/api/student-enrollment/verify/<TOKEN>

# Update profile (Public, token-based)
curl -X PATCH http://localhost:3001/api/student-enrollment/profile/<TOKEN> \
  -H "Content-Type: application/json" \
  -d '{
    "personalDetails": {
      "dateOfBirth": "2005-05-15",
      "gender": "male",
      "address": "123 Main St, City"
    }
  }'

# Submit application (Public, token-based)
curl -X POST http://localhost:3001/api/student-enrollment/submit/<TOKEN>

# Admin review (Admin)
curl -X POST http://localhost:3001/api/student-enrollment/<ID>/admin-review \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "x-tenant-id: test-tenant-001" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "sectionId": "section-a-001",
    "notes": "Documents verified"
  }'

# Pending approvals (HOD/Principal)
curl http://localhost:3001/api/student-enrollment/pending-approval \
  -H "Authorization: Bearer <HOD_TOKEN>" \
  -H "x-tenant-id: test-tenant-001"

# Final approval (HOD/Principal)
curl -X POST http://localhost:3001/api/student-enrollment/<ID>/approve \
  -H "Authorization: Bearer <HOD_TOKEN>" \
  -H "x-tenant-id: test-tenant-001"
```

---

### 12.6 Student Record Endpoints

```bash
# List students
curl http://localhost:3001/api/students \
  -H "Authorization: Bearer <TOKEN>" \
  -H "x-tenant-id: test-tenant-001"

# Get student by ID
curl http://localhost:3001/api/students/student-001 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "x-tenant-id: test-tenant-001"

# Create student
curl -X POST http://localhost:3001/api/students \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "x-tenant-id: test-tenant-001" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Kumar",
    "email": "rahul@test.edunexus.io",
    "rollNo": "21CS101",
    "batch": "2021",
    "departmentId": "dept-cse-001"
  }'
```

---

### 12.6 Attendance Endpoints (Teacher)

```bash
# Mark attendance
curl -X POST http://localhost:3001/api/attendance \
  -H "Authorization: Bearer <TEACHER_TOKEN>" \
  -H "x-tenant-id: test-tenant-001" \
  -H "Content-Type: application/json" \
  -d '{
    "subjectId": "subject-001",
    "date": "2026-01-07",
    "records": [
      {"studentId": "student-001", "status": "present"},
      {"studentId": "student-002", "status": "absent"}
    ]
  }'

# Get attendance for student
curl "http://localhost:3001/api/attendance/student/student-001?month=1&year=2026" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "x-tenant-id: test-tenant-001"
```

---

### 12.7 Exam Endpoints

```bash
# List exams
curl http://localhost:3001/api/exams \
  -H "Authorization: Bearer <TOKEN>" \
  -H "x-tenant-id: test-tenant-001"

# Get upcoming exams
curl http://localhost:3001/api/exams/upcoming \
  -H "Authorization: Bearer <TOKEN>" \
  -H "x-tenant-id: test-tenant-001"

# Create exam
curl -X POST http://localhost:3001/api/exams \
  -H "Authorization: Bearer <TEACHER_TOKEN>" \
  -H "x-tenant-id: test-tenant-001" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mid-Semester Exam",
    "subjectId": "subject-001",
    "type": "midterm",
    "date": "2026-02-15",
    "totalMarks": 50
  }'

# Submit bulk marks
curl -X POST http://localhost:3001/api/exam-results/bulk \
  -H "Authorization: Bearer <TEACHER_TOKEN>" \
  -H "x-tenant-id: test-tenant-001" \
  -H "Content-Type: application/json" \
  -d '{
    "examId": "exam-001",
    "results": [
      {"studentId": "student-001", "marks": 45},
      {"studentId": "student-002", "marks": 38}
    ]
  }'
```

---

### 12.8 Fee Endpoints

```bash
# Get student fees
curl http://localhost:3001/api/fees/student/student-001 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "x-tenant-id: test-tenant-001"

# Create payment order (Razorpay)
curl -X POST http://localhost:3001/api/payments/create-order \
  -H "Authorization: Bearer <STUDENT_TOKEN>" \
  -H "x-tenant-id: test-tenant-001" \
  -H "Content-Type: application/json" \
  -d '{
    "feeId": "fee-001",
    "amount": 25000
  }'
```

---

### 12.9 Transport Endpoints

```bash
# List routes
curl http://localhost:3001/api/transport/routes \
  -H "Authorization: Bearer <TOKEN>" \
  -H "x-tenant-id: test-tenant-001"

# Get student pass
curl http://localhost:3001/api/transport/passes/student/student-001 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "x-tenant-id: test-tenant-001"
```

---

### 12.10 Library Endpoints

```bash
# Search books
curl "http://localhost:3001/api/library/books?search=algorithms" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "x-tenant-id: test-tenant-001"

# Issue book
curl -X POST http://localhost:3001/api/library/issues \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "x-tenant-id: test-tenant-001" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "book-001",
    "studentId": "student-001"
  }'
```

---

## 13. Bug Report Template

### Bug Report Form

Use this template when logging bugs found during E2E testing:

```markdown
## Bug Report

### Bug ID
BUG-[YYYY-MM-DD]-[NUMBER]
Example: BUG-2026-01-07-001

### Summary
[One-line description of the bug]

### Severity
- [ ] Critical (System down, data loss)
- [ ] High (Major feature broken)
- [ ] Medium (Feature partially working)
- [ ] Low (Minor issue, cosmetic)

### Priority
- [ ] P1 - Fix immediately
- [ ] P2 - Fix before release
- [ ] P3 - Fix when possible

### Test Case Reference
TC-[PERSONA]-[NUMBER]
Example: TC-ST-005 (Student Fee Payment)

### Environment
- **Browser:** Chrome 120 / Firefox 121 / Safari 17
- **OS:** macOS / Windows / Linux
- **Screen Size:** Desktop / Tablet / Mobile
- **API Server:** Running / Not Running
- **Database:** Connected / Error

### Steps to Reproduce
1. Navigate to [URL]
2. Click [Button/Link]
3. Enter [Data]
4. Submit

### Expected Result
[What should happen]

### Actual Result
[What actually happened]

### Screenshots/Videos
[Attach screenshots or screen recordings]

### Console Errors
```
[Paste any browser console errors]
```

### Network Errors
[Paste any failed API requests from Network tab]

### Additional Context
[Any other relevant information]

### Reported By
[Your Name]

### Date Reported
[YYYY-MM-DD]
```

---

### Sample Bug Reports

#### Example 1: Critical Bug

```markdown
## Bug Report

### Bug ID
BUG-2026-01-07-001

### Summary
Payment fails with 500 error when paying fees via UPI

### Severity
- [x] Critical (System down, data loss)

### Priority
- [x] P1 - Fix immediately

### Test Case Reference
TC-ST-005 (Student Fee Payment)

### Environment
- **Browser:** Chrome 120
- **OS:** macOS
- **API Server:** Running
- **Database:** Connected

### Steps to Reproduce
1. Navigate to `/student/fees`
2. Click "Pay Now" on pending fee
3. Select UPI as payment method
4. Enter UPI ID
5. Click "Pay"

### Expected Result
Razorpay popup opens, payment processes

### Actual Result
Error toast: "Payment failed. Please try again."
Console shows: POST /api/payments/create-order returned 500

### Console Errors
```
POST http://localhost:3001/api/payments/create-order 500 (Internal Server Error)
Error: Razorpay key not configured
```

### Reported By
QA Team

### Date Reported
2026-01-07
```

---

#### Example 2: Medium Bug

```markdown
## Bug Report

### Bug ID
BUG-2026-01-07-002

### Summary
Attendance percentage shows NaN when no attendance records exist

### Severity
- [ ] Critical
- [ ] High
- [x] Medium (Feature partially working)

### Priority
- [ ] P1
- [x] P2 - Fix before release

### Test Case Reference
TC-ST-003 (Student Attendance)

### Environment
- **Browser:** Chrome 120
- **OS:** Windows 11

### Steps to Reproduce
1. Login as new student with no attendance history
2. Navigate to `/student/attendance`

### Expected Result
Show "0%" or "No attendance records yet"

### Actual Result
Shows "NaN%" in attendance card

### Screenshots
[attendance_nan.png attached]

### Reported By
QA Team

### Date Reported
2026-01-07
```

---

### Bug Tracking Sheet

| Bug ID | Summary | Severity | Status | Assigned To |
|--------|---------|----------|--------|-------------|
| BUG-2026-01-07-001 | Payment 500 error | Critical | Open | Backend |
| BUG-2026-01-07-002 | Attendance NaN | Medium | In Progress | Frontend |

---

## 14. Test Data Samples

### 14.1 Tenant Seed Data

```json
{
  "id": "test-tenant-001",
  "name": "Test Engineering College",
  "subdomain": "test-college",
  "logo": null,
  "settings": {
    "theme": "default",
    "features": ["attendance", "fees", "exams", "transport", "hostel", "library", "placements"]
  },
  "status": "active",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

### 14.2 Department Seed Data

```json
[
  {
    "id": "dept-cse-001",
    "tenantId": "test-tenant-001",
    "name": "Computer Science and Engineering",
    "code": "CSE",
    "hodId": "staff-hod-001"
  },
  {
    "id": "dept-ece-001",
    "tenantId": "test-tenant-001",
    "name": "Electronics and Communication",
    "code": "ECE",
    "hodId": "staff-hod-002"
  },
  {
    "id": "dept-mech-001",
    "tenantId": "test-tenant-001",
    "name": "Mechanical Engineering",
    "code": "MECH",
    "hodId": "staff-hod-003"
  }
]
```

---

### 14.3 Staff Seed Data

```json
[
  {
    "id": "staff-principal-001",
    "tenantId": "test-tenant-001",
    "name": "Dr. Rajesh Kumar",
    "email": "principal@test.edunexus.io",
    "role": "principal",
    "departmentId": null
  },
  {
    "id": "staff-hod-001",
    "tenantId": "test-tenant-001",
    "name": "Dr. Priya Sharma",
    "email": "hod.cse@test.edunexus.io",
    "role": "hod",
    "departmentId": "dept-cse-001"
  },
  {
    "id": "staff-teacher-001",
    "tenantId": "test-tenant-001",
    "name": "Prof. Amit Singh",
    "email": "amit.singh@test.edunexus.io",
    "role": "teacher",
    "departmentId": "dept-cse-001"
  },
  {
    "id": "staff-lab-001",
    "tenantId": "test-tenant-001",
    "name": "Mr. Suresh Kumar",
    "email": "lab.cse@test.edunexus.io",
    "role": "lab_assistant",
    "departmentId": "dept-cse-001"
  },
  {
    "id": "staff-admin-001",
    "tenantId": "test-tenant-001",
    "name": "Mrs. Lakshmi Devi",
    "email": "admin@test.edunexus.io",
    "role": "admin_staff",
    "departmentId": null
  }
]
```

---

### 14.4 Student Seed Data

```json
[
  {
    "id": "student-001",
    "tenantId": "test-tenant-001",
    "userId": null,
    "name": "Rahul Kumar",
    "email": "rahul.kumar@test.edunexus.io",
    "rollNo": "21CS101",
    "batch": "2021",
    "semester": 6,
    "departmentId": "dept-cse-001",
    "section": "A",
    "status": "active"
  },
  {
    "id": "student-002",
    "tenantId": "test-tenant-001",
    "userId": null,
    "name": "Priya Patel",
    "email": "priya.patel@test.edunexus.io",
    "rollNo": "21CS102",
    "batch": "2021",
    "semester": 6,
    "departmentId": "dept-cse-001",
    "section": "A",
    "status": "active"
  },
  {
    "id": "student-003",
    "tenantId": "test-tenant-001",
    "userId": null,
    "name": "Vikram Singh",
    "email": "vikram.singh@test.edunexus.io",
    "rollNo": "21CS103",
    "batch": "2021",
    "semester": 6,
    "departmentId": "dept-cse-001",
    "section": "B",
    "status": "active"
  }
]
```

---

### 14.5 Subject Seed Data

```json
[
  {
    "id": "subject-001",
    "tenantId": "test-tenant-001",
    "name": "Data Structures and Algorithms",
    "code": "CS301",
    "departmentId": "dept-cse-001",
    "semester": 3,
    "credits": 4,
    "isLab": false
  },
  {
    "id": "subject-002",
    "tenantId": "test-tenant-001",
    "name": "Database Management Systems",
    "code": "CS401",
    "departmentId": "dept-cse-001",
    "semester": 4,
    "credits": 4,
    "isLab": false
  },
  {
    "id": "subject-003",
    "tenantId": "test-tenant-001",
    "name": "DSA Lab",
    "code": "CS301L",
    "departmentId": "dept-cse-001",
    "semester": 3,
    "credits": 2,
    "isLab": true
  }
]
```

---

### 14.6 Exam Seed Data

```json
[
  {
    "id": "exam-001",
    "tenantId": "test-tenant-001",
    "name": "Mid-Semester Examination",
    "subjectId": "subject-001",
    "type": "midterm",
    "date": "2026-02-15T09:00:00Z",
    "totalMarks": 50,
    "duration": 120
  },
  {
    "id": "exam-002",
    "tenantId": "test-tenant-001",
    "name": "End-Semester Examination",
    "subjectId": "subject-001",
    "type": "endsem",
    "date": "2026-05-10T09:00:00Z",
    "totalMarks": 100,
    "duration": 180
  },
  {
    "id": "exam-003",
    "tenantId": "test-tenant-001",
    "name": "Practical Exam",
    "subjectId": "subject-003",
    "type": "practical",
    "date": "2026-05-05T14:00:00Z",
    "totalMarks": 50,
    "duration": 180
  }
]
```

---

### 14.7 Fee Seed Data

```json
[
  {
    "id": "fee-001",
    "tenantId": "test-tenant-001",
    "studentId": "student-001",
    "type": "tuition",
    "amount": 75000,
    "dueDate": "2026-01-31",
    "status": "pending"
  },
  {
    "id": "fee-002",
    "tenantId": "test-tenant-001",
    "studentId": "student-001",
    "type": "hostel",
    "amount": 50000,
    "dueDate": "2026-01-31",
    "status": "pending"
  },
  {
    "id": "fee-003",
    "tenantId": "test-tenant-001",
    "studentId": "student-002",
    "type": "tuition",
    "amount": 75000,
    "dueDate": "2026-01-31",
    "status": "paid",
    "paidAt": "2026-01-05T10:30:00Z"
  }
]
```

---

### 14.8 SQL Seed Script

```sql
-- Run this in PostgreSQL to seed test data
-- Ensure you're connected to the edunexus database

-- Insert Test Tenant
INSERT INTO "Tenant" (id, name, subdomain, status, "createdAt", "updatedAt")
VALUES ('test-tenant-001', 'Test Engineering College', 'test-college', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Departments
INSERT INTO "Department" (id, "tenantId", name, code, "createdAt", "updatedAt")
VALUES
  ('dept-cse-001', 'test-tenant-001', 'Computer Science and Engineering', 'CSE', NOW(), NOW()),
  ('dept-ece-001', 'test-tenant-001', 'Electronics and Communication', 'ECE', NOW(), NOW()),
  ('dept-mech-001', 'test-tenant-001', 'Mechanical Engineering', 'MECH', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Students
INSERT INTO "Student" (id, "tenantId", name, email, "rollNo", batch, semester, "departmentId", section, status, "createdAt", "updatedAt")
VALUES
  ('student-001', 'test-tenant-001', 'Rahul Kumar', 'rahul.kumar@test.edunexus.io', '21CS101', '2021', 6, 'dept-cse-001', 'A', 'active', NOW(), NOW()),
  ('student-002', 'test-tenant-001', 'Priya Patel', 'priya.patel@test.edunexus.io', '21CS102', '2021', 6, 'dept-cse-001', 'A', 'active', NOW(), NOW()),
  ('student-003', 'test-tenant-001', 'Vikram Singh', 'vikram.singh@test.edunexus.io', '21CS103', '2021', 6, 'dept-cse-001', 'B', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Subjects
INSERT INTO "Subject" (id, "tenantId", name, code, "departmentId", semester, credits, "isLab", "createdAt", "updatedAt")
VALUES
  ('subject-001', 'test-tenant-001', 'Data Structures and Algorithms', 'CS301', 'dept-cse-001', 3, 4, false, NOW(), NOW()),
  ('subject-002', 'test-tenant-001', 'Database Management Systems', 'CS401', 'dept-cse-001', 4, 4, false, NOW(), NOW()),
  ('subject-003', 'test-tenant-001', 'DSA Lab', 'CS301L', 'dept-cse-001', 3, 2, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify data
SELECT 'Tenants' as table_name, COUNT(*) as count FROM "Tenant" WHERE id = 'test-tenant-001'
UNION ALL
SELECT 'Departments', COUNT(*) FROM "Department" WHERE "tenantId" = 'test-tenant-001'
UNION ALL
SELECT 'Students', COUNT(*) FROM "Student" WHERE "tenantId" = 'test-tenant-001'
UNION ALL
SELECT 'Subjects', COUNT(*) FROM "Subject" WHERE "tenantId" = 'test-tenant-001';
```

---

### 14.9 NPM Seed Command

```bash
# Add to package.json scripts
"db:seed:test": "npx prisma db seed -- --tenant=test"

# Run seed
cd /Users/sriramvenkatg/edunexus
DATABASE_URL="postgresql://edunexus:edunexus_dev_password@localhost:5432/edunexus" npm run db:seed:test
```

---

*Document generated for EduNexus E2E Testing*
*Use this guide for manual testing before production deployment*
