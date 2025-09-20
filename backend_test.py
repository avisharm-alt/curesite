import requests
import sys
import json
from datetime import datetime
from urllib.parse import quote

class CUREAPITester:
    def __init__(self, base_url="https://medstudent-exchange.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.admin_token = None
        self.student_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.critical_failures = []
        self.test_user_id = None
        self.test_poster_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, critical=False):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                if critical:
                    self.critical_failures.append(f"{name}: Expected {expected_status}, got {response.status_code}")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            if critical:
                self.critical_failures.append(f"{name}: Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            if critical:
                self.critical_failures.append(f"{name}: Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            if critical:
                self.critical_failures.append(f"{name}: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def create_mock_admin_token(self):
        """Create a mock admin token for testing (this won't work in real scenario)"""
        # This is just for testing structure - real auth would require OAuth flow
        print("\n🔐 Note: Admin authentication requires OAuth flow which cannot be automated")
        print("   Testing admin endpoints will show expected 401 responses")
        return None

    def test_student_profile_update(self):
        """CRITICAL: Test student profile update functionality"""
        print("\n🚨 CRITICAL TEST: Student Profile Update")
        
        # Test profile update without authentication (should fail)
        profile_data = {
            "name": "John Smith",
            "university": "University of Toronto", 
            "program": "Medicine",
            "year": 3,
            "user_type": "student"
        }
        
        success, response = self.run_test(
            "Profile Update (No Auth)", 
            "PUT", 
            "users/profile", 
            401, 
            data=profile_data,
            critical=True
        )
        
        # This should fail with 401 since we don't have a valid token
        if not success:
            print("❌ CRITICAL ISSUE: Profile update endpoint not responding correctly to unauthenticated requests")
        
        return success, response

    def test_admin_poster_review(self):
        """CRITICAL: Test admin poster review functionality"""
        print("\n🚨 CRITICAL TEST: Admin Poster Review")
        
        # First get a poster to review
        success, posters = self.run_test("Get Posters for Review Test", "GET", "posters", 200)
        
        if success and isinstance(posters, list) and len(posters) > 0:
            poster_id = posters[0].get('id')
            if poster_id:
                # Test poster review without admin auth (should fail with 401/403)
                review_data = {
                    "status": "approved",
                    "comments": "Test review comment"
                }
                
                success, response = self.run_test(
                    "Poster Review (No Admin Auth)",
                    "PUT",
                    f"posters/{poster_id}/review",
                    401,  # Should fail without auth
                    data=review_data,
                    critical=True
                )
                
                return success, response
        
        print("❌ CRITICAL ISSUE: No posters available to test review functionality")
        self.critical_failures.append("Admin Poster Review: No posters available for testing")
        return False, {}

    def test_admin_professor_management(self):
        """CRITICAL: Test admin professor management"""
        print("\n🚨 CRITICAL TEST: Admin Professor Management")
        
        # Test creating professor profile without admin auth
        professor_data = {
            "department": "Computer Science",
            "research_areas": ["Machine Learning", "AI"],
            "lab_description": "AI Research Lab focusing on medical applications",
            "accepting_students": True,
            "website": "https://example.com"
        }
        
        # Test CREATE
        success_create, response_create = self.run_test(
            "Admin Create Professor (No Auth)",
            "POST",
            "admin/professor-network",
            401,  # Should fail without admin auth
            data=professor_data,
            critical=True
        )
        
        # Test GET all professors (admin endpoint)
        success_get, response_get = self.run_test(
            "Admin Get All Professors (No Auth)",
            "GET",
            "admin/professor-network",
            401,  # Should fail without admin auth
            critical=True
        )
        
        return success_create and success_get, {"create": response_create, "get": response_get}

    def test_admin_volunteer_management(self):
        """CRITICAL: Test admin volunteer opportunities management"""
        print("\n🚨 CRITICAL TEST: Admin Volunteer Management")
        
        volunteer_data = {
            "title": "Medical Research Assistant",
            "organization": "Toronto General Hospital",
            "description": "Assist with clinical research studies",
            "location": "Toronto, ON",
            "contact_email": "research@tgh.ca",
            "requirements": ["Undergraduate student", "Interest in medicine"],
            "time_commitment": "10 hours/week"
        }
        
        # Test CREATE
        success_create, response_create = self.run_test(
            "Admin Create Volunteer Opportunity (No Auth)",
            "POST",
            "admin/volunteer-opportunities",
            401,  # Should fail without admin auth
            data=volunteer_data,
            critical=True
        )
        
        # Test GET all volunteer opportunities (admin endpoint)
        success_get, response_get = self.run_test(
            "Admin Get All Volunteer Opportunities (No Auth)",
            "GET",
            "admin/volunteer-opportunities",
            401,  # Should fail without admin auth
            critical=True
        )
        
        return success_create and success_get, {"create": response_create, "get": response_get}

    def test_admin_ec_profiles_management(self):
        """CRITICAL: Test admin EC profiles management"""
        print("\n🚨 CRITICAL TEST: Admin EC Profiles Management")
        
        ec_profile_data = {
            "medical_school": "University of Toronto",
            "admission_year": 2024,
            "undergraduate_gpa": 3.9,
            "mcat_score": 520,
            "research_hours": 500,
            "volunteer_hours": 200,
            "clinical_hours": 100,
            "leadership_activities": ["Student Council President"],
            "awards_scholarships": ["Dean's List"],
            "publications": 2
        }
        
        # Test CREATE
        success_create, response_create = self.run_test(
            "Admin Create EC Profile (No Auth)",
            "POST",
            "admin/ec-profiles",
            401,  # Should fail without admin auth
            data=ec_profile_data,
            critical=True
        )
        
        # Test GET all EC profiles (admin endpoint)
        success_get, response_get = self.run_test(
            "Admin Get All EC Profiles (No Auth)",
            "GET",
            "admin/ec-profiles",
            401,  # Should fail without admin auth
            critical=True
        )
        
        return success_create and success_get, {"create": response_create, "get": response_get}

    def test_authentication_flow(self):
        """CRITICAL: Test authentication flow"""
        print("\n🚨 CRITICAL TEST: Authentication Flow")
        
        # Test Google auth redirect
        success_google, response_google = self.run_test(
            "Google Auth Redirect",
            "GET",
            "auth/google",
            302,  # Should redirect
            critical=True
        )
        
        # Test getting current user without token
        success_me, response_me = self.run_test(
            "Get Current User (No Token)",
            "GET",
            "auth/me",
            401,  # Should fail without token
            critical=True
        )
        
        # Test admin test endpoint without auth
        success_admin_test, response_admin_test = self.run_test(
            "Admin Test Endpoint (No Auth)",
            "GET",
            "admin/test",
            401,  # Should fail without admin token
            critical=True
        )
        
        return success_google and success_me and success_admin_test, {
            "google": response_google,
            "me": response_me,
            "admin_test": response_admin_test
        }

    def test_admin_panel_endpoints(self):
        """Test all admin panel endpoints that should require authentication"""
        print("\n🚨 CRITICAL TEST: Admin Panel Endpoints")
        
        admin_endpoints = [
            ("admin/posters/pending", "GET"),
            ("admin/posters/all", "GET"),
            ("admin/stats", "GET"),
            ("admin/posters", "GET"),
            ("admin/professor-network", "GET"),
            ("admin/volunteer-opportunities", "GET"),
            ("admin/ec-profiles", "GET")
        ]
        
        all_success = True
        responses = {}
        
        for endpoint, method in admin_endpoints:
            success, response = self.run_test(
                f"Admin Endpoint: {endpoint}",
                method,
                endpoint,
                401,  # Should fail without admin auth
                critical=True
            )
            responses[endpoint] = response
            all_success = all_success and success
        
        return all_success, responses

    def test_posters_endpoint(self):
        """Test posters endpoint"""
        success, response = self.run_test("Get Posters", "GET", "posters", 200)
        
        # Test with filters
        if success:
            self.run_test("Get Posters (Approved)", "GET", "posters?status=approved", 200)
            self.run_test("Get Posters (Pending)", "GET", "posters?status=pending", 200)
            self.run_test("Get Posters (All Status)", "GET", "posters", 200)
            self.run_test("Get Posters (By University)", "GET", "posters?university=University%20of%20Toronto", 200)
        
        return success, response

    def test_specific_poster(self):
        """Test specific poster mentioned in review request"""
        poster_id = "c67e8d86-c92a-4488-b362-f33c60d488c1"
        print(f"\n🔍 Testing specific poster ID: {poster_id}")
        
        # First get all posters to see if this specific one exists
        success, all_posters = self.run_test("Get All Posters for Specific Check", "GET", "posters", 200)
        
        if success and isinstance(all_posters, list):
            found_poster = None
            for poster in all_posters:
                if poster.get('id') == poster_id:
                    found_poster = poster
                    break
            
            if found_poster:
                print(f"✅ Found specific poster: {found_poster.get('title', 'No title')}")
                print(f"   Status: {found_poster.get('status', 'No status')}")
                print(f"   University: {found_poster.get('university', 'No university')}")
                if found_poster.get('status') == 'pending':
                    print(f"✅ Poster has correct 'pending' status")
                    self.tests_passed += 1
                else:
                    print(f"❌ Poster status is '{found_poster.get('status')}', expected 'pending'")
                self.tests_run += 1
            else:
                print(f"❌ Specific poster with ID {poster_id} not found")
                self.tests_run += 1
        
        return success, all_posters

    def test_admin_endpoints(self):
        """Test admin endpoints (without authentication)"""
        # These should fail without proper admin token
        self.run_test("Admin Pending Posters (No Auth)", "GET", "admin/posters/pending", 401)
        self.run_test("Admin Stats (No Auth)", "GET", "admin/stats", 401)
        
        return True, {}

    def test_student_network_endpoint(self):
        """Test student network endpoint"""
        success, response = self.run_test("Get Student Network", "GET", "student-network", 200)
        
        # Test with search
        if success:
            self.run_test("Search Student Network", "GET", "student-network?research_interest=biology", 200)
        
        return success, response

    def test_professor_network_endpoint(self):
        """Test professor network endpoint"""
        success, response = self.run_test("Get Professor Network", "GET", "professor-network", 200)
        
        # Test with filters
        if success:
            self.run_test("Get Accepting Professors", "GET", "professor-network?accepting_students=true", 200)
            self.run_test("Search Professor Research", "GET", "professor-network?research_area=medicine", 200)
        
        return success, response

    def test_ec_profiles_endpoint(self):
        """Test EC profiles endpoint"""
        success, response = self.run_test("Get EC Profiles", "GET", "ec-profiles", 200)
        
        # Test with filters
        if success:
            self.run_test("Filter EC Profiles by School", "GET", "ec-profiles?medical_school=University%20of%20Toronto", 200)
            self.run_test("Filter EC Profiles by Year", "GET", "ec-profiles?admission_year=2024", 200)
        
        return success, response

    def test_ec_stats_endpoint(self):
        """Test EC profiles stats endpoint"""
        return self.run_test("Get EC Profile Stats", "GET", "ec-profiles/stats", 200)

    def test_volunteer_opportunities_endpoint(self):
        """Test volunteer opportunities endpoint"""
        success, response = self.run_test("Get Volunteer Opportunities", "GET", "volunteer-opportunities", 200)
        
        # Test with location search
        if success:
            self.run_test("Search Volunteer by Location", "GET", "volunteer-opportunities?location=Toronto", 200)
        
        return success, response

    def test_auth_endpoints(self):
        """Test authentication endpoints (without actual OAuth)"""
        # Test Google auth redirect (should redirect)
        success, response = self.run_test("Google Auth Redirect", "GET", "auth/google", 302)
        
        # Test auth/me without token (should fail)
        self.run_test("Get Current User (No Token)", "GET", "auth/me", 401)
        
        return success, response

    def test_cors_headers(self):
        """Test CORS headers"""
        print(f"\n🔍 Testing CORS Headers...")
        try:
            response = requests.options(f"{self.api_url}/health", timeout=10)
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            }
            print(f"   CORS Headers: {cors_headers}")
            return True
        except Exception as e:
            print(f"❌ CORS test failed: {str(e)}")
            return False

def main():
    print("🚀 Starting CURE API Testing...")
    print("=" * 50)
    
    tester = CUREAPITester()
    
    # Test basic endpoints
    print("\n📋 Testing Basic Endpoints...")
    tester.test_health_check()
    tester.test_root_endpoint()
    
    # Test main feature endpoints
    print("\n📚 Testing Feature Endpoints...")
    tester.test_posters_endpoint()
    tester.test_specific_poster()
    tester.test_student_network_endpoint()
    tester.test_professor_network_endpoint()
    tester.test_ec_profiles_endpoint()
    tester.test_ec_stats_endpoint()
    tester.test_volunteer_opportunities_endpoint()
    
    # Test admin endpoints
    print("\n👑 Testing Admin Endpoints...")
    tester.test_admin_endpoints()
    
    # Test authentication
    print("\n🔐 Testing Authentication...")
    tester.test_auth_endpoints()
    
    # Test CORS
    print("\n🌐 Testing CORS...")
    tester.test_cors_headers()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! Backend is working correctly.")
        return 0
    else:
        failed_tests = tester.tests_run - tester.tests_passed
        print(f"⚠️  {failed_tests} test(s) failed. Check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())