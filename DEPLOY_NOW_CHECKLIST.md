# 🚀 DEPLOY TO NEW VERCEL PROJECT NOW - Quick Checklist

## ✅ Everything is Ready!

All code is updated and pushed to GitHub. Your backend is running on Railway.

## Quick Deploy Steps (5 minutes)

### 1. Go to Vercel
Visit: https://vercel.com/new

### 2. Import Your Repo
- Select: `avisharm-alt/curesite`
- Click "Import"

### 3. CRITICAL: Set Root Directory
⚠️ **THIS IS THE MOST IMPORTANT STEP**
- Click "Edit" next to Root Directory
- Type: `frontend`
- Click Save

### 4. Add Environment Variable
Click "Add" under Environment Variables:
```
Key: REACT_APP_BACKEND_URL
Value: https://curesite-production.up.railway.app
```

### 5. Deploy
- Click "Deploy"
- Wait 2-3 minutes
- DONE! ✅

## What You'll See After Deployment

1. **Homepage:** "Explore The Platform" (not "Our")
2. **Profile Page:** Your approved poster with **"Complete Payment"** button
3. **Button Click:** Redirects to Stripe checkout ($25)
4. **After Payment:** Poster shows as "Paid" and appears publicly

## Your Test Poster Info

You already have a poster ready in production MongoDB:
- **Status:** approved ✅
- **Payment Status:** pending ✅
- **User ID:** f2456c7c-1e7f-4eff-899d-55b9f06e53d7

Sign in with the account that owns this poster and the button will appear!

## If Deployment Fails

Double-check:
- [ ] Root Directory is set to `frontend` (not blank!)
- [ ] Environment variable is added
- [ ] Framework preset is "React" or "Create React App"

## After Successful Deployment

1. Hard refresh your browser (Ctrl+Shift+R)
2. Clear cache if needed
3. Sign in to see your poster
4. Test the Complete Payment button
5. Delete old Vercel project

---

**Full detailed guide:** See `/app/FRESH_VERCEL_DEPLOYMENT_GUIDE.md`

## Expected Result

✅ Text: "Explore The Platform"
✅ Button: "Complete Payment" on approved posters
✅ Stripe: Checkout session created and working
✅ Backend: All payment endpoints functional
