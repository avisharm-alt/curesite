#!/usr/bin/env python3
import os
import sys
import traceback
import time

def main():
    try:
        print("🚀 CURE Backend Starting...")
        print(f"Python version: {sys.version}")
        print(f"Working directory: {os.getcwd()}")
        print(f"PORT environment: {os.environ.get('PORT', 'NOT SET')}")
        print(f"MONGO_URL set: {'Yes' if os.environ.get('MONGO_URL') else 'No'}")
        
        # Import and test server
        print("📦 Importing server module...")
        import server
        print("✅ Server imported successfully")
        
        # Get port - Railway should provide this, fallback to 8000
        port_env = os.environ.get('PORT')
        if port_env:
            port = int(port_env)
            print(f"🔧 Using Railway PORT: {port}")
        else:
            port = 8000
            print(f"⚠️  No PORT env var set, using default: {port}")
            
        # Start uvicorn
        print("🚀 Starting uvicorn server...")
        import uvicorn
        uvicorn.run(
            "server:app",
            host="0.0.0.0", 
            port=port,
            log_level="info"
        )
        
    except Exception as e:
        print(f"💥 STARTUP FAILED: {e}")
        print("📋 Full traceback:")
        traceback.print_exc()
        print("⏰ Keeping container alive for 30 seconds to see logs...")
        time.sleep(30)
        sys.exit(1)

if __name__ == "__main__":
    main()