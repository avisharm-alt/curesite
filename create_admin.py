#!/usr/bin/env python3
import asyncio
import os
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

async def create_admin():
    """Create admin account manually"""
    
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    admin_email = "curejournal@gmail.com"
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if existing_admin:
        print(f"✅ Admin account already exists: {admin_email}")
        print(f"   User ID: {existing_admin['id']}")
        print(f"   User Type: {existing_admin.get('user_type', 'student')}")
        
        # Update to ensure admin privileges
        if existing_admin.get('user_type') != 'admin':
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"user_type": "admin", "verified": True}}
            )
            print("   ✅ Updated to admin privileges")
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