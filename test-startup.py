#!/usr/bin/env python3
"""
Test script to verify server startup requirements
"""
import os
import sys
import traceback

def test_imports():
    """Test if all required modules can be imported"""
    print("🧪 Testing imports...")
    try:
        import fastapi
        print(f"✅ FastAPI: {fastapi.__version__}")
        
        import uvicorn
        print(f"✅ Uvicorn: {uvicorn.__version__}")
        
        import motor
        print(f"✅ Motor: {motor.version}")
        
        import authlib
        print(f"✅ Authlib: {authlib.__version__}")
        
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_environment():
    """Test environment variables"""
    print("\n🔧 Testing environment variables...")
    
    required_vars = []  # No truly required vars for basic startup
    optional_vars = ['PORT', 'MONGO_URL', 'DB_NAME', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
    
    print("Required variables:")
    for var in required_vars:
        value = os.environ.get(var)
        if value:
            print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: Not set")
    
    print("\nOptional variables:")
    for var in optional_vars:
        value = os.environ.get(var)
        if value:
            # Mask sensitive values
            if 'SECRET' in var or 'PASSWORD' in var:
                print(f"✅ {var}: ***masked***")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"⚠️  {var}: Not set (will use fallback)")

def test_server_creation():
    """Test if we can create the FastAPI app"""
    print("\n🚀 Testing server creation...")
    try:
        # Add the backend directory to path if needed
        if os.path.exists('backend'):
            sys.path.insert(0, 'backend')
        
        from server import app
        print("✅ FastAPI app created successfully")
        
        # Test health endpoint
        @app.get("/test")
        async def test_endpoint():
            return {"status": "test_ok"}
        
        return True
    except Exception as e:
        print(f"❌ Server creation failed: {e}")
        traceback.print_exc()
        return False

def main():
    print("🔍 CURE Backend Startup Test")
    print("=" * 40)
    
    tests = [
        ("Import Test", test_imports),
        ("Environment Test", test_environment),
        ("Server Creation Test", test_server_creation),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results.append((test_name, False))
    
    print("\n📊 Test Results:")
    print("=" * 40)
    all_passed = True
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if not result:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All tests passed! Server should start successfully.")
        return 0
    else:
        print("\n💥 Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())