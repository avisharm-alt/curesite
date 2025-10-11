#!/usr/bin/env python3
"""
Create test data for Stripe payment integration testing
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
from datetime import datetime, timezone

async def create_test_data():
    """Create test data for payment integration testing"""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client['cure_db']
    
    print("🔧 Creating test data for Stripe payment integration testing...")
    
    # Create test user
    test_user = {
        "id": str(uuid.uuid4()),
        "email": "student@university.ca",
        "name": "Sarah Johnson",
        "university": "University of Toronto",
        "program": "Computer Science",
        "year": 3,
        "user_type": "student",
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(test_user)
    print(f"✅ Created test user: {test_user['name']}")
    
    # Create test posters with different payment statuses
    test_posters = [
        {
            "id": str(uuid.uuid4()),
            "title": "Machine Learning Applications in Medical Diagnosis",
            "authors": ["Sarah Johnson", "Dr. Michael Chen"],
            "abstract": "This research explores the application of machine learning algorithms in medical diagnosis, focusing on image recognition for early cancer detection.",
            "keywords": ["machine learning", "medical diagnosis", "cancer detection", "image recognition"],
            "university": "University of Toronto",
            "program": "Computer Science",
            "submitted_by": test_user["id"],
            "status": "approved",
            "payment_status": "completed",
            "payment_link": "https://buy.stripe.com/cNi6oJdBXd8j4COeMqgrS00",
            "payment_completed_at": datetime.now(timezone.utc).isoformat(),
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "reviewer_id": "admin-id",
            "reviewer_comments": "Excellent research with strong methodology"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Sustainable Energy Solutions for Urban Development",
            "authors": ["Alex Thompson", "Dr. Lisa Wang"],
            "abstract": "An investigation into renewable energy integration in urban planning, with focus on solar and wind power optimization.",
            "keywords": ["renewable energy", "urban planning", "sustainability", "solar power"],
            "university": "McGill University",
            "program": "Environmental Engineering",
            "submitted_by": test_user["id"],
            "status": "approved",
            "payment_status": "pending",
            "payment_link": "https://buy.stripe.com/cNi6oJdBXd8j4COeMqgrS00",
            "payment_completed_at": None,
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "reviewer_id": "admin-id",
            "reviewer_comments": "Good research, payment required for publication"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Quantum Computing Algorithms for Cryptography",
            "authors": ["David Kim", "Dr. Jennifer Liu"],
            "abstract": "Research on quantum algorithms and their implications for modern cryptographic systems.",
            "keywords": ["quantum computing", "cryptography", "algorithms", "security"],
            "university": "University of British Columbia",
            "program": "Physics",
            "submitted_by": test_user["id"],
            "status": "pending",
            "payment_status": "not_required",
            "payment_link": None,
            "payment_completed_at": None,
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "reviewed_at": None,
            "reviewer_id": None,
            "reviewer_comments": None
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Biomedical Applications of Nanotechnology",
            "authors": ["Emma Rodriguez", "Dr. Robert Brown"],
            "abstract": "Exploring the use of nanotechnology in drug delivery systems and medical treatments.",
            "keywords": ["nanotechnology", "biomedical", "drug delivery", "medical treatment"],
            "university": "University of Waterloo",
            "program": "Biomedical Engineering",
            "submitted_by": test_user["id"],
            "status": "approved",
            "payment_status": "not_required",  # This should NOT appear in public (missing completed payment)
            "payment_link": None,
            "payment_completed_at": None,
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "reviewer_id": "admin-id",
            "reviewer_comments": "Approved but payment not processed yet"
        }
    ]
    
    for poster in test_posters:
        await db.poster_submissions.insert_one(poster)
        print(f"✅ Created poster: {poster['title']} (Status: {poster['status']}, Payment: {poster['payment_status']})")
    
    # Create admin user
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": "curejournal@gmail.com",
        "name": "CURE Admin",
        "user_type": "admin",
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": "curejournal@gmail.com"})
    if not existing_admin:
        await db.users.insert_one(admin_user)
        print(f"✅ Created admin user: {admin_user['name']}")
    else:
        print(f"✅ Admin user already exists: {existing_admin.get('name', 'Admin')}")
    
    client.close()
    
    print("\n🎯 Test data creation complete!")
    print("   - 1 test user created")
    print("   - 4 test posters created with different payment statuses:")
    print("     • 1 approved + completed payment (should appear in public)")
    print("     • 1 approved + pending payment (should NOT appear in public)")
    print("     • 1 pending + not required (should NOT appear in public)")
    print("     • 1 approved + not required (should NOT appear in public)")
    print("   - Admin user ensured")

if __name__ == "__main__":
    asyncio.run(create_test_data())