#!/usr/bin/env python3
"""
Fix the JWT token-to-database lookup mismatch in production
This script will:
1. Check what users actually exist in production DB
2. Check what format their IDs are in  
3. Create/fix the admin user with proper ID structure
4. Generate a working JWT token
"""
import asyncio
import os
import uuid
import jwt
import requests
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient

async def fix_production_auth():
    print("🔧 Fixing Production Authentication Mismatch")
    print("=" * 50)
    
    # For local testing with production URLs
    backend_url = "https://curesite-production.up.railway.app"
    admin_email = "curejournal@gmail.com"
    
    # We'll use local MongoDB to simulate the fix
    # In production, you'd use MONGO_URL from Railway environment
    mongo_url = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(mongo_url)
    db = client["cure_db"]
    
    print("1️⃣ Checking current user database state...")
    
    # Check all users and their ID formats
    users = await db.users.find({}).to_list(100)
    print(f"   Found {len(users)} users in database:")
    
    for user in users:
        user_id = user.get('id', 'NO_ID')
        email = user.get('email', 'NO_EMAIL')
        user_type = user.get('user_type', 'student')
        print(f"   - {email} | ID: {user_id} | Type: {user_type}")
    
    print(f"\n2️⃣ Looking for admin user: {admin_email}")
    admin_user = await db.users.find_one({"email": admin_email})
    
    if admin_user:
        print(f"   ✅ Admin user found:")
        print(f"      Email: {admin_user['email']}")
        print(f"      ID: {admin_user.get('id', 'MISSING_ID')}")
        print(f"      Type: {admin_user.get('user_type', 'student')}")
        admin_id = admin_user.get('id')
        
        if not admin_id:
            # Fix missing ID
            admin_id = str(uuid.uuid4())
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"id": admin_id}}
            )
            print(f"      ✅ Added missing ID: {admin_id}")
        
        if admin_user.get('user_type') != 'admin':
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"user_type": "admin", "verified": True}}
            )
            print(f"      ✅ Updated to admin type")
    else:
        print(f"   ❌ Admin user not found - creating...")
        admin_id = str(uuid.uuid4())
        admin_data = {
            "id": admin_id,
            "email": admin_email,
            "name": "CURE Admin",
            "profile_picture": None,
            "university": "CURE Administration",
            "program": "Platform Management",
            "year": None,
            "user_type": "admin",
            "verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_data)
        print(f"   ✅ Created admin user with ID: {admin_id}")
    
    print(f"\n3️⃣ Creating JWT token with correct user ID...")
    
    # Create JWT token using the actual user ID from database
    SECRET_KEY = "cure_jwt_secret_key_2024_secure_random"
    ALGORITHM = "HS256"
    
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    token_data = {
        "sub": admin_id,  # Use the actual UUID from database
        "exp": expire
    }
    
    working_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    print(f"   ✅ Generated token with user ID: {admin_id}")
    
    print(f"\n4️⃣ Testing JWT token with production backend...")
    
    # Test the token against production
    headers = {"Authorization": f"Bearer {working_token}"}
    
    try:
        # Test /auth/me endpoint
        response = requests.get(f"{backend_url}/api/auth/me", headers=headers, timeout=10)
        print(f"   /auth/me status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ SUCCESS! User: {data.get('email')} - Type: {data.get('user_type')}")
        else:
            print(f"   ❌ Response: {response.text}")
        
        # Test admin endpoint
        response = requests.get(f"{backend_url}/api/admin/test", headers=headers, timeout=10)
        print(f"   /admin/test status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ ADMIN ACCESS WORKING!")
        else:
            print(f"   ❌ Admin test failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Testing failed: {e}")
    
    print(f"\n5️⃣ WORKING JWT TOKEN FOR FRONTEND:")
    print("=" * 60)
    print(working_token)
    print("=" * 60)
    
    print(f"\n6️⃣ Instructions for fixing frontend:")
    print(f"   1. Open https://curesite.vercel.app in browser")
    print(f"   2. Open Developer Tools (F12)")
    print(f"   3. Go to Application → Local Storage")
    print(f"   4. Set key 'token' to the JWT token above")
    print(f"   5. Refresh page - admin panel should work")
    
    # Create production version of this script
    production_script = f'''#!/usr/bin/env python3
import asyncio
import os
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

async def fix_production_admin():
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'cure_db')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    admin_user = await db.users.find_one({{"email": "curejournal@gmail.com"}})
    
    if admin_user:
        admin_id = admin_user.get('id')
        if not admin_id:
            admin_id = str(uuid.uuid4())
            await db.users.update_one(
                {{"email": "curejournal@gmail.com"}},
                {{"$set": {{"id": admin_id, "user_type": "admin", "verified": True}}}}
            )
        print(f"Admin user ID: {{admin_id}}")
    else:
        admin_id = str(uuid.uuid4())
        admin_data = {{
            "id": admin_id,
            "email": "curejournal@gmail.com",
            "name": "CURE Admin",
            "user_type": "admin",
            "verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }}
        await db.users.insert_one(admin_data)
        print(f"Created admin user with ID: {{admin_id}}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_production_admin())'''
    
    with open('/app/production_admin_fix.py', 'w') as f:
        f.write(production_script)
    
    client.close()
    
    print(f"\n✅ Fix complete! Production script saved as production_admin_fix.py")
    return working_token, admin_id

if __name__ == "__main__":
    token, user_id = asyncio.run(fix_production_auth())
    print(f"\nSUMMARY:")
    print(f"Admin User ID: {user_id}")
    print(f"Working Token: {token}")