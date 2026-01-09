# EduNexus Personas

This document describes the 9 user personas in the EduNexus system, their roles, responsibilities, and key features.

## Persona Overview

| Persona | Role Code | Primary Focus | Dashboard Route |
|---------|-----------|---------------|-----------------|
| Platform Owner | `platform_owner` | Multi-tenant management | `/platform` |
| Principal | `principal` | Institution oversight | `/principal` |
| HOD | `hod` | Department management | `/hod` |
| Admin Staff | `admin_staff` | Administrative operations | `/admin` |
| Teacher | `teacher` | Academic delivery | `/teacher` |
| Lab Assistant | `lab_assistant` | Laboratory management | `/lab-assistant` |
| Student | `student` | Learning & growth | `/student` |
| Parent | `parent` | Child monitoring | `/parent` |
| Alumni | `alumni` | Networking & mentorship | `/alumni` |

---

## 1. Platform Owner

**Role Code:** `platform_owner`

### Profile
The Platform Owner is the super-administrator of the EduNexus SaaS platform, responsible for managing multiple college tenants.

### Key Responsibilities
- Tenant (college) onboarding and management
- Subscription and billing management
- Platform-wide settings and configurations
- Technical support and issue resolution
- Feature rollouts and updates

### Dashboard Features
- Active tenants overview
- Subscription status monitoring
- Support ticket management
- Platform health metrics
- Revenue analytics

### Pain Points Addressed
- Complex multi-tenant management
- Subscription lifecycle tracking
- Centralized support management

---

## 2. Principal

**Role Code:** `principal`

### Profile
The Principal is the head of the institution with complete visibility into all college operations.

### Key Responsibilities
- Institution-wide strategic oversight
- Department performance monitoring
- Budget and resource allocation
- Policy implementation
- Stakeholder communication

### Dashboard Features
- Institution KPI dashboard
- Department-wise performance metrics
- Faculty overview and management
- Student enrollment trends
- Financial summary
- Accreditation tracking (NBA/NAAC/NIRF)

### Key Metrics
- Overall attendance rate
- Academic performance trends
- Placement statistics
- Student growth indices
- Faculty performance scores

### Pain Points Addressed
- Lack of unified visibility
- Manual report compilation
- Delayed decision making

---

## 3. Head of Department (HOD)

**Role Code:** `hod`

### Profile
The HOD manages all academic and administrative activities within their department.

### Key Responsibilities
- Department academic planning
- Faculty workload distribution
- Student performance monitoring
- Curriculum management
- Industry collaboration

### Dashboard Features
- Department performance dashboard
- Faculty management
- Student list with filters
- Attendance analytics
- Result analysis
- Timetable management

### Key Metrics
- Department attendance percentage
- Pass rate by subject
- Faculty teaching hours
- Research output
- Placement rate (department-wise)

### Pain Points Addressed
- Manual attendance tracking
- Scattered student information
- Lack of trend analysis

---

## 4. Admin Staff

**Role Code:** `admin_staff`

### Profile
Admin Staff handles day-to-day administrative operations including records, fees, and certificates.

### Key Responsibilities
- Student records management
- Fee collection and tracking
- Certificate issuance
- Hostel and transport administration
- Communication management

### Dashboard Features
- Admin dashboard with quick actions
- Student records management
- Fee management module
- Certificate request processing
- Hostel allocation
- Transport management
- Library administration
- Bulk communication tools

### Key Metrics
- Pending fee collections
- Certificate request queue
- Hostel occupancy
- Library utilization
- Communication delivery rates

### Pain Points Addressed
- Paper-based record keeping
- Manual fee tracking
- Slow certificate processing

---

## 5. Teacher

**Role Code:** `teacher`

### Profile
Teachers are responsible for academic delivery, student assessment, and providing feedback.

### Key Responsibilities
- Subject teaching
- Attendance marking
- Assessment and grading
- Student feedback
- Mentoring

### Dashboard Features
- Today's schedule
- Quick attendance marking
- Class-wise student list
- Assignment management
- Grade entry
- Feedback submission
- Disengagement alerts

### Key Metrics
- Classes taught this week
- Pending assignments to grade
- Student performance by subject
- Feedback submission rate

### Pain Points Addressed
- Time-consuming attendance
- Manual gradebook management
- Lack of student insights

---

## 6. Lab Assistant

**Role Code:** `lab_assistant`

### Profile
Lab Assistants manage laboratory resources, equipment, and practical sessions.

### Key Responsibilities
- Lab session management
- Equipment inventory
- Practical attendance
- Consumable tracking
- Safety compliance

### Dashboard Features
- Lab schedule view
- Equipment inventory
- Consumable management
- Practical attendance marking
- Maintenance requests
- Safety checklist

### Key Metrics
- Lab utilization rate
- Equipment status
- Consumable levels
- Pending maintenance

### Pain Points Addressed
- Equipment tracking
- Consumable ordering delays
- Manual practical records

---

## 7. Student

**Role Code:** `student`

### Profile
Students are the primary users focused on their academic journey, growth, and career preparation.

### Key Responsibilities
- Academic performance
- Attendance maintenance
- Skill development
- Career preparation

### Dashboard Features
- Personal dashboard with SGI/CRI
- Attendance tracker
- Academic calendar
- Fee payment status
- Library access
- Certificate requests
- Goal tracking
- AI-powered guidance
- Journey timeline
- Mentor connections

### Key Metrics
- Student Growth Index (SGI)
- Career Readiness Index (CRI)
- Attendance percentage
- CGPA
- Achievements count

### Key Features
- **SGI Dashboard:** Academic, engagement, skills, and behavioral scores
- **CRI Dashboard:** Resume, interview, skill-fit, and industry exposure scores
- **Goals:** Personal goal setting with AI suggestions
- **Journey Timeline:** Visual academic journey with milestones
- **Mentorship:** Connect with alumni mentors

### Pain Points Addressed
- Lack of progress visibility
- No personalized guidance
- Disconnected career preparation

---

## 8. Parent

**Role Code:** `parent`

### Profile
Parents monitor their child's academic progress, attendance, and overall development.

### Key Responsibilities
- Child's progress monitoring
- Fee management
- School communication
- Event participation

### Dashboard Features
- Child's summary dashboard
- Attendance overview
- Academic performance
- Fee payment status
- Notifications and alerts
- Event calendar

### Key Metrics
- Child's attendance percentage
- Academic performance trend
- Fee payment status
- Pending notifications

### Pain Points Addressed
- Lack of visibility into child's progress
- Delayed communication
- Multiple payment channels

---

## 9. Alumni

**Role Code:** `alumni`

### Profile
Alumni are graduated students who can stay connected, mentor current students, and contribute to the institution.

### Key Responsibilities
- Profile maintenance
- Mentoring students
- Participating in events
- Contributing to institution

### Dashboard Features
- Alumni profile
- Employment history
- Mentorship management
- Event participation
- Contribution tracking
- Job referrals
- Alumni directory

### Key Features
- **Profile:** Employment history, achievements, social links
- **Mentorship:** Accept/manage mentee requests
- **Events:** Register for reunions, networking events
- **Contributions:** Donations, guest lectures, scholarships

### Pain Points Addressed
- Lost connection with alma mater
- No structured mentoring
- Limited contribution channels

---

## Role Hierarchy

```
Platform Owner
    │
    └── Principal
            │
            ├── HOD
            │     │
            │     ├── Teacher
            │     └── Lab Assistant
            │
            └── Admin Staff

    (Separate hierarchies)
    ├── Student
    ├── Parent (linked to Student)
    └── Alumni (graduated Student)
```

## Permission Levels

| Permission | Platform Owner | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|------------|:--------------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| Manage Tenants | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View All Departments | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Department | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Students | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Mark Attendance | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Submit Grades | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Own Data | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Child Data | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Mentor Students | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Test Account Credentials

**Password for all accounts:** `Nexus@1104`

### Nexus Engineering College (nexus-ec)
| Persona | Email |
|---------|-------|
| Principal | principal@nexus-ec.edu |
| HOD | hod.cse@nexus-ec.edu |
| Admin Staff | admin@nexus-ec.edu |
| Teacher | teacher@nexus-ec.edu |
| Lab Assistant | lab@nexus-ec.edu |
| Student | student@nexus-ec.edu |
| Parent | parent@nexus-ec.edu |
| Alumni | alumni@nexus-ec.edu |

### Quantum Institute of Technology (quantum-it)
| Persona | Email |
|---------|-------|
| Principal | principal@quantum-it.edu |
| HOD | hod.cse@quantum-it.edu |
| Admin Staff | admin@quantum-it.edu |
| Teacher | teacher@quantum-it.edu |
| Lab Assistant | lab@quantum-it.edu |
| Student | student@quantum-it.edu |
| Parent | parent@quantum-it.edu |
| Alumni | alumni@quantum-it.edu |

### Careerfied Academy (careerfied)
| Persona | Email |
|---------|-------|
| Principal | principal@careerfied.edu |
| HOD | hod.cse@careerfied.edu |
| Admin Staff | admin@careerfied.edu |
| Teacher | teacher@careerfied.edu |
| Lab Assistant | lab@careerfied.edu |
| Student | student@careerfied.edu |
| Parent | parent@careerfied.edu |
| Alumni | alumni@careerfied.edu |
