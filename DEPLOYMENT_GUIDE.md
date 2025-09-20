# 🚀 CURE Project Deployment Guide

Deploy your CURE project using Vercel (Frontend) + Railway (Backend + Database)

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Railway account (free)
- Google Cloud Console project (for OAuth)

---

## 🗃️ STEP 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
# In your project directory
git init
git add .
git commit -m "Initial deployment setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cure-project.git
git push -u origin main
```

### 1.2 Repository Structure Should Look Like:
```
cure-project/
├── frontend/           # React app
├── backend/           # FastAPI app
├── vercel.json        # Vercel config
├── railway.json       # Railway config
├── Procfile          # Railway process file
├── requirements.txt   # Python dependencies
└── runtime.txt        # Python version
```

---

## 🚂 STEP 2: Deploy Backend & Database on Railway

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your GitHub account

### 2.2 Deploy Backend
1. **Create New Project**: Click "New Project"
2. **Deploy from GitHub**: Select your repository
3. **Configure Service**:
   - Service Name: `cure-backend`
   - Root Directory: Leave empty
   - Railway will auto-detect configuration from `nixpacks.toml` and `railway.json`
   
**Alternative Manual Configuration (if auto-detection fails):**
- Build Command: `pip install -r backend/requirements.txt`
- Start Command: `cd backend && python -m uvicorn server:app --host 0.0.0.0 --port $PORT`

### 2.3 Add MongoDB Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "Add MongoDB"
3. Railway will provision a MongoDB instance
4. Note the connection details (auto-generated)

### 2.4 Configure Environment Variables
In Railway Backend service, add these variables:

**Required Variables:**
```env
# Database
MONGO_URL=mongodb://mongo:password@monogo.railway.internal:27017
DB_NAME=cure_db

# JWT Security
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-backend-url.railway.app/api/auth/google/callback

# CORS (Your Vercel frontend URL)
FRONTEND_URL=https://your-app-name.vercel.app
```

**Get Your Railway URLs:**
- Backend URL: `https://your-service-name.railway.app`
- MongoDB URL: Available in Railway database service

---

## ⚡ STEP 3: Deploy Frontend on Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Connect your GitHub account

### 3.2 Deploy Frontend
1. **New Project**: Click "New Project"
2. **Import Repository**: Select your GitHub repository
3. **Configure Project**:
   - Framework: `Create React App`
   - Root Directory: `frontend`
   - Build Command: `yarn build`
   - Output Directory: `build`
   - Install Command: `yarn install`

### 3.3 Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables:

```env
REACT_APP_BACKEND_URL=https://your-backend-service.railway.app
```

### 3.4 Deploy
1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. You'll get a URL like: `https://your-app-name.vercel.app`

---

## 🔐 STEP 4: Configure Google OAuth

### 4.1 Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"

### 4.2 Configure OAuth Client
**Application type**: Web application

**Authorized JavaScript origins:**
```
https://your-app-name.vercel.app
http://localhost:3000
```

**Authorized redirect URIs:**
```
https://your-backend-service.railway.app/api/auth/google/callback
http://localhost:8001/api/auth/google/callback
```

### 4.3 Update Environment Variables
Update your Railway backend environment variables with the Google OAuth credentials.

---

## 🔄 STEP 5: Update CORS Settings

Update your backend CORS settings to allow your Vercel domain:

```python
# In backend/server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app-name.vercel.app",  # Your Vercel URL
        "http://localhost:3000"  # Local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🧪 STEP 6: Test Your Deployment

### 6.1 Test Backend
Visit: `https://your-backend-service.railway.app/health`
Should return: `{"status": "healthy", "service": "CURE Backend"}`

### 6.2 Test Frontend
Visit: `https://your-app-name.vercel.app`
Should load the CURE homepage

### 6.3 Test OAuth
1. Click "Sign in with Google" on your deployed frontend
2. Should redirect to Google OAuth
3. After authentication, should redirect back to your app

---

## 🔧 STEP 7: Troubleshooting

### Common Issues:

**Backend Not Starting:**
- Check Railway logs for errors
- Verify all environment variables are set
- Check MongoDB connection string

**Frontend API Errors:**
- Verify `REACT_APP_BACKEND_URL` points to Railway backend
- Check CORS settings in backend
- Ensure backend is running

**OAuth Not Working:**
- Verify Google OAuth redirect URIs match exactly
- Check Google OAuth credentials in Railway environment
- Ensure HTTPS is used for production URLs

### Check Logs:
- **Railway**: Dashboard → Service → View Logs
- **Vercel**: Dashboard → Project → Functions tab → View Logs

---

## 💡 Production Tips

1. **Custom Domains**: 
   - Vercel: Add custom domain in project settings
   - Railway: Add custom domain in service settings

2. **Environment Security**:
   - Use strong JWT secret keys
   - Rotate OAuth credentials periodically
   - Use Railway's built-in secrets management

3. **Performance**:
   - Enable Vercel's Edge Caching
   - Use Railway's auto-scaling features
   - Monitor usage in both dashboards

4. **Monitoring**:
   - Set up Railway alerts for service health
   - Monitor Vercel analytics
   - Set up error tracking (Sentry, etc.)

---

## 📞 Support Resources

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **FastAPI Deployment**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com/deployment/)

---

## 🎉 You're Live!

Once deployed:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://your-backend-service.railway.app`
- **Admin Panel**: `https://your-app-name.vercel.app/admin` (after logging in as admin)

Your CURE platform is now live and ready for users! 🚀