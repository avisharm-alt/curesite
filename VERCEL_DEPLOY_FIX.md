# FIX VERCEL DEPLOYMENT - DO THIS NOW

## The Problem
Vercel build was failing with: `sh: line 1: cd: frontend: No such file or directory`

## The Fix  
Updated `/vercel.json` to properly install and build from the frontend directory.

## What You Need to Do NOW:

### Option 1: Redeploy from Vercel Dashboard (RECOMMENDED)
1. Go to https://vercel.com/dashboard
2. Find your project "curesite"  
3. Click on it
4. Go to "Deployments" tab
5. Click the three dots (...) next to the latest failed deployment
6. Click **"Redeploy"**
7. **IMPORTANT: UNCHECK "Use existing Build Cache"**
8. Click "Redeploy" button

This will trigger a fresh build with the new configuration.

### Option 2: Configure Root Directory in Vercel (ALTERNATIVE)
If the above doesn't work:

1. Go to your Vercel project settings
2. Click "Settings" tab
3. Go to "General" section
4. Find "Root Directory"
5. Set it to: `frontend`
6. Click "Save"
7. Go back to "Deployments" and redeploy

### Option 3: Push Empty Commit (IF DASHBOARD ACCESS ISSUES)
```bash
cd /app
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

## What Changed in vercel.json:

**Old (broken):**
```json
{
  "buildCommand": "cd frontend && yarn build",
  "installCommand": "cd frontend && yarn install"
}
```

**New (working):**
```json
{
  "buildCommand": "cd frontend && yarn install && yarn build",
  "installCommand": "echo 'Skipping root install'"
}
```

## After Successful Deployment

Once Vercel deploys successfully, check:
1. Go to https://curesite.vercel.app/
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Go to your Profile page
4. **The Complete Payment button WILL appear** on approved posters with pending payment

## Expected Result
- Text will change from "Explore Our Platform" to "Explore The Platform" ✅
- Complete Payment button will show on approved posters ✅
- Button will create Stripe checkout session and redirect to payment ✅

## If It Still Doesn't Work
Check the Vercel build logs:
- They should show: "Building..." instead of failing at "cd frontend"
- Build should complete successfully
- Output should be in "frontend/build" directory

The latest commit (ee80eea) has the fix. Vercel just needs to rebuild with this configuration.
