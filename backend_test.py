import requests
import sys
from datetime import datetime

class CUREAPITester:
    def __init__(self, base_url="https://academiccure.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
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

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_posters_endpoint(self):
        """Test posters endpoint"""
        success, response = self.run_test("Get Posters", "GET", "posters", 200)
        
        # Test with filters
        if success:
            self.run_test("Get Posters (Approved)", "GET", "posters?status=approved", 200)
            self.run_test("Get Posters (By University)", "GET", "posters?university=University%20of%20Toronto", 200)
        
        return success, response

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
    tester.test_student_network_endpoint()
    tester.test_professor_network_endpoint()
    tester.test_ec_profiles_endpoint()
    tester.test_ec_stats_endpoint()
    tester.test_volunteer_opportunities_endpoint()
    
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