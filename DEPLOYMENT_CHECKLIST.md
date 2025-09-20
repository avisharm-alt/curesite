# 🚀 CURE Deployment Checklist

## Pre-Deployment
- [ ] Code pushed to GitHub repository
- [ ] Frontend builds successfully locally (`cd frontend && yarn build`)
- [ ] Backend runs successfully locally (`cd backend && uvicorn server:app`)

## Railway (Backend & Database)
- [ ] Railway account created
- [ ] Project created from GitHub repository
- [ ] MongoDB database added to project
- [ ] All environment variables configured
- [ ] Backend service deployed successfully
- [ ] Health check endpoint working: `/health`

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
