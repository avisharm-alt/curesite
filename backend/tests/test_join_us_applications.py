"""
Test suite for Join Us / Review Board Applications feature
Tests: POST /api/applications, GET /api/admin/applications, PUT /api/admin/applications/:id/status
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://signin-integration-1.preview.emergentagent.com')

# JWT tokens for testing
ADMIN_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi1qd3QtdXNlciIsImV4cCI6OTk5OTk5OTk5OX0.OblF8mVLgtze7x2mCkqkksZSgP7ppN6SEfaq9G7sY6s"
STUDENT_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LWp3dC11c2VyIiwiZXhwIjo5OTk5OTk5OTk5fQ.QvdBah-4lhtQfvHkAMWzliaO-wEipbo0sGYtlx1JkHc"


class TestApplicationSubmission:
    """Tests for POST /api/applications - public endpoint"""
    
    def test_submit_application_success(self):
        """Test successful application submission with all required fields"""
        unique_email = f"test-{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Test Applicant",
            "email": unique_email,
            "university": "University of Toronto",
            "program": "Health Sciences",
            "year": 2,
            "why_join": "I want to help review health stories because I care about authentic storytelling and want to contribute to the community."
        }
        
        response = requests.post(f"{BASE_URL}/api/applications", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data, "Response should contain application id"
        assert "message" in data, "Response should contain success message"
        assert data["message"] == "Application submitted successfully"
    
    def test_submit_application_duplicate_email_rejected(self):
        """Test that duplicate email submissions are rejected with 400"""
        unique_email = f"test-dup-{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "First Applicant",
            "email": unique_email,
            "university": "McGill University",
            "program": "Medicine",
            "year": 3,
            "why_join": "First application reason."
        }
        
        # First submission should succeed
        response1 = requests.post(f"{BASE_URL}/api/applications", json=payload)
        assert response1.status_code == 200, f"First submission failed: {response1.text}"
        
        # Second submission with same email should fail
        payload["name"] = "Second Applicant"
        payload["why_join"] = "Second application reason."
        response2 = requests.post(f"{BASE_URL}/api/applications", json=payload)
        
        assert response2.status_code == 400, f"Expected 400 for duplicate, got {response2.status_code}"
        data = response2.json()
        assert "detail" in data
        assert "already exists" in data["detail"].lower()
    
    def test_submit_application_missing_required_fields(self):
        """Test that missing required fields return validation error"""
        # Missing 'name' field
        payload = {
            "email": f"test-{uuid.uuid4().hex[:8]}@example.com",
            "university": "University of Toronto",
            "program": "Health Sciences",
            "year": 2,
            "why_join": "Test reason"
        }
        
        response = requests.post(f"{BASE_URL}/api/applications", json=payload)
        assert response.status_code == 422, f"Expected 422 for validation error, got {response.status_code}"


class TestAdminApplicationsEndpoint:
    """Tests for GET /api/admin/applications - admin only"""
    
    def test_get_applications_with_admin_jwt(self):
        """Test that admin can retrieve all applications"""
        headers = {"Authorization": f"Bearer {ADMIN_JWT}"}
        response = requests.get(f"{BASE_URL}/api/admin/applications", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list of applications"
        
        # Verify application structure if there are any
        if len(data) > 0:
            app = data[0]
            assert "id" in app
            assert "name" in app
            assert "email" in app
            assert "university" in app
            assert "program" in app
            assert "year" in app
            assert "why_join" in app
            assert "status" in app
            assert "submitted_at" in app
    
    def test_get_applications_with_student_jwt_returns_403(self):
        """Test that non-admin users get 403 Forbidden"""
        headers = {"Authorization": f"Bearer {STUDENT_JWT}"}
        response = requests.get(f"{BASE_URL}/api/admin/applications", headers=headers)
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        assert "not authorized" in data["detail"].lower()
    
    def test_get_applications_without_auth_returns_401(self):
        """Test that unauthenticated requests get 401"""
        response = requests.get(f"{BASE_URL}/api/admin/applications")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


class TestApplicationStatusUpdate:
    """Tests for PUT /api/admin/applications/:id/status - admin only"""
    
    def test_approve_application(self):
        """Test admin can approve an application"""
        # First create a new application
        unique_email = f"test-approve-{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Approve Test",
            "email": unique_email,
            "university": "University of British Columbia",
            "program": "Public Health",
            "year": 4,
            "why_join": "Testing approval flow."
        }
        
        create_response = requests.post(f"{BASE_URL}/api/applications", json=payload)
        assert create_response.status_code == 200
        app_id = create_response.json()["id"]
        
        # Now approve it
        headers = {"Authorization": f"Bearer {ADMIN_JWT}", "Content-Type": "application/json"}
        response = requests.put(
            f"{BASE_URL}/api/admin/applications/{app_id}/status",
            headers=headers,
            json={"status": "approved"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "message" in data
        assert "approved" in data["message"].lower()
    
    def test_reject_application(self):
        """Test admin can reject an application"""
        # First create a new application
        unique_email = f"test-reject-{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Reject Test",
            "email": unique_email,
            "university": "McMaster University",
            "program": "Nursing",
            "year": 1,
            "why_join": "Testing rejection flow."
        }
        
        create_response = requests.post(f"{BASE_URL}/api/applications", json=payload)
        assert create_response.status_code == 200
        app_id = create_response.json()["id"]
        
        # Now reject it
        headers = {"Authorization": f"Bearer {ADMIN_JWT}", "Content-Type": "application/json"}
        response = requests.put(
            f"{BASE_URL}/api/admin/applications/{app_id}/status",
            headers=headers,
            json={"status": "rejected"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "message" in data
        assert "rejected" in data["message"].lower()
    
    def test_update_status_with_student_jwt_returns_403(self):
        """Test that non-admin users cannot update application status"""
        headers = {"Authorization": f"Bearer {STUDENT_JWT}", "Content-Type": "application/json"}
        response = requests.put(
            f"{BASE_URL}/api/admin/applications/some-id/status",
            headers=headers,
            json={"status": "approved"}
        )
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
    
    def test_update_status_invalid_status_returns_400(self):
        """Test that invalid status values are rejected"""
        # First create a new application
        unique_email = f"test-invalid-{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Invalid Status Test",
            "email": unique_email,
            "university": "Queen's University",
            "program": "Biology",
            "year": 2,
            "why_join": "Testing invalid status."
        }
        
        create_response = requests.post(f"{BASE_URL}/api/applications", json=payload)
        assert create_response.status_code == 200
        app_id = create_response.json()["id"]
        
        # Try invalid status
        headers = {"Authorization": f"Bearer {ADMIN_JWT}", "Content-Type": "application/json"}
        response = requests.put(
            f"{BASE_URL}/api/admin/applications/{app_id}/status",
            headers=headers,
            json={"status": "invalid_status"}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    def test_update_nonexistent_application_returns_404(self):
        """Test that updating non-existent application returns 404"""
        headers = {"Authorization": f"Bearer {ADMIN_JWT}", "Content-Type": "application/json"}
        response = requests.put(
            f"{BASE_URL}/api/admin/applications/nonexistent-id-12345/status",
            headers=headers,
            json={"status": "approved"}
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestApplicationDataPersistence:
    """Tests to verify data is properly persisted and retrievable"""
    
    def test_created_application_appears_in_admin_list(self):
        """Test that a newly created application appears in admin list"""
        unique_email = f"test-persist-{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Persistence Test User",
            "email": unique_email,
            "university": "Western University",
            "program": "Kinesiology",
            "year": 3,
            "why_join": "Testing data persistence."
        }
        
        # Create application
        create_response = requests.post(f"{BASE_URL}/api/applications", json=payload)
        assert create_response.status_code == 200
        app_id = create_response.json()["id"]
        
        # Verify it appears in admin list
        headers = {"Authorization": f"Bearer {ADMIN_JWT}"}
        list_response = requests.get(f"{BASE_URL}/api/admin/applications", headers=headers)
        assert list_response.status_code == 200
        
        applications = list_response.json()
        found = any(app["id"] == app_id for app in applications)
        assert found, f"Created application {app_id} not found in admin list"
        
        # Verify data integrity
        created_app = next(app for app in applications if app["id"] == app_id)
        assert created_app["name"] == payload["name"]
        assert created_app["email"] == payload["email"]
        assert created_app["university"] == payload["university"]
        assert created_app["program"] == payload["program"]
        assert created_app["year"] == payload["year"]
        assert created_app["why_join"] == payload["why_join"]
        assert created_app["status"] == "pending"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
