#!/usr/bin/env python3
"""
Production Diagnostic Script for Railway
This script will help diagnose admin authentication issues in production
"""
import asyncio
import os
import jwt
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv

async def production_diagnostic():
    """Run diagnostic checks for production environment"""
    
    print("🔍 CURE Production Diagnostic")
    print("=" * 50)
    
    # Load environment variables (Railway should provide these)
    print("1️⃣ Environment Variables:")
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'cure_db')
    jwt_secret = os.environ.get('JWT_SECRET_KEY', 'fallback_secret_key')
    frontend_url = os.environ.get('FRONTEND_URL')
    
    print(f"   MONGO_URL: {'Set ✅' if mongo_url else 'Missing ❌'}")
    print(f"   DB_NAME: {db_name}")
    print(f"   JWT_SECRET_KEY: {'Set ✅' if jwt_secret != 'fallback_secret_key' else 'Using fallback ⚠️'}")
    print(f"   FRONTEND_URL: {frontend_url or 'Not set'}")
    
    if not mongo_url:
        print("❌ Cannot proceed without MONGO_URL")
        return
    
    # Connect to MongoDB
    print(f"\n2️⃣ Database Connection:")
    try:
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Test connection
        await db.command("ping")
        print("   ✅ MongoDB connection successful")
        
        # Check collections
        collections = await db.list_collection_names()
        print(f"   📋 Collections: {', '.join(collections)}")
        
    except Exception as e:
        print(f"   ❌ MongoDB connection failed: {e}")
        return
    
    # Check admin user
    print(f"\n3️⃣ Admin User Check:")
    admin_email = "curejournal@gmail.com"
    
    admin_user = await db.users.find_one({"email": admin_email})
    if admin_user:
        print(f"   ✅ Admin user found:")
        print(f"      Email: {admin_user['email']}")
        print(f"      ID: {admin_user['id']}")
        print(f"      Name: {admin_user.get('name', 'N/A')}")
        print(f"      Type: {admin_user.get('user_type', 'student')}")
        print(f"      Verified: {admin_user.get('verified', False)}")
        
        if admin_user.get('user_type') != 'admin':
            print("   ⚠️  User type is not 'admin' - updating now...")
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"user_type": "admin", "verified": True}}
            )
            print("   ✅ Updated user type to admin")
            
        # Create test JWT token
        print(f"\n4️⃣ JWT Token Test:")
        try:
            expire = datetime.now(timezone.utc) + timedelta(hours=1)
            token_data = {
                "sub": admin_user['id'],
                "exp": expire
            }
            
            test_token = jwt.encode(token_data, jwt_secret, algorithm='HS256')
            print(f"   ✅ Test token created successfully")
            print(f"   🔑 Token: {test_token}")
            
            # Verify token can be decoded
            decoded = jwt.decode(test_token, jwt_secret, algorithms=['HS256'])
            print(f"   ✅ Token verification successful")
            print(f"      User ID: {decoded.get('sub')}")
            print(f"      Expires: {datetime.fromtimestamp(decoded.get('exp'), timezone.utc)}")
            
        except Exception as e:
            print(f"   ❌ JWT token test failed: {e}")
    
    else:
        print(f"   ❌ Admin user not found - creating now...")
        import uuid
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
        print(f"   ✅ Created admin user with ID: {admin_data['id']}")
    
    # List all users
    print(f"\n5️⃣ All Users in Database:")
    users = await db.users.find({}).to_list(100)
    for user in users:
        user_type = user.get('user_type', 'student')
        marker = "👑" if user_type == "admin" else "👤"
        print(f"   {marker} {user['email']} - {user_type} - ID: {user['id']}")
    
    # Check for other collections
    print(f"\n6️⃣ Data Summary:")
    poster_count = await db.poster_submissions.count_documents({})
    professor_count = await db.professor_network.count_documents({})
    volunteer_count = await db.volunteer_opportunities.count_documents({})
    ec_count = await db.ec_profiles.count_documents({})
    
    print(f"   📊 Posters: {poster_count}")
    print(f"   👨‍🏫 Professors: {professor_count}")
    print(f"   🤝 Volunteer Opportunities: {volunteer_count}")
    print(f"   🎓 EC Profiles: {ec_count}")
    
    client.close()
    
    print(f"\n7️⃣ Next Steps:")
    print("   1. Ensure admin user logs in via Google OAuth at least once")
    print("   2. Check browser localStorage has valid JWT token")
    print("   3. Verify CORS settings allow your frontend domain")
    print("   4. Test admin endpoints with created token")
    
    print(f"\n✅ Diagnostic complete!")

if __name__ == "__main__":
    asyncio.run(production_diagnostic())