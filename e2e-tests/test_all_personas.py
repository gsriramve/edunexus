#!/usr/bin/env python3
"""
Comprehensive UI Tests for All Personas
Tests login and dashboard for each role in Nexus Engineering College
"""

from playwright.sync_api import sync_playwright
import os
import time
import json

BASE_URL = "http://15.206.243.177"
SCREENSHOTS_DIR = "/Users/sriramvenkatg/edunexus/e2e-tests/screenshots"

# Test credentials for Nexus Engineering College
PERSONAS = [
    {"role": "Principal", "email": "principal@nexus-ec.edu", "password": "Nexus@1104", "dashboard_path": "/principal"},
    {"role": "HOD", "email": "hod.cse@nexus-ec.edu", "password": "Nexus@1104", "dashboard_path": "/hod"},
    {"role": "Admin", "email": "admin@nexus-ec.edu", "password": "Nexus@1104", "dashboard_path": "/admin"},
    {"role": "Teacher", "email": "teacher@nexus-ec.edu", "password": "Nexus@1104", "dashboard_path": "/teacher"},
    {"role": "Lab Assistant", "email": "lab@nexus-ec.edu", "password": "Nexus@1104", "dashboard_path": "/lab-assistant"},
    {"role": "Student", "email": "student@nexus-ec.edu", "password": "Nexus@1104", "dashboard_path": "/student"},
    {"role": "Parent", "email": "parent@nexus-ec.edu", "password": "Nexus@1104", "dashboard_path": "/parent"},
]

os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def test_persona(browser, persona):
    """Test login and dashboard for a single persona"""
    role = persona["role"]
    email = persona["email"]
    password = persona["password"]
    dashboard_path = persona["dashboard_path"]

    print(f"\n{'='*60}")
    print(f"Testing {role}: {email}")
    print(f"{'='*60}")

    results = {
        "role": role,
        "email": email,
        "login_success": False,
        "dashboard_loaded": False,
        "errors": [],
        "console_errors": [],
        "api_errors": []
    }

    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    page = context.new_page()

    # Capture console errors
    page.on("console", lambda msg: results["console_errors"].append(msg.text) if msg.type == "error" else None)

    # Capture failed requests
    def on_response(response):
        if response.status >= 400:
            results["api_errors"].append(f"{response.status} {response.url}")
    page.on("response", on_response)

    try:
        # Step 1: Go to sign-in page
        print(f"  1. Navigating to sign-in page...")
        page.goto(f"{BASE_URL}/sign-in", wait_until="networkidle", timeout=30000)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/{role.lower().replace(' ', '_')}_01_signin_page.png")

        # Step 2: Enter credentials
        print(f"  2. Entering credentials...")

        # Wait for Clerk sign-in form
        page.wait_for_selector('input[name="identifier"]', timeout=10000)
        page.fill('input[name="identifier"]', email)

        # Click continue button
        page.click('button[data-localization-key="formButtonPrimary"]')

        # Wait for password field
        page.wait_for_selector('input[name="password"]', timeout=10000)
        page.fill('input[name="password"]', password)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/{role.lower().replace(' ', '_')}_02_credentials.png")

        # Step 3: Submit login
        print(f"  3. Submitting login...")
        page.click('button[data-localization-key="formButtonPrimary"]')

        # Wait for redirect after login
        page.wait_for_load_state("networkidle", timeout=30000)
        time.sleep(3)  # Allow time for redirect

        current_url = page.url
        print(f"  4. Current URL after login: {current_url}")
        page.screenshot(path=f"{SCREENSHOTS_DIR}/{role.lower().replace(' ', '_')}_03_after_login.png")

        # Check if login was successful (not on sign-in page)
        if "/sign-in" not in current_url:
            results["login_success"] = True
            print(f"  ✅ Login successful!")
        else:
            results["errors"].append("Still on sign-in page after login attempt")
            print(f"  ❌ Login failed - still on sign-in page")

        # Step 4: Navigate to dashboard
        if results["login_success"]:
            print(f"  5. Navigating to dashboard: {dashboard_path}")
            page.goto(f"{BASE_URL}{dashboard_path}", wait_until="networkidle", timeout=30000)
            time.sleep(3)  # Allow time for data to load

            page.screenshot(path=f"{SCREENSHOTS_DIR}/{role.lower().replace(' ', '_')}_04_dashboard.png", full_page=True)

            # Check for error messages on the page
            error_indicators = page.query_selector_all('text="Failed to load"')
            error_indicators += page.query_selector_all('text="Something went wrong"')
            error_indicators += page.query_selector_all('text="Error"')

            if error_indicators:
                for indicator in error_indicators:
                    text = indicator.text_content()
                    results["errors"].append(f"Error on page: {text}")
                print(f"  ❌ Dashboard has errors")
            else:
                results["dashboard_loaded"] = True
                print(f"  ✅ Dashboard loaded successfully!")

            # Check page content
            page_content = page.content()
            if "Failed to load dashboard" in page_content:
                results["errors"].append("Dashboard failed to load")
                results["dashboard_loaded"] = False

            # Get visible text for verification
            body_text = page.inner_text("body")
            if "User is not" in body_text or "no staff record" in body_text:
                results["errors"].append("User role/staff record issue")
                results["dashboard_loaded"] = False

        # Step 5: Sign out
        print(f"  6. Signing out...")
        try:
            sign_out_btn = page.query_selector('text="Sign Out"') or page.query_selector('text="Sign out"')
            if sign_out_btn:
                sign_out_btn.click()
                page.wait_for_load_state("networkidle", timeout=10000)
        except Exception as e:
            print(f"  Warning: Could not sign out: {e}")

    except Exception as e:
        results["errors"].append(str(e))
        print(f"  ❌ Error: {e}")
        page.screenshot(path=f"{SCREENSHOTS_DIR}/{role.lower().replace(' ', '_')}_error.png")

    finally:
        context.close()

    # Print summary for this persona
    print(f"\n  Summary for {role}:")
    print(f"    Login: {'✅' if results['login_success'] else '❌'}")
    print(f"    Dashboard: {'✅' if results['dashboard_loaded'] else '❌'}")
    if results["errors"]:
        print(f"    Errors: {results['errors']}")
    if results["console_errors"]:
        print(f"    Console Errors: {len(results['console_errors'])}")
    if results["api_errors"]:
        print(f"    API Errors: {results['api_errors'][:5]}")  # Show first 5

    return results


def main():
    print("\n" + "="*60)
    print("EduNexus Comprehensive UI Test Suite")
    print("Testing all personas from Nexus Engineering College")
    print("="*60)

    all_results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for persona in PERSONAS:
            result = test_persona(browser, persona)
            all_results.append(result)

        browser.close()

    # Final Summary
    print("\n" + "="*60)
    print("FINAL TEST RESULTS")
    print("="*60)

    passed = 0
    failed = 0

    for result in all_results:
        status = "✅ PASS" if (result["login_success"] and result["dashboard_loaded"]) else "❌ FAIL"
        if result["login_success"] and result["dashboard_loaded"]:
            passed += 1
        else:
            failed += 1

        print(f"\n{result['role']:15} {status}")
        print(f"  Login: {'✅' if result['login_success'] else '❌'}")
        print(f"  Dashboard: {'✅' if result['dashboard_loaded'] else '❌'}")
        if result["errors"]:
            for err in result["errors"]:
                print(f"  Error: {err}")

    print(f"\n{'='*60}")
    print(f"Total: {passed} passed, {failed} failed out of {len(all_results)}")
    print(f"Screenshots saved to: {SCREENSHOTS_DIR}")
    print(f"{'='*60}")

    # Save results to JSON
    with open(f"{SCREENSHOTS_DIR}/test_results.json", "w") as f:
        json.dump(all_results, f, indent=2)

    return all_results


if __name__ == "__main__":
    main()
