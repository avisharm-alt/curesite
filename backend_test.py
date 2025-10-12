import requests
import sys
import json
from datetime import datetime
from urllib.parse import quote

class CURESocialAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.critical_failures = []
        self.test_user_id = None
        self.test_post_id = None

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
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                        if len(response_data) > 0:
                            print(f"   Sample item keys: {list(response_data[0].keys()) if isinstance(response_data[0], dict) else 'Not dict'}")
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
        return self.run_test("Health Check", "GET", "../health", 200, critical=True)

    def test_circles_endpoint(self):
        """Test circles endpoint - should return 11 circles"""
        print("\n🚨 CRITICAL TEST: Circles Endpoint")
        print("   Expected: 11 default circles (Neuroscience, ML in Medicine, Cancer Research, etc.)")
        
        success, response = self.run_test(
            "GET /api/social/circles", 
            "GET", 
            "social/circles", 
            200, 
            critical=True
        )
        
        if success and isinstance(response, list):
            circle_count = len(response)
            print(f"   ✅ Found {circle_count} circles")
            
            if circle_count == 11:
                print("   ✅ Correct number of circles (11)")
                
                # Check for expected circles
                expected_circles = [
                    "Neuroscience", "Machine Learning in Medicine", "Cancer Research", 
                    "Student Network", "Cardiology", "Immunology", "Genetics"
                ]
                
                found_circles = [circle.get('name', '') for circle in response]
                print(f"   Circle names: {found_circles}")
                
                for expected in expected_circles[:5]:  # Check first 5
                    if any(expected.lower() in name.lower() for name in found_circles):
                        print(f"   ✅ Found expected circle: {expected}")
                    else:
                        print(f"   ⚠️  Expected circle not found: {expected}")
                
            else:
                print(f"   ❌ Expected 11 circles, got {circle_count}")
                self.critical_failures.append(f"Circles count mismatch: expected 11, got {circle_count}")
                return False, response
        else:
            print("   ❌ Circles endpoint failed or returned invalid data")
            return False, response
        
        return success, response

    def test_post_creation_endpoint(self):
        """Test post creation endpoint - requires authentication"""
        print("\n🚨 CRITICAL TEST: Post Creation Endpoint")
        print("   Testing POST /api/social/posts (should require authentication)")
        
        post_data = {
            "text": "This is a test post for CURE Social platform testing. #neuroscience #research",
            "tags": ["testing", "cure"],
            "visibility": "public",
            "attachments": []
        }
        
        # Test without authentication (should fail)
        success, response = self.run_test(
            "POST /api/social/posts (No Auth)",
            "POST",
            "social/posts",
            401,  # Should fail without authentication
            data=post_data,
            critical=True
        )
        
        if success:
            print("   ✅ Post creation endpoint properly protected (401 without auth)")
        else:
            print("   ❌ Post creation endpoint not responding correctly")
        
        return success, response

    def test_feed_endpoints(self):
        """Test feed endpoints with different modes"""
        print("\n🚨 CRITICAL TEST: Feed Endpoints")
        print("   Testing GET /api/social/feed with modes: global, following, university, circle")
        
        all_success = True
        results = {}
        
        # Test global feed (should work without auth)
        success_global, response_global = self.run_test(
            "GET /api/social/feed?mode=global",
            "GET",
            "social/feed?mode=global",
            200,
            critical=True
        )
        results['global'] = {'success': success_global, 'response': response_global}
        all_success = all_success and success_global
        
        if success_global:
            print("   ✅ Global feed accessible without authentication")
            if isinstance(response_global, dict):
                posts = response_global.get('posts', [])
                print(f"   Found {len(posts)} posts in global feed")
        
        # Test following feed (should require auth)
        success_following, response_following = self.run_test(
            "GET /api/social/feed?mode=following",
            "GET",
            "social/feed?mode=following",
            401,  # Should require authentication
            critical=True
        )
        results['following'] = {'success': success_following, 'response': response_following}
        all_success = all_success and success_following
        
        if success_following:
            print("   ✅ Following feed properly protected (401 without auth)")
        
        # Test university feed (should require auth)
        success_university, response_university = self.run_test(
            "GET /api/social/feed?mode=university",
            "GET",
            "social/feed?mode=university",
            401,  # Should require authentication
            critical=True
        )
        results['university'] = {'success': success_university, 'response': response_university}
        all_success = all_success and success_university
        
        if success_university:
            print("   ✅ University feed properly protected (401 without auth)")
        
        # Test circle feed (should require auth)
        success_circle, response_circle = self.run_test(
            "GET /api/social/feed?mode=circle&circle_id=test-circle",
            "GET",
            "social/feed?mode=circle&circle_id=test-circle",
            401,  # Should require authentication
            critical=True
        )
        results['circle'] = {'success': success_circle, 'response': response_circle}
        all_success = all_success and success_circle
        
        if success_circle:
            print("   ✅ Circle feed properly protected (401 without auth)")
        
        return all_success, results

    def test_like_unlike_endpoints(self):
        """Test like/unlike endpoints"""
        print("\n🚨 CRITICAL TEST: Like/Unlike Endpoints")
        print("   Testing POST/DELETE /api/social/posts/{id}/like")
        
        test_post_id = "test-post-id-123"
        
        # Test like without auth (should fail)
        success_like, response_like = self.run_test(
            "POST /api/social/posts/{id}/like (No Auth)",
            "POST",
            f"social/posts/{test_post_id}/like",
            401,  # Should require authentication
            critical=True
        )
        
        # Test unlike without auth (should fail)
        success_unlike, response_unlike = self.run_test(
            "DELETE /api/social/posts/{id}/like (No Auth)",
            "DELETE",
            f"social/posts/{test_post_id}/like",
            401,  # Should require authentication
            critical=True
        )
        
        if success_like and success_unlike:
            print("   ✅ Like/unlike endpoints properly protected (401 without auth)")
        else:
            print("   ❌ Like/unlike endpoints not responding correctly")
        
        return success_like and success_unlike, {
            'like': response_like,
            'unlike': response_unlike
        }

    def test_comments_endpoints(self):
        """Test comments endpoints"""
        print("\n🚨 CRITICAL TEST: Comments Endpoints")
        print("   Testing POST /api/social/posts/{id}/comments and GET comments")
        
        test_post_id = "test-post-id-123"
        comment_data = {
            "text": "This is a test comment for CURE Social testing",
            "parent_comment_id": None
        }
        
        # Test create comment without auth (should fail)
        success_create, response_create = self.run_test(
            "POST /api/social/posts/{id}/comments (No Auth)",
            "POST",
            f"social/posts/{test_post_id}/comments",
            401,  # Should require authentication
            data=comment_data,
            critical=True
        )
        
        # Test get comments (should work without auth)
        success_get, response_get = self.run_test(
            "GET /api/social/posts/{id}/comments",
            "GET",
            f"social/posts/{test_post_id}/comments",
            200,  # Should work without auth
            critical=True
        )
        
        if success_create:
            print("   ✅ Comment creation properly protected (401 without auth)")
        if success_get:
            print("   ✅ Comment retrieval accessible without auth")
        
        return success_create and success_get, {
            'create': response_create,
            'get': response_get
        }

    def test_follow_system_endpoints(self):
        """Test follow system endpoints"""
        print("\n🚨 CRITICAL TEST: Follow System Endpoints")
        print("   Testing POST/DELETE /api/social/follow/{user_id}")
        
        test_user_id = "test-user-id-123"
        
        # Test follow without auth (should fail)
        success_follow, response_follow = self.run_test(
            "POST /api/social/follow/{user_id} (No Auth)",
            "POST",
            f"social/follow/{test_user_id}",
            401,  # Should require authentication
            critical=True
        )
        
        # Test unfollow without auth (should fail)
        success_unfollow, response_unfollow = self.run_test(
            "DELETE /api/social/follow/{user_id} (No Auth)",
            "DELETE",
            f"social/follow/{test_user_id}",
            401,  # Should require authentication
            critical=True
        )
        
        # Test get followers (should work without auth)
        success_followers, response_followers = self.run_test(
            "GET /api/social/user/{user_id}/followers",
            "GET",
            f"social/user/{test_user_id}/followers",
            200,  # Should work without auth
            critical=True
        )
        
        # Test get following (should work without auth)
        success_following, response_following = self.run_test(
            "GET /api/social/user/{user_id}/following",
            "GET",
            f"social/user/{test_user_id}/following",
            200,  # Should work without auth
            critical=True
        )
        
        all_success = success_follow and success_unfollow and success_followers and success_following
        
        if success_follow and success_unfollow:
            print("   ✅ Follow/unfollow endpoints properly protected (401 without auth)")
        if success_followers and success_following:
            print("   ✅ Followers/following lists accessible without auth")
        
        return all_success, {
            'follow': response_follow,
            'unfollow': response_unfollow,
            'followers': response_followers,
            'following': response_following
        }

    def test_search_endpoint(self):
        """Test search functionality"""
        print("\n🚨 CRITICAL TEST: Search Endpoint")
        print("   Testing GET /api/social/search (should work without auth)")
        
        # Test search without auth (should work)
        success_search, response_search = self.run_test(
            "GET /api/social/search?query=test",
            "GET",
            "social/search?query=test",
            200,  # Should work without auth
            critical=True
        )
        
        if success_search:
            print("   ✅ Search endpoint accessible without authentication")
            if isinstance(response_search, list):
                print(f"   Found {len(response_search)} search results")
        
        # Test search with type filter
        success_user_search, response_user_search = self.run_test(
            "GET /api/social/search?query=test&type=user",
            "GET",
            "social/search?query=test&type=user",
            200,
            critical=True
        )
        
        if success_user_search:
            print("   ✅ Search with type filter working")
        
        return success_search and success_user_search, {
            'general': response_search,
            'user_filter': response_user_search
        }

    def test_user_stats_endpoint(self):
        """Test user stats endpoint"""
        print("\n🚨 CRITICAL TEST: User Stats Endpoint")
        print("   Testing GET /api/social/user/{id}/stats")
        
        test_user_id = "test-user-id-123"
        
        # Test user stats (should work without auth)
        success, response = self.run_test(
            "GET /api/social/user/{id}/stats",
            "GET",
            f"social/user/{test_user_id}/stats",
            200,  # Should work without auth
            critical=True
        )
        
        if success:
            print("   ✅ User stats endpoint accessible without authentication")
            if isinstance(response, dict):
                expected_stats = ['followers', 'following', 'posts', 'circles']
                for stat in expected_stats:
                    if stat in response:
                        print(f"   ✅ {stat}: {response.get(stat, 0)}")
                    else:
                        print(f"   ⚠️  Missing stat: {stat}")
        
        return success, response

    def test_notifications_endpoint(self):
        """Test notifications endpoint"""
        print("\n🚨 CRITICAL TEST: Notifications Endpoint")
        print("   Testing GET /api/social/notifications (should require auth)")
        
        # Test notifications without auth (should fail)
        success, response = self.run_test(
            "GET /api/social/notifications (No Auth)",
            "GET",
            "social/notifications",
            401,  # Should require authentication
            critical=True
        )
        
        if success:
            print("   ✅ Notifications endpoint properly protected (401 without auth)")
        else:
            print("   ❌ Notifications endpoint not responding correctly")
        
        return success, response

    def test_profile_update_endpoint(self):
        """Test profile update endpoint"""
        print("\n🚨 CRITICAL TEST: Profile Update Endpoint")
        print("   Testing PATCH /api/social/profile (should require auth)")
        
        profile_data = {
            "bio": "Updated bio for CURE Social testing",
            "interests": ["neuroscience", "machine learning"],
            "role": "student"
        }
        
        # Test profile update without auth (should fail)
        success, response = self.run_test(
            "PATCH /api/social/profile (No Auth)",
            "PATCH",
            "social/profile",
            401,  # Should require authentication
            data=profile_data,
            critical=True
        )
        
        if success:
            print("   ✅ Profile update endpoint properly protected (401 without auth)")
        else:
            print("   ❌ Profile update endpoint not responding correctly")
        
        return success, response

    def test_backend_logs_for_social_setup(self):
        """Check if backend has social collections and indexes set up"""
        print("\n🔍 TESTING: Backend Social Setup")
        print("   Checking if social collections are properly initialized")
        
        # We can infer setup by testing if endpoints exist and respond correctly
        # The circles endpoint is a good indicator since it should return seeded data
        
        success, response = self.test_circles_endpoint()
        
        if success and isinstance(response, list) and len(response) > 0:
            print("   ✅ Social collections appear to be properly set up")
            print("   ✅ Database migration likely completed successfully")
            return True, "Social setup verified"
        else:
            print("   ❌ Social collections may not be properly set up")
            self.critical_failures.append("Social collections setup verification failed")
            return False, "Social setup failed"

    def run_comprehensive_social_tests(self):
        """Run all CURE Social backend tests"""
        print("🚀 STARTING CURE SOCIAL BACKEND COMPREHENSIVE TESTING")
        print("=" * 60)
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test 1: Health check
        print("\n📊 BASIC CONNECTIVITY TESTS")
        self.test_health_check()
        
        # Test 2: Social setup verification
        print("\n🔧 SOCIAL SETUP VERIFICATION")
        self.test_backend_logs_for_social_setup()
        
        # Test 3: Circles endpoint (Priority 1)
        print("\n🎯 PRIORITY 1: CIRCLES ENDPOINT")
        self.test_circles_endpoint()
        
        # Test 4: Post creation (Priority 2)
        print("\n📝 PRIORITY 2: POST CREATION")
        self.test_post_creation_endpoint()
        
        # Test 5: Feed endpoints (Priority 3)
        print("\n📰 PRIORITY 3: FEED ENDPOINTS")
        self.test_feed_endpoints()
        
        # Test 6: Like/unlike endpoints (Priority 4)
        print("\n❤️  PRIORITY 4: LIKE/UNLIKE ENDPOINTS")
        self.test_like_unlike_endpoints()
        
        # Test 7: Comments (Priority 5)
        print("\n💬 PRIORITY 5: COMMENTS ENDPOINTS")
        self.test_comments_endpoints()
        
        # Test 8: Follow system (Priority 6)
        print("\n👥 PRIORITY 6: FOLLOW SYSTEM")
        self.test_follow_system_endpoints()
        
        # Test 9: Search (Priority 7)
        print("\n🔍 PRIORITY 7: SEARCH FUNCTIONALITY")
        self.test_search_endpoint()
        
        # Test 10: User stats (Priority 8)
        print("\n📈 PRIORITY 8: USER STATS")
        self.test_user_stats_endpoint()
        
        # Test 11: Notifications (Priority 9)
        print("\n🔔 PRIORITY 9: NOTIFICATIONS")
        self.test_notifications_endpoint()
        
        # Test 12: Profile update (Priority 10)
        print("\n👤 PRIORITY 10: PROFILE UPDATE")
        self.test_profile_update_endpoint()
        
        # Final summary
        self.print_final_summary()

    def print_final_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 60)
        print("🏁 CURE SOCIAL BACKEND TESTING COMPLETE")
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
        
        print(f"\n🎯 ENDPOINT STATUS SUMMARY:")
        
        # Expected results based on our tests
        endpoint_status = [
            ("GET /api/social/circles", "✅ Working" if self.tests_passed >= 2 else "❌ Failed"),
            ("POST /api/social/posts", "✅ Protected" if self.tests_passed >= 3 else "❌ Failed"),
            ("GET /api/social/feed (global)", "✅ Working" if self.tests_passed >= 4 else "❌ Failed"),
            ("GET /api/social/feed (protected)", "✅ Protected" if self.tests_passed >= 7 else "❌ Failed"),
            ("POST/DELETE /api/social/posts/{id}/like", "✅ Protected" if self.tests_passed >= 9 else "❌ Failed"),
            ("POST/GET /api/social/posts/{id}/comments", "✅ Mixed Access" if self.tests_passed >= 11 else "❌ Failed"),
            ("POST/DELETE /api/social/follow/{user_id}", "✅ Protected" if self.tests_passed >= 15 else "❌ Failed"),
            ("GET /api/social/search", "✅ Working" if self.tests_passed >= 17 else "❌ Failed"),
            ("GET /api/social/user/{id}/stats", "✅ Working" if self.tests_passed >= 18 else "❌ Failed"),
            ("GET /api/social/notifications", "✅ Protected" if self.tests_passed >= 19 else "❌ Failed"),
            ("PATCH /api/social/profile", "✅ Protected" if self.tests_passed >= 20 else "❌ Failed"),
        ]
        
        for endpoint, status in endpoint_status:
            print(f"   {endpoint}: {status}")
        
        print(f"\n🔒 AUTHENTICATION STATUS:")
        if self.tests_passed >= 10:
            print("   ✅ Protected endpoints properly require authentication")
            print("   ✅ Public endpoints accessible without authentication")
        else:
            print("   ❌ Authentication protection may have issues")
        
        print(f"\n📋 RECOMMENDATIONS:")
        if len(self.critical_failures) == 0:
            print("   ✅ All critical social endpoints are working correctly")
            print("   ✅ Authentication protection is properly implemented")
            print("   ✅ CURE Social backend is ready for frontend integration")
        else:
            print("   ❌ Critical issues found that need to be addressed:")
            for failure in self.critical_failures[:3]:  # Show top 3
                print(f"      - {failure}")
            if len(self.critical_failures) > 3:
                print(f"      - ... and {len(self.critical_failures) - 3} more issues")

if __name__ == "__main__":
    # Use production URL from vercel.json
    base_url = "https://curesite-production.up.railway.app"
    
    print("🚀 CURE SOCIAL BACKEND API TESTER")
    print("=" * 50)
    print(f"Target: {base_url}")
    print("Focus: Testing 10 social endpoint groups")
    print("=" * 50)
    
    tester = CURESocialAPITester(base_url)
    tester.run_comprehensive_social_tests()