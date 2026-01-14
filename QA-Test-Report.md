# EduNexus QA Test Report
Generated: 2026-01-14T11:58:01.123Z
Domain: https://edu-nexus.co.in

## Summary

| Persona | Login | Pages Passed | 404 Errors | Load < 2s | Status |
|---------|-------|--------------|------------|-----------|--------|
| Platform Owner | ✅ | 3/3 | ✅ | ✅ | ✅ PASS |
| Principal | ✅ | 8/8 | ❌ | ✅ | ❌ FAIL |
| HOD | ✅ | 10/10 | ❌ | ✅ | ❌ FAIL |
| Admin Staff | ✅ | 6/6 | ❌ | ✅ | ❌ FAIL |
| Teacher | ✅ | 6/7 | ❌ | ✅ | ❌ FAIL |
| Lab Assistant | ✅ | 6/6 | ❌ | ✅ | ❌ FAIL |
| Student | ✅ | 9/9 | ❌ | ✅ | ❌ FAIL |
| Parent | ✅ | 6/6 | ❌ | ✅ | ❌ FAIL |
| Alumni | ✅ | 6/6 | ❌ | ✅ | ❌ FAIL |

**Overall: 1/9 personas passed all tests**

## Detailed Results

### Platform Owner (admin@edunexus.io)

- **Login**: Success (2365ms)
- **Dashboard Load**: 0ms
- **404 Errors**: No
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 1155ms | ✅ |
| Colleges | 845ms | ✅ |
| Help & Support | 622ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR

---

### Principal (principal@nexus-ec.edu)

- **Login**: Success (1636ms)
- **Dashboard Load**: 1ms
- **404 Errors**: Yes
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 1399ms | ✅ |
| Departments | 1198ms | ✅ |
| Faculty | 601ms | ✅ |
| Students | 1156ms | ✅ |
| Academics | 1204ms | ✅ |
| Reports | 1252ms | ✅ |
| Fee Overview | 1157ms | ✅ |
| Help & Support | 599ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- 404: https://edu-nexus.co.in/principal/faculty

---

### HOD (hod.cse@nexus-ec.edu)

- **Login**: Success (1625ms)
- **Dashboard Load**: 0ms
- **404 Errors**: Yes
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 1545ms | ✅ |
| Faculty | 1052ms | ✅ |
| Students | 1025ms | ✅ |
| Subjects | 1025ms | ✅ |
| Time Table | 589ms | ✅ |
| Attendance | 1117ms | ✅ |
| Results | 590ms | ✅ |
| At-Risk Students | 590ms | ✅ |
| Skill Gaps | 1027ms | ✅ |
| Help & Support | 595ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- 404: https://edu-nexus.co.in/hod/timetable
- 404: https://edu-nexus.co.in/hod/results
- 404: https://edu-nexus.co.in/hod/at-risk

---

### Admin Staff (admin@nexus-ec.edu)

- **Login**: Success (1650ms)
- **Dashboard Load**: 0ms
- **404 Errors**: Yes
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 1279ms | ✅ |
| Records | 1122ms | ✅ |
| Fee Management | 1145ms | ✅ |
| Attendance | 587ms | ✅ |
| Announcements | 600ms | ✅ |
| Help & Support | 599ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- 404: https://edu-nexus.co.in/admin/attendance
- 404: https://edu-nexus.co.in/admin/announcements

---

### Teacher (teacher@nexus-ec.edu)

- **Login**: Success (1606ms)
- **Dashboard Load**: 0ms
- **404 Errors**: Yes
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 0ms | ❌ page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "https://edu-nexus.co.in/teacher", waiting until "networkidle"[22m
 |
| Classes | 1004ms | ✅ |
| Attendance | 1984ms | ✅ |
| Results | 1002ms | ✅ |
| Materials | 1010ms | ✅ |
| Feedback | 969ms | ✅ |
| Help & Support | 612ms | ✅ |

#### Errors

- Dashboard: page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "https://edu-nexus.co.in/teacher", waiting until "networkidle"[22m

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- 404: https://edu-nexus.co.in/placeholder-avatar.jpg
- 404: https://edu-nexus.co.in/teacher/timetable?_rsc=q18w7
- 404: https://edu-nexus.co.in/placeholder-avatar.jpg
- 404: https://edu-nexus.co.in/teacher/profile?_rsc=q18w7

---

### Lab Assistant (lab@nexus-ec.edu)

- **Login**: Success (1622ms)
- **Dashboard Load**: 0ms
- **404 Errors**: Yes
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 663ms | ✅ |
| Labs | 593ms | ✅ |
| Attendance | 590ms | ✅ |
| Equipment | 597ms | ✅ |
| Marks Entry | 602ms | ✅ |
| Help & Support | 653ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)
- 404: https://edu-nexus.co.in/lab
- 404: https://edu-nexus.co.in/lab/labs
- 404: https://edu-nexus.co.in/lab/attendance
- 404: https://edu-nexus.co.in/lab/equipment
- 404: https://edu-nexus.co.in/lab/marks

---

### Student (student@nexus-ec.edu)

- **Login**: Success (1667ms)
- **Dashboard Load**: 0ms
- **404 Errors**: Yes
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 1281ms | ✅ |
| Academics | 1106ms | ✅ |
| Attendance | 1160ms | ✅ |
| Results | 595ms | ✅ |
| Fee Details | 1959ms | ✅ |
| ID Card | 594ms | ✅ |
| Career | 1059ms | ✅ |
| Insights | 1085ms | ✅ |
| Help & Support | 605ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- 404: https://edu-nexus.co.in/student/results
- 404: https://edu-nexus.co.in/student/id-card

---

### Parent (parent@nexus-ec.edu)

- **Login**: Success (1577ms)
- **Dashboard Load**: 0ms
- **404 Errors**: Yes
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 1015ms | ✅ |
| Academics | 891ms | ✅ |
| Attendance | 846ms | ✅ |
| Fee Details | 1067ms | ✅ |
| Communications | 588ms | ✅ |
| Help & Support | 597ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- 404: https://edu-nexus.co.in/parent/communications

---

### Alumni (alumni@nexus-ec.edu)

- **Login**: Success (1640ms)
- **Dashboard Load**: 0ms
- **404 Errors**: Yes
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 1026ms | ✅ |
| Events | 918ms | ✅ |
| Jobs | 592ms | ✅ |
| Mentorship | 907ms | ✅ |
| Directory | 937ms | ✅ |
| Help & Support | 605ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- Console: Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
- 404: https://edu-nexus.co.in/alumni/jobs

---

## Test Criteria

1. **Login Success**: User can successfully authenticate
2. **No 404 Errors**: No HTTP 404 responses during navigation
3. **Load Time < 2s**: All pages load within 2 seconds
4. **All Pages Accessible**: All navigation items for the persona work

## Notes

- Tests performed using Playwright headless browser
- Load times include network idle wait
- Some pages may show empty data (demo environment)
