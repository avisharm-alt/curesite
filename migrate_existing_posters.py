#!/usr/bin/env python3
"""
Migration Script: Update Existing Approved Posters
This script adds payment_status and payment_completed_at fields to existing approved posters
so they remain visible on the public network after the payment integration is deployed.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone

async def migrate_existing_posters():
    """Update existing approved posters to have completed payment status"""
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client['cure_db']
    
    print("🔄 Starting migration: Update existing approved posters")
    print("=" * 60)
    
    # Find all approved posters without payment_status field
    existing_approved = await db.poster_submissions.find({
        "status": "approved",
        "payment_status": {"$exists": False}
    }).to_list(1000)
    
    print(f"\n📊 Found {len(existing_approved)} approved posters without payment status")
    
    if len(existing_approved) == 0:
        print("✅ No migration needed - all posters already have payment status")
        client.close()
        return
    
    # Show what will be updated
    print("\n📝 Posters that will be updated:")
    for i, poster in enumerate(existing_approved[:10], 1):  # Show first 10
        print(f"   {i}. {poster.get('title', 'Untitled')} (ID: {poster.get('id', 'Unknown')[:8]}...)")
    
    if len(existing_approved) > 10:
        print(f"   ... and {len(existing_approved) - 10} more")
    
    # Ask for confirmation
    print("\n⚠️  This will set payment_status='completed' for all these posters")
    print("   (They were approved before payment integration, so they should remain visible)")
    
    response = input("\n🤔 Proceed with migration? (yes/no): ").strip().lower()
    
    if response != 'yes':
        print("❌ Migration cancelled")
        client.close()
        return
    
    # Perform the migration
    print("\n🔄 Updating posters...")
    
    result = await db.poster_submissions.update_many(
        {
            "status": "approved",
            "payment_status": {"$exists": False}
        },
        {
            "$set": {
                "payment_status": "completed",
                "payment_completed_at": None,  # No specific payment date for old posters
                "payment_link": None  # Old posters didn't have payment links
            }
        }
    )
    
    print(f"\n✅ Migration complete!")
    print(f"   - {result.matched_count} posters matched")
    print(f"   - {result.modified_count} posters updated")
    
    # Verify the migration
    print("\n🔍 Verifying migration...")
    
    remaining = await db.poster_submissions.count_documents({
        "status": "approved",
        "payment_status": {"$exists": False}
    })
    
    if remaining == 0:
        print("✅ Verification passed - all approved posters now have payment status")
    else:
        print(f"⚠️  Warning: {remaining} approved posters still without payment status")
    
    # Show summary
    print("\n📊 Final Statistics:")
    total_approved = await db.poster_submissions.count_documents({"status": "approved"})
    completed_payment = await db.poster_submissions.count_documents({
        "status": "approved",
        "payment_status": "completed"
    })
    pending_payment = await db.poster_submissions.count_documents({
        "status": "approved",
        "payment_status": "pending"
    })
    
    print(f"   - Total approved posters: {total_approved}")
    print(f"   - With completed payment: {completed_payment}")
    print(f"   - With pending payment: {pending_payment}")
    print(f"   - Visible on public network: {completed_payment}")
    
    client.close()
    print("\n🎉 Migration finished successfully!")

async def rollback_migration():
    """Rollback migration - remove payment fields from posters that were migrated"""
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client['cure_db']
    
    print("⚠️  ROLLBACK: Removing payment fields from migrated posters")
    print("=" * 60)
    
    # Find posters with completed payment but no payment_completed_at date
    # (These are likely migrated posters)
    migrated_posters = await db.poster_submissions.find({
        "status": "approved",
        "payment_status": "completed",
        "payment_completed_at": None
    }).to_list(1000)
    
    print(f"\n📊 Found {len(migrated_posters)} potentially migrated posters")
    
    if len(migrated_posters) == 0:
        print("✅ No migrated posters found")
        client.close()
        return
    
    response = input("\n🤔 Remove payment fields from these posters? (yes/no): ").strip().lower()
    
    if response != 'yes':
        print("❌ Rollback cancelled")
        client.close()
        return
    
    result = await db.poster_submissions.update_many(
        {
            "status": "approved",
            "payment_status": "completed",
            "payment_completed_at": None
        },
        {
            "$unset": {
                "payment_status": "",
                "payment_completed_at": "",
                "payment_link": ""
            }
        }
    )
    
    print(f"\n✅ Rollback complete!")
    print(f"   - {result.modified_count} posters rolled back")
    
    client.close()

if __name__ == "__main__":
    import sys
    
    print("🔧 Poster Payment Status Migration Tool")
    print("=" * 60)
    print()
    print("Options:")
    print("  1. Migrate existing approved posters (add payment_status)")
    print("  2. Rollback migration (remove payment_status)")
    print("  3. Exit")
    print()
    
    choice = input("Select option (1/2/3): ").strip()
    
    if choice == "1":
        asyncio.run(migrate_existing_posters())
    elif choice == "2":
        asyncio.run(rollback_migration())
    elif choice == "3":
        print("👋 Exiting...")
    else:
        print("❌ Invalid option")
