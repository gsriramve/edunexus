#!/usr/bin/env python3
"""
Comprehensive UI Test for Quantum Institute of Technology
Tests all personas with QA, BA, and Product Team perspectives
"""

import sys
import time
import json
from datetime import datetime
from playwright.sync_api import sync_playwright

# Test configuration
BASE_URL = "http://15.206.243.177:3000"
CREDENTIALS = {
    "principal": {"email": "principal@quantum-it.edu", "password": "Nexus@1104", "expected_path": "/principal"},
    "hod": {"email": "hod.cse@quantum-it.edu", "password": "Nexus@1104", "expected_path": "/hod"},
    "admin": {"email": "admin@quantum-it.edu", "password": "Nexus@1104", "expected_path": "/admin"},
    "teacher": {"email": "teacher@quantum-it.edu", "password": "Nexus@1104", "expected_path": "/teacher"},
    "lab": {"email": "lab@quantum-it.edu", "password": "Nexus@1104", "expected_path": "/lab-assistant"},
    "student": {"email": "student@quantum-it.edu", "password": "Nexus@1104", "expected_path": "/student"},
    "parent": {"email": "parent@quantum-it.edu", "password": "Nexus@1104", "expected_path": "/parent"},
}

# Navigation routes per persona
NAVIGATION_ROUTES = {
    "principal": [
        "/principal", "/principal/departments", "/principal/staff", "/principal/students",
        "/principal/academics", "/principal/fees", "/principal/reports", "/principal/settings"
    ],
    "hod": [
        "/hod", "/hod/faculty", "/hod/students", "/hod/subjects",
        "/hod/attendance", "/hod/exams", "/hod/reports"
    ],
    "admin": [
        "/admin", "/admin/fees", "/admin/admissions", "/admin/records",
        "/admin/library", "/admin/hostel", "/admin/transport", "/admin/reports"
    ],
    "teacher": [
        "/teacher", "/teacher/classes", "/teacher/attendance", "/teacher/marks",
        "/teacher/assignments", "/teacher/materials", "/teacher/students"
    ],
    "lab": [
        "/lab-assistant", "/lab-assistant/equipment", "/lab-assistant/attendance", "/lab-assistant/marks"
    ],
    "student": [
        "/student", "/student/academics", "/student/attendance", "/student/fees",
        "/student/timetable", "/student/library", "/student/career"
    ],
    "parent": [
        "/parent", "/parent/academics", "/parent/attendance", "/parent/fees",
        "/parent/communication"
    ],
}

class TestResult:
    def __init__(self, persona):
        self.persona = persona
        self.login_success = False
        self.login_time_ms = 0
        self.dashboard_load_time_ms = 0
        self.navigation_results = []
        self.errors_404 = []
        self.console_errors = []
        self.ui_issues = []
        self.data_checks = []
        self.screenshots = []
        self.overall_status = "PENDING"

def test_persona(persona: str, output_dir: str = "e2e-tests/screenshots/quantum"):
    """Test a single persona comprehensively"""
    result = TestResult(persona)
    creds = CREDENTIALS[persona]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        # Capture console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        try:
            # === LOGIN TEST ===
            print(f"[{persona.upper()}] Starting login test...")
            login_start = time.time()

            page.goto(f"{BASE_URL}/sign-in", timeout=30000)
            page.wait_for_load_state("networkidle", timeout=30000)

            # Fill credentials
            page.fill('input[name="identifier"]', creds["email"])
            page.click('button:has-text("Continue")')
            page.wait_for_timeout(2000)

            page.fill('input[name="password"]', creds["password"])
            page.click('button:has-text("Continue")')

            # Wait for redirect to dashboard
            page.wait_for_timeout(5000)
            page.wait_for_load_state("networkidle", timeout=30000)

            login_end = time.time()
            result.login_time_ms = int((login_end - login_start) * 1000)

            current_url = page.url
            if creds["expected_path"] in current_url or "/redirect" in current_url:
                result.login_success = True
                print(f"[{persona.upper()}] Login successful in {result.login_time_ms}ms")
            else:
                result.login_success = False
                print(f"[{persona.upper()}] Login may have issues, URL: {current_url}")

            # Wait for full dashboard load
            page.wait_for_timeout(3000)
            page.wait_for_load_state("networkidle", timeout=30000)

            # === DASHBOARD SCREENSHOT ===
            dashboard_start = time.time()
            screenshot_path = f"{output_dir}/{persona}_quantum_dashboard.png"
            page.screenshot(path=screenshot_path, full_page=True)
            result.screenshots.append(screenshot_path)
            dashboard_end = time.time()
            result.dashboard_load_time_ms = int((dashboard_end - dashboard_start) * 1000)
            print(f"[{persona.upper()}] Dashboard screenshot saved")

            # === UI DISTORTION CHECK ===
            # Check for overflow issues
            overflow_check = page.evaluate("""
                () => {
                    const issues = [];
                    document.querySelectorAll('*').forEach(el => {
                        const rect = el.getBoundingClientRect();
                        if (rect.width > window.innerWidth + 50) {
                            issues.push(`Element overflow: ${el.tagName}.${el.className}`);
                        }
                    });
                    return issues.slice(0, 5);
                }
            """)
            if overflow_check:
                result.ui_issues.extend(overflow_check)

            # === DATA AUTHENTICITY CHECK ===
            page_content = page.content()

            # Check for "Quantum" institution name
            if "quantum" in page_content.lower() or "Quantum" in page_content:
                result.data_checks.append({"check": "Institution Name", "status": "PASS", "detail": "Quantum Institute found"})
            else:
                result.data_checks.append({"check": "Institution Name", "status": "WARN", "detail": "Institution name not found"})

            # Check for loading spinners stuck
            spinners = page.query_selector_all('[class*="spinner"], [class*="loading"], [class*="skeleton"]')
            if len(spinners) > 5:
                result.ui_issues.append(f"Multiple loading indicators present: {len(spinners)}")

            # === NAVIGATION TEST ===
            routes = NAVIGATION_ROUTES.get(persona, [])
            print(f"[{persona.upper()}] Testing {len(routes)} navigation routes...")

            for route in routes:
                nav_result = {"route": route, "status": "PENDING", "load_time_ms": 0}
                try:
                    nav_start = time.time()
                    page.goto(f"{BASE_URL}{route}", timeout=30000)
                    page.wait_for_load_state("networkidle", timeout=20000)
                    nav_end = time.time()

                    nav_result["load_time_ms"] = int((nav_end - nav_start) * 1000)

                    # Check for 404
                    if "404" in page.content() or "not found" in page.content().lower():
                        nav_result["status"] = "404"
                        result.errors_404.append(route)
                    elif "error" in page.content().lower() and "boundary" in page.content().lower():
                        nav_result["status"] = "ERROR"
                    else:
                        nav_result["status"] = "OK"

                except Exception as e:
                    nav_result["status"] = "TIMEOUT"
                    nav_result["error"] = str(e)

                result.navigation_results.append(nav_result)
                status_icon = "✅" if nav_result["status"] == "OK" else "❌"
                print(f"  {status_icon} {route} - {nav_result['status']} ({nav_result['load_time_ms']}ms)")

            # Capture any console errors
            result.console_errors = console_errors[:10]  # Limit to 10

            # === DETERMINE OVERALL STATUS ===
            if not result.login_success:
                result.overall_status = "LOGIN_FAILED"
            elif result.errors_404:
                result.overall_status = "HAS_404_ERRORS"
            elif result.ui_issues:
                result.overall_status = "UI_ISSUES"
            elif result.console_errors:
                result.overall_status = "CONSOLE_ERRORS"
            else:
                result.overall_status = "PASSED"

        except Exception as e:
            result.overall_status = "EXCEPTION"
            print(f"[{persona.upper()}] Test exception: {str(e)}")

        finally:
            browser.close()

    return result

def generate_report(results: list) -> dict:
    """Generate comprehensive test report"""
    report = {
        "test_run": {
            "timestamp": datetime.now().isoformat(),
            "institution": "Quantum Institute of Technology",
            "base_url": BASE_URL,
            "total_personas": len(results),
        },
        "summary": {
            "passed": 0,
            "failed": 0,
            "warnings": 0,
        },
        "qa_perspective": {
            "total_routes_tested": 0,
            "routes_with_404": [],
            "average_load_time_ms": 0,
            "slowest_routes": [],
            "console_errors_count": 0,
        },
        "ba_perspective": {
            "data_authenticity": [],
            "feature_availability": {},
        },
        "product_perspective": {
            "ui_issues": [],
            "performance_metrics": {},
            "user_experience_score": 0,
        },
        "persona_results": [],
    }

    total_load_times = []
    all_routes = []

    for r in results:
        persona_summary = {
            "persona": r.persona,
            "status": r.overall_status,
            "login_success": r.login_success,
            "login_time_ms": r.login_time_ms,
            "dashboard_load_time_ms": r.dashboard_load_time_ms,
            "routes_tested": len(r.navigation_results),
            "routes_passed": len([n for n in r.navigation_results if n["status"] == "OK"]),
            "errors_404": r.errors_404,
            "ui_issues": r.ui_issues,
            "console_errors_count": len(r.console_errors),
            "data_checks": r.data_checks,
        }
        report["persona_results"].append(persona_summary)

        # Aggregate stats
        if r.overall_status == "PASSED":
            report["summary"]["passed"] += 1
        elif r.overall_status in ["UI_ISSUES", "CONSOLE_ERRORS"]:
            report["summary"]["warnings"] += 1
        else:
            report["summary"]["failed"] += 1

        # QA metrics
        report["qa_perspective"]["total_routes_tested"] += len(r.navigation_results)
        report["qa_perspective"]["routes_with_404"].extend(r.errors_404)
        report["qa_perspective"]["console_errors_count"] += len(r.console_errors)

        for nav in r.navigation_results:
            if nav["load_time_ms"] > 0:
                total_load_times.append(nav["load_time_ms"])
                all_routes.append({"route": nav["route"], "time": nav["load_time_ms"], "persona": r.persona})

        # Product metrics
        report["product_perspective"]["ui_issues"].extend(r.ui_issues)
        report["product_perspective"]["performance_metrics"][r.persona] = {
            "login_time_ms": r.login_time_ms,
            "dashboard_load_time_ms": r.dashboard_load_time_ms,
        }

    # Calculate averages
    if total_load_times:
        report["qa_perspective"]["average_load_time_ms"] = int(sum(total_load_times) / len(total_load_times))
        all_routes.sort(key=lambda x: x["time"], reverse=True)
        report["qa_perspective"]["slowest_routes"] = all_routes[:5]

    # UX Score (0-100)
    ux_score = 100
    ux_score -= len(report["qa_perspective"]["routes_with_404"]) * 10
    ux_score -= len(report["product_perspective"]["ui_issues"]) * 5
    ux_score -= report["summary"]["failed"] * 15
    if report["qa_perspective"]["average_load_time_ms"] > 3000:
        ux_score -= 10
    report["product_perspective"]["user_experience_score"] = max(0, ux_score)

    return report

def print_report(report: dict):
    """Print formatted test report"""
    print("\n" + "="*80)
    print("  QUANTUM INSTITUTE OF TECHNOLOGY - COMPREHENSIVE TEST REPORT")
    print("="*80)
    print(f"\nTest Run: {report['test_run']['timestamp']}")
    print(f"Base URL: {report['test_run']['base_url']}")

    print("\n" + "-"*40)
    print("  EXECUTIVE SUMMARY")
    print("-"*40)
    print(f"  Total Personas Tested: {report['test_run']['total_personas']}")
    print(f"  Passed: {report['summary']['passed']}")
    print(f"  Warnings: {report['summary']['warnings']}")
    print(f"  Failed: {report['summary']['failed']}")

    print("\n" + "-"*40)
    print("  QA PERSPECTIVE")
    print("-"*40)
    print(f"  Total Routes Tested: {report['qa_perspective']['total_routes_tested']}")
    print(f"  Routes with 404: {len(report['qa_perspective']['routes_with_404'])}")
    if report['qa_perspective']['routes_with_404']:
        for r in report['qa_perspective']['routes_with_404']:
            print(f"    - {r}")
    print(f"  Average Load Time: {report['qa_perspective']['average_load_time_ms']}ms")
    print(f"  Console Errors: {report['qa_perspective']['console_errors_count']}")
    print("  Slowest Routes:")
    for r in report['qa_perspective']['slowest_routes']:
        print(f"    - {r['route']} ({r['persona']}): {r['time']}ms")

    print("\n" + "-"*40)
    print("  PRODUCT PERSPECTIVE")
    print("-"*40)
    print(f"  UI Issues Found: {len(report['product_perspective']['ui_issues'])}")
    for issue in report['product_perspective']['ui_issues'][:5]:
        print(f"    - {issue}")
    print(f"  User Experience Score: {report['product_perspective']['user_experience_score']}/100")

    print("\n" + "-"*40)
    print("  PERSONA BREAKDOWN")
    print("-"*40)
    for p in report['persona_results']:
        status_icon = "✅" if p['status'] == "PASSED" else ("⚠️" if "WARN" in p['status'] or "ISSUES" in p['status'] else "❌")
        print(f"\n  {status_icon} {p['persona'].upper()}")
        print(f"     Login: {'✅' if p['login_success'] else '❌'} ({p['login_time_ms']}ms)")
        print(f"     Routes: {p['routes_passed']}/{p['routes_tested']} passed")
        print(f"     404 Errors: {len(p['errors_404'])}")
        print(f"     UI Issues: {len(p['ui_issues'])}")

    print("\n" + "="*80)
    print("  END OF REPORT")
    print("="*80 + "\n")

if __name__ == "__main__":
    import os

    # Create output directory
    output_dir = "e2e-tests/screenshots/quantum"
    os.makedirs(output_dir, exist_ok=True)

    # Get persona from command line
    if len(sys.argv) > 1:
        persona = sys.argv[1]
        if persona in CREDENTIALS:
            result = test_persona(persona, output_dir)
            # Save individual result
            with open(f"{output_dir}/{persona}_result.json", "w") as f:
                json.dump({
                    "persona": result.persona,
                    "overall_status": result.overall_status,
                    "login_success": result.login_success,
                    "login_time_ms": result.login_time_ms,
                    "dashboard_load_time_ms": result.dashboard_load_time_ms,
                    "errors_404": result.errors_404,
                    "ui_issues": result.ui_issues,
                    "console_errors": result.console_errors,
                    "data_checks": result.data_checks,
                    "navigation_results": result.navigation_results,
                }, f, indent=2)
            print(f"\n[{persona.upper()}] Result saved to {output_dir}/{persona}_result.json")
        else:
            print(f"Unknown persona: {persona}")
            print(f"Available: {', '.join(CREDENTIALS.keys())}")
    else:
        # Run all personas sequentially and generate report
        print("Running comprehensive test for all personas...")
        results = []
        for persona in CREDENTIALS.keys():
            print(f"\n{'='*60}")
            print(f"Testing {persona.upper()}...")
            print('='*60)
            result = test_persona(persona, output_dir)
            results.append(result)

        # Generate and print report
        report = generate_report(results)
        print_report(report)

        # Save report
        with open(f"{output_dir}/comprehensive_report.json", "w") as f:
            json.dump(report, f, indent=2)
        print(f"Full report saved to {output_dir}/comprehensive_report.json")
