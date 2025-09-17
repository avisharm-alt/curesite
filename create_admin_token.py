#!/usr/bin/env python3
import jwt
import os
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

def create_admin_token():
    """Create a JWT token for admin access"""
    
    SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'cure_jwt_secret_key_2024_secure_random')
    ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
    
    # Admin user ID from the database
    admin_user_id = "a5e26098-e803-42ab-896d-00a204af66c8"
    
    # Create token with 24 hour expiration
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    token_data = {
        "sub": admin_user_id,
        "exp": expire
    }
    
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    print("🔑 Admin JWT Token:")
    print(token)
    print("\n📋 To use this token:")
    print("1. Open browser developer tools (F12)")
    print("2. Go to Application/Storage → Local Storage")
    print("3. Add key: 'token'")
    print("4. Add value: the token above")
    print("5. Refresh the page")
    print("6. You should see 'Admin Panel' in the navigation")
    
    return token

if __name__ == "__main__":
    create_admin_token()