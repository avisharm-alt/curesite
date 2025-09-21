#!/usr/bin/env python3
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
    
    admin_user = await db.users.find_one({"email": "curejournal@gmail.com"})
    
    if admin_user:
        admin_id = admin_user.get('id')
        if not admin_id:
            admin_id = str(uuid.uuid4())
            await db.users.update_one(
                {"email": "curejournal@gmail.com"},
                {"$set": {"id": admin_id, "user_type": "admin", "verified": True}}
            )
        print(f"Admin user ID: {admin_id}")
    else:
        admin_id = str(uuid.uuid4())
        admin_data = {
            "id": admin_id,
            "email": "curejournal@gmail.com",
            "name": "CURE Admin",
            "user_type": "admin",
            "verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_data)
        print(f"Created admin user with ID: {admin_id}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_production_admin())