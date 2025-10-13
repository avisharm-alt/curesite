#!/usr/bin/env python3
"""
Check existing posters in the database to understand their status
"""

import requests
import sys
import json

def check_admin_posters():
    """Check all posters via admin endpoint (without auth, will get 403 but shows endpoint exists)"""
    print("🔍 Checking Admin Posters Endpoint...")
    
    try:
        response = requests.get("http://localhost:8001/api/admin/posters/all", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 403:
            print("   ✅ Admin endpoint exists (403 without auth is expected)")
        elif response.status_code == 200:
            posters = response.json()
            print(f"   Found {len(posters)} total posters")
            for poster in posters:
                print(f"   - {poster.get('title', 'No title')} (Status: {poster.get('status', 'unknown')}, Payment: {poster.get('payment_status', 'unknown')})")
        else:
            print(f"   Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"   Error: {str(e)}")

def check_public_posters():
    """Check public posters endpoint"""
    print("\n🔍 Checking Public Posters Endpoint...")
    
    try:
        response = requests.get("http://localhost:8001/api/posters", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            posters = response.json()
            print(f"   Found {len(posters)} public posters")
            for poster in posters:
                print(f"   - {poster.get('title', 'No title')} (ID: {poster.get('id', 'No ID')})")
                print(f"     Status: {poster.get('status', 'unknown')}, Payment: {poster.get('payment_status', 'unknown')}")
                print(f"     File: {poster.get('poster_url', 'No file')}")
        else:
            print(f"   Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"   Error: {str(e)}")

def test_specific_poster_view(poster_id):
    """Test viewing a specific poster"""
    print(f"\n🔍 Testing Poster View for ID: {poster_id}")
    
    try:
        response = requests.get(f"http://localhost:8001/api/posters/{poster_id}/view", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_length = len(response.content)
            print(f"   ✅ Poster served successfully")
            print(f"   Content-Type: {content_type}")
            print(f"   Content-Length: {content_length} bytes")
        elif response.status_code == 404:
            print(f"   ❌ Poster not found (404)")
        elif response.status_code == 403:
            print(f"   ❌ Access forbidden (403) - poster may not be approved")
        else:
            print(f"   Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"   Error: {str(e)}")

if __name__ == "__main__":
    print("🚀 CURE POSTER DATABASE CHECK")
    print("=" * 50)
    
    check_public_posters()
    check_admin_posters()
    
    # Test with some common poster IDs that might exist
    test_poster_ids = [
        "1ef0a4d6-ff70-4d8d-8726-8ef74a0f8a73",  # From test_result.md
        "test-poster-1",
        "poster-123"
    ]
    
    for poster_id in test_poster_ids:
        test_specific_poster_view(poster_id)