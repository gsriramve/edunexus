# EduNexus QA Test Report
Generated: 2026-01-14T19:28:14.626Z
Domain: https://edu-nexus.co.in

## Summary

| Persona | Login | Pages Passed | 404 Errors | Load < 2s | Status |
|---------|-------|--------------|------------|-----------|--------|
| Platform Owner | ✅ | 3/3 | ✅ | ✅ | ✅ PASS |
| Principal | ✅ | 8/8 | ✅ | ✅ | ✅ PASS |
| HOD | ✅ | 9/10 | ✅ | ✅ | ❌ FAIL |
| Admin Staff | ✅ | 6/6 | ✅ | ✅ | ✅ PASS |
| Teacher | ✅ | 7/7 | ✅ | ✅ | ✅ PASS |
| Lab Assistant | ✅ | 6/6 | ✅ | ✅ | ✅ PASS |
| Student | ✅ | 9/9 | ✅ | ✅ | ✅ PASS |
| Parent | ✅ | 6/6 | ✅ | ✅ | ✅ PASS |
| Alumni | ✅ | 6/6 | ✅ | ✅ | ✅ PASS |

**Overall: 8/9 personas passed all tests**

## Detailed Results

### Platform Owner (admin@edunexus.io)

- **Login**: Success (1885ms)
- **Dashboard Load**: 0ms
- **404 Errors**: No
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 366ms | ✅ |
| Colleges | 184ms | ✅ |
| Help & Support | 69ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)

---

### Principal (principal@nexus-ec.edu)

- **Login**: Success (1883ms)
- **Dashboard Load**: 0ms
- **404 Errors**: No
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 150ms | ✅ |
| Departments | 113ms | ✅ |
| Faculty | 56ms | ✅ |
| Students | 117ms | ✅ |
| Academics | 143ms | ✅ |
| Reports | 120ms | ✅ |
| Fee Overview | 125ms | ✅ |
| Help & Support | 66ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)

---

### HOD (hod.cse@nexus-ec.edu)

- **Login**: Success (3012ms)
- **Dashboard Load**: 2ms
- **404 Errors**: No
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 738ms | ✅ |
| Faculty | 112ms | ✅ |
| Students | 124ms | ✅ |
| Subjects | 117ms | ✅ |
| Time Table | 61ms | ✅ |
| Attendance | 0ms | ❌ page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "https://edu-nexus.co.in/hod/attendance", waiting until "load"[22m
 |
| Results | 597ms | ✅ |
| At-Risk Students | 60ms | ✅ |
| Skill Gaps | 148ms | ✅ |
| Help & Support | 76ms | ✅ |

#### Errors

- Attendance: page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "https://edu-nexus.co.in/hod/attendance", waiting until "load"[22m

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: net::ERR_NETWORK_IO_SUSPENDED
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)
- Console: Auth initialization failed: TypeError: Failed to fetch
    at https://edu-nexus.co.in/_next/static/chunks/9044-a2dd1bd90fbe8b5b.js:1:1634
    at https://edu-nexus.co.in/_next/static/chunks/9044-a2dd1bd90fbe8b5b.js:1:2155
    at iy (https://edu-nexus.co.in/_next/static/chunks/87c73c54-6924dc1d7f5947de.js:1:92274)
    at um (https://edu-nexus.co.in/_next/static/chunks/87c73c54-6924dc1d7f5947de.js:1:116124)
    at up (https://edu-nexus.co.in/_next/static/chunks/87c73c54-6924dc1d7f5947de.js:1:115786)
    at um (https://edu-nexus.co.in/_next/static/chunks/87c73c54-6924dc1d7f5947de.js:1:116169)
    at up (https://edu-nexus.co.in/_next/static/chunks/87c73c54-6924dc1d7f5947de.js:1:115786)
    at um (https://edu-nexus.co.in/_next/static/chunks/87c73c54-6924dc1d7f5947de.js:1:116169)
    at up (https://edu-nexus.co.in/_next/static/chunks/87c73c54-6924dc1d7f5947de.js:1:115786)
    at um (https://edu-nexus.co.in/_next/static/chunks/87c73c54-6924dc1d7f5947de.js:1:116169)

---

### Admin Staff (admin@nexus-ec.edu)

- **Login**: Success (1683ms)
- **Dashboard Load**: 0ms
- **404 Errors**: No
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 170ms | ✅ |
| Records | 144ms | ✅ |
| Fee Management | 123ms | ✅ |
| Attendance | 61ms | ✅ |
| Announcements | 56ms | ✅ |
| Help & Support | 52ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 400 (Bad Request)
- Console: Failed to load resource: the server responded with a status of 400 (Bad Request)
- Console: Failed to load resource: the server responded with a status of 400 (Bad Request)

---

### Teacher (teacher@nexus-ec.edu)

- **Login**: Success (1621ms)
- **Dashboard Load**: 0ms
- **404 Errors**: No
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 165ms | ✅ |
| Classes | 159ms | ✅ |
| Attendance | 115ms | ✅ |
| Results | 109ms | ✅ |
| Materials | 138ms | ✅ |
| Feedback | 125ms | ✅ |
| Help & Support | 60ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)

---

### Lab Assistant (lab@nexus-ec.edu)

- **Login**: Success (1981ms)
- **Dashboard Load**: 0ms
- **404 Errors**: No
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 49ms | ✅ |
| Labs | 73ms | ✅ |
| Attendance | 44ms | ✅ |
| Equipment | 52ms | ✅ |
| Marks Entry | 47ms | ✅ |
| Help & Support | 88ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)

---

### Student (student@nexus-ec.edu)

- **Login**: Success (1618ms)
- **Dashboard Load**: 0ms
- **404 Errors**: No
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 141ms | ✅ |
| Academics | 125ms | ✅ |
| Attendance | 127ms | ✅ |
| Results | 60ms | ✅ |
| Fee Details | 130ms | ✅ |
| ID Card | 57ms | ✅ |
| Career | 117ms | ✅ |
| Insights | 103ms | ✅ |
| Help & Support | 61ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)

---

### Parent (parent@nexus-ec.edu)

- **Login**: Success (1810ms)
- **Dashboard Load**: 0ms
- **404 Errors**: No
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 217ms | ✅ |
| Academics | 127ms | ✅ |
| Attendance | 115ms | ✅ |
| Fee Details | 535ms | ✅ |
| Communications | 47ms | ✅ |
| Help & Support | 58ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)

---

### Alumni (alumni@nexus-ec.edu)

- **Login**: Success (1647ms)
- **Dashboard Load**: 0ms
- **404 Errors**: No
- **All Pages Under 2s**: Yes

#### Page Load Times

| Page | Load Time | Status |
|------|-----------|--------|
| Dashboard | 103ms | ✅ |
| Events | 111ms | ✅ |
| Jobs | 55ms | ✅ |
| Mentorship | 101ms | ✅ |
| Directory | 112ms | ✅ |
| Help & Support | 77ms | ✅ |

#### Errors

- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 401 (Unauthorized)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)
- Console: Failed to load resource: the server responded with a status of 404 (Not Found)

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
