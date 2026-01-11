#!/usr/bin/env python3
"""
Comprehensive QA Validation for Nexus Engineering College
Tests all 7 personas with responsiveness, data authenticity, and performance checks
"""

import sys
import time
import json
import os
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Test configuration
BASE_URL = "http://15.206.243.177:3000"
OUTPUT_DIR = "e2e-tests/screenshots/qa-validation"

# Credentials for Nexus EC
CREDENTIALS = {
    "principal": {"email": "principal@nexus-ec.edu", "password": "Nexus@1104", "expected_path": "/principal"},
    "hod": {"email": "hod.cse@nexus-ec.edu", "password": "Nexus@1104", "expected_path": "/hod"},
    "admin": {"email": "admin@nexus-ec.edu", "password": "Nexus@1104", "expected_path": "/admin"},
    "teacher": {"email": "teacher@nexus-ec.edu", "password": "Nexus@1104", "expected_path": "/teacher"},
    "lab": {"email": "lab@nexus-ec.edu", "password": "Nexus@1104", "expected_path": "/lab-assistant"},
    "student": {"email": "student@nexus-ec.edu", "password": "Nexus@1104", "expected_path": "/student"},
    "parent": {"email": "parent@nexus-ec.edu", "password": "Nexus@1104", "expected_path": "/parent"},
}

# Viewports for responsiveness testing
VIEWPORTS = {
    "mobile": {"width": 375, "height": 812},
    "tablet": {"width": 768, "height": 1024},
    "desktop": {"width": 1920, "height": 1080},
}

# Navigation routes per persona (comprehensive)
NAVIGATION_ROUTES = {
    "principal": [
        "/principal", "/principal/institution-metrics", "/principal/accreditation",
        "/principal/alumni", "/principal/feedback-cycles", "/principal/departments",
        "/principal/staff", "/principal/students", "/principal/academics",
        "/principal/exams", "/principal/fees", "/principal/reports", "/principal/settings", "/principal/users"
    ],
    "hod": [
        "/hod", "/hod/department-health", "/hod/skill-gaps", "/hod/face-enrollment",
        "/hod/feedback-cycles", "/hod/faculty", "/hod/students", "/hod/subjects",
        "/hod/attendance", "/hod/exams", "/hod/reports", "/hod/curriculum"
    ],
    "admin": [
        "/admin", "/admin/admissions", "/admin/records", "/admin/fees", "/admin/id-cards",
        "/admin/library", "/admin/transport", "/admin/hostel", "/admin/communication",
        "/admin/documents", "/admin/placements", "/admin/sports", "/admin/sports-clubs",
        "/admin/reports", "/admin/import-export", "/admin/audit-logs"
    ],
    "teacher": [
        "/teacher", "/teacher/feedback", "/teacher/alerts", "/teacher/classes",
        "/teacher/attendance", "/teacher/face-attendance", "/teacher/assignments",
        "/teacher/results", "/teacher/messages"
    ],
    "lab": [
        "/lab-assistant", "/lab-assistant/attendance", "/lab-assistant/marks", "/lab-assistant/equipment"
    ],
    "student": [
        "/student", "/student/growth", "/student/career-readiness", "/student/journey",
        "/student/goals", "/student/guidance", "/student/feedback", "/student/mentorship",
        "/student/academics", "/student/attendance", "/student/exams", "/student/fees",
        "/student/practice", "/student/career", "/student/library", "/student/transport", "/student/hostel"
    ],
    "parent": [
        "/parent", "/parent/academics", "/parent/attendance", "/parent/fees",
        "/parent/transport", "/parent/messages"
    ],
}

class TestResult:
    def __init__(self, persona):
        self.persona = persona
        self.login_success = False
        self.login_time_ms = 0
        self.navigation_results = []
        self.responsiveness_results = []
        self.errors_404 = []
        self.console_errors = []
        self.ui_issues = []
        self.data_checks = []
        self.performance_issues = []
        self.screenshots = []
        self.overall_status = "PENDING"
        self.start_time = None
        self.end_time = None
        self.login_error = None

def check_responsiveness(page, route, viewport_name, viewport_size, persona, output_dir):
    """Check responsiveness at a specific viewport"""
    issues = []

    # Set viewport
    page.set_viewport_size(viewport_size)
    page.wait_for_timeout(500)

    # Check for horizontal overflow
    has_h_scroll = page.evaluate("""
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    """)
    if has_h_scroll:
        issues.append(f"Horizontal scroll detected at {viewport_name}")

    # Check for overlapping elements
    overflow_elements = page.evaluate("""
        () => {
            const issues = [];
            document.querySelectorAll('*').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.right > window.innerWidth + 10 && rect.width > 50) {
                    issues.push(`${el.tagName}.${el.className.split(' ')[0]} overflows`);
                }
            });
            return issues.slice(0, 3);
        }
    """)
    issues.extend(overflow_elements)

    # Check text readability (font size)
    small_text = page.evaluate("""
        () => {
            let count = 0;
            document.querySelectorAll('p, span, div, td, li').forEach(el => {
                const style = window.getComputedStyle(el);
                if (parseFloat(style.fontSize) < 10 && el.textContent.trim().length > 0) {
                    count++;
                }
            });
            return count;
        }
    """)
    if small_text > 5:
        issues.append(f"Found {small_text} elements with very small text")

    # Capture screenshot
    route_name = route.replace("/", "_").strip("_") or "dashboard"
    screenshot_path = f"{output_dir}/{persona}/{viewport_name}_{route_name}.png"
    os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)
    page.screenshot(path=screenshot_path, full_page=False)

    return {
        "route": route,
        "viewport": viewport_name,
        "issues": issues,
        "screenshot": screenshot_path,
        "status": "PASS" if not issues else "FAIL"
    }

def check_data_authenticity(page, persona):
    """Check for data authenticity issues"""
    checks = []
    content = page.content().lower()

    # Check for undefined/null values
    if "undefined" in content or ">null<" in content:
        checks.append({"check": "No undefined/null", "status": "FAIL", "detail": "Found undefined or null values displayed"})
    else:
        checks.append({"check": "No undefined/null", "status": "PASS", "detail": "No undefined/null values found"})

    # Check for empty states where data expected
    loading_spinners = page.query_selector_all('[class*="skeleton"], [class*="loading"], [class*="spinner"]')
    if len(loading_spinners) > 10:
        checks.append({"check": "Data loaded", "status": "WARN", "detail": f"Many loading indicators ({len(loading_spinners)}) still visible"})
    else:
        checks.append({"check": "Data loaded", "status": "PASS", "detail": "Data appears to be loaded"})

    # Check for institution name
    if "nexus" in content:
        checks.append({"check": "Institution name", "status": "PASS", "detail": "Nexus institution found"})
    else:
        checks.append({"check": "Institution name", "status": "WARN", "detail": "Institution name not clearly visible"})

    # Check for error messages
    error_elements = page.query_selector_all('[class*="error"], [class*="Error"]')
    visible_errors = [e for e in error_elements if e.is_visible()]
    if visible_errors:
        checks.append({"check": "No visible errors", "status": "FAIL", "detail": f"Found {len(visible_errors)} error elements"})
    else:
        checks.append({"check": "No visible errors", "status": "PASS", "detail": "No error elements visible"})

    return checks

def perform_clerk_login(page, email, password, persona, output_dir):
    """Handle Clerk authentication with multiple strategies"""
    login_success = False
    login_error = None

    try:
        # Navigate to sign-in
        page.goto(f"{BASE_URL}/sign-in", timeout=30000)
        page.wait_for_load_state("networkidle", timeout=30000)

        # Screenshot login page
        os.makedirs(f"{output_dir}/{persona}", exist_ok=True)
        page.screenshot(path=f"{output_dir}/{persona}/01_login_page.png")

        # Try to find email input with various selectors
        email_selectors = [
            'input[name="identifier"]',
            'input[type="email"]',
            'input[id*="email"]',
            'input[placeholder*="email"]',
            'input[autocomplete="email"]',
        ]

        email_input = None
        for selector in email_selectors:
            try:
                email_input = page.wait_for_selector(selector, timeout=5000)
                if email_input:
                    break
            except:
                continue

        if not email_input:
            # Maybe already on password page, check URL
            if "factor" in page.url or "password" in page.url:
                pass  # Already past email step
            else:
                raise Exception("Could not find email input field")

        if email_input:
            email_input.fill(email)
            page.screenshot(path=f"{output_dir}/{persona}/02_email_entered.png")

            # Click continue/next button
            continue_selectors = [
                'button:has-text("Continue")',
                'button:has-text("Next")',
                'button[type="submit"]',
                'button:has-text("Sign in")',
            ]

            for selector in continue_selectors:
                try:
                    btn = page.query_selector(selector)
                    if btn and btn.is_visible():
                        btn.click()
                        break
                except:
                    continue

            # Wait for page to transition
            page.wait_for_timeout(5000)
            page.screenshot(path=f"{output_dir}/{persona}/03_after_continue.png")

        # Check if we got redirected to Google OAuth - if so, go back and try password
        current_url = page.url
        if "google.com" in current_url or "accounts.google" in current_url:
            # Go back to Clerk and look for password option
            page.go_back()
            page.wait_for_timeout(2000)

            # Try to find "Use another method" or "Sign in with password" link
            alt_method_selectors = [
                'button:has-text("Use another method")',
                'a:has-text("Use another method")',
                'button:has-text("Sign in with password")',
                'a:has-text("password")',
                '[data-localization-key*="alternative"]',
            ]

            for selector in alt_method_selectors:
                try:
                    alt_btn = page.query_selector(selector)
                    if alt_btn and alt_btn.is_visible():
                        alt_btn.click()
                        page.wait_for_timeout(2000)
                        break
                except:
                    continue

            page.screenshot(path=f"{output_dir}/{persona}/03b_alt_method.png")

        # Now try to find password input with longer wait
        password_selectors = [
            'input[name="password"]',
            'input[type="password"]',
            'input[id*="password"]',
            'input[autocomplete="current-password"]',
        ]

        password_input = None
        # Try multiple times with waits
        for attempt in range(3):
            for selector in password_selectors:
                try:
                    password_input = page.wait_for_selector(selector, timeout=5000)
                    if password_input and password_input.is_visible():
                        break
                except:
                    continue
            if password_input:
                break
            page.wait_for_timeout(2000)

        if password_input:
            password_input.fill(password)
            page.screenshot(path=f"{output_dir}/{persona}/04_password_entered.png")

            # Click continue/sign in button
            for selector in continue_selectors:
                try:
                    btn = page.query_selector(selector)
                    if btn and btn.is_visible():
                        btn.click()
                        break
                except:
                    continue

            # Wait for navigation
            page.wait_for_timeout(5000)
            page.wait_for_load_state("networkidle", timeout=30000)
            page.screenshot(path=f"{output_dir}/{persona}/05_after_login.png")

            # Check if we reached dashboard
            current_url = page.url
            if "/sign-in" not in current_url and "/sign-up" not in current_url and "clerk" not in current_url:
                login_success = True
            else:
                login_error = f"Still on login page after authentication. URL: {current_url}"
        else:
            # Check page content for clues
            page_content = page.content()
            page.screenshot(path=f"{output_dir}/{persona}/password_not_found.png")

            # Check if we're on a verification/factor page
            if "verify" in page_content.lower() or "code" in page_content.lower():
                login_error = "Email verification or OTP required - password login not available"
            elif "google" in page.url.lower():
                login_error = "Redirected to Google OAuth - password login not configured"
            else:
                login_error = f"Password field not found. Current URL: {page.url}"

    except Exception as e:
        login_error = str(e)
        try:
            page.screenshot(path=f"{output_dir}/{persona}/login_error.png")
        except:
            pass

    return login_success, login_error

def test_persona(persona: str):
    """Test a single persona comprehensively"""
    result = TestResult(persona)
    result.start_time = datetime.now().isoformat()
    creds = CREDENTIALS[persona]
    persona_dir = f"{OUTPUT_DIR}/{persona}"
    os.makedirs(persona_dir, exist_ok=True)

    print(f"\n[{persona.upper()}] Starting comprehensive QA validation...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Start with desktop viewport for login
        context = browser.new_context(viewport=VIEWPORTS["desktop"])
        page = context.new_page()

        # Capture console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append({"type": msg.type, "text": msg.text}) if msg.type == "error" else None)

        try:
            # === LOGIN TEST ===
            print(f"[{persona.upper()}] Logging in...")
            login_start = time.time()

            login_success, login_error = perform_clerk_login(
                page, creds["email"], creds["password"], persona, OUTPUT_DIR
            )

            login_end = time.time()
            result.login_time_ms = int((login_end - login_start) * 1000)
            result.login_success = login_success
            result.login_error = login_error

            if login_success:
                print(f"[{persona.upper()}] Login successful ({result.login_time_ms}ms)")

                # Wait for dashboard
                page.wait_for_timeout(3000)

                # === DATA AUTHENTICITY CHECK ON DASHBOARD ===
                result.data_checks = check_data_authenticity(page, persona)

                # === TEST EACH ROUTE ===
                routes = NAVIGATION_ROUTES.get(persona, [])
                total_routes = len(routes)
                print(f"[{persona.upper()}] Testing {total_routes} pages across 3 viewports ({total_routes * 3} total tests)...")

                for idx, route in enumerate(routes):
                    nav_result = {
                        "route": route,
                        "status": "OK",
                        "load_time_ms": 0,
                        "is_404": False,
                        "viewport_results": []
                    }

                    try:
                        # Navigate to page
                        nav_start = time.time()
                        page.goto(f"{BASE_URL}{route}", timeout=30000)
                        page.wait_for_load_state("networkidle", timeout=20000)
                        nav_end = time.time()

                        nav_result["load_time_ms"] = int((nav_end - nav_start) * 1000)

                        # Check for 404
                        page_content = page.content()
                        if "404" in page_content or "not found" in page_content.lower():
                            nav_result["status"] = "404"
                            nav_result["is_404"] = True
                            result.errors_404.append(route)
                            print(f"  [{idx+1}/{total_routes}] {route} - 404 NOT FOUND")
                        else:
                            # Performance check
                            if nav_result["load_time_ms"] > 5000:
                                result.performance_issues.append(f"{route} took {nav_result['load_time_ms']}ms")

                            # Test responsiveness at all viewports
                            for vp_name, vp_size in VIEWPORTS.items():
                                resp_result = check_responsiveness(page, route, vp_name, vp_size, persona, OUTPUT_DIR)
                                nav_result["viewport_results"].append(resp_result)
                                result.responsiveness_results.append(resp_result)
                                result.screenshots.append(resp_result["screenshot"])

                                if resp_result["issues"]:
                                    result.ui_issues.extend([f"{route} ({vp_name}): {issue}" for issue in resp_result["issues"]])

                            print(f"  [{idx+1}/{total_routes}] {route} - OK ({nav_result['load_time_ms']}ms)")

                    except Exception as e:
                        nav_result["status"] = "ERROR"
                        nav_result["error"] = str(e)
                        print(f"  [{idx+1}/{total_routes}] {route} - ERROR: {str(e)[:50]}")

                    result.navigation_results.append(nav_result)

                # Collect console errors
                result.console_errors = [e for e in console_errors if "error" in e["type"].lower()][:20]

                # === DETERMINE OVERALL STATUS ===
                if result.errors_404:
                    result.overall_status = "HAS_404_ERRORS"
                elif len(result.ui_issues) > 10:
                    result.overall_status = "MAJOR_UI_ISSUES"
                elif result.ui_issues:
                    result.overall_status = "MINOR_UI_ISSUES"
                elif result.console_errors:
                    result.overall_status = "CONSOLE_ERRORS"
                elif result.performance_issues:
                    result.overall_status = "PERFORMANCE_ISSUES"
                else:
                    result.overall_status = "PASSED"
            else:
                result.overall_status = "LOGIN_FAILED"
                print(f"[{persona.upper()}] Login failed: {login_error}")

        except Exception as e:
            result.overall_status = "EXCEPTION"
            result.login_error = str(e)
            print(f"[{persona.upper()}] Exception: {str(e)}")

        finally:
            browser.close()

    result.end_time = datetime.now().isoformat()

    # Save individual result
    with open(f"{persona_dir}/result.json", "w") as f:
        json.dump({
            "persona": result.persona,
            "overall_status": result.overall_status,
            "login_success": result.login_success,
            "login_error": result.login_error,
            "login_time_ms": result.login_time_ms,
            "pages_tested": len(result.navigation_results),
            "screenshots_captured": len(result.screenshots),
            "errors_404": result.errors_404,
            "ui_issues": result.ui_issues[:20],
            "performance_issues": result.performance_issues,
            "console_errors_count": len(result.console_errors),
            "data_checks": result.data_checks,
            "start_time": result.start_time,
            "end_time": result.end_time,
        }, f, indent=2)

    print(f"[{persona.upper()}] Completed - Status: {result.overall_status}")
    return result

def generate_report(results: list) -> dict:
    """Generate comprehensive test report"""
    report = {
        "test_run": {
            "timestamp": datetime.now().isoformat(),
            "institution": "Nexus Engineering College",
            "base_url": BASE_URL,
            "total_personas": len(results),
            "viewports_tested": list(VIEWPORTS.keys()),
        },
        "summary": {
            "passed": 0,
            "failed": 0,
            "warnings": 0,
            "total_pages_tested": 0,
            "total_screenshots": 0,
        },
        "login_results": {},
        "responsiveness": {
            "mobile_issues": 0,
            "tablet_issues": 0,
            "desktop_issues": 0,
        },
        "performance": {
            "average_load_time_ms": 0,
            "slowest_pages": [],
            "pages_over_3s": 0,
        },
        "errors": {
            "total_404": 0,
            "routes_with_404": [],
            "console_errors": 0,
        },
        "data_authenticity": {
            "issues_found": [],
        },
        "persona_results": [],
    }

    all_load_times = []
    all_routes = []

    for r in results:
        persona_summary = {
            "persona": r.persona,
            "status": r.overall_status,
            "login_success": r.login_success,
            "login_error": r.login_error,
            "login_time_ms": r.login_time_ms,
            "pages_tested": len(r.navigation_results),
            "screenshots": len(r.screenshots),
            "errors_404": r.errors_404,
            "ui_issues_count": len(r.ui_issues),
            "console_errors_count": len(r.console_errors),
        }
        report["persona_results"].append(persona_summary)
        report["login_results"][r.persona] = {
            "success": r.login_success,
            "error": r.login_error,
            "time_ms": r.login_time_ms
        }

        # Aggregate summary
        if r.overall_status == "PASSED":
            report["summary"]["passed"] += 1
        elif "ISSUES" in r.overall_status or "ERRORS" in r.overall_status:
            report["summary"]["warnings"] += 1
        else:
            report["summary"]["failed"] += 1

        report["summary"]["total_pages_tested"] += len(r.navigation_results)
        report["summary"]["total_screenshots"] += len(r.screenshots)

        # 404 errors
        report["errors"]["routes_with_404"].extend(r.errors_404)
        report["errors"]["total_404"] += len(r.errors_404)
        report["errors"]["console_errors"] += len(r.console_errors)

        # Responsiveness
        for resp in r.responsiveness_results:
            if resp["issues"]:
                if resp["viewport"] == "mobile":
                    report["responsiveness"]["mobile_issues"] += 1
                elif resp["viewport"] == "tablet":
                    report["responsiveness"]["tablet_issues"] += 1
                else:
                    report["responsiveness"]["desktop_issues"] += 1

        # Performance
        for nav in r.navigation_results:
            if nav["load_time_ms"] > 0:
                all_load_times.append(nav["load_time_ms"])
                all_routes.append({"route": nav["route"], "time": nav["load_time_ms"], "persona": r.persona})
                if nav["load_time_ms"] > 3000:
                    report["performance"]["pages_over_3s"] += 1

        # Data authenticity
        for check in r.data_checks:
            if check["status"] != "PASS":
                report["data_authenticity"]["issues_found"].append(f"{r.persona}: {check['check']} - {check['detail']}")

    # Calculate averages and top items
    if all_load_times:
        report["performance"]["average_load_time_ms"] = int(sum(all_load_times) / len(all_load_times))
        all_routes.sort(key=lambda x: x["time"], reverse=True)
        report["performance"]["slowest_pages"] = all_routes[:10]

    return report

def generate_markdown_report(report: dict) -> str:
    """Generate markdown report"""
    md = []
    md.append("# QA Test Report - EduNexus")
    md.append(f"\n**Date:** {report['test_run']['timestamp']}")
    md.append(f"**Institution:** {report['test_run']['institution']}")
    md.append(f"**Base URL:** {report['test_run']['base_url']}")
    md.append(f"**Viewports:** {', '.join(report['test_run']['viewports_tested'])}")

    md.append("\n## Executive Summary\n")
    md.append(f"| Metric | Value |")
    md.append(f"|--------|-------|")
    md.append(f"| Total Personas | {report['test_run']['total_personas']} |")
    md.append(f"| Passed | {report['summary']['passed']} |")
    md.append(f"| Warnings | {report['summary']['warnings']} |")
    md.append(f"| Failed | {report['summary']['failed']} |")
    md.append(f"| Total Pages Tested | {report['summary']['total_pages_tested']} |")
    md.append(f"| Total Screenshots | {report['summary']['total_screenshots']} |")

    md.append("\n## Login Results\n")
    md.append("| Persona | Status | Time (ms) | Error |")
    md.append("|---------|--------|-----------|-------|")
    for persona, data in report['login_results'].items():
        status = "Success" if data['success'] else "Failed"
        error = data['error'][:50] if data['error'] else "-"
        md.append(f"| {persona} | {status} | {data['time_ms']} | {error} |")

    md.append("\n## Responsiveness Results\n")
    md.append(f"| Viewport | Issues Found |")
    md.append(f"|----------|--------------|")
    md.append(f"| Mobile (375px) | {report['responsiveness']['mobile_issues']} |")
    md.append(f"| Tablet (768px) | {report['responsiveness']['tablet_issues']} |")
    md.append(f"| Desktop (1920px) | {report['responsiveness']['desktop_issues']} |")

    md.append("\n## Performance Results\n")
    md.append(f"- **Average Load Time:** {report['performance']['average_load_time_ms']}ms")
    md.append(f"- **Pages Over 3s:** {report['performance']['pages_over_3s']}")
    if report['performance']['slowest_pages']:
        md.append("\n**Slowest Pages:**")
        for p in report['performance']['slowest_pages'][:5]:
            md.append(f"- `{p['route']}` ({p['persona']}): {p['time']}ms")

    md.append("\n## 404 Errors\n")
    if report['errors']['routes_with_404']:
        md.append(f"**Total 404 Errors:** {report['errors']['total_404']}")
        md.append("\n| Route | Status |")
        md.append("|-------|--------|")
        for r in report['errors']['routes_with_404']:
            md.append(f"| `{r}` | 404 |")
    else:
        md.append("No 404 errors found.")

    md.append("\n## Data Authenticity\n")
    if report['data_authenticity']['issues_found']:
        for issue in report['data_authenticity']['issues_found']:
            md.append(f"- {issue}")
    else:
        md.append("All data authenticity checks passed.")

    md.append("\n## Per-Persona Results\n")
    for p in report['persona_results']:
        status_emoji = "PASS" if p['status'] == "PASSED" else ("WARN" if "ISSUES" in p['status'] else "FAIL")
        md.append(f"\n### {p['persona'].upper()} - {status_emoji}")
        md.append(f"- **Login:** {'Success' if p['login_success'] else 'Failed'} ({p['login_time_ms']}ms)")
        if p['login_error']:
            md.append(f"- **Login Error:** {p['login_error'][:100]}")
        md.append(f"- **Pages Tested:** {p['pages_tested']}")
        md.append(f"- **Screenshots:** {p['screenshots']}")
        md.append(f"- **404 Errors:** {len(p['errors_404'])}")
        md.append(f"- **UI Issues:** {p['ui_issues_count']}")
        md.append(f"- **Console Errors:** {p['console_errors_count']}")
        if p['errors_404']:
            md.append(f"- **404 Routes:** {', '.join(p['errors_404'])}")

    md.append("\n---")
    md.append(f"\n*Report generated at {datetime.now().isoformat()}*")

    return "\n".join(md)

if __name__ == "__main__":
    print("="*70)
    print("  NEXUS ENGINEERING COLLEGE - COMPREHENSIVE QA VALIDATION")
    print("="*70)
    print(f"\nBase URL: {BASE_URL}")
    print(f"Personas: {', '.join(CREDENTIALS.keys())}")
    print(f"Viewports: {', '.join(VIEWPORTS.keys())}")
    print(f"Output: {OUTPUT_DIR}")
    print()

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Check for single persona mode
    if len(sys.argv) > 1:
        persona = sys.argv[1]
        if persona in CREDENTIALS:
            result = test_persona(persona)
            print(f"\nResult: {result.overall_status}")
            sys.exit(0 if result.login_success else 1)
        else:
            print(f"Unknown persona: {persona}")
            print(f"Available: {', '.join(CREDENTIALS.keys())}")
            sys.exit(1)

    # Run all personas in parallel
    print("Starting parallel QA validation for all 7 personas...")
    print("-"*70)

    results = []
    with ThreadPoolExecutor(max_workers=7) as executor:
        futures = {executor.submit(test_persona, persona): persona for persona in CREDENTIALS.keys()}
        for future in as_completed(futures):
            persona = futures[future]
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                print(f"[{persona.upper()}] Failed with exception: {e}")

    # Generate reports
    print("\n" + "="*70)
    print("  GENERATING REPORTS")
    print("="*70)

    report = generate_report(results)

    # Save JSON report
    json_path = f"{OUTPUT_DIR}/qa_comprehensive_report.json"
    with open(json_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"JSON report saved: {json_path}")

    # Save Markdown report
    md_report = generate_markdown_report(report)
    md_path = "e2e-tests/reports/qa_comprehensive_report.md"
    os.makedirs(os.path.dirname(md_path), exist_ok=True)
    with open(md_path, "w") as f:
        f.write(md_report)
    print(f"Markdown report saved: {md_path}")

    # Print summary
    print("\n" + "="*70)
    print("  SUMMARY")
    print("="*70)
    print(f"  Passed: {report['summary']['passed']}/{report['test_run']['total_personas']}")
    print(f"  Warnings: {report['summary']['warnings']}")
    print(f"  Failed: {report['summary']['failed']}")
    print(f"  Total Pages: {report['summary']['total_pages_tested']}")
    print(f"  Total Screenshots: {report['summary']['total_screenshots']}")
    print(f"  404 Errors: {report['errors']['total_404']}")
    print(f"  Avg Load Time: {report['performance']['average_load_time_ms']}ms")
    print("="*70)
