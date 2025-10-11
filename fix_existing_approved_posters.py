#!/usr/bin/env python3
"""
Fix existing approved posters that don't have payment fields
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def fix_approved_posters():
    """Update approved posters without payment fields"""
    
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client['cure_db']
    
    print("🔧 Fixing existing approved posters...")
    
    # Find approved posters without payment_status
    result = await db.poster_submissions.update_many(
        {
            "status": "approved",
            "$or": [
                {"payment_status": {"$exists": False}},
                {"payment_status": None}
            ]
        },
        {
            "$set": {
                "payment_status": "pending",
                "payment_link": "https://buy.stripe.com/cNi6oJdBXd8j4COeMqgrS00",
                "payment_completed_at": None
            }
        }
    )
    
    print(f"✅ Updated {result.modified_count} approved posters")
    print(f"   Set payment_status to 'pending'")
    print(f"   Added payment link")
    
    # Show updated posters
    updated_posters = await db.poster_submissions.find({
        "status": "approved",
        "payment_status": "pending"
    }).to_list(100)
    
    print(f"\n📋 Approved posters awaiting payment:")
    for poster in updated_posters:
        print(f"   - {poster.get('title', 'Untitled')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_approved_posters())
