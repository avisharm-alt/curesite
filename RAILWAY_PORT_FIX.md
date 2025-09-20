# 🔧 Railway Port Configuration Fix

## Issue ❌
Railway backend returning 502 error because it's not binding to the correct port.

## Railway Port Rules ✅
- Railway provides a dynamic `$PORT` environment variable
- Your app MUST bind to `$PORT` (not 8080 or any fixed port)
- Railway automatically routes traffic to your app

## Current Configuration ✅
Your configurations are actually correct:

**nixpacks.toml:**
```toml
cmd = 'python -m uvicorn backend.server:app --host 0.0.0.0 --port $PORT'
```

**Dockerfile:**
```dockerfile
CMD ["sh", "-c", "python -m uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

## Fix Steps 🚀

### 1. Check Railway Environment Variables
In Railway dashboard, make sure you DON'T have:
- ❌ `PORT=8080` (delete this if it exists)
- ✅ Let Railway set PORT automatically

### 2. Force Redeploy
```bash
git add .
git commit -m "Fix Railway port configuration"
git push origin main
```

### 3. Check Railway Logs
After redeployment:
1. Go to Railway dashboard
2. Click your service
3. View logs for startup messages
4. Look for: "Starting CURE Backend on port XXXX"

### 4. Verify Build Method
In Railway dashboard:
- Make sure it's using **NIXPACKS** (preferred)
- Or **Docker** with our Dockerfile
- NOT auto-detection that might use wrong ports

## Expected Behavior ✅
After fix:
- ✅ `https://curesite-production.up.railway.app/health` returns `{"status": "healthy"}`
- ✅ Frontend can connect to backend
- ✅ No more 502 errors

## If Still Not Working 🔍
1. **Check Railway logs** for specific error messages
2. **Environment variables**: Ensure MONGO_URL and DB_NAME are set
3. **MongoDB connection**: Verify your database is accessible
4. **Try different builder**: Switch between NIXPACKS and Docker

**The key is: Never hardcode port 8080 - always use Railway's $PORT! 🚀**