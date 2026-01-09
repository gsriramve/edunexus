#!/usr/bin/env python3
"""
EduNexus E2E Test Runner - Runs all persona tests and generates report
"""

import json
import os
import subprocess
import sys
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# Test data
TEST_PERSONAS = [
    # College 1: Nexus Engineering College
    {"email": "principal@nexus-ec.edu", "password": "Nexus@1104", "role": "principal", "college": "nexus-ec"},
    {"email": "hod.cse@nexus-ec.edu", "password": "Nexus@1104", "role": "hod", "college": "nexus-ec"},
    {"email": "admin@nexus-ec.edu", "password": "Nexus@1104", "role": "admin", "college": "nexus-ec"},
    {"email": "teacher@nexus-ec.edu", "password": "Nexus@1104", "role": "teacher", "college": "nexus-ec"},
    {"email": "lab@nexus-ec.edu", "password": "Nexus@1104", "role": "lab", "college": "nexus-ec"},
    {"email": "student@nexus-ec.edu", "password": "Nexus@1104", "role": "student", "college": "nexus-ec"},
    {"email": "parent@nexus-ec.edu", "password": "Nexus@1104", "role": "parent", "college": "nexus-ec"},

    # College 2: Quantum Institute of Technology
    {"email": "principal@quantum-it.edu", "password": "Nexus@1104", "role": "principal", "college": "quantum-it"},
    {"email": "hod.cse@quantum-it.edu", "password": "Nexus@1104", "role": "hod", "college": "quantum-it"},
    {"email": "admin@quantum-it.edu", "password": "Nexus@1104", "role": "admin", "college": "quantum-it"},
    {"email": "teacher@quantum-it.edu", "password": "Nexus@1104", "role": "teacher", "college": "quantum-it"},
    {"email": "lab@quantum-it.edu", "password": "Nexus@1104", "role": "lab", "college": "quantum-it"},
    {"email": "student@quantum-it.edu", "password": "Nexus@1104", "role": "student", "college": "quantum-it"},
    {"email": "parent@quantum-it.edu", "password": "Nexus@1104", "role": "parent", "college": "quantum-it"},

    # College 3: Careerfied Academy
    {"email": "principal@careerfied.edu", "password": "Nexus@1104", "role": "principal", "college": "careerfied"},
    {"email": "hod.cse@careerfied.edu", "password": "Nexus@1104", "role": "hod", "college": "careerfied"},
    {"email": "admin@careerfied.edu", "password": "Nexus@1104", "role": "admin", "college": "careerfied"},
    {"email": "teacher@careerfied.edu", "password": "Nexus@1104", "role": "teacher", "college": "careerfied"},
    {"email": "lab@careerfied.edu", "password": "Nexus@1104", "role": "lab", "college": "careerfied"},
    {"email": "student@careerfied.edu", "password": "Nexus@1104", "role": "student", "college": "careerfied"},
    {"email": "parent@careerfied.edu", "password": "Nexus@1104", "role": "parent", "college": "careerfied"},
]

def run_persona_test(persona):
    """Run a single persona test"""
    cmd = [
        sys.executable,
        "/Users/sriramvenkatg/edunexus/e2e-tests/test_persona.py",
        "--email", persona["email"],
        "--password", persona["password"],
        "--role", persona["role"],
        "--college", persona["college"],
        "--output", "/Users/sriramvenkatg/edunexus/e2e-tests"
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        return {
            "persona": persona,
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr
        }
    except subprocess.TimeoutExpired:
        return {
            "persona": persona,
            "success": False,
            "error": "Test timed out after 120 seconds"
        }
    except Exception as e:
        return {
            "persona": persona,
            "success": False,
            "error": str(e)
        }

def generate_report(results):
    """Generate final test report"""
    report = {
        "timestamp": datetime.now().isoformat(),
        "total_personas": len(results),
        "passed": 0,
        "failed": 0,
        "results_by_college": {},
        "results_by_role": {},
        "all_results": []
    }

    for result in results:
        persona = result["persona"]
        college = persona["college"]
        role = persona["role"]

        if college not in report["results_by_college"]:
            report["results_by_college"][college] = {"passed": 0, "failed": 0, "tests": []}
        if role not in report["results_by_role"]:
            report["results_by_role"][role] = {"passed": 0, "failed": 0}

        # Load individual test report
        report_file = f"/Users/sriramvenkatg/edunexus/e2e-tests/reports/{role}_{college}_report.json"
        if os.path.exists(report_file):
            with open(report_file) as f:
                test_report = json.load(f)

            status = test_report.get("summary", {}).get("status", "UNKNOWN")
            if status == "PASS":
                report["passed"] += 1
                report["results_by_college"][college]["passed"] += 1
                report["results_by_role"][role]["passed"] += 1
            else:
                report["failed"] += 1
                report["results_by_college"][college]["failed"] += 1
                report["results_by_role"][role]["failed"] += 1

            report["results_by_college"][college]["tests"].append(test_report)
            report["all_results"].append(test_report)
        else:
            report["failed"] += 1
            report["results_by_college"][college]["failed"] += 1
            report["results_by_role"][role]["failed"] += 1

    return report

def main():
    print("="*60)
    print("EduNexus E2E Test Suite")
    print(f"Testing {len(TEST_PERSONAS)} personas across 3 colleges")
    print("="*60)

    # Run tests with 8 parallel workers
    results = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(run_persona_test, p): p for p in TEST_PERSONAS}

        for future in as_completed(futures):
            result = future.result()
            results.append(result)
            persona = result["persona"]
            status = "PASS" if result["success"] else "FAIL"
            print(f"  [{status}] {persona['role']}@{persona['college']}")

    # Generate report
    print("\n" + "="*60)
    print("Generating Final Report...")
    print("="*60)

    report = generate_report(results)

    # Save report
    report_path = "/Users/sriramvenkatg/edunexus/e2e-tests/reports/final_report.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    # Generate markdown report
    md_report = generate_markdown_report(report)
    md_path = "/Users/sriramvenkatg/edunexus/e2e-tests/reports/TEST_REPORT.md"
    with open(md_path, "w") as f:
        f.write(md_report)

    # Print summary
    print(f"\nTOTAL: {report['passed']} passed, {report['failed']} failed out of {report['total_personas']}")
    print(f"\nReports saved to:")
    print(f"  - {report_path}")
    print(f"  - {md_path}")

    return report["failed"] == 0

def generate_markdown_report(report):
    """Generate markdown test report"""
    md = f"""# EduNexus E2E Test Report

Generated: {report['timestamp']}

## Summary

| Metric | Value |
|--------|-------|
| Total Personas Tested | {report['total_personas']} |
| Passed | {report['passed']} |
| Failed | {report['failed']} |
| Success Rate | {(report['passed']/report['total_personas']*100):.1f}% |

## Results by College

"""

    for college, data in report["results_by_college"].items():
        status = "PASS" if data["failed"] == 0 else "FAIL"
        md += f"""### {college.replace('-', ' ').title()}
- Status: **{status}**
- Passed: {data['passed']} / {data['passed'] + data['failed']}

"""

    md += """## Results by Role

| Role | Passed | Failed | Status |
|------|--------|--------|--------|
"""

    for role, data in report["results_by_role"].items():
        status = "PASS" if data["failed"] == 0 else "FAIL"
        md += f"| {role.title()} | {data['passed']} | {data['failed']} | {status} |\n"

    md += """
## Performance Metrics

| Persona | Login Page Load | Dashboard Load |
|---------|----------------|----------------|
"""

    for result in report.get("all_results", []):
        persona = f"{result.get('role', 'N/A')}@{result.get('college', 'N/A')}"
        login_time = result.get("performance", {}).get("login_page_load", "N/A")
        dashboard_time = result.get("performance", {}).get("dashboard_load", "N/A")
        md += f"| {persona} | {login_time}s | {dashboard_time}s |\n"

    md += """
## Detailed Test Results

"""

    for result in report.get("all_results", []):
        persona = f"{result.get('role', 'N/A')}@{result.get('college', 'N/A')}"
        summary = result.get("summary", {})
        status = summary.get("status", "UNKNOWN")

        md += f"""### {persona}
- **Status**: {status}
- **Tests**: {summary.get('passed', 0)} passed, {summary.get('failed', 0)} failed

| Test | Status | Details |
|------|--------|---------|
"""
        for test in result.get("tests", []):
            md += f"| {test['name']} | {test['status']} | {test['details'][:50]}... |\n"

        if result.get("errors"):
            md += f"\n**Errors**: {', '.join(result['errors'][:3])}\n"

        md += "\n"

    md += """
## Tenant Isolation Verification

To verify tenant isolation, compare the data visible to each college:
- Students from one college should NOT be visible to another college's users
- Fee records should be isolated per tenant
- All reports should show only tenant-specific data

## Screenshots

Screenshots are saved in `/Users/sriramvenkatg/edunexus/e2e-tests/screenshots/`

---
*Report generated by EduNexus E2E Test Suite*
"""

    return md

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
