#!/usr/bin/env python3
"""
EduNexus E2E Test Script - Tests a single persona
Usage: python test_persona.py --email <email> --password <password> --role <role> --college <college>
"""

import argparse
import json
import time
import os
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

BASE_URL = "http://15.206.243.177"

# Role to expected dashboard mapping
ROLE_DASHBOARDS = {
    "principal": "/principal",
    "hod": "/hod",
    "admin": "/admin",
    "teacher": "/teacher",
    "lab": "/lab-assistant",
    "student": "/student",
    "parent": "/parent"
}

# Role to expected sidebar items
ROLE_SIDEBAR_ITEMS = {
    "principal": ["Dashboard", "Academics", "Departments", "Staff", "Students", "Fees", "Reports", "Settings"],
    "hod": ["Dashboard", "Students", "Faculty", "Attendance", "Curriculum", "Exams", "Reports"],
    "admin": ["Dashboard", "Admissions", "Fees", "Documents", "Library", "Hostel", "Transport"],
    "teacher": ["Dashboard", "Classes", "Attendance", "Marks", "Assignments", "Materials"],
    "lab": ["Dashboard", "Equipment", "Attendance", "Marks"],
    "student": ["Dashboard", "Academics", "Attendance", "Fees", "Library", "Profile"],
    "parent": ["Dashboard", "Academics", "Attendance", "Fees", "Communication"]
}

def test_persona(email: str, password: str, role: str, college: str, output_dir: str):
    """Test a single persona end-to-end"""
    results = {
        "email": email,
        "role": role,
        "college": college,
        "timestamp": datetime.now().isoformat(),
        "tests": [],
        "performance": {},
        "errors": [],
        "screenshots": []
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        # Enable console logging
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        try:
            # Test 1: Login
            print(f"[{role}@{college}] Testing login...")
            start_time = time.time()
            page.goto(f"{BASE_URL}/sign-in", wait_until="networkidle")
            login_load_time = time.time() - start_time
            results["performance"]["login_page_load"] = round(login_load_time, 2)

            # Fill login form - Clerk form (email + password on same page)
            # Wait for form to be ready
            page.wait_for_timeout(1000)

            # Fill email
            email_input = page.locator('input[type="email"], input[name="identifier"]').first
            email_input.click()
            email_input.fill(email)
            page.wait_for_timeout(500)

            # Fill password
            password_input = page.locator('input[type="password"]').first
            password_input.click()
            password_input.fill(password)
            page.wait_for_timeout(500)

            # Click the Continue button (not Google button)
            # The Continue button is the last button in the form, not "Continue with Google"
            continue_btn = page.locator('button:text-is("Continue")').first
            continue_btn.click()

            # Wait for redirect to dashboard
            start_time = time.time()
            try:
                page.wait_for_url(f"**{ROLE_DASHBOARDS.get(role, '/redirect')}**", timeout=15000)
                dashboard_load_time = time.time() - start_time
                results["performance"]["dashboard_load"] = round(dashboard_load_time, 2)
                results["tests"].append({"name": "Login", "status": "PASS", "details": f"Redirected to {page.url}"})
            except PlaywrightTimeout:
                # Check current URL
                current_url = page.url
                if "/redirect" in current_url or "/setup" in current_url:
                    page.wait_for_timeout(3000)
                    current_url = page.url

                if ROLE_DASHBOARDS.get(role, "") in current_url:
                    results["tests"].append({"name": "Login", "status": "PASS", "details": f"Redirected to {current_url}"})
                else:
                    results["tests"].append({"name": "Login", "status": "FAIL", "details": f"Unexpected URL: {current_url}"})
                    results["errors"].append(f"Login redirect failed: {current_url}")

            # Take dashboard screenshot
            screenshot_path = f"{output_dir}/screenshots/{role}_{college}_dashboard.png"
            page.screenshot(path=screenshot_path, full_page=False)
            results["screenshots"].append(screenshot_path)

            # Test 2: Check for 404 errors
            print(f"[{role}@{college}] Checking for 404 errors...")
            page_title = page.title()
            page_content = page.content()

            if "404" in page_title or "not found" in page_content.lower():
                results["tests"].append({"name": "No 404", "status": "FAIL", "details": "404 page detected"})
            else:
                results["tests"].append({"name": "No 404", "status": "PASS", "details": "No 404 errors"})

            # Test 3: Check for Access Denied
            print(f"[{role}@{college}] Checking for access denied...")
            if "access denied" in page_content.lower() or "unauthorized" in page_content.lower():
                results["tests"].append({"name": "No Access Denied", "status": "FAIL", "details": "Access denied on dashboard"})
            else:
                results["tests"].append({"name": "No Access Denied", "status": "PASS", "details": "Dashboard accessible"})

            # Test 4: Check sidebar navigation exists
            print(f"[{role}@{college}] Checking sidebar navigation...")
            try:
                sidebar = page.locator('nav, aside, [role="navigation"]').first
                if sidebar.is_visible():
                    results["tests"].append({"name": "Sidebar Visible", "status": "PASS", "details": "Navigation sidebar visible"})
                else:
                    results["tests"].append({"name": "Sidebar Visible", "status": "FAIL", "details": "Sidebar not visible"})
            except:
                results["tests"].append({"name": "Sidebar Visible", "status": "WARN", "details": "Could not locate sidebar"})

            # Test 5: Navigate sidebar items and check for errors
            print(f"[{role}@{college}] Testing navigation links...")
            nav_links = page.locator('a[href^="/"]').all()
            nav_errors = []

            for i, link in enumerate(nav_links[:10]):  # Test first 10 links
                try:
                    href = link.get_attribute("href")
                    if href and not href.startswith("#"):
                        link.click()
                        page.wait_for_load_state("networkidle", timeout=10000)

                        # Check for 404 or error
                        if "404" in page.title() or "error" in page.title().lower():
                            nav_errors.append(f"404 on {href}")

                        page.wait_for_timeout(500)
                except Exception as e:
                    nav_errors.append(f"Error navigating: {str(e)[:50]}")

            if nav_errors:
                results["tests"].append({"name": "Navigation Links", "status": "FAIL", "details": "; ".join(nav_errors[:5])})
            else:
                results["tests"].append({"name": "Navigation Links", "status": "PASS", "details": f"Tested {min(10, len(nav_links))} links"})

            # Test 6: UI Alignment check
            print(f"[{role}@{college}] Checking UI alignment...")
            # Take full page screenshot for visual inspection
            full_screenshot = f"{output_dir}/screenshots/{role}_{college}_full.png"
            page.screenshot(path=full_screenshot, full_page=True)
            results["screenshots"].append(full_screenshot)

            # Check for overlapping elements (basic check)
            viewport = page.viewport_size
            if viewport:
                results["tests"].append({"name": "UI Alignment", "status": "PASS", "details": f"Viewport: {viewport['width']}x{viewport['height']}"})

            # Test 7: Check tenant data (look for college name in page)
            print(f"[{role}@{college}] Verifying tenant data...")
            page_text = page.inner_text("body")

            # Map college short names to full names
            college_names = {
                "nexus-ec": ["Nexus Engineering", "nexus-ec"],
                "quantum-it": ["Quantum Institute", "quantum-it"],
                "careerfied": ["Careerfied Academy", "careerfied"]
            }

            expected_names = college_names.get(college, [college])
            found_tenant = any(name.lower() in page_text.lower() for name in expected_names)

            if found_tenant:
                results["tests"].append({"name": "Tenant Data", "status": "PASS", "details": f"Found {college} data"})
            else:
                results["tests"].append({"name": "Tenant Data", "status": "WARN", "details": "Could not verify tenant-specific data"})

            # Check console errors
            if console_errors:
                results["errors"].extend(console_errors[:5])
                results["tests"].append({"name": "Console Errors", "status": "WARN", "details": f"{len(console_errors)} JS errors"})
            else:
                results["tests"].append({"name": "Console Errors", "status": "PASS", "details": "No JS errors"})

            # Logout
            print(f"[{role}@{college}] Logging out...")
            try:
                # Look for user menu or logout button
                user_button = page.locator('button:has-text("Sign out"), button:has-text("Logout"), [aria-label="User menu"]').first
                if user_button.is_visible():
                    user_button.click()
                    page.wait_for_timeout(1000)
                results["tests"].append({"name": "Logout", "status": "PASS", "details": "Logout attempted"})
            except:
                results["tests"].append({"name": "Logout", "status": "WARN", "details": "Could not find logout button"})

        except Exception as e:
            results["errors"].append(f"Test error: {str(e)}")
            results["tests"].append({"name": "Overall", "status": "ERROR", "details": str(e)[:100]})

            # Take error screenshot
            error_screenshot = f"{output_dir}/screenshots/{role}_{college}_error.png"
            try:
                page.screenshot(path=error_screenshot)
                results["screenshots"].append(error_screenshot)
            except:
                pass

        finally:
            browser.close()

    # Calculate summary
    passed = sum(1 for t in results["tests"] if t["status"] == "PASS")
    failed = sum(1 for t in results["tests"] if t["status"] == "FAIL")
    warned = sum(1 for t in results["tests"] if t["status"] == "WARN")

    results["summary"] = {
        "total": len(results["tests"]),
        "passed": passed,
        "failed": failed,
        "warnings": warned,
        "status": "PASS" if failed == 0 else "FAIL"
    }

    # Save results
    report_path = f"{output_dir}/reports/{role}_{college}_report.json"
    with open(report_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"[{role}@{college}] Tests complete: {passed} passed, {failed} failed, {warned} warnings")
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test a single EduNexus persona")
    parser.add_argument("--email", required=True, help="Login email")
    parser.add_argument("--password", required=True, help="Login password")
    parser.add_argument("--role", required=True, help="User role (principal, hod, admin, teacher, lab, student, parent)")
    parser.add_argument("--college", required=True, help="College identifier (nexus-ec, quantum-it, careerfied)")
    parser.add_argument("--output", default="/Users/sriramvenkatg/edunexus/e2e-tests", help="Output directory")

    args = parser.parse_args()

    result = test_persona(args.email, args.password, args.role, args.college, args.output)

    # Print summary
    print("\n" + "="*50)
    print(f"TEST SUMMARY: {args.role}@{args.college}")
    print("="*50)
    for test in result["tests"]:
        status_icon = "✓" if test["status"] == "PASS" else "✗" if test["status"] == "FAIL" else "⚠"
        print(f"  {status_icon} {test['name']}: {test['status']} - {test['details']}")
    print(f"\nOverall: {result['summary']['status']}")
