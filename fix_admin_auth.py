#!/usr/bin/env python3
"""
Comprehensive admin authentication diagnostic and fix script
This script will:
1. Check the current state of admin user in database
2. Identify JWT token issues
3. Fix admin authentication problems
"""
import asyncio
import uuid
import jwt
import os
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient

async def diagnose_and_fix_admin():
    """Diagnose and fix admin authentication issues"""
    
    print("🔍 CURE Admin Authentication Diagnostic")
    print("=" * 50)
    
    # Connect to local MongoDB (for development testing)
    mongo_url = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(mongo_url)
    db = client["cure_db"]
    
    admin_email = "curejournal@gmail.com"
    
    print(f"\n1️⃣ Checking admin user in database...")
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if not existing_admin:
        print("❌ Admin user not found! Creating admin user...")
        admin_data = {
            "id": str(uuid.uuid4()),
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
        existing_admin = admin_data
        print(f"✅ Created admin user with ID: {admin_data['id']}")
    else:
        print(f"✅ Found admin user:")
        print(f"   Email: {existing_admin['email']}")
        print(f"   ID: {existing_admin['id']}")
        print(f"   Type: {existing_admin.get('user_type', 'student')}")
        print(f"   Name: {existing_admin.get('name', 'N/A')}")
        
        # Ensure admin privileges
        if existing_admin.get('user_type') != 'admin':
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"user_type": "admin"}}
            )
            print("   ✅ Updated user_type to admin")
    
    print(f"\n2️⃣ Creating JWT token for admin user...")
    
    # JWT settings (should match backend)
    SECRET_KEY = 'fallback_secret_key'  # This is the fallback in server.py
    ALGORITHM = 'HS256'
    
    # Create token that matches backend expectations
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    token_data = {
        "sub": existing_admin['id'],  # This is what get_current_user expects
        "exp": expire
    }
    
    admin_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    print(f"✅ JWT Token created:")
    print(f"   User ID in token: {existing_admin['id']}")
    print(f"   Expires: {expire}")
    
    print(f"\n3️⃣ JWT Token for frontend:")
    print("=" * 60)
    print(admin_token)
    print("=" * 60)
    
    print(f"\n4️⃣ Testing backend auth locally...")
    # Verify the token can be decoded
    try:
        decoded = jwt.decode(admin_token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"✅ Token decodes successfully:")
        print(f"   sub (user_id): {decoded.get('sub')}")
        print(f"   exp: {datetime.fromtimestamp(decoded.get('exp'), timezone.utc)}")
    except Exception as e:
        print(f"❌ Token decode failed: {e}")
    
    # Test if user can be found with this ID
    token_user = await db.users.find_one({"id": decoded.get('sub')})
    if token_user:
        print(f"✅ Backend can find user with token ID")
        print(f"   User type: {token_user.get('user_type')}")
    else:
        print(f"❌ Backend cannot find user with token ID: {decoded.get('sub')}")
    
    print(f"\n5️⃣ Instructions for production:")
    print("1. Run this script in your Railway environment to create the admin user")
    print("2. Use the generated token in your frontend localStorage")
    print("3. Or ensure Google OAuth is properly updating user_type to 'admin'")
    
    # Close connection
    client.close()
    
    return admin_token, existing_admin['id']

async def create_production_admin_script():
    """Create a script for production deployment"""
    
    production_script = '''#!/usr/bin/env python3
"""
Production Admin Creation Script for Railway
Run this in your Railway environment to create the admin user
"""
import asyncio
import os
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

async def create_production_admin():
    # Get Railway environment variables
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'cure_db')
    
    if not mongo_url:
        print("❌ MONGO_URL environment variable not found")
        return
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    admin_email = "curejournal@gmail.com"
    
    # Check if admin exists
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if existing_admin:
        # Update to admin if needed
        if existing_admin.get('user_type') != 'admin':
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"user_type": "admin", "verified": True}}
            )
            print(f"✅ Updated {admin_email} to admin")
        else:
            print(f"✅ {admin_email} already has admin privileges")
    else:
        # Create new admin
        admin_data = {
            "id": str(uuid.uuid4()),
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
        print(f"✅ Created admin user: {admin_email}")
    
    # List all users
    users = await db.users.find({}).to_list(100)
    print(f"\\n📋 Total users: {len(users)}")
    for user in users:
        print(f"   {user['email']} - {user.get('user_type', 'student')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_production_admin())
'''
    
    with open('/app/create_production_admin.py', 'w') as f:
        f.write(production_script)
    
    print("✅ Created production admin script: /app/create_production_admin.py")

if __name__ == "__main__":
    token, user_id = asyncio.run(diagnose_and_fix_admin())
    asyncio.run(create_production_admin_script())
    
    print(f"\n🚀 SUMMARY:")
    print(f"Local admin user ID: {user_id}")
    print(f"Local JWT token generated for testing")
    print(f"Production script created: create_production_admin.py")