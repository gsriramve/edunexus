# Feature Matrix

This document maps all EduNexus features to user personas, showing which roles have access to each feature.

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Full Access |
| 👁️ | View Only |
| 🔸 | Partial Access |
| ❌ | No Access |

---

## Dashboard & Overview

| Feature | Platform | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|---------|:--------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| Platform Dashboard | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Institution KPIs | ❌ | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Department Dashboard | ❌ | ✅ | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Personal Dashboard | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Child Dashboard | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## Academic Management

| Feature | Platform | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|---------|:--------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| **Departments** |
| Create/Edit Department | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Departments | ❌ | ✅ | ✅ | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| Assign HOD | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Courses & Subjects** |
| Create/Edit Course | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign Subjects | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Syllabus | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 👁️ | ❌ |
| **Timetable** |
| Create Timetable | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Timetable | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 👁️ | ❌ |

---

## Attendance Management

| Feature | Platform | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|---------|:--------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| Mark Class Attendance | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mark Lab Attendance | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Attendance Reports | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Own Attendance | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 👁️ | ❌ |
| Low Attendance Alerts | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |

---

## Examination & Results

| Feature | Platform | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|---------|:--------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| Schedule Exams | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Enter Marks | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Results | ❌ | ✅ | ✅ | ✅ | 🔸 | ❌ | ❌ | ❌ | ❌ |
| View Own Results | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 👁️ | ❌ |
| Result Analytics | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Student Growth & Career

| Feature | Platform | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|---------|:--------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| **Student Growth Index (SGI)** |
| View Institution SGI | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Department SGI | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Student SGI | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | 👁️ | ❌ |
| Configure SGI Weights | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Career Readiness (CRI)** |
| View CRI Dashboard | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | 👁️ | ❌ |
| View Skill Gaps | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Goals & Guidance** |
| Set Personal Goals | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View AI Guidance | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Assign Goals to Student | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Disengagement Alerts** |
| View/Manage Alerts | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Receive Alerts | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 360° Feedback System

| Feature | Platform | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|---------|:--------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| Manage Feedback Cycles | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Submit Faculty Feedback | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Submit Peer Feedback | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Self-Assessment | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Own Feedback | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Aggregated Reports | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Fee Management

| Feature | Platform | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|---------|:--------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| Configure Fee Structure | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Fee Collection | ❌ | ✅ | 👁️ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Record Payments | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Own Fees | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Make Payment | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Send Fee Reminders | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Library Management

| Feature | Platform | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|---------|:--------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| Manage Books | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Issue/Return Books | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Catalog | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Own Issues | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| E-Resources Access | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Library Reports | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Hostel & Transport

| Feature | Platform | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|---------|:--------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| **Hostel** |
| Manage Rooms | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Allocate Rooms | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Allocation | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | 👁️ | ❌ |
| **Transport** |
| Manage Routes | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Issue Passes | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Pass | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | 👁️ | ❌ |

---

## Certificates

| Feature | Platform | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|---------|:--------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| Configure Certificate Types | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Process Requests | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Request Certificate | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Own Requests | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Download Certificate | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## Alumni & Mentorship

| Feature | Platform | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|---------|:--------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| **Alumni Management** |
| Approve Registrations | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Alumni Directory | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Update Own Profile | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Mentorship** |
| Request Mentor | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Accept Mentees | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage Mentorships | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔸 | ❌ | ✅ |
| **Events** |
| Create Alumni Events | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Register for Events | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Clubs & Activities

| Feature | Platform | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|---------|:--------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| Manage Clubs | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Join Clubs | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Club Admin | ❌ | ❌ | ❌ | ❌ | 🔸 | ❌ | 🔸 | ❌ | ❌ |
| Sports Teams | ❌ | ✅ | ✅ | ✅ | 🔸 | ❌ | 🔸 | ❌ | ❌ |
| Record Achievements | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |

---

## Communications

| Feature | Platform | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|---------|:--------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| Manage Templates | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Send Bulk Messages | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Notifications | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Notification Settings | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Reports & Analytics

| Feature | Platform | Principal | HOD | Admin | Teacher | Lab Asst | Student | Parent | Alumni |
|---------|:--------:|:---------:|:---:|:-----:|:-------:|:--------:|:-------:|:------:|:------:|
| Platform Reports | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Institution Reports | ❌ | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Department Reports | ❌ | ✅ | ✅ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Class Reports | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Export to Excel | ❌ | ✅ | ✅ | ✅ | 🔸 | ❌ | ❌ | ❌ | ❌ |
| Accreditation Reports | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Feature Count by Persona

| Persona | Full Access | View Only | Partial | Total |
|---------|:-----------:|:---------:|:-------:|:-----:|
| Platform Owner | 5 | 0 | 0 | 5 |
| Principal | 45 | 8 | 0 | 53 |
| HOD | 28 | 6 | 1 | 35 |
| Admin Staff | 35 | 2 | 0 | 37 |
| Teacher | 15 | 2 | 4 | 21 |
| Lab Assistant | 8 | 2 | 0 | 10 |
| Student | 25 | 0 | 3 | 28 |
| Parent | 5 | 12 | 0 | 17 |
| Alumni | 10 | 1 | 0 | 11 |

---

## Related Documents

- [Personas Guide](../personas/PERSONAS.md)
- [Permission Hierarchy](../personas/PERMISSION_HIERARCHY.md)
- [User Journey Flows](../journeys/USER_JOURNEY_FLOWS.md)
