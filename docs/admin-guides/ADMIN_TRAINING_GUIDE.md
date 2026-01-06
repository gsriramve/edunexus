# EduNexus Administrator Training Guide

## Complete Guide for College Administrators

This comprehensive guide covers all administrative functions in EduNexus for Admin Staff, HODs, and Principals.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [User Management](#2-user-management)
3. [Department Management](#3-department-management)
4. [Student Administration](#4-student-administration)
5. [Staff Administration](#5-staff-administration)
6. [Fee Management](#6-fee-management)
7. [Academic Administration](#7-academic-administration)
8. [Transport Management](#8-transport-management)
9. [Hostel Management](#9-hostel-management)
10. [Library Management](#10-library-management)
11. [Communication](#11-communication)
12. [Reports & Analytics](#12-reports--analytics)
13. [System Configuration](#13-system-configuration)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. System Overview

### Role Hierarchy

```
Principal (Super Admin)
├── Full system access
├── All modules and reports
└── System configuration

HOD (Department Head)
├── Department-level access
├── Faculty management
├── Student management (dept)
└── Department reports

Admin Staff
├── Fee collection
├── Admissions
├── Student records
├── Communication
└── Operational modules

Teacher
├── Attendance
├── Marks entry
├── Materials upload
└── Student interaction

Lab Assistant
├── Lab attendance
├── Practical marks
└── Equipment status
```

### Navigation

- **Dashboard**: Overview and quick actions
- **Left Menu**: Main navigation
- **Top Bar**: Search, notifications, profile
- **Quick Actions**: Common tasks

---

## 2. User Management

### Creating New Users

1. Go to **Settings** > **Users**
2. Click "Add User"
3. Fill user details:
   - Full Name
   - Email (college domain)
   - Role (Staff/Teacher/Student/Parent)
   - Department (if applicable)
4. Click "Create"
5. User receives welcome email with login instructions

### Bulk User Import

1. Go to **Settings** > **Users** > **Import**
2. Download template (Excel)
3. Fill user data in template
4. Upload completed file
5. Review and confirm
6. Users created with temporary passwords

### Managing Roles

1. Go to **Settings** > **Roles**
2. View existing roles
3. Edit permissions per role
4. Create custom roles if needed

### Deactivating Users

1. Find user in user list
2. Click user name
3. Click "Deactivate"
4. Confirm action
5. User cannot login (data preserved)

---

## 3. Department Management

### Creating Departments

1. Go to **Departments** from menu
2. Click "Add Department"
3. Enter:
   - Department Name
   - Department Code
   - Description
4. Assign HOD
5. Save

### Managing Department

- Edit department details
- Change HOD assignment
- View department stats
- Manage courses under department

### Department Reports

- Faculty count
- Student count
- Attendance overview
- Performance metrics

---

## 4. Student Administration

### Student Admission

1. Go to **Admissions** from menu
2. Click "New Admission"
3. Complete student form:
   - Personal Details
   - Academic History
   - Parent/Guardian Info
   - Documents
4. Assign:
   - Roll Number
   - Department
   - Section
   - Batch
5. Submit for verification
6. After verification, student account created

### Bulk Student Import

1. Go to **Students** > **Import**
2. Download template
3. Fill student data
4. Upload file
5. Review validation results
6. Fix errors if any
7. Confirm import

### Student Profiles

Access and manage:
- Personal information
- Academic records
- Attendance history
- Fee records
- Documents
- Parent details

### Student Transfers

1. Go to student profile
2. Click "Transfer"
3. Select new department/section
4. Update roll number if needed
5. Add transfer remarks
6. Confirm

### Graduation/Exit

1. Go to student profile
2. Click "Graduate" or "Exit"
3. Select reason
4. Complete exit formalities
5. Generate leaving certificate
6. Archive student record

---

## 5. Staff Administration

### Adding Staff

1. Go to **Staff** from menu
2. Click "Add Staff"
3. Fill details:
   - Personal Info
   - Qualifications
   - Employment Details
   - Department
   - Designation
4. Assign subjects (for teachers)
5. Set role permissions
6. Create account

### Staff Documents

- Upload joining documents
- Qualification certificates
- ID proofs
- Experience letters

### Leave Management

1. Go to **Staff** > **Leave**
2. View leave requests
3. Approve/reject with remarks
4. Track leave balance

### Performance Tracking

- View teaching assignments
- Attendance compliance
- Student feedback (if enabled)
- Task completion

---

## 6. Fee Management

### Fee Structure Setup

1. Go to **Fees** > **Structure**
2. Click "Add Fee Type"
3. Define:
   - Fee Name (Tuition, Hostel, etc.)
   - Amount
   - Applicable to (branch/batch/all)
   - Due Date
   - Late Fee rules
4. Save

### Fee Collection

1. Go to **Fees** > **Collection**
2. Search student by name/roll
3. View pending fees
4. Select fees to collect
5. Choose payment mode
6. Enter payment details
7. Generate receipt

### Payment Methods

- **Cash**: Manual entry
- **Online**: Razorpay integration
- **Cheque**: Enter cheque details
- **DD**: Demand draft details
- **Bank Transfer**: NEFT/RTGS reference

### Fee Waivers

1. Go to **Fees** > **Waivers**
2. Click "New Waiver"
3. Select student
4. Select fee type
5. Enter waiver amount/percentage
6. Add reason and documents
7. Submit for approval

### Fee Reports

- Collection summary
- Outstanding dues
- Payment mode analysis
- Branch-wise collection
- Daily/Monthly reports

---

## 7. Academic Administration

### Academic Calendar

1. Go to **Academics** > **Calendar**
2. Add events:
   - Holidays
   - Exams
   - Events
   - Important dates
3. Set reminders
4. Publish to students/staff

### Exam Management

#### Creating Exams

1. Go to **Exams** > **Schedule**
2. Click "Add Exam"
3. Fill:
   - Exam Name
   - Type (Internal/External/Practical)
   - Subject
   - Date & Time
   - Total Marks
   - Venue
4. Assign invigilators
5. Publish schedule

#### Result Processing

1. Teachers enter marks
2. Go to **Exams** > **Results**
3. Review entered marks
4. Verify and approve
5. Publish results
6. Generate marksheets

### Timetable Management

1. Go to **Academics** > **Timetable**
2. Select section
3. Assign subjects to slots
4. Assign teachers
5. Check for conflicts
6. Publish

---

## 8. Transport Management

### Route Setup

1. Go to **Transport** > **Routes**
2. Click "Add Route"
3. Enter:
   - Route Name
   - Starting Point
   - Stops with timing
   - Vehicle Assignment
4. Save

### Vehicle Management

1. Go to **Transport** > **Vehicles**
2. Add vehicles with:
   - Registration Number
   - Capacity
   - Driver Details
   - Insurance Info
   - Fitness Certificate

### Pass Management

1. Go to **Transport** > **Passes**
2. View/approve pass requests
3. Assign routes to students
4. Generate passes

### Tracking

- Real-time vehicle tracking
- Route adherence
- Delay alerts
- Parent notifications

---

## 9. Hostel Management

### Block & Room Setup

1. Go to **Hostel** > **Blocks**
2. Add block:
   - Name
   - Type (Boys/Girls)
   - Warden
   - Capacity
3. Add rooms:
   - Room numbers
   - Floor
   - Capacity
   - Amenities

### Room Allocation

1. Go to **Hostel** > **Allocations**
2. Click "New Allocation"
3. Select student
4. Choose block and room
5. Set from/to dates
6. Confirm

### Mess Management

1. Go to **Hostel** > **Mess**
2. Update weekly menu
3. Set meal timings
4. Track special dietary needs

### Complaint Handling

1. Go to **Hostel** > **Complaints**
2. View pending complaints
3. Assign to staff
4. Track resolution
5. Close tickets

---

## 10. Library Management

### Catalog Management

1. Go to **Library** > **Catalog**
2. Add books:
   - ISBN
   - Title
   - Author
   - Publisher
   - Category
   - Copies
3. Import bulk via Excel

### Issue/Return

1. Go to **Library** > **Circulation**
2. Scan/enter student ID
3. Scan/enter book barcode
4. Issue or return
5. Calculate fines if overdue

### E-Resources

1. Go to **Library** > **E-Resources**
2. Add digital content:
   - Title
   - Type
   - File/URL
   - Access restrictions
3. Track downloads/views

---

## 11. Communication

### Announcements

1. Go to **Communication** > **Announcements**
2. Click "New Announcement"
3. Fill:
   - Title
   - Content
   - Priority
   - Target audience
   - Attachments
4. Publish immediately or schedule

### Bulk SMS/Email

1. Go to **Communication** > **Bulk**
2. Select recipients:
   - All students
   - Specific branch/batch
   - Custom selection
3. Choose channel (SMS/Email/Both)
4. Compose message
5. Send or schedule

### Templates

1. Go to **Communication** > **Templates**
2. Create reusable templates
3. Use variables for personalization
4. Save for quick use

---

## 12. Reports & Analytics

### Standard Reports

| Report | Purpose | Frequency |
|--------|---------|-----------|
| Attendance Summary | Overall attendance | Daily/Weekly |
| Fee Collection | Revenue tracking | Daily |
| Exam Results | Academic performance | Per exam |
| Student List | Master data | As needed |
| Staff Report | Faculty information | Monthly |

### Generating Reports

1. Go to **Reports** from menu
2. Select report type
3. Choose parameters:
   - Date range
   - Department/Branch
   - Format (PDF/Excel)
4. Generate
5. Download or email

### Scheduled Reports

1. Go to **Reports** > **Schedule**
2. Click "Add Schedule"
3. Select report
4. Set frequency
5. Add recipients
6. Activate

### Analytics Dashboard

- Student enrollment trends
- Fee collection analytics
- Attendance patterns
- Exam performance analysis
- Placement statistics

---

## 13. System Configuration

### General Settings

1. Go to **Settings** > **General**
2. Configure:
   - College name and logo
   - Academic year
   - Working days
   - Holiday list
   - Contact information

### Notification Settings

1. Go to **Settings** > **Notifications**
2. Configure triggers:
   - Fee reminders
   - Attendance alerts
   - Exam notifications
3. Set channels (Email/SMS/Push)

### Integration Settings

1. Go to **Settings** > **Integrations**
2. Configure:
   - Payment gateway
   - SMS provider
   - Email service

### Backup & Export

1. Go to **Settings** > **Data**
2. Export data (for backup)
3. Schedule automatic backups

---

## 14. Troubleshooting

### Common Issues

#### Login Problems
- Clear browser cache
- Reset password
- Check account status
- Contact IT if persists

#### Data Not Showing
- Check filters applied
- Verify permissions
- Refresh page
- Check date range

#### Payment Failures
- Verify payment gateway status
- Check bank connectivity
- Review error message
- Retry or use alternative method

#### Report Errors
- Check data availability
- Verify date range
- Try smaller dataset
- Contact support for large reports

### Support Escalation

1. **Level 1**: IT Helpdesk (basic issues)
2. **Level 2**: Admin Support (functionality)
3. **Level 3**: Technical Team (system issues)
4. **Level 4**: Vendor Support (critical bugs)

### Emergency Contacts

- **IT Helpdesk**: helpdesk@college.edu
- **System Admin**: admin@college.edu
- **EduNexus Support**: support@edunexus.com

---

## Best Practices

### Daily Tasks (Admin Staff)
- [ ] Process fee collections
- [ ] Handle student queries
- [ ] Update records as needed
- [ ] Check pending approvals

### Weekly Tasks (HOD)
- [ ] Review department reports
- [ ] Approve pending requests
- [ ] Check faculty compliance
- [ ] Monitor student attendance

### Monthly Tasks (Principal)
- [ ] Review analytics dashboards
- [ ] Verify financial reports
- [ ] Audit user access
- [ ] Check compliance status

---

## Training Checklist

Complete these exercises:

- [ ] Create a test student account
- [ ] Process a sample fee payment
- [ ] Mark attendance for a class
- [ ] Generate an attendance report
- [ ] Send a bulk SMS
- [ ] Create an exam schedule
- [ ] Export student data
- [ ] Handle a hostel complaint

---

*For additional support, contact your IT administrator or EduNexus support team.*

*Last Updated: January 2026*
