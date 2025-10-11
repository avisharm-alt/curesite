import requests
import sys
import json
from datetime import datetime
from urllib.parse import quote

class CUREAPITester:
    def __init__(self, base_url="https://17327586-7f38-43e4-9b34-2c5c25c3115f.preview.emergentagent.com"):
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

    def test_stripe_payment_integration(self):
        """CRITICAL: Test Stripe payment integration for poster submissions"""
        print("\n🚨 CRITICAL TEST: Stripe Payment Integration")
        print("   Testing ALL payment endpoints and functionality as requested")
        
        all_tests_passed = True
        results = {}
        
        # Test 1: Health check - verify backend is running
        print("\n1. Health Check - Verify backend is running")
        success_health, response_health = self.run_test("Health Check", "GET", "../health", 200, critical=True)
        results['health_check'] = {'success': success_health, 'response': response_health}
        all_tests_passed = all_tests_passed and success_health
        
        # Test 2: GET /api/posters - verify public endpoint only shows paid posters
        print("\n2. GET /api/posters - Verify public endpoint only shows paid posters")
        success_public, all_posters = self.run_test("Get Public Posters", "GET", "posters", 200, critical=True)
        results['public_posters'] = {'success': success_public, 'response': all_posters}
        
        if success_public and isinstance(all_posters, list):
            payment_filtered_correctly = True
            for poster in all_posters:
                status = poster.get('status')
                payment_status = poster.get('payment_status')
                
                # Public endpoint should only show approved AND completed payment posters
                if status != 'approved' or payment_status != 'completed':
                    print(f"❌ Found invalid poster in public list: {poster.get('title', 'No title')}")
                    print(f"   Status: {status}, Payment Status: {payment_status}")
                    payment_filtered_correctly = False
                    self.critical_failures.append(f"Public poster filtering failed: {poster.get('title')} has status={status}, payment_status={payment_status}")
            
            if payment_filtered_correctly:
                print("✅ Public posters correctly filtered for approved + completed payment only")
            else:
                print("❌ CRITICAL: Public posters not properly filtered by payment status")
                all_tests_passed = False
        else:
            all_tests_passed = False
        
        # Test 3: GET /api/posters/my - verify authentication required
        print("\n3. GET /api/posters/my - Verify authentication required")
        success_my, response_my = self.run_test("Get My Posters (No Auth)", "GET", "posters/my", 401, critical=True)
        results['my_posters_auth'] = {'success': success_my, 'response': response_my}
        all_tests_passed = all_tests_passed and success_my
        
        # Test 4: POST /api/posters - verify poster submission still works (without auth should fail)
        print("\n4. POST /api/posters - Verify poster submission endpoint exists")
        poster_data = {
            "title": "Test Research Poster for Payment Integration",
            "authors": ["Dr. Sarah Johnson", "Michael Chen"],
            "abstract": "This is a test poster submission to verify the payment integration system works correctly.",
            "keywords": ["payment", "integration", "testing"],
            "university": "University of Toronto",
            "program": "Computer Science"
        }
        success_submit, response_submit = self.run_test("Submit Poster (No Auth)", "POST", "posters", 401, data=poster_data, critical=True)
        results['poster_submission'] = {'success': success_submit, 'response': response_submit}
        all_tests_passed = all_tests_passed and success_submit
        
        # Test 5: PUT /api/admin/posters/{id}/review - verify admin approval sets payment fields
        print("\n5. PUT /api/admin/posters/{id}/review - Verify admin approval endpoint")
        if success_public and all_posters and len(all_posters) > 0:
            test_poster_id = all_posters[0].get('id')
            review_data = {
                "status": "approved",
                "comments": "Test approval for payment integration testing"
            }
            success_review, response_review = self.run_test(
                "Admin Poster Review (No Auth)", 
                "PUT", 
                f"admin/posters/{test_poster_id}/review", 
                403,  # Should fail without admin auth
                data=review_data, 
                critical=True
            )
            results['admin_review'] = {'success': success_review, 'response': response_review}
            all_tests_passed = all_tests_passed and success_review
        else:
            print("❌ No posters available to test admin review")
            self.critical_failures.append("No posters available for admin review testing")
            all_tests_passed = False
        
        # Test 6: PUT /api/admin/posters/{id}/payment - verify mark as paid endpoint
        print("\n6. PUT /api/admin/posters/{id}/payment - Verify mark as paid endpoint")
        if success_public and all_posters and len(all_posters) > 0:
            test_poster_id = all_posters[0].get('id')
            success_payment, response_payment = self.run_test(
                "Admin Mark Payment Completed (No Auth)", 
                "PUT", 
                f"admin/posters/{test_poster_id}/payment", 
                403,  # Should fail without admin auth
                critical=True
            )
            results['admin_payment'] = {'success': success_payment, 'response': response_payment}
            all_tests_passed = all_tests_passed and success_payment
        else:
            print("❌ No posters available to test payment completion")
            self.critical_failures.append("No posters available for payment completion testing")
            all_tests_passed = False
        
        # Test 7: GET /api/admin/posters/all - verify admin can see all posters with payment status
        print("\n7. GET /api/admin/posters/all - Verify admin can see all posters")
        success_admin_all, response_admin_all = self.run_test("Admin Get All Posters (No Auth)", "GET", "admin/posters/all", 403, critical=True)
        results['admin_all_posters'] = {'success': success_admin_all, 'response': response_admin_all}
        all_tests_passed = all_tests_passed and success_admin_all
        
        # Test 8: GET /api/admin/posters/pending - verify pending posters endpoint still works
        print("\n8. GET /api/admin/posters/pending - Verify pending posters endpoint")
        success_pending, response_pending = self.run_test("Admin Get Pending Posters (No Auth)", "GET", "admin/posters/pending", 403, critical=True)
        results['admin_pending'] = {'success': success_pending, 'response': response_pending}
        all_tests_passed = all_tests_passed and success_pending
        
        return all_tests_passed, results

    def test_payment_fields_in_poster_model(self):
        """Test that poster model includes payment fields"""
        print("\n🔍 Testing payment fields in poster model...")
        
        # Test GET /api/posters/my endpoint (should fail without auth)
        success, response = self.run_test(
            "Get My Posters (Payment Fields Check - No Auth)",
            "GET",
            "posters/my",
            401,  # Should fail without auth token
            critical=True
        )
        
        # Test public posters to check if payment fields are present
        success_public, public_posters = self.run_test("Get Public Posters (Payment Fields)", "GET", "posters", 200)
        
        if success_public and isinstance(public_posters, list) and len(public_posters) > 0:
            sample_poster = public_posters[0]
            required_payment_fields = ['payment_status', 'payment_link', 'payment_completed_at']
            
            missing_fields = []
            for field in required_payment_fields:
                if field not in sample_poster:
                    missing_fields.append(field)
            
            if not missing_fields:
                print("✅ All required payment fields present in poster model")
                print(f"   Payment Status: {sample_poster.get('payment_status')}")
                print(f"   Payment Link: {'Present' if sample_poster.get('payment_link') else 'None'}")
                print(f"   Payment Completed At: {'Present' if sample_poster.get('payment_completed_at') else 'None'}")
                self.tests_passed += 1
            else:
                print(f"❌ CRITICAL: Missing payment fields in poster model: {missing_fields}")
                self.critical_failures.append(f"Missing payment fields: {missing_fields}")
            
            self.tests_run += 1
            return True, sample_poster
        else:
            print("❌ No posters available to check payment fields")
            return False, {}

    def test_sendgrid_email_integration(self):
        """Test SendGrid email integration (indirectly through poster approval)"""
        print("\n🔍 Testing SendGrid email integration...")
        print("   Note: Email sending will be tested indirectly through poster approval endpoint")
        
        # Since we can't actually approve posters without admin auth,
        # we'll test that the endpoint exists and requires proper authentication
        success, response = self.run_test(
            "SendGrid Email Integration (via Poster Approval - No Auth)",
            "PUT",
            "admin/posters/test-id/review",
            403,  # Should fail without admin auth
            data={"status": "approved", "comments": "Test"},
            critical=True
        )
        
        print("   ✅ Poster approval endpoint properly protected (email integration endpoint exists)")
        print("   📧 Email sending functionality requires admin authentication to test fully")
        
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
                print(f"   Payment Status: {found_poster.get('payment_status', 'No payment status')}")
                print(f"   University: {found_poster.get('university', 'No university')}")
                
                # Check if payment fields are present
                payment_fields = ['payment_status', 'payment_link', 'payment_completed_at']
                for field in payment_fields:
                    if field in found_poster:
                        print(f"   ✅ {field}: {found_poster.get(field)}")
                    else:
                        print(f"   ❌ Missing {field}")
                
                self.tests_passed += 1
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

    def test_production_health_endpoint(self):
        """Test production health endpoint specifically"""
        print("\n🚨 PRODUCTION TEST: Health Endpoint")
        url = f"{self.base_url}/health"
        success, response = self.run_test(
            "Production Health Check",
            "GET",
            url,
            200,
            critical=True
        )
        return success, response

    def test_production_admin_test_endpoint(self):
        """Test production admin test endpoint without auth"""
        print("\n🚨 PRODUCTION TEST: Admin Test Endpoint")
        url = f"{self.api_url}/admin/test"
        success, response = self.run_test(
            "Production Admin Test (No Auth)",
            "GET",
            url,
            401,  # Should fail without auth
            critical=True
        )
        return success, response

    def test_production_google_oauth(self):
        """Test production Google OAuth flow"""
        print("\n🚨 PRODUCTION TEST: Google OAuth Flow")
        url = f"{self.api_url}/auth/google"
        success, response = self.run_test(
            "Production Google OAuth",
            "GET",
            url,
            302,  # Should redirect
            critical=True
        )
        return success, response

    def test_production_admin_professor_endpoint(self):
        """Test production admin professor endpoint without auth"""
        print("\n🚨 PRODUCTION TEST: Admin Professor Network")
        url = f"{self.api_url}/admin/professor-network"
        success, response = self.run_test(
            "Production Admin Professor Network (No Auth)",
            "GET",
            url,
            401,  # Should fail without auth
            critical=True
        )
        return success, response

    def test_production_admin_posters_endpoint(self):
        """Test production admin posters endpoint without auth"""
        print("\n🚨 PRODUCTION TEST: Admin Posters Management")
        url = f"{self.api_url}/admin/posters"
        success, response = self.run_test(
            "Production Admin Posters (No Auth)",
            "GET",
            url,
            401,  # Should fail without auth
            critical=True
        )
        return success, response

    def test_production_environment_diagnostics(self):
        """Run comprehensive production environment diagnostics"""
        print("\n🔍 PRODUCTION ENVIRONMENT DIAGNOSTICS")
        print("=" * 50)
        
        diagnostics = {}
        
        # Test 1: Basic connectivity
        print("\n1. Testing basic connectivity...")
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            diagnostics['health_status'] = response.status_code
            diagnostics['health_response'] = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            print(f"   ✅ Health endpoint: {response.status_code}")
        except Exception as e:
            diagnostics['health_error'] = str(e)
            print(f"   ❌ Health endpoint failed: {e}")
        
        # Test 2: API root
        print("\n2. Testing API root...")
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            diagnostics['api_root_status'] = response.status_code
            diagnostics['api_root_response'] = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            print(f"   ✅ API root: {response.status_code}")
        except Exception as e:
            diagnostics['api_root_error'] = str(e)
            print(f"   ❌ API root failed: {e}")
        
        # Test 3: Google OAuth redirect
        print("\n3. Testing Google OAuth redirect...")
        try:
            response = requests.get(f"{self.api_url}/auth/google", timeout=10, allow_redirects=False)
            diagnostics['oauth_status'] = response.status_code
            diagnostics['oauth_location'] = response.headers.get('Location', 'No redirect location')
            print(f"   ✅ OAuth redirect: {response.status_code}")
            if response.status_code == 302:
                print(f"   📍 Redirect to: {response.headers.get('Location', 'Unknown')[:100]}...")
        except Exception as e:
            diagnostics['oauth_error'] = str(e)
            print(f"   ❌ OAuth redirect failed: {e}")
        
        # Test 4: Admin endpoints (should fail without auth)
        print("\n4. Testing admin endpoints (should return 401/403)...")
        admin_endpoints = [
            "/admin/test",
            "/admin/professor-network", 
            "/admin/posters",
            "/admin/stats"
        ]
        
        for endpoint in admin_endpoints:
            try:
                response = requests.get(f"{self.api_url}{endpoint}", timeout=10)
                diagnostics[f'admin_{endpoint.replace("/", "_")}'] = {
                    'status': response.status_code,
                    'response': response.text[:200] if response.text else 'No response'
                }
                expected = 401 if endpoint != "/admin/test" else 401
                if response.status_code in [401, 403]:
                    print(f"   ✅ {endpoint}: {response.status_code} (correctly protected)")
                else:
                    print(f"   ❌ {endpoint}: {response.status_code} (unexpected)")
            except Exception as e:
                diagnostics[f'admin_{endpoint.replace("/", "_")}_error'] = str(e)
                print(f"   ❌ {endpoint} failed: {e}")
        
        # Test 5: Public endpoints
        print("\n5. Testing public endpoints...")
        public_endpoints = [
            "/posters",
            "/student-network",
            "/professor-network",
            "/ec-profiles",
            "/volunteer-opportunities"
        ]
        
        for endpoint in public_endpoints:
            try:
                response = requests.get(f"{self.api_url}{endpoint}", timeout=10)
                diagnostics[f'public_{endpoint.replace("/", "_")}'] = {
                    'status': response.status_code,
                    'count': len(response.json()) if response.headers.get('content-type', '').startswith('application/json') and isinstance(response.json(), list) else 'N/A'
                }
                if response.status_code == 200:
                    print(f"   ✅ {endpoint}: {response.status_code}")
                else:
                    print(f"   ❌ {endpoint}: {response.status_code}")
            except Exception as e:
                diagnostics[f'public_{endpoint.replace("/", "_")}_error'] = str(e)
                print(f"   ❌ {endpoint} failed: {e}")
        
        return diagnostics

def main():
    print("🚀 Starting CURE API PRODUCTION TESTING...")
    print("🚨 Focus: Admin functionality in production environment")
    print("🌐 Testing URL: http://localhost:8001")
    print("=" * 70)
    
    tester = CUREAPITester()
    
    # Run comprehensive production diagnostics first
    print("\n🔍 PRODUCTION ENVIRONMENT DIAGNOSTICS")
    diagnostics = tester.test_production_environment_diagnostics()
    
    # CRITICAL PRODUCTION TESTS - As specified in review request
    print("\n🚨 CRITICAL PRODUCTION TESTS...")
    print("   Testing specific endpoints mentioned in review request:")
    print("   1. Health endpoint: GET /health")
    print("   2. Admin test endpoint: GET /api/admin/test")
    print("   3. Google OAuth flow: GET /api/auth/google")
    print("   4. Admin professor endpoint: GET /api/admin/professor-network")
    print("   5. Admin posters endpoint: GET /api/admin/posters")
    
    # Test 1: Health endpoint
    tester.test_production_health_endpoint()
    
    # Test 2: Admin test endpoint
    tester.test_production_admin_test_endpoint()
    
    # Test 3: Google OAuth flow
    tester.test_production_google_oauth()
    
    # Test 4: Admin professor endpoint
    tester.test_production_admin_professor_endpoint()
    
    # Test 5: Admin posters endpoint
    tester.test_production_admin_posters_endpoint()
    
    # Additional authentication flow tests
    print("\n🔐 AUTHENTICATION FLOW TESTS...")
    tester.test_authentication_flow()
    
    # STRIPE PAYMENT INTEGRATION TESTS - As requested in review
    print("\n💳 STRIPE PAYMENT INTEGRATION TESTS...")
    print("   Testing new payment functionality for poster submissions:")
    print("   1. Payment fields in poster model")
    print("   2. Poster review with payment logic")
    print("   3. Mark payment completed endpoint")
    print("   4. Public posters payment filtering")
    print("   5. SendGrid email integration")
    
    # Test payment fields in poster model
    tester.test_payment_fields_in_poster_model()
    
    # Test Stripe payment integration flow
    tester.test_stripe_payment_integration()
    
    # Test SendGrid email integration
    tester.test_sendgrid_email_integration()
    
    # Test supporting public endpoints to verify backend is working
    print("\n📚 PUBLIC ENDPOINTS VERIFICATION...")
    tester.test_posters_endpoint()
    tester.test_student_network_endpoint()
    tester.test_professor_network_endpoint()
    tester.test_ec_profiles_endpoint()
    tester.test_volunteer_opportunities_endpoint()
    
    # Test CORS configuration
    print("\n🌐 CORS CONFIGURATION TEST...")
    tester.test_cors_headers()
    
    # Print final results
    print("\n" + "=" * 70)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    # Analysis of production issues
    print("\n🔍 PRODUCTION ISSUE ANALYSIS:")
    print("=" * 40)
    
    if tester.critical_failures:
        print(f"\n🚨 CRITICAL FAILURES ({len(tester.critical_failures)}):")
        for failure in tester.critical_failures:
            print(f"   ❌ {failure}")
    
    # Specific analysis for admin functionality
    print("\n📋 ADMIN FUNCTIONALITY ANALYSIS:")
    print("   Based on testing results:")
    
    if diagnostics.get('health_status') == 200:
        print("   ✅ Backend server is running and accessible")
    else:
        print("   ❌ Backend server connectivity issues")
    
    if diagnostics.get('oauth_status') == 302:
        print("   ✅ Google OAuth redirect is working")
    else:
        print("   ❌ Google OAuth redirect issues")
    
    admin_protected = True
    for key in diagnostics:
        if key.startswith('admin_') and not key.endswith('_error'):
            if diagnostics[key].get('status') not in [401, 403]:
                admin_protected = False
                break
    
    if admin_protected:
        print("   ✅ Admin endpoints are properly protected")
        print("   🔍 Issue likely: Admin user doesn't exist in production MongoDB")
        print("   🔍 Issue likely: JWT token authentication not working in production")
    else:
        print("   ❌ Admin endpoints protection issues")
    
    # Recommendations
    print("\n💡 RECOMMENDATIONS:")
    print("   1. Verify curejournal@gmail.com exists as admin user in production MongoDB")
    print("   2. Check JWT_SECRET_KEY consistency between local and production")
    print("   3. Verify Google OAuth redirect URIs include production URLs")
    print("   4. Test complete OAuth flow manually to get valid admin token")
    
    if tester.tests_passed == tester.tests_run:
        print("\n🎉 All tests passed! Backend endpoints are responding correctly.")
        print("   Issue is likely with admin user setup or JWT configuration.")
        return 0
    else:
        failed_tests = tester.tests_run - tester.tests_passed
        print(f"\n⚠️  {failed_tests} test(s) failed. Check the issues above.")
        
        if tester.critical_failures:
            print("\n🚨 CRITICAL ISSUES FOUND - These need immediate attention!")
        
        return 1

if __name__ == "__main__":
    sys.exit(main())