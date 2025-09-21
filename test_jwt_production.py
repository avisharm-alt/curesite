#!/usr/bin/env python3
"""
Test JWT token with production Railway environment
"""
import requests
import jwt
from datetime import datetime, timezone, timedelta

def test_production_jwt():
    print("🔐 Testing JWT with Production Environment")
    print("=" * 50)
    
    # The JWT secret key you set in Railway
    SECRET_KEY = "cure_jwt_secret_key_2024_secure_random"
    ALGORITHM = "HS256"
    
    # This should be the admin user ID from production database
    # We need to find the correct user ID for curejournal@gmail.com
    print("1️⃣ Testing different potential admin user IDs...")
    
    # Test with email as user ID (sometimes OAuth systems use email)
    test_user_ids = [
        "curejournal@gmail.com",
        "a5e26098-e803-42ab-896d-00a204af66c8",  # From the old script
        "admin",  # Sometimes simple IDs are used
    ]
    
    backend_url = "https://curesite-production.up.railway.app"
    
    for user_id in test_user_ids:
        print(f"\n🧪 Testing with user_id: {user_id}")
        
        # Create JWT token
        expire = datetime.now(timezone.utc) + timedelta(hours=1)
        token_data = {
            "sub": user_id,
            "exp": expire
        }
        
        token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
        print(f"   Generated token: {token[:50]}...")
        
        # Test admin endpoint
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = requests.get(f"{backend_url}/api/admin/test", headers=headers, timeout=10)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ SUCCESS! Admin access working")
                print(f"   User email: {data.get('user_email')}")
                print(f"   User type: {data.get('user_type')}")
                print(f"   Is admin: {data.get('is_admin')}")
                print(f"\n🎉 WORKING TOKEN:")
                print(f"   {token}")
                return token, user_id
            elif response.status_code == 403:
                print(f"   ❌ 403 Forbidden - User not admin or doesn't exist")
            elif response.status_code == 401:
                print(f"   ❌ 401 Unauthorized - Invalid token or user not found")
            else:
                print(f"   ❌ Unexpected status: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request failed: {e}")
    
    print(f"\n2️⃣ Testing with different JWT secrets...")
    # Test with the other fallback key
    fallback_keys = [
        "cure_jwt_secret_key_2024_secure_random",  # Your key
        "fallback_secret_key",  # Backend fallback
    ]
    
    for secret in fallback_keys:
        print(f"\n🔑 Testing with secret: {secret}")
        user_id = "curejournal@gmail.com"  # Most likely to be correct
        
        expire = datetime.now(timezone.utc) + timedelta(hours=1)
        token_data = {
            "sub": user_id,
            "exp": expire
        }
        
        token = jwt.encode(token_data, secret, algorithm=ALGORITHM)
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = requests.get(f"{backend_url}/api/admin/test", headers=headers, timeout=10)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ SUCCESS with secret: {secret}")
                print(f"   Token: {token}")
                return token, user_id
                
        except Exception as e:
            print(f"   ❌ Failed: {e}")
    
    print(f"\n❌ No working combination found")
    print(f"📋 Next steps:")
    print(f"   1. Verify JWT_SECRET_KEY is set in Railway to: cure_jwt_secret_key_2024_secure_random")
    print(f"   2. Ensure admin user exists in production MongoDB")
    print(f"   3. Check if OAuth created the user with a different ID")
    
    return None, None

if __name__ == "__main__":
    token, user_id = test_production_jwt()