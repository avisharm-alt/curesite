#!/usr/bin/env python3
import asyncio
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

async def create_admin():
    """Create admin account for local development"""
    
    # Connect to local MongoDB
    mongo_url = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(mongo_url)
    db = client["cure_db"]  # Default database name
    
    admin_email = "curejournal@gmail.com"
    
    print(f"🔍 Checking for admin user: {admin_email}")
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if existing_admin:
        print(f"✅ Admin account already exists: {admin_email}")
        print(f"   User ID: {existing_admin['id']}")
        print(f"   User Type: {existing_admin.get('user_type', 'student')}")
        print(f"   Name: {existing_admin.get('name', 'N/A')}")
        
        # Update to ensure admin privileges
        if existing_admin.get('user_type') != 'admin':
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"user_type": "admin", "verified": True}}
            )
            print("   ✅ Updated to admin privileges")
        else:
            print("   ✅ Already has admin privileges")
    else:
        # Create new admin account
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
        print(f"✅ Created admin account: {admin_email}")
        print(f"   User ID: {admin_data['id']}")
        print(f"   Name: {admin_data['name']}")
    
    # Show all current users
    print("\n📋 All users in system:")
    users = await db.users.find({}).to_list(100)
    for user in users:
        print(f"   {user['email']} - {user.get('user_type', 'student')} - ID: {user['id']}")
    
    # Close connection
    client.close()
    print("\n✅ Admin setup completed!")

if __name__ == "__main__":
    asyncio.run(create_admin())