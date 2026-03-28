"""
Backend API Tests for Vital Signs - Auth and Core Endpoints
Tests: Auth endpoints, session management, and story-related functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://signin-integration-1.preview.emergentagent.com')

# Test session tokens created in MongoDB
ADMIN_SESSION_TOKEN = "admin_session_token_123"
REGULAR_SESSION_TOKEN = "test_session_token_123"


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_api_accessible(self):
        """Test that API is accessible via /api/auth/me (returns 401 without auth)"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        # 401 means API is working, just not authenticated
        assert response.status_code == 401
        print("✅ API is accessible")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_auth_me_without_session(self):
        """GET /api/auth/me returns 401 when no session cookie/token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✅ /api/auth/me returns 401 without session")
    
    def test_auth_me_with_invalid_token(self):
        """GET /api/auth/me returns 401 with invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid_token_xyz"}
        )
        assert response.status_code == 401
        print("✅ /api/auth/me returns 401 with invalid token")
    
    def test_auth_me_with_valid_admin_session(self):
        """GET /api/auth/me returns user data with valid admin session"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {ADMIN_SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "curejournal@gmail.com"
        assert data["user_type"] == "admin"
        assert "user_id" in data
        assert "name" in data
        print(f"✅ /api/auth/me returns admin user: {data['name']}")
    
    def test_auth_me_with_valid_regular_session(self):
        """GET /api/auth/me returns user data with valid regular session"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {REGULAR_SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["user_type"] == "student"
        print(f"✅ /api/auth/me returns regular user: {data['name']}")
    
    def test_auth_session_without_session_id(self):
        """POST /api/auth/session returns 400 when no session_id provided"""
        response = requests.post(
            f"{BASE_URL}/api/auth/session",
            json={},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 400
        print("✅ /api/auth/session returns 400 without session_id")
    
    def test_auth_session_with_invalid_session_id(self):
        """POST /api/auth/session returns 401 with invalid session_id"""
        response = requests.post(
            f"{BASE_URL}/api/auth/session",
            json={"session_id": "invalid_session_id_xyz"},
            headers={"Content-Type": "application/json"}
        )
        # Should return 401 because Emergent auth will reject invalid session
        assert response.status_code == 401
        print("✅ /api/auth/session returns 401 with invalid session_id")
    
    def test_auth_signout_endpoint(self):
        """POST /api/auth/signout works and returns success"""
        response = requests.post(
            f"{BASE_URL}/api/auth/signout",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("✅ /api/auth/signout returns success")


class TestAdminEndpoints:
    """Admin-protected endpoint tests
    
    NOTE: Admin endpoints use JWT-based auth (get_current_user), not session tokens.
    The /api/auth/me endpoint supports session tokens, but admin endpoints require JWT.
    This is a known limitation - admin endpoints need JWT tokens from Google OAuth flow.
    """
    
    def test_admin_posters_pending_without_auth(self):
        """GET /api/admin/posters/pending returns 401/403 without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/posters/pending")
        # Should return 401 (no auth) or 403 (not admin) or 422 (validation error)
        assert response.status_code in [401, 403, 422]
        print("✅ Admin endpoint protected without auth")
    
    def test_admin_posters_pending_requires_jwt(self):
        """GET /api/admin/posters/pending requires JWT token (not session token)
        
        NOTE: Admin endpoints use get_current_user which expects JWT tokens.
        Session tokens work for /api/auth/me but not for admin endpoints.
        This is expected behavior - admin access requires full OAuth flow.
        """
        response = requests.get(
            f"{BASE_URL}/api/admin/posters/pending",
            headers={"Authorization": f"Bearer {ADMIN_SESSION_TOKEN}"}
        )
        # Session token won't work for JWT-protected endpoints
        # This returns 401 because session tokens aren't valid JWTs
        assert response.status_code == 401
        print("✅ Admin endpoint correctly rejects session token (requires JWT)")


class TestPublicEndpoints:
    """Public endpoint tests"""
    
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
