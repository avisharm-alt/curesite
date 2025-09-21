#!/usr/bin/env python3
"""
Debug production authentication flow systematically
"""
import requests
import jwt
from datetime import datetime, timezone, timedelta

def debug_production_auth():
    print("🔍 Production Authentication Debug")
    print("=" * 50)
    
    # Test 1: Verify backend URL is accessible
    backend_url = "https://curesite-production.up.railway.app"
    print(f"1️⃣ Testing backend connectivity...")
    
    try:
        response = requests.get(f"{backend_url}/health", timeout=10)
        print(f"   ✅ Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"   ❌ Backend not accessible: {e}")
        return
    
    # Test 2: Check OAuth redirect
    print(f"\n2️⃣ Testing OAuth redirect...")
    try:
        response = requests.get(f"{backend_url}/api/auth/google", allow_redirects=False, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 302:
            print(f"   ✅ OAuth redirect working: {response.headers.get('location', 'No location')[:100]}...")
        else:
            print(f"   ❌ Unexpected response: {response.text}")
    except Exception as e:
        print(f"   ❌ OAuth test failed: {e}")
    
    # Test 3: Test /auth/me endpoint (this is key for debugging)
    print(f"\n3️⃣ Testing /auth/me endpoint...")
    
    # Create a test token with the JWT key the user set
    SECRET_KEY = "cure_jwt_secret_key_2024_secure_random"
    ALGORITHM = "HS256"
    
    # Try with email as user ID (most likely for OAuth)
    user_id = "curejournal@gmail.com"
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    token_data = {
        "sub": user_id,
        "exp": expire
    }
    
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{backend_url}/api/auth/me", headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Auth working! User: {data.get('email')} - Type: {data.get('user_type')}")
        else:
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Auth/me test failed: {e}")
    
    # Test 4: Check CORS
    print(f"\n4️⃣ Testing CORS with frontend domain...")
    cors_headers = {
        "Origin": "https://curesite.vercel.app",
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{backend_url}/api/auth/me", headers=cors_headers, timeout=10)
        print(f"   Status: {response.status_code}")
        cors_header = response.headers.get('Access-Control-Allow-Origin', 'Not set')
        print(f"   CORS header: {cors_header}")
        if cors_header in ['*', 'https://curesite.vercel.app']:
            print(f"   ✅ CORS configured correctly")
        else:
            print(f"   ⚠️ CORS might be blocking frontend")
    except Exception as e:
        print(f"   ❌ CORS test failed: {e}")
    
    # Test 5: Check what happens with OPTIONS request (preflight)
    print(f"\n5️⃣ Testing CORS preflight...")
    try:
        response = requests.options(f"{backend_url}/api/admin/test", 
                                  headers={"Origin": "https://curesite.vercel.app"}, 
                                  timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not set')}")
        print(f"   Allow-Methods: {response.headers.get('Access-Control-Allow-Methods', 'Not set')}")
        print(f"   Allow-Headers: {response.headers.get('Access-Control-Allow-Headers', 'Not set')}")
    except Exception as e:
        print(f"   ❌ Preflight test failed: {e}")
    
    print(f"\n📋 DIAGNOSTIC SUMMARY:")
    print(f"   - Backend URL: {backend_url}")
    print(f"   - Test token: {token}")
    print(f"   - Next: Check Vercel env vars and browser network tab")

if __name__ == "__main__":
    debug_production_auth()