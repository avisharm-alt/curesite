#!/bin/bash

# CURE Project Deployment Setup Script
echo "🚀 Setting up CURE project for deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial deployment setup"
    git branch -M main
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Create .env.example files
echo "📝 Creating environment variable templates..."

# Frontend .env example
cat > frontend/.env.example << EOL
REACT_APP_BACKEND_URL=https://your-backend-service.railway.app
EOL

# Backend .env example
cat > backend/.env.example << EOL
# Database
MONGO_URL=mongodb://mongo:password@mongo.railway.internal:27017
DB_NAME=cure_db

# JWT Security
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-backend-service.railway.app/api/auth/google/callback

# CORS
FRONTEND_URL=https://your-app-name.vercel.app
EOL

echo "✅ Environment templates created"

# Create deployment checklist
cat > DEPLOYMENT_CHECKLIST.md << EOL
# 🚀 CURE Deployment Checklist

## Pre-Deployment
- [ ] Code pushed to GitHub repository
- [ ] Frontend builds successfully locally (\`cd frontend && yarn build\`)
- [ ] Backend runs successfully locally (\`cd backend && uvicorn server:app\`)

## Railway (Backend & Database)
- [ ] Railway account created
- [ ] Project created from GitHub repository
- [ ] MongoDB database added to project
- [ ] All environment variables configured
- [ ] Backend service deployed successfully
- [ ] Health check endpoint working: \`/health\`

## Vercel (Frontend)
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Build settings configured (root: frontend, build: yarn build)
- [ ] Environment variables set (REACT_APP_BACKEND_URL)
- [ ] Frontend deployed successfully

## Google OAuth Setup
- [ ] Google Cloud Console project created
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized origins configured
- [ ] Authorized redirect URIs configured
- [ ] Client ID and secret added to Railway environment

## Testing
- [ ] Backend health check responds
- [ ] Frontend loads correctly
- [ ] Google OAuth login works
- [ ] API calls from frontend to backend work
- [ ] Admin panel accessible (after login)

## Production Ready
- [ ] Custom domains configured (optional)
- [ ] HTTPS working correctly
- [ ] Error monitoring set up
- [ ] Performance monitoring enabled
EOL

echo "✅ Deployment checklist created"

echo ""
echo "🎉 Deployment setup complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Follow the DEPLOYMENT_GUIDE.md for detailed instructions"
echo "3. Use DEPLOYMENT_CHECKLIST.md to track your progress"
echo ""
echo "Files created:"
echo "- vercel.json (Vercel configuration)"
echo "- railway.json (Railway configuration)"
echo "- Procfile (Railway process file)"
echo "- requirements.txt (Python dependencies)"
echo "- runtime.txt (Python version)"
echo "- DEPLOYMENT_GUIDE.md (Detailed deployment guide)"
echo "- DEPLOYMENT_CHECKLIST.md (Deployment checklist)"
echo "- frontend/.env.example (Frontend environment template)"
echo "- backend/.env.example (Backend environment template)"
echo ""
echo "Happy deploying! 🚀"