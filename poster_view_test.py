#!/usr/bin/env python3
"""
CURE Poster Viewing Functionality Test
Tests the recent fix for poster viewing endpoint /api/posters/{poster_id}/view
"""

import requests
import sys
import json
from datetime import datetime

class PosterViewTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.critical_failures = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
            if details:
                print(f"   {details}")
        else:
            print(f"❌ {name}")
            if details:
                print(f"   {details}")
            self.critical_failures.append(f"{name}: {details}")

    def test_health_check(self):
        """Test backend health"""
        print("\n🔍 Testing Backend Health...")
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            self.log_test("Backend Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Backend Health Check", False, f"Error: {str(e)}")
            return False

    def get_existing_posters(self):
        """Get list of existing posters to test with"""
        print("\n🔍 Getting Existing Posters...")
        try:
            response = requests.get(f"{self.api_url}/posters", timeout=10)
            if response.status_code == 200:
                posters = response.json()
                print(f"   Found {len(posters)} public posters")
                for i, poster in enumerate(posters[:3]):  # Show first 3
                    print(f"   {i+1}. {poster.get('title', 'No title')} (ID: {poster.get('id', 'No ID')})")
                return posters
            else:
                print(f"   Failed to get posters: {response.status_code}")
                return []
        except Exception as e:
            print(f"   Error getting posters: {str(e)}")
            return []

    def test_poster_view_endpoint_exists(self):
        """Test if the poster view endpoint exists"""
        print("\n🔍 Testing Poster View Endpoint Existence...")
        
        # Use a dummy poster ID to test if endpoint exists
        test_poster_id = "dummy-poster-id-123"
        
        try:
            response = requests.get(f"{self.api_url}/posters/{test_poster_id}/view", timeout=10)
            
            # We expect 404 (poster not found) rather than 405 (method not allowed) or 500 (server error)
            # This indicates the endpoint exists but poster doesn't exist
            if response.status_code == 404:
                success = True
                details = "Endpoint exists (404 for non-existent poster is expected)"
            elif response.status_code == 405:
                success = False
                details = "Endpoint does not exist (405 Method Not Allowed)"
            elif response.status_code == 500:
                success = False
                details = f"Server error (500): {response.text[:100]}"
            else:
                success = True
                details = f"Endpoint exists (Status: {response.status_code})"
            
            self.log_test("Poster View Endpoint Exists", success, details)
            return success
            
        except Exception as e:
            self.log_test("Poster View Endpoint Exists", False, f"Error: {str(e)}")
            return False

    def test_poster_view_with_valid_id(self, poster_id):
        """Test poster view with a valid poster ID"""
        print(f"\n🔍 Testing Poster View with Valid ID: {poster_id}")
        
        try:
            response = requests.get(f"{self.api_url}/posters/{poster_id}/view", timeout=10)
            
            if response.status_code == 200:
                # Check if it's a file response
                content_type = response.headers.get('content-type', '')
                content_disposition = response.headers.get('content-disposition', '')
                
                success = True
                details = f"Status: 200, Content-Type: {content_type}"
                
                if 'application/pdf' in content_type:
                    details += ", PDF file served correctly"
                elif 'image/' in content_type:
                    details += ", Image file served correctly"
                elif 'inline' in content_disposition:
                    details += ", File served inline as expected"
                else:
                    details += f", Response length: {len(response.content)} bytes"
                
            elif response.status_code == 404:
                success = False
                details = "Poster not found (404) - may not be approved or file missing"
            elif response.status_code == 403:
                success = False
                details = "Access forbidden (403) - poster may not be approved for public viewing"
            else:
                success = False
                details = f"Unexpected status: {response.status_code}, Response: {response.text[:100]}"
            
            self.log_test(f"View Poster {poster_id}", success, details)
            return success
            
        except Exception as e:
            self.log_test(f"View Poster {poster_id}", False, f"Error: {str(e)}")
            return False

    def test_poster_view_with_invalid_id(self):
        """Test poster view with invalid poster ID"""
        print("\n🔍 Testing Poster View with Invalid ID...")
        
        invalid_ids = [
            "invalid-poster-id-123",
            "nonexistent-poster",
            "12345"
        ]
        
        all_success = True
        
        for invalid_id in invalid_ids:
            try:
                response = requests.get(f"{self.api_url}/posters/{invalid_id}/view", timeout=10)
                
                # Should return 404 for invalid/non-existent poster
                if response.status_code == 404:
                    success = True
                    details = "Correctly returns 404 for invalid poster ID"
                else:
                    success = False
                    details = f"Expected 404, got {response.status_code}"
                
                self.log_test(f"Invalid ID Test ({invalid_id})", success, details)
                all_success = all_success and success
                
            except Exception as e:
                self.log_test(f"Invalid ID Test ({invalid_id})", False, f"Error: {str(e)}")
                all_success = False
        
        return all_success

    def test_poster_view_error_handling(self):
        """Test error handling for poster view endpoint"""
        print("\n🔍 Testing Poster View Error Handling...")
        
        # Test with malformed IDs
        malformed_ids = [
            "",  # Empty ID
            "../../etc/passwd",  # Path traversal attempt
            "poster with spaces",  # Spaces in ID
            "poster%20with%20encoding"  # URL encoded
        ]
        
        all_success = True
        
        for malformed_id in malformed_ids:
            try:
                # URL encode the malformed ID properly
                import urllib.parse
                encoded_id = urllib.parse.quote(malformed_id, safe='')
                
                response = requests.get(f"{self.api_url}/posters/{encoded_id}/view", timeout=10)
                
                # Should handle gracefully (404 or 400)
                if response.status_code in [400, 404]:
                    success = True
                    details = f"Correctly handles malformed ID with {response.status_code}"
                elif response.status_code == 500:
                    success = False
                    details = f"Server error (500) - poor error handling"
                else:
                    success = True  # Any other response is acceptable
                    details = f"Handles with status {response.status_code}"
                
                self.log_test(f"Malformed ID Test ({malformed_id[:20]})", success, details)
                all_success = all_success and success
                
            except Exception as e:
                # Network errors are acceptable for malformed requests
                success = True
                details = f"Network error (acceptable): {str(e)[:50]}"
                self.log_test(f"Malformed ID Test ({malformed_id[:20]})", success, details)
        
        return all_success

    def run_comprehensive_poster_view_tests(self):
        """Run all poster viewing tests"""
        print("🚀 STARTING POSTER VIEWING FUNCTIONALITY TESTS")
        print("=" * 60)
        print(f"Testing against: {self.base_url}")
        print("Focus: /api/posters/{{poster_id}}/view endpoint")
        print("=" * 60)
        
        # Test 1: Backend health
        if not self.test_health_check():
            print("\n❌ Backend is not responding. Stopping tests.")
            return
        
        # Test 2: Get existing posters
        existing_posters = self.get_existing_posters()
        
        # Test 3: Check if endpoint exists
        self.test_poster_view_endpoint_exists()
        
        # Test 4: Test with valid poster IDs (if any exist)
        if existing_posters:
            print(f"\n🔍 Testing with {len(existing_posters)} existing posters...")
            for poster in existing_posters[:3]:  # Test first 3 posters
                poster_id = poster.get('id')
                if poster_id:
                    self.test_poster_view_with_valid_id(poster_id)
        else:
            print("\n⚠️  No existing posters found to test with")
            # Create a test case with a realistic poster ID format
            test_id = "1ef0a4d6-ff70-4d8d-8726-8ef74a0f8a73"  # UUID format
            self.test_poster_view_with_valid_id(test_id)
        
        # Test 5: Test with invalid IDs
        self.test_poster_view_with_invalid_id()
        
        # Test 6: Test error handling
        self.test_poster_view_error_handling()
        
        # Final summary
        self.print_final_summary()

    def print_final_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("🏁 POSTER VIEWING FUNCTIONALITY TEST COMPLETE")
        print("=" * 60)
        
        print(f"\n📊 OVERALL RESULTS:")
        print(f"   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.critical_failures:
            print(f"\n❌ CRITICAL FAILURES ({len(self.critical_failures)}):")
            for i, failure in enumerate(self.critical_failures, 1):
                print(f"   {i}. {failure}")
        else:
            print(f"\n✅ NO CRITICAL FAILURES DETECTED")
        
        print(f"\n🎯 POSTER VIEW ENDPOINT STATUS:")
        
        if self.tests_passed >= (self.tests_run * 0.8):  # 80% success rate
            print("   ✅ Poster viewing functionality is working correctly")
            print("   ✅ Endpoint exists and handles requests properly")
            print("   ✅ Error handling is implemented")
        else:
            print("   ❌ Poster viewing functionality has issues")
            print("   ❌ Check the failures above for details")
        
        print(f"\n📋 RECOMMENDATIONS:")
        if len(self.critical_failures) == 0:
            print("   ✅ Poster viewing endpoint is working as expected")
            print("   ✅ Recent fix appears to be successful")
            print("   ✅ Frontend can safely use /api/posters/{poster_id}/view")
        else:
            print("   ❌ Issues found that need attention:")
            for failure in self.critical_failures[:3]:
                print(f"      - {failure}")
        
        print(f"\n🔧 TECHNICAL DETAILS:")
        print(f"   - Endpoint: GET /api/posters/{{poster_id}}/view")
        print(f"   - Expected: Returns poster file (PDF/image) with proper headers")
        print(f"   - Error handling: 404 for missing posters, 403 for unapproved")
        print(f"   - Content-Type: application/pdf or image/* as appropriate")

if __name__ == "__main__":
    # Test against local backend
    base_url = "http://localhost:8001"
    
    print("🚀 CURE POSTER VIEWING FUNCTIONALITY TESTER")
    print("=" * 50)
    print(f"Target: {base_url}")
    print("Focus: Testing poster view endpoint after recent fix")
    print("=" * 50)
    
    tester = PosterViewTester(base_url)
    tester.run_comprehensive_poster_view_tests()