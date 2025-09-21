# 🚨 CRITICAL FIX FOR RAILWAY ADMIN ISSUE

## Problem Identified
The admin user `curejournal@gmail.com` **does not exist** in your production MongoDB database on Railway.

## Immediate Solution

### Step 1: Upload Script to Railway
1. Copy the file `/app/production_diagnostic.py` to your Railway project
2. Or create a new file with this content:

```python
#!/usr/bin/env python3
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
    print(f"🔍 Checking for admin user: {admin_email}")
    
    # Check if admin exists
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if existing_admin:
        print(f"✅ Admin user found: {existing_admin['email']}")
        # Update to admin if needed
        if existing_admin.get('user_type') != 'admin':
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"user_type": "admin", "verified": True}}
            )
            print(f"✅ Updated {admin_email} to admin")
        else:
            print(f"✅ {admin_email} already has admin privileges")
            print(f"   User ID: {existing_admin['id']}")
            print(f"   User Type: {existing_admin.get('user_type')}")
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
        print(f"   User ID: {admin_data['id']}")
    
    # List all users to verify
    users = await db.users.find({}).to_list(10)
    print(f"\n📋 Users in database ({len(users)} total):")
    for user in users:
        user_type = user.get('user_type', 'student')
        print(f"   {'👑' if user_type == 'admin' else '👤'} {user['email']} - {user_type}")
    
    client.close()
    print(f"\n✅ Admin setup completed!")

if __name__ == "__main__":
    asyncio.run(create_production_admin())
```

### Step 2: Run in Railway
1. In your Railway dashboard, go to your backend service
2. Open the "Deploy" tab
3. Use the web terminal or deploy this script
4. Run: `python create_production_admin.py`

### Step 3: Alternative - Run via Railway CLI
If you have Railway CLI installed:
```bash
railway run python create_production_admin.py
```

## Expected Output
After running the script, you should see:
```
✅ Created admin user: curejournal@gmail.com
   User ID: [some-uuid]
👑 curejournal@gmail.com - admin
```

## Test After Fix
1. Log out of your frontend (clear localStorage)
2. Log back in via Google OAuth at https://curesite.vercel.app
3. Go to Admin Panel
4. Admin functions should now work

## If Still Not Working
If admin functions still don't work after this:
1. Check browser Network tab for 401/403 errors
2. Verify JWT token in localStorage contains the user ID from the script output
3. Check that `REACT_APP_BACKEND_URL` in Vercel = `https://curesite-production.up.railway.app`