#!/usr/bin/env python3
"""
Fellowship Application API Testing
Tests all fellowship endpoints as specified in the review request
"""

import requests
import json
from datetime import datetime

# Backend URL based on review request
BACKEND_URL = "http://localhost:8001"
API_BASE = f"{BACKEND_URL}/api"

class FellowshipAPITester:
    def __init__(self):
        self.test_results = []
        self.fellowship_test_data = {
            "full_name": "Test Student",
            "university": "University of Toronto", 
            "program": "Computer Science",
            "year_of_study": "3rd Year",
            "research_interests": ["AI / Computer Science", "Health & Medicine"],
            "statement_of_interest": "This is a test statement of interest with enough words to pass validation. I am deeply interested in the intersection of artificial intelligence and healthcare, particularly in developing machine learning models that can assist in medical diagnosis and treatment planning. My academic background in computer science, combined with my passion for healthcare applications, makes me an ideal candidate for this fellowship program. I am committed to contributing meaningful research during the fellowship period.",
            "commitment_confirmed": True
        }

    def log_test(self, endpoint, method, expected_status, actual_status, details=""):
        """Log test results"""
        status = "✅ PASS" if actual_status == expected_status else "❌ FAIL"
        self.test_results.append({
            'endpoint': endpoint,
            'method': method,
            'expected': expected_status,
            'actual': actual_status,
            'status': status,
            'details': details
        })
        print(f"{status} {method} {endpoint} - Expected: {expected_status}, Got: {actual_status} {details}")

    def test_health_endpoint(self):
        """Test the health endpoint"""
        print("\n=== Testing Health Endpoint ===")
        try:
            # Health endpoint is at root level, not under /api
            response = requests.get(f"{BACKEND_URL}/health", timeout=10)
            self.log_test("/health", "GET", 200, response.status_code)
            if response.status_code == 200:
                print(f"Health check response: {response.json()}")
        except requests.exceptions.RequestException as e:
            self.log_test("/health", "GET", 200, "ERROR", f"Connection error: {e}")

    def test_public_fellowship_stats(self):
        """Test public fellowship statistics endpoint"""
        print("\n=== Testing Public Fellowship Stats ===")
        try:
            response = requests.get(f"{API_BASE}/fellowship/stats", timeout=10)
            self.log_test("/api/fellowship/stats", "GET", 200, response.status_code)
            
            if response.status_code == 200:
                data = response.json()
                print(f"Fellowship stats: {data}")
                
                # Verify expected fields
                expected_fields = ['total_applications', 'accepted_applications', 'acceptance_rate']
                for field in expected_fields:
                    if field in data:
                        print(f"  ✓ {field}: {data[field]}")
                    else:
                        print(f"  ⚠️ Missing field: {field}")
            else:
                print(f"Error response: {response.text}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("/api/fellowship/stats", "GET", 200, "ERROR", f"Connection error: {e}")

    def test_protected_user_endpoints_without_auth(self):
        """Test that protected user endpoints return 403 without authentication"""
        print("\n=== Testing Protected User Endpoints (No Auth) ===")
        
        # Test POST /api/fellowship/apply without auth
        try:
            response = requests.post(f"{API_BASE}/fellowship/apply", 
                                   json=self.fellowship_test_data, timeout=10)
            self.log_test("/api/fellowship/apply", "POST", 403, response.status_code, 
                         "- Should return 403 without auth")
        except requests.exceptions.RequestException as e:
            self.log_test("/api/fellowship/apply", "POST", 403, "ERROR", f"Connection error: {e}")

        # Test POST /api/fellowship/upload-resume without auth  
        try:
            response = requests.post(f"{API_BASE}/fellowship/upload-resume", timeout=10)
            self.log_test("/api/fellowship/upload-resume", "POST", 403, response.status_code,
                         "- Should return 403 without auth")
        except requests.exceptions.RequestException as e:
            self.log_test("/api/fellowship/upload-resume", "POST", 403, "ERROR", f"Connection error: {e}")

        # Test GET /api/fellowship/applications/my without auth
        try:
            response = requests.get(f"{API_BASE}/fellowship/applications/my", timeout=10)
            self.log_test("/api/fellowship/applications/my", "GET", 403, response.status_code,
                         "- Should return 403 without auth")
        except requests.exceptions.RequestException as e:
            self.log_test("/api/fellowship/applications/my", "GET", 403, "ERROR", f"Connection error: {e}")

    def test_admin_endpoints_without_auth(self):
        """Test that admin endpoints return 403 without authentication"""
        print("\n=== Testing Admin Endpoints (No Auth) ===")
        
        # Test GET /api/admin/fellowship/applications without auth
        try:
            response = requests.get(f"{API_BASE}/admin/fellowship/applications", timeout=10)
            self.log_test("/api/admin/fellowship/applications", "GET", 403, response.status_code,
                         "- Should return 403 without admin auth")
        except requests.exceptions.RequestException as e:
            self.log_test("/api/admin/fellowship/applications", "GET", 403, "ERROR", f"Connection error: {e}")

        # Test PUT /api/admin/fellowship/applications/test-id/status without auth
        test_status_data = {"status": "under_review", "admin_notes": "Test review"}
        try:
            response = requests.put(f"{API_BASE}/admin/fellowship/applications/test-id/status",
                                  json=test_status_data, timeout=10)
            self.log_test("/api/admin/fellowship/applications/{id}/status", "PUT", 403, response.status_code,
                         "- Should return 403 without admin auth")
        except requests.exceptions.RequestException as e:
            self.log_test("/api/admin/fellowship/applications/{id}/status", "PUT", 403, "ERROR", f"Connection error: {e}")

        # Test GET /api/admin/fellowship/applications/test-id/resume without auth
        try:
            response = requests.get(f"{API_BASE}/admin/fellowship/applications/test-id/resume", timeout=10)
            self.log_test("/api/admin/fellowship/applications/{id}/resume", "GET", 403, response.status_code,
                         "- Should return 403 without admin auth")
        except requests.exceptions.RequestException as e:
            self.log_test("/api/admin/fellowship/applications/{id}/resume", "GET", 403, "ERROR", f"Connection error: {e}")

    def test_fellowship_data_validation(self):
        """Test fellowship application data validation"""
        print("\n=== Testing Fellowship Application Data Validation ===")
        
        # Test with invalid data (missing required fields)
        invalid_data = {"full_name": "Test User"}  # Missing required fields
        try:
            response = requests.post(f"{API_BASE}/fellowship/apply", json=invalid_data, timeout=10)
            # Should return 422 (validation error) or 403 (auth required)
            if response.status_code in [422, 403]:
                self.log_test("/api/fellowship/apply", "POST", "422 or 403", response.status_code,
                             "- Validation working correctly")
            else:
                self.log_test("/api/fellowship/apply", "POST", "422 or 403", response.status_code,
                             "- Unexpected response for invalid data")
        except requests.exceptions.RequestException as e:
            self.log_test("/api/fellowship/apply", "POST", "422 or 403", "ERROR", f"Connection error: {e}")

    def test_backend_availability(self):
        """Test if backend server is running and accessible"""
        print("\n=== Testing Backend Server Availability ===")
        try:
            response = requests.get(BACKEND_URL, timeout=5)
            if response.status_code in [200, 404, 422]:  # Any response means server is up
                print(f"✅ Backend server is accessible at {BACKEND_URL}")
                return True
            else:
                print(f"⚠️ Backend server responded with status: {response.status_code}")
                return True
        except requests.exceptions.RequestException as e:
            print(f"❌ Backend server not accessible: {e}")
            return False

    def print_test_summary(self):
        """Print summary of all tests"""
        print("\n" + "="*60)
        print("FELLOWSHIP APPLICATION API TEST SUMMARY")
        print("="*60)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t['status'] == '✅ PASS'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%")
        
        if failed_tests > 0:
            print(f"\nFailed Tests:")
            for test in self.test_results:
                if test['status'] == '❌ FAIL':
                    print(f"  - {test['method']} {test['endpoint']}: Expected {test['expected']}, Got {test['actual']} {test['details']}")
        
        print("\nDetailed Results:")
        for test in self.test_results:
            print(f"{test['status']} {test['method']} {test['endpoint']} {test['details']}")

    def run_all_tests(self):
        """Run all fellowship API tests"""
        print("Starting Fellowship Application API Tests...")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("="*60)
        
        # Check if backend is available first
        if not self.test_backend_availability():
            print("❌ Backend server is not accessible. Cannot proceed with API tests.")
            return
        
        # Run all test suites
        self.test_health_endpoint()
        self.test_public_fellowship_stats()
        self.test_protected_user_endpoints_without_auth()
        self.test_admin_endpoints_without_auth()
        self.test_fellowship_data_validation()
        
        # Print summary
        self.print_test_summary()

if __name__ == "__main__":
    tester = FellowshipAPITester()
    tester.run_all_tests()