# User Journey Flows

This document outlines the key user journeys for each persona in EduNexus, visualized with Mermaid diagrams.

## Student Journeys

### Journey 1: Daily Check-in Flow

```mermaid
flowchart LR
    A[Login] --> B[Student Dashboard]
    B --> C{Check SGI Score}
    C --> D[View AI Guidance]
    D --> E[Check Today's Classes]
    E --> F[View Attendance]
    F --> G{Low Attendance?}
    G -->|Yes| H[View Remediation Tips]
    G -->|No| I[Continue to Assignments]
    I --> J[Submit Work]
    J --> K[Logout]
```

### Journey 2: Career Preparation Flow

```mermaid
flowchart TD
    A[Student Dashboard] --> B[View CRI Score]
    B --> C[Identify Skill Gaps]
    C --> D{Need Mentorship?}
    D -->|Yes| E[Browse Alumni Mentors]
    E --> F[Request Mentorship]
    F --> G[Await Approval]
    G --> H[Schedule Meeting]
    D -->|No| I[Set Personal Goals]
    I --> J[Track Progress]
    J --> K[Update Resume]
    K --> L[View Matching Companies]
```

### Journey 3: Fee Payment Flow

```mermaid
flowchart LR
    A[Dashboard] --> B[View Fee Summary]
    B --> C{Pending Fees?}
    C -->|Yes| D[View Fee Breakdown]
    D --> E[Select Payment]
    E --> F[Payment Gateway]
    F --> G{Success?}
    G -->|Yes| H[Download Receipt]
    G -->|No| I[Retry Payment]
    C -->|No| J[View History]
```

---

## Teacher Journeys

### Journey 4: Daily Attendance Flow

```mermaid
flowchart TD
    A[Login] --> B[Teacher Dashboard]
    B --> C[View Today's Schedule]
    C --> D[Select Class]
    D --> E[Mark Attendance]
    E --> F{All Students Marked?}
    F -->|No| G[Mark Present/Absent]
    G --> F
    F -->|Yes| H[Submit Attendance]
    H --> I[View Summary]
    I --> J[Check Low Attendance Alerts]
```

### Journey 5: Assessment & Grading Flow

```mermaid
flowchart TD
    A[Teacher Dashboard] --> B[Select Subject]
    B --> C[Create Assignment/Exam]
    C --> D[Set Deadline/Schedule]
    D --> E[Notify Students]
    E --> F[Collect Submissions]
    F --> G[Grade Submissions]
    G --> H[Enter Marks]
    H --> I[Submit Grades]
    I --> J[View Class Analytics]
```

### Journey 6: Student Feedback Flow

```mermaid
flowchart LR
    A[Dashboard] --> B[View Feedback Cycle]
    B --> C[Select Student]
    C --> D[Fill Feedback Form]
    D --> E[Rate Categories]
    E --> F[Add Comments]
    F --> G[Submit Feedback]
    G --> H[View Submission Status]
```

---

## HOD Journeys

### Journey 7: Department Overview Flow

```mermaid
flowchart TD
    A[Login] --> B[HOD Dashboard]
    B --> C[View Department Stats]
    C --> D{Issues Detected?}
    D -->|Low Attendance| E[View Affected Students]
    E --> F[Send Alerts]
    D -->|Poor Performance| G[Analyze Results]
    G --> H[Plan Intervention]
    D -->|No Issues| I[Check Faculty Workload]
    I --> J[Adjust Assignments]
```

### Journey 8: Faculty Management Flow

```mermaid
flowchart LR
    A[HOD Dashboard] --> B[Faculty Overview]
    B --> C[View Teaching Load]
    C --> D[Assign Subjects]
    D --> E[Review Feedback Scores]
    E --> F[Generate Reports]
```

---

## Admin Staff Journeys

### Journey 9: Certificate Processing Flow

```mermaid
flowchart TD
    A[Admin Dashboard] --> B[View Pending Requests]
    B --> C[Select Request]
    C --> D[Verify Student Details]
    D --> E{Approved?}
    E -->|Yes| F[Process Certificate]
    F --> G[Generate Document]
    G --> H[Notify Student]
    E -->|No| I[Add Rejection Reason]
    I --> J[Notify Student]
```

### Journey 10: Fee Management Flow

```mermaid
flowchart TD
    A[Admin Dashboard] --> B[Fee Management]
    B --> C[View Collection Summary]
    C --> D{Overdue Fees?}
    D -->|Yes| E[Generate Reminders]
    E --> F[Send Bulk SMS/Email]
    D -->|No| G[Generate Reports]
    G --> H[Export to Excel]
```

### Journey 11: Hostel Allocation Flow

```mermaid
flowchart LR
    A[Admin] --> B[Hostel Management]
    B --> C[View Room Availability]
    C --> D[Process Allocation Request]
    D --> E[Assign Room]
    E --> F[Generate Fee Entry]
    F --> G[Notify Student]
```

---

## Parent Journeys

### Journey 12: Child Monitoring Flow

```mermaid
flowchart TD
    A[Login] --> B[Parent Dashboard]
    B --> C[View Child Summary]
    C --> D[Check Attendance]
    D --> E{Low Attendance?}
    E -->|Yes| F[Contact Teacher]
    E -->|No| G[View Academic Progress]
    G --> H[Check Fee Status]
    H --> I{Pending Fees?}
    I -->|Yes| J[Make Payment]
    I -->|No| K[View Notifications]
```

---

## Alumni Journeys

### Journey 13: Mentorship Flow

```mermaid
flowchart TD
    A[Login] --> B[Alumni Dashboard]
    B --> C[View Mentorship Requests]
    C --> D{Accept Request?}
    D -->|Yes| E[Schedule First Meeting]
    E --> F[Conduct Sessions]
    F --> G[Log Meeting Notes]
    G --> H[Complete Mentorship]
    H --> I[Rate Mentee]
    D -->|No| J[Decline with Reason]
```

### Journey 14: Event Participation Flow

```mermaid
flowchart LR
    A[Dashboard] --> B[View Events]
    B --> C[Select Event]
    C --> D[Register]
    D --> E[Receive Confirmation]
    E --> F[Attend Event]
    F --> G[Provide Feedback]
```

---

## Principal Journeys

### Journey 15: Institution Overview Flow

```mermaid
flowchart TD
    A[Login] --> B[Principal Dashboard]
    B --> C[View Institution KPIs]
    C --> D[Department Performance]
    D --> E{Issues Detected?}
    E -->|Yes| F[Drill Down to Details]
    F --> G[Assign Action Items]
    E -->|No| H[Review Accreditation Status]
    H --> I[Check Placement Stats]
    I --> J[Generate Board Report]
```

---

## Cross-Persona Interactions

### Feedback Cycle Flow

```mermaid
sequenceDiagram
    participant Admin as Admin Staff
    participant Teacher as Teacher
    participant HOD as HOD
    participant Student as Student

    Admin->>Teacher: Open Feedback Cycle
    Teacher->>Student: Submit Faculty Feedback
    Student->>Student: Complete Self-Assessment
    Student->>Student: Peer Feedback
    HOD->>Student: HOD Feedback
    Admin->>Admin: Close Cycle
    Admin->>Student: Generate Summary
    Student->>Student: View Aggregated Feedback
```

### Placement Drive Flow

```mermaid
sequenceDiagram
    participant Admin as Placement Cell
    participant Student as Eligible Students
    participant Alumni as Alumni (Referrers)
    participant Company as Company

    Admin->>Student: Announce Drive
    Student->>Admin: Register Interest
    Alumni->>Student: Share Tips/Referrals
    Admin->>Company: Share Resumes
    Company->>Student: Shortlist & Interview
    Company->>Admin: Selection Results
    Admin->>Student: Communicate Offers
```

### Disengagement Alert Flow

```mermaid
sequenceDiagram
    participant System as AI System
    participant HOD as HOD
    participant Teacher as Mentor
    participant Parent as Parent
    participant Student as Student

    System->>HOD: Generate Alert
    HOD->>Teacher: Assign Follow-up
    Teacher->>Student: Counseling Session
    System->>Parent: Send Notification
    Teacher->>HOD: Report Resolution
    HOD->>System: Mark Resolved
```

---

## API Touchpoints Summary

| Journey | Key API Endpoints |
|---------|-------------------|
| Student Check-in | `GET /student-indices/dashboard/:id`, `GET /student-journey/my-dashboard` |
| Career Prep | `GET /alumni/mentors`, `POST /alumni/mentorship-request` |
| Fee Payment | `GET /student-fees/:studentId`, `POST /payments/initiate` |
| Attendance | `POST /teacher-attendance`, `GET /teacher-attendance/today` |
| Certificate | `GET /admin-records/certificates`, `PUT /admin-records/certificates/:id` |
| Parent Monitor | `GET /parent-dashboard/:studentId` |
| Alumni Mentor | `GET /alumni/my-mentorships`, `PUT /alumni/mentorship/:id` |
| Principal KPI | `GET /principal-dashboard`, `GET /principal-dashboard/departments` |

---

## Next Steps

For detailed API specifications, see [API Touchpoints](./API_TOUCHPOINTS.md).

For end-to-end test scenarios based on these journeys, see [E2E User Journeys](../testing/E2E_USER_JOURNEYS.md).
