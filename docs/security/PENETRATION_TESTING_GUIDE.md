# EduNexus Penetration Testing Guide

## Overview
This guide outlines the penetration testing procedures for the EduNexus platform before production deployment.

---

## 1. Scope

### In-Scope
- Web Application (Next.js frontend)
- API Server (NestJS backend)
- ML Service (FastAPI)
- Authentication flows
- Multi-tenant isolation
- File upload/download
- Payment integration

### Out-of-Scope
- Third-party services (Clerk, Razorpay, SendGrid)
- AWS infrastructure (unless specifically authorized)
- Physical security
- Social engineering

---

## 2. Testing Environment

### Setup
```bash
# Clone repository
git clone https://github.com/your-org/edunexus.git
cd edunexus

# Start local environment
docker-compose up -d

# Verify services
curl http://localhost:3001/api/health
```

### Test Credentials
```
# Tenant: test-tenant

# Platform Owner
email: platform@test.com
role: platform_owner

# Principal
email: principal@test.com
role: principal

# Teacher
email: teacher@test.com
role: teacher

# Student
email: student@test.com
role: student

# Parent
email: parent@test.com
role: parent
```

---

## 3. Tools Required

### Recommended Tools
- **Burp Suite** - Web proxy and scanner
- **OWASP ZAP** - Free web scanner
- **Postman** - API testing
- **sqlmap** - SQL injection testing
- **Nuclei** - Vulnerability scanner
- **k6** - Load testing
- **nmap** - Port scanning

### Installation
```bash
# OWASP ZAP
brew install --cask owasp-zap

# sqlmap
pip install sqlmap

# Nuclei
brew install nuclei

# k6
brew install k6
```

---

## 4. Test Cases

### 4.1 Authentication Tests

#### 4.1.1 Brute Force Attack
```bash
# Test login rate limiting
for i in {1..100}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong'$i'"}'
done

# Expected: Rate limiting kicks in after threshold
```

#### 4.1.2 JWT Token Manipulation
```bash
# Decode JWT
echo $TOKEN | cut -d. -f2 | base64 -d

# Try modifying claims and re-signing
# Expected: Server should reject tampered tokens
```

#### 4.1.3 Session Fixation
- Log in as User A
- Copy session token
- Log in as User B
- Try using User A's token
- Expected: Old session invalidated

### 4.2 Authorization Tests

#### 4.2.1 Horizontal Privilege Escalation
```bash
# As student from tenant A, try accessing tenant B data
curl -X GET http://localhost:3001/api/students \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "x-tenant-id: tenant-b"

# Expected: 403 Forbidden
```

#### 4.2.2 Vertical Privilege Escalation
```bash
# As student, try admin-only endpoints
curl -X DELETE http://localhost:3001/api/students/123 \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "x-tenant-id: test-tenant"

# Expected: 403 Forbidden
```

#### 4.2.3 IDOR (Insecure Direct Object Reference)
```bash
# As student A, try accessing student B's records
curl -X GET http://localhost:3001/api/students/student-b-id/grades \
  -H "Authorization: Bearer $STUDENT_A_TOKEN"

# Expected: 403 Forbidden or 404 Not Found
```

### 4.3 Injection Tests

#### 4.3.1 SQL Injection
```bash
# Test common SQL injection payloads
curl -X GET "http://localhost:3001/api/students?search='; DROP TABLE students;--" \
  -H "Authorization: Bearer $TOKEN"

# Test with sqlmap
sqlmap -u "http://localhost:3001/api/students?search=test" \
  --headers="Authorization: Bearer $TOKEN"

# Expected: No SQL errors, queries parameterized
```

#### 4.3.2 NoSQL Injection
```bash
# Test MongoDB operators
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$gt":""},"password":{"$gt":""}}'

# Expected: Validation error, not authentication bypass
```

#### 4.3.3 Command Injection
```bash
# Test file operations
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@test.txt;filename=test.txt;rm -rf /" \
  -H "Authorization: Bearer $TOKEN"

# Expected: Filename sanitized
```

### 4.4 XSS Tests

#### 4.4.1 Stored XSS
```bash
# Create announcement with script
curl -X POST http://localhost:3001/api/communication/announcements \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<script>alert(1)</script>",
    "content": "<img src=x onerror=alert(1)>"
  }'

# View announcement in browser
# Expected: Script tags escaped/sanitized
```

#### 4.4.2 Reflected XSS
```
# Test URL parameters
http://localhost:3000/search?q=<script>alert(1)</script>

# Expected: Query parameter escaped in response
```

### 4.5 Multi-Tenant Isolation

#### 4.5.1 Cross-Tenant Data Access
```bash
# Create resource in tenant A
RESOURCE_ID=$(curl -X POST http://localhost:3001/api/exams \
  -H "Authorization: Bearer $TENANT_A_TOKEN" \
  -H "x-tenant-id: tenant-a" \
  -d '{"name":"Test Exam"}' | jq -r '.id')

# Try accessing from tenant B
curl -X GET http://localhost:3001/api/exams/$RESOURCE_ID \
  -H "Authorization: Bearer $TENANT_B_TOKEN" \
  -H "x-tenant-id: tenant-b"

# Expected: 404 Not Found (not 403, to prevent enumeration)
```

#### 4.5.2 Tenant Header Manipulation
```bash
# Try requests without tenant header
curl -X GET http://localhost:3001/api/students \
  -H "Authorization: Bearer $TOKEN"

# Expected: 400 Bad Request (tenant required)

# Try with invalid tenant
curl -X GET http://localhost:3001/api/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant-id: invalid-tenant"

# Expected: 403 Forbidden
```

### 4.6 File Upload Tests

#### 4.6.1 Malicious File Upload
```bash
# Try uploading executable
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@malware.exe" \
  -H "Authorization: Bearer $TOKEN"

# Expected: Rejected due to file type

# Try double extension
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@test.php.jpg" \
  -H "Authorization: Bearer $TOKEN"

# Expected: Proper MIME type validation
```

#### 4.6.2 Path Traversal
```bash
# Try accessing files outside allowed directory
curl -X GET "http://localhost:3001/api/documents/../../../etc/passwd" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 404 or sanitized path
```

### 4.7 API Rate Limiting

#### 4.7.1 Load Test
```bash
# Run k6 load test
cd scripts/load-testing
k6 run api-load-test.js

# Check for:
# - Response times under threshold
# - Rate limiting active
# - No 5xx errors under load
```

### 4.8 Business Logic Tests

#### 4.8.1 Fee Payment Manipulation
```bash
# Try modifying payment amount
curl -X POST http://localhost:3001/api/payments/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"feeId":"123","amount":1}'  # Original amount: 50000

# Expected: Server validates amount against fee record
```

#### 4.8.2 Grade Modification
```bash
# As teacher, try modifying grades for another subject
curl -X PUT http://localhost:3001/api/exam-results/123 \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{"marks": 100}'

# Expected: Only allowed for assigned subjects
```

---

## 5. Automated Scanning

### OWASP ZAP Scan
```bash
# Start ZAP in daemon mode
zap.sh -daemon -port 8080

# Run baseline scan
zap-baseline.py -t http://localhost:3000

# Run full scan
zap-full-scan.py -t http://localhost:3000 -r report.html
```

### Nuclei Scan
```bash
# Run with standard templates
nuclei -u http://localhost:3001 -t cves/ -t vulnerabilities/

# Run API-specific templates
nuclei -u http://localhost:3001/api -t http/
```

---

## 6. Reporting

### Vulnerability Classification

| Severity | CVSS Score | Response Time |
|----------|------------|---------------|
| Critical | 9.0 - 10.0 | Immediate |
| High | 7.0 - 8.9 | 24 hours |
| Medium | 4.0 - 6.9 | 1 week |
| Low | 0.1 - 3.9 | 1 month |
| Info | 0.0 | As needed |

### Report Template

```markdown
## Vulnerability Report

**Title**: [Brief description]
**Severity**: [Critical/High/Medium/Low/Info]
**CVSS Score**: [0.0 - 10.0]

### Description
[Detailed description of the vulnerability]

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Impact
[What can an attacker do with this vulnerability]

### Remediation
[How to fix the vulnerability]

### References
- [Related CVE or documentation]
```

---

## 7. Post-Testing

### Cleanup
- Remove test data
- Rotate any exposed credentials
- Clear test tenant

### Remediation Tracking
- Create tickets for all findings
- Prioritize by severity
- Schedule fixes before launch

---

*Last Updated: January 2026*
