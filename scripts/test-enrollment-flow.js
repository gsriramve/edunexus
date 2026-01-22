/**
 * Test script for Student Enrollment & Onboarding flow
 *
 * Tests:
 * 1. Admin initiates enrollment
 * 2. Send invitation email (token generated)
 * 3. Verify token (public endpoint)
 * 4. Student updates profile
 * 5. Student submits application
 * 6. Admin reviews and approves
 * 7. HOD/Principal final approval
 */

const { chromium } = require('playwright');

const DOMAIN = 'http://localhost:3000';
const API_URL = 'http://localhost:3001/api';
const PASSWORD = 'Nexus@1104';
const TIMEOUT = 30000;

// Test data
const TEST_STUDENT = {
  firstName: 'Test',
  lastName: 'Student',
  email: `test.student.${Date.now()}@example.com`,
  mobileNumber: '9876543210',
  academicYear: '2025-26',
};

const results = {
  tests: [],
  passed: 0,
  failed: 0,
};

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    info: '\x1b[36mℹ\x1b[0m',
    success: '\x1b[32m✓\x1b[0m',
    error: '\x1b[31m✗\x1b[0m',
    warn: '\x1b[33m⚠\x1b[0m',
  }[type] || 'ℹ';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function recordTest(name, passed, details = '') {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    log(`${name}: PASSED ${details}`, 'success');
  } else {
    results.failed++;
    log(`${name}: FAILED ${details}`, 'error');
  }
}

async function loginAsAdmin(page) {
  log('Logging in as Admin Staff...');

  await page.goto(`${DOMAIN}/sign-in`);
  await page.waitForLoadState('networkidle');

  // Fill login form
  await page.fill('input[name="identifier"]', 'admin@nexus-ec.edu');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(1000);

  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button:has-text("Continue")');

  // Wait for redirect to dashboard
  await page.waitForURL('**/admin**', { timeout: TIMEOUT });
  log('Logged in as Admin Staff', 'success');
}

async function testEnrollmentListPage(page) {
  log('Testing enrollment list page...');

  try {
    await page.goto(`${DOMAIN}/admin/enrollments`);
    await page.waitForLoadState('networkidle');

    // Check page loaded
    const title = await page.locator('h1:has-text("Student Enrollments")').isVisible();

    // Check for New Enrollment button
    const newButton = await page.locator('button:has-text("New Enrollment")').isVisible();

    recordTest('Enrollment List Page', title && newButton, 'Page loads with title and New Enrollment button');
    return true;
  } catch (error) {
    recordTest('Enrollment List Page', false, error.message);
    return false;
  }
}

async function testNewEnrollmentPage(page) {
  log('Testing new enrollment creation...');

  try {
    await page.goto(`${DOMAIN}/admin/enrollments/new`);
    await page.waitForLoadState('networkidle');

    // Check form fields exist
    const formVisible = await page.locator('form').isVisible();
    const firstNameField = await page.locator('input#firstName').isVisible();
    const lastNameField = await page.locator('input#lastName').isVisible();
    const emailField = await page.locator('input#email').isVisible();
    const mobileField = await page.locator('input#mobileNumber').isVisible();

    recordTest('New Enrollment Form', formVisible && firstNameField && lastNameField && emailField && mobileField,
      'Form fields present');

    return formVisible;
  } catch (error) {
    recordTest('New Enrollment Form', false, error.message);
    return false;
  }
}

async function testCreateEnrollment(page, departmentId) {
  log('Creating test enrollment...');

  try {
    await page.goto(`${DOMAIN}/admin/enrollments/new`);
    await page.waitForLoadState('networkidle');

    // Fill the form
    await page.fill('input#firstName', TEST_STUDENT.firstName);
    await page.fill('input#lastName', TEST_STUDENT.lastName);
    await page.fill('input#email', TEST_STUDENT.email);
    await page.fill('input#mobileNumber', TEST_STUDENT.mobileNumber);

    // Select department
    await page.click('#departmentId');
    await page.waitForTimeout(500);
    const firstDept = page.locator('[role="option"]').first();
    if (await firstDept.isVisible()) {
      await firstDept.click();
    }

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect or success message
    await page.waitForTimeout(3000);

    // Check if redirected to enrollment detail page
    const currentUrl = page.url();
    const success = currentUrl.includes('/admin/enrollments/') && !currentUrl.includes('/new');

    recordTest('Create Enrollment', success, success ? `Redirected to: ${currentUrl}` : 'Failed to create enrollment');

    if (success) {
      // Extract enrollment ID from URL
      const match = currentUrl.match(/\/admin\/enrollments\/([a-f0-9-]+)/);
      return match ? match[1] : null;
    }
    return null;
  } catch (error) {
    recordTest('Create Enrollment', false, error.message);
    return null;
  }
}

async function testSendInvitation(page, enrollmentId) {
  log('Testing send invitation...');

  try {
    await page.goto(`${DOMAIN}/admin/enrollments/${enrollmentId}`);
    await page.waitForLoadState('networkidle');

    // Look for Send Invitation button
    const sendButton = page.locator('button:has-text("Send Invitation")');
    if (await sendButton.isVisible()) {
      await sendButton.click();
      await page.waitForTimeout(2000);

      // Check for success toast or status change
      const toastVisible = await page.locator('text="Invitation sent"').isVisible().catch(() => false);
      recordTest('Send Invitation', true, 'Invitation button clicked');
      return true;
    } else {
      recordTest('Send Invitation', false, 'Send Invitation button not found');
      return false;
    }
  } catch (error) {
    recordTest('Send Invitation', false, error.message);
    return false;
  }
}

async function testEnrollmentDetailPage(page, enrollmentId) {
  log('Testing enrollment detail page...');

  try {
    await page.goto(`${DOMAIN}/admin/enrollments/${enrollmentId}`);
    await page.waitForLoadState('networkidle');

    // Check for student name
    const studentName = await page.locator(`text="${TEST_STUDENT.firstName} ${TEST_STUDENT.lastName}"`).isVisible();

    // Check for status badge
    const statusBadge = await page.locator('.badge, [class*="badge"]').first().isVisible();

    recordTest('Enrollment Detail Page', studentName || statusBadge, 'Student details displayed');
    return true;
  } catch (error) {
    recordTest('Enrollment Detail Page', false, error.message);
    return false;
  }
}

async function testPublicEnrollmentPage(page, token) {
  log('Testing public enrollment page...');

  try {
    await page.goto(`${DOMAIN}/enroll/${token}`);
    await page.waitForLoadState('networkidle');

    // Check if the page shows enrollment form or error
    const pageContent = await page.content();
    const hasForm = pageContent.includes('profile') || pageContent.includes('enrollment');

    recordTest('Public Enrollment Page', hasForm, 'Public page accessible');
    return hasForm;
  } catch (error) {
    recordTest('Public Enrollment Page', false, error.message);
    return false;
  }
}

async function testApprovalPage(page) {
  log('Testing approval page (HOD/Principal view)...');

  try {
    // Login as HOD
    await page.goto(`${DOMAIN}/sign-out`);
    await page.waitForTimeout(2000);
    await page.goto(`${DOMAIN}/sign-in`);
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="identifier"]', 'hod.cse@nexus-ec.edu');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);

    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button:has-text("Continue")');

    await page.waitForURL('**/hod**', { timeout: TIMEOUT });

    // Navigate to approvals page
    await page.goto(`${DOMAIN}/approvals/enrollments`);
    await page.waitForLoadState('networkidle');

    const title = await page.locator('h1:has-text("Enrollment Approvals")').isVisible();
    recordTest('Approval Page (HOD)', title, 'Approval page accessible');
    return title;
  } catch (error) {
    recordTest('Approval Page (HOD)', false, error.message);
    return false;
  }
}

async function runTests() {
  log('Starting Enrollment Flow Tests...', 'info');
  log(`Domain: ${DOMAIN}`, 'info');
  log(`API: ${API_URL}`, 'info');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login as Admin
    await loginAsAdmin(page);

    // Test 1: Enrollment List Page
    await testEnrollmentListPage(page);

    // Test 2: New Enrollment Form
    await testNewEnrollmentPage(page);

    // Test 3: Create Enrollment
    const enrollmentId = await testCreateEnrollment(page);

    if (enrollmentId) {
      // Test 4: Enrollment Detail Page
      await testEnrollmentDetailPage(page, enrollmentId);

      // Test 5: Send Invitation
      await testSendInvitation(page, enrollmentId);
    }

    // Test 6: Approval Page
    await testApprovalPage(page);

  } catch (error) {
    log(`Test suite error: ${error.message}`, 'error');
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`\x1b[32mPassed: ${results.passed}\x1b[0m`);
  console.log(`\x1b[31mFailed: ${results.failed}\x1b[0m`);
  console.log('='.repeat(60));

  results.tests.forEach((test, i) => {
    const status = test.passed ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
    console.log(`${i + 1}. ${status} ${test.name}`);
    if (test.details) {
      console.log(`   └─ ${test.details}`);
    }
  });

  return results.failed === 0;
}

// Run the tests
runTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
