"""
Backend API Tests for Vital Signs - Direct Google OAuth with JWT
Tests: Google OAuth redirect, JWT authentication, and protected endpoints

Auth Flow:
1. /api/auth/google -> 302 redirect to accounts.google.com
2. Google callback -> /api/auth/google/callback -> redirects to frontend with ?token=JWT&user=ENCODED_USER
3. Frontend stores JWT in localStorage
4. All authenticated requests use Authorization: Bearer JWT
"""
import pytest
import requests
import os
from urllib.parse import urlparse, parse_qs

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://vital-admin-stage.preview.emergentagent.com')

# JWT tokens for test users (created in MongoDB)
TEST_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LWp3dC11c2VyIiwiZXhwIjoxNzc1MzM4MDQxfQ.bnhydGXBB8PSSUA4EfMEnCzH-i_msVK3Ql4EwToVDWc"
ADMIN_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi1qd3QtdXNlciIsImV4cCI6MTc3NTMzODA0MX0.ZO13KQirWv6nxp8xckscnxdl8jJQFk-v_P9wbgD7pEo"


class TestGoogleOAuthRedirect:
    """Tests for Google OAuth redirect endpoint"""
    
    def test_google_auth_returns_302_redirect(self):
        """GET /api/auth/google returns 302 redirect to Google"""
        response = requests.get(f"{BASE_URL}/api/auth/google", allow_redirects=False)
        assert response.status_code == 302, f"Expected 302, got {response.status_code}"
        print("✅ /api/auth/google returns 302 redirect")
    
    def test_google_auth_redirects_to_accounts_google(self):
        """GET /api/auth/google redirects to accounts.google.com"""
        response = requests.get(f"{BASE_URL}/api/auth/google", allow_redirects=False)
        location = response.headers.get('Location', '')
        assert 'accounts.google.com' in location, f"Expected redirect to Google, got: {location}"
        print(f"✅ Redirects to Google OAuth: {location[:80]}...")
    
    def test_google_auth_has_correct_client_id(self):
        """GET /api/auth/google includes correct client_id in redirect URL"""
        response = requests.get(f"{BASE_URL}/api/auth/google", allow_redirects=False)
        location = response.headers.get('Location', '')
        expected_client_id = "492483192809-ktal7sbtjgvqn6fp1cmp1ebkdjpkrg7g.apps.googleusercontent.com"
        assert expected_client_id in location, f"Expected client_id {expected_client_id} in URL"
        print("✅ Correct Google client_id in redirect URL")
    
    def test_google_auth_has_https_redirect_uri(self):
        """GET /api/auth/google includes HTTPS redirect_uri"""
        response = requests.get(f"{BASE_URL}/api/auth/google", allow_redirects=False)
        location = response.headers.get('Location', '')
        # Parse the redirect URL to check redirect_uri parameter
        parsed = urlparse(location)
        params = parse_qs(parsed.query)
        redirect_uri = params.get('redirect_uri', [''])[0]
        assert redirect_uri.startswith('https://'), f"redirect_uri should use HTTPS: {redirect_uri}"
        assert '/api/auth/google/callback' in redirect_uri, f"redirect_uri should point to callback: {redirect_uri}"
        print(f"✅ HTTPS redirect_uri: {redirect_uri}")


class TestJWTAuthentication:
    """Tests for JWT-based authentication"""
    
    def test_auth_me_returns_401_without_token(self):
        """GET /api/auth/me returns 401 when no token provided"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✅ /api/auth/me returns 401 without token")
    
    def test_auth_me_returns_401_with_invalid_token(self):
        """GET /api/auth/me returns 401 with invalid JWT"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid_jwt_token_xyz"}
        )
        assert response.status_code == 401
        print("✅ /api/auth/me returns 401 with invalid token")
    
    def test_auth_me_returns_user_with_valid_test_jwt(self):
        """GET /api/auth/me returns user data with valid test JWT"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {TEST_JWT_TOKEN}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["user_type"] == "student"
        assert "user_id" in data
        assert "name" in data
        print(f"✅ /api/auth/me returns test user: {data['name']} ({data['email']})")
    
    def test_auth_me_returns_admin_with_valid_admin_jwt(self):
        """GET /api/auth/me returns admin user data with valid admin JWT"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {ADMIN_JWT_TOKEN}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["email"] == "curejournal@gmail.com"
        assert data["user_type"] == "admin"
        assert "user_id" in data
        assert "name" in data
        print(f"✅ /api/auth/me returns admin user: {data['name']} ({data['email']})")


class TestLogoutEndpoint:
    """Tests for logout endpoint"""
    
    def test_logout_returns_success(self):
        """POST /api/auth/logout returns success message"""
        response = requests.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("✅ /api/auth/logout returns success")


class TestAdminEndpoints:
    """Tests for admin-protected endpoints"""
    
    def test_admin_stats_requires_auth(self):
        """GET /api/admin/stats returns 401/403 without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code in [401, 403, 422]
        print("✅ /api/admin/stats requires authentication")
    
    def test_admin_stats_requires_admin_role(self):
        """GET /api/admin/stats returns 403 for non-admin user"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {TEST_JWT_TOKEN}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✅ /api/admin/stats returns 403 for non-admin user")
    
    def test_admin_stats_works_for_admin(self):
        """GET /api/admin/stats returns data for admin user"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {ADMIN_JWT_TOKEN}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "total_users" in data
        assert "total_posters" in data
        print(f"✅ /api/admin/stats returns data for admin: {data}")


class TestPublicEndpoints:
    """Tests for public endpoints (no auth required)"""
    
    def test_api_accessible(self):
        """API is accessible (auth/me returns 401 without token)"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✅ API is accessible (returns 401 for unauthenticated request)")
    
    def test_get_posters_public(self):
        """GET /api/posters returns list (may be empty)"""
        response = requests.get(f"{BASE_URL}/api/posters")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ /api/posters returns {len(data)} posters")
    
    def test_get_journal_articles_public(self):
        """GET /api/journal/articles returns list (may be empty)"""
        response = requests.get(f"{BASE_URL}/api/journal/articles")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ /api/journal/articles returns {len(data)} articles")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
