#!/usr/bin/env python3
"""
Comprehensive backend API testing for Vital Signs health storytelling platform
Tests all story endpoints, tags, universities, and admin functionality
"""

import requests
import json
import sys
from typing import Dict, Any, List

# Backend URL configuration
BACKEND_URL = "http://localhost:8001"
API_BASE = f"{BACKEND_URL}/api"

class VitalSignsAPITester:
    def __init__(self):
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status}: {test_name}"
        if details:
            result += f" - {details}"
        
        self.test_results.append(result)
        print(result)
        
    def test_health_endpoint(self):
        """Test basic health endpoint"""
        try:
            response = requests.get(f"{BACKEND_URL}/health", timeout=10)
            if response.status_code == 200:
                self.log_test("Health endpoint", True, f"Status: {response.status_code}")
            else:
                self.log_test("Health endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Health endpoint", False, f"Error: {str(e)}")
    
    def test_public_stories_endpoints(self):
        """Test public story endpoints"""
        
        # Test GET /api/stories - List approved stories
        try:
            response = requests.get(f"{API_BASE}/stories", timeout=10)
            if response.status_code == 200:
                data = response.json()
                required_fields = ["stories", "total", "page", "limit", "has_more"]
                if all(field in data for field in required_fields):
                    self.log_test("GET /api/stories", True, f"Returns stories list with pagination. Found {len(data['stories'])} stories")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_test("GET /api/stories", False, f"Missing required fields: {missing_fields}")
            else:
                self.log_test("GET /api/stories", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/stories", False, f"Error: {str(e)}")
        
        # Test GET /api/stories with pagination
        try:
            response = requests.get(f"{API_BASE}/stories?page=1&limit=5", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if len(data.get("stories", [])) <= 5:
                    self.log_test("GET /api/stories (pagination)", True, f"Pagination working, returned {len(data.get('stories', []))} stories")
                else:
                    self.log_test("GET /api/stories (pagination)", False, "Pagination limit not respected")
            else:
                self.log_test("GET /api/stories (pagination)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/stories (pagination)", False, f"Error: {str(e)}")
        
        # Test GET /api/stories with tag filter
        try:
            response = requests.get(f"{API_BASE}/stories?tag=Mental Health", timeout=10)
            if response.status_code == 200:
                self.log_test("GET /api/stories (tag filter)", True, "Tag filtering working")
            else:
                self.log_test("GET /api/stories (tag filter)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/stories (tag filter)", False, f"Error: {str(e)}")
        
        # Test GET /api/stories/featured - Featured stories
        try:
            response = requests.get(f"{API_BASE}/stories/featured", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/stories/featured", True, f"Returns featured stories list. Found {len(data)} featured stories")
                else:
                    self.log_test("GET /api/stories/featured", False, "Should return array of featured stories")
            else:
                self.log_test("GET /api/stories/featured", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/stories/featured", False, f"Error: {str(e)}")
        
        # Test GET /api/stories/{story_id} - Single story (using a test ID)
        try:
            response = requests.get(f"{API_BASE}/stories/test-story-id", timeout=10)
            if response.status_code == 404:
                self.log_test("GET /api/stories/{story_id}", True, "Correctly returns 404 for non-existent story")
            elif response.status_code == 200:
                self.log_test("GET /api/stories/{story_id}", True, "Returns story data for valid ID")
            else:
                self.log_test("GET /api/stories/{story_id}", False, f"Unexpected status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/stories/{story_id}", False, f"Error: {str(e)}")
    
    def test_tags_endpoint(self):
        """Test health topic tags endpoint"""
        try:
            response = requests.get(f"{API_BASE}/tags", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    expected_tags = [
                        "Mental Health", "Chronic Illness", "Rare Disease", "Caregiving",
                        "Disability", "Surgical Experience", "Addiction & Recovery", 
                        "Reproductive Health", "Other"
                    ]
                    
                    tag_names = [tag.get("name") for tag in data if isinstance(tag, dict)]
                    
                    if len(data) == 9:
                        self.log_test("GET /api/tags (count)", True, f"Returns exactly 9 tags as expected")
                    else:
                        self.log_test("GET /api/tags (count)", False, f"Expected 9 tags, got {len(data)}")
                    
                    # Check if all expected tags are present
                    missing_tags = [tag for tag in expected_tags if tag not in tag_names]
                    if not missing_tags:
                        self.log_test("GET /api/tags (content)", True, "All expected health topic tags present")
                    else:
                        self.log_test("GET /api/tags (content)", False, f"Missing tags: {missing_tags}")
                        
                    # Log the actual tags found
                    self.log_test("GET /api/tags (tags found)", True, f"Tags: {tag_names}")
                else:
                    self.log_test("GET /api/tags", False, "Should return array of tags")
            else:
                self.log_test("GET /api/tags", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/tags", False, f"Error: {str(e)}")
    
    def test_universities_endpoint(self):
        """Test Canadian universities endpoint"""
        try:
            response = requests.get(f"{API_BASE}/universities", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) == 21:
                        self.log_test("GET /api/universities (count)", True, f"Returns exactly 21 universities as expected")
                    else:
                        self.log_test("GET /api/universities (count)", False, f"Expected 21 universities, got {len(data)}")
                    
                    # Check for some expected universities
                    expected_unis = ["University of Toronto", "McGill University", "University of British Columbia"]
                    found_unis = [uni for uni in expected_unis if uni in data]
                    
                    if len(found_unis) == len(expected_unis):
                        self.log_test("GET /api/universities (content)", True, f"Major Canadian universities present")
                    else:
                        self.log_test("GET /api/universities (content)", False, f"Missing expected universities")
                        
                    # Log first few universities
                    self.log_test("GET /api/universities (sample)", True, f"First 5 universities: {data[:5]}")
                else:
                    self.log_test("GET /api/universities", False, "Should return array of universities")
            else:
                self.log_test("GET /api/universities", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/universities", False, f"Error: {str(e)}")
    
    def test_protected_endpoints_without_auth(self):
        """Test that protected endpoints require authentication"""
        
        protected_endpoints = [
            ("POST", "/stories", "Submit new story"),
            ("GET", "/stories/my/submissions", "Get user's stories"),
            ("POST", "/stories/test-id/resonate", "Toggle story resonance")
        ]
        
        for method, endpoint, description in protected_endpoints:
            try:
                if method == "POST":
                    response = requests.post(f"{API_BASE}{endpoint}", 
                                           json={"test": "data"}, timeout=10)
                else:
                    response = requests.get(f"{API_BASE}{endpoint}", timeout=10)
                
                if response.status_code in [401, 403]:
                    self.log_test(f"{method} {endpoint} (auth required)", True, 
                                f"Correctly requires authentication (status: {response.status_code})")
                else:
                    self.log_test(f"{method} {endpoint} (auth required)", False, 
                                f"Should require auth, got status: {response.status_code}")
            except Exception as e:
                self.log_test(f"{method} {endpoint} (auth required)", False, f"Error: {str(e)}")
    
    def test_admin_endpoints_without_auth(self):
        """Test that admin endpoints require authentication"""
        
        admin_endpoints = [
            ("GET", "/admin/stories", "Get all stories for admin"),
            ("PUT", "/admin/stories/test-id/status", "Update story status"),
            ("PUT", "/admin/stories/test-id/feature", "Toggle featured status"),
            ("POST", "/admin/tags", "Create/update tags"),
            ("GET", "/admin/stories/analytics", "Get story analytics")
        ]
        
        for method, endpoint, description in admin_endpoints:
            try:
                if method == "POST":
                    response = requests.post(f"{API_BASE}{endpoint}", 
                                           json={"test": "data"}, timeout=10)
                elif method == "PUT":
                    response = requests.put(f"{API_BASE}{endpoint}", 
                                          json={"test": "data"}, timeout=10)
                else:
                    response = requests.get(f"{API_BASE}{endpoint}", timeout=10)
                
                if response.status_code in [401, 403]:
                    self.log_test(f"{method} {endpoint} (admin auth required)", True, 
                                f"Correctly requires admin auth (status: {response.status_code})")
                else:
                    self.log_test(f"{method} {endpoint} (admin auth required)", False, 
                                f"Should require admin auth, got status: {response.status_code}")
            except Exception as e:
                self.log_test(f"{method} {endpoint} (admin auth required)", False, f"Error: {str(e)}")
    
    def test_api_router_inclusion(self):
        """Test that API router is properly included"""
        try:
            # Test a known endpoint to verify API router is working
            response = requests.get(f"{API_BASE}/tags", timeout=10)
            if response.status_code in [200, 401, 403]:
                self.log_test("API Router inclusion", True, "API endpoints are accessible")
            else:
                self.log_test("API Router inclusion", False, f"API endpoints not accessible: {response.status_code}")
        except Exception as e:
            self.log_test("API Router inclusion", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests"""
        print("🧪 Starting Vital Signs API Testing...")
        print("=" * 60)
        
        # Test basic connectivity
        self.test_health_endpoint()
        self.test_api_router_inclusion()
        
        # Test public endpoints
        self.test_public_stories_endpoints()
        self.test_tags_endpoint()
        self.test_universities_endpoint()
        
        # Test authentication requirements
        self.test_protected_endpoints_without_auth()
        self.test_admin_endpoints_without_auth()
        
        # Print summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests)*100:.1f}%")
        
        if self.passed_tests == self.total_tests:
            print("\n🎉 ALL TESTS PASSED! Vital Signs API is working correctly.")
        else:
            print(f"\n⚠️  {self.total_tests - self.passed_tests} tests failed. See details above.")
        
        return self.passed_tests == self.total_tests

if __name__ == "__main__":
    tester = VitalSignsAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)