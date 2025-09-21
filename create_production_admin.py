#!/usr/bin/env python3
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
    print(f"\n📋 Total users: {len(users)}")
    for user in users:
        print(f"   {user['email']} - {user.get('user_type', 'student')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_production_admin())
