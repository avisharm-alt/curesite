"""
CURE Social Migration Script
Migrates existing users and seeds default academic circles
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'cure_db')

# Default academic circles to seed
DEFAULT_CIRCLES = [
    {
        "id": str(uuid.uuid4()),
        "name": "Neuroscience",
        "slug": "neuroscience",
        "description": "Brain research, neuroimaging, neurodegeneration, and cognitive neuroscience",
        "owner_type": "system",
        "member_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Machine Learning in Medicine",
        "slug": "ml-in-medicine",
        "description": "AI/ML applications in healthcare, medical imaging, diagnostics",
        "owner_type": "system",
        "member_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Cancer Research",
        "slug": "cancer-research",
        "description": "Oncology, tumor biology, cancer therapeutics, immunotherapy",
        "owner_type": "system",
        "member_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Synthetic Biology",
        "slug": "synthetic-biology",
        "description": "Genetic engineering, CRISPR, bioengineering, metabolic engineering",
        "owner_type": "system",
        "member_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Clinical Research",
        "slug": "clinical-research",
        "description": "Clinical trials, medical research, patient outcomes, healthcare",
        "owner_type": "system",
        "member_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Immunology",
        "slug": "immunology",
        "description": "Immune system, vaccines, autoimmune diseases, immunotherapy",
        "owner_type": "system",
        "member_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Genetics & Genomics",
        "slug": "genetics-genomics",
        "description": "DNA sequencing, gene expression, population genetics, epigenetics",
        "owner_type": "system",
        "member_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Medical Imaging",
        "slug": "medical-imaging",
        "description": "MRI, CT, PET, ultrasound, image analysis, radiology",
        "owner_type": "system",
        "member_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Public Health",
        "slug": "public-health",
        "description": "Epidemiology, health policy, global health, preventive medicine",
        "owner_type": "system",
        "member_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Stem Cell Research",
        "slug": "stem-cell-research",
        "description": "Regenerative medicine, cell differentiation, organoids, tissue engineering",
        "owner_type": "system",
        "member_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Student Network",
        "slug": "student-network",
        "description": "Community for all undergraduate researchers - share experiences, collaborate, and connect",
        "owner_type": "system",
        "member_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]


async def migrate():
    """Run migration"""
    print("🚀 Starting CURE Social migration...")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"📊 Connected to database: {db_name}")
    
    # 1. Update existing users with social fields
    print("\n📝 Updating existing users...")
    users_count = await db.users.count_documents({})
    print(f"   Found {users_count} users")
    
    # Add social fields to users that don't have them
    result = await db.users.update_many(
        {"role": {"$exists": False}},
        {
            "$set": {
                "role": "student",  # Default to student
                "bio": None,
                "interests": [],
                "links": {}
            }
        }
    )
    print(f"   ✅ Updated {result.modified_count} users with social fields")
    
    # 2. Create indexes for social collections
    print("\n🔍 Creating indexes...")
    
    # Posts indexes
    await db.posts.create_index([("author_id", 1)])
    await db.posts.create_index([("created_at", -1)])
    await db.posts.create_index([("tags", 1)])
    await db.posts.create_index([("visibility", 1)])
    print("   ✅ Created posts indexes")
    
    # Follows indexes
    await db.follows.create_index([("follower_id", 1), ("followed_id", 1)], unique=True)
    await db.follows.create_index([("follower_id", 1)])
    await db.follows.create_index([("followed_id", 1)])
    print("   ✅ Created follows indexes")
    
    # Likes indexes
    await db.likes.create_index([("post_id", 1), ("user_id", 1)], unique=True)
    await db.likes.create_index([("post_id", 1)])
    await db.likes.create_index([("user_id", 1)])
    print("   ✅ Created likes indexes")
    
    # Circle members indexes
    await db.circle_members.create_index([("circle_id", 1), ("user_id", 1)], unique=True)
    await db.circle_members.create_index([("user_id", 1)])
    print("   ✅ Created circle_members indexes")
    
    # Comments indexes
    await db.comments.create_index([("post_id", 1)])
    await db.comments.create_index([("author_id", 1)])
    await db.comments.create_index([("created_at", -1)])
    print("   ✅ Created comments indexes")
    
    # Notifications indexes
    await db.notifications.create_index([("user_id", 1)])
    await db.notifications.create_index([("created_at", -1)])
    await db.notifications.create_index([("read", 1)])
    print("   ✅ Created notifications indexes")
    
    # 3. Seed default circles
    print("\n🎯 Seeding default circles...")
    existing_circles = await db.circles.count_documents({})
    
    if existing_circles == 0:
        await db.circles.insert_many(DEFAULT_CIRCLES)
        print(f"   ✅ Created {len(DEFAULT_CIRCLES)} default circles")
        for circle in DEFAULT_CIRCLES:
            print(f"      • {circle['name']}")
    else:
        print(f"   ℹ️  Circles already exist ({existing_circles} circles)")
        # Add any missing circles
        for circle in DEFAULT_CIRCLES:
            existing = await db.circles.find_one({"slug": circle["slug"]})
            if not existing:
                await db.circles.insert_one(circle)
                print(f"      ✅ Added missing circle: {circle['name']}")
    
    # 4. Auto-join students to Student Network
    print("\n👥 Auto-joining students to Student Network...")
    student_network = await db.circles.find_one({"slug": "student-network"})
    
    if student_network:
        students = await db.users.find({"role": "student"}).to_list(length=10000)
        joined_count = 0
        
        for student in students:
            # Check if already a member
            existing_membership = await db.circle_members.find_one({
                "circle_id": student_network["id"],
                "user_id": student["id"]
            })
            
            if not existing_membership:
                member = {
                    "id": str(uuid.uuid4()),
                    "circle_id": student_network["id"],
                    "user_id": student["id"],
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.circle_members.insert_one(member)
                joined_count += 1
        
        # Update member count
        actual_member_count = await db.circle_members.count_documents({"circle_id": student_network["id"]})
        await db.circles.update_one(
            {"id": student_network["id"]},
            {"$set": {"member_count": actual_member_count}}
        )
        
        print(f"   ✅ Joined {joined_count} new students to Student Network")
        print(f"   📊 Total Student Network members: {actual_member_count}")
    else:
        print("   ⚠️  Student Network circle not found")
    
    # 5. Summary
    print("\n" + "="*60)
    print("✅ CURE Social migration completed successfully!")
    print("="*60)
    print("\nDatabase Statistics:")
    print(f"   Users: {await db.users.count_documents({})}")
    print(f"   Circles: {await db.circles.count_documents({})}")
    print(f"   Posts: {await db.posts.count_documents({})}")
    print(f"   Follows: {await db.follows.count_documents({})}")
    print(f"   Circle Members: {await db.circle_members.count_documents({})}")
    print("\nNext steps:")
    print("   1. Restart backend: sudo supervisorctl restart backend")
    print("   2. Test endpoints: curl http://localhost:8001/api/social/circles")
    print("   3. Build frontend components")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(migrate())
