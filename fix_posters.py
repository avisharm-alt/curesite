#!/usr/bin/env python3
import asyncio
import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

async def fix_posters():
    """Fix poster submissions to link to their uploaded files"""
    
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Get all poster submissions without poster_url
    posters = await db.poster_submissions.find({"poster_url": None}).to_list(1000)
    print(f"Found {len(posters)} posters without file links")
    
    # Get all uploaded files
    uploads_dir = Path("/app/uploads")
    uploaded_files = list(uploads_dir.glob("*.pdf")) + list(uploads_dir.glob("*.png")) + list(uploads_dir.glob("*.jpg")) + list(uploads_dir.glob("*.jpeg"))
    
    print(f"Found {len(uploaded_files)} uploaded files")
    
    # Try to match posters to files based on submitted_by user_id
    for poster in posters:
        submitted_by = poster["submitted_by"]
        print(f"\nProcessing poster: {poster['title']} (submitted by: {submitted_by})")
        
        # Look for files that start with this user ID
        matching_files = [f for f in uploaded_files if f.name.startswith(submitted_by)]
        
        if matching_files:
            # Use the first matching file
            file_path = str(matching_files[0])
            print(f"  Found matching file: {file_path}")
            
            # Update the poster with the file path
            result = await db.poster_submissions.update_one(
                {"id": poster["id"]},
                {"$set": {"poster_url": file_path}}
            )
            
            if result.modified_count > 0:
                print(f"  ✅ Updated poster {poster['id']} with file path")
            else:
                print(f"  ❌ Failed to update poster {poster['id']}")
        else:
            print(f"  ⚠️  No matching file found for user {submitted_by}")
    
    # Close connection
    client.close()
    print("\n✅ Poster fixing completed!")

if __name__ == "__main__":
    asyncio.run(fix_posters())