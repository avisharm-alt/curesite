# Fresh Vercel Frontend Deployment Guide

## ✅ Frontend is Ready for New Vercel Project

All configurations have been set up for you. The frontend will connect to your Railway backend at:
**https://curesite-production.up.railway.app**

## Step-by-Step Deployment Instructions

### Option 1: Deploy via Vercel Dashboard (RECOMMENDED)

1. **Go to Vercel:**
   - Visit https://vercel.com/new
   - Sign in with your GitHub account

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `avisharm-alt/curesite`
   - Click "Import"

3. **Configure Project Settings:**
   - **Framework Preset:** React (should auto-detect)
   - **Root Directory:** Click "Edit" and set to `frontend`
   - **Build Command:** Leave as default (`yarn build` or `npm run build`)
   - **Output Directory:** Leave as default (`build`)

4. **Environment Variables:**
   Click "Add Environment Variable" and add:
   ```
   Key: REACT_APP_BACKEND_URL
   Value: https://curesite-production.up.railway.app
   ```
   Set for: Production, Preview, and Development

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete (2-3 minutes)
   - Your site will be live at: `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd /app/frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: curesite-frontend (or your choice)
# - Directory: ./ (current)
# - Override settings: No
```

## What's Included & Configured

✅ **Environment Configuration:**
- `.env.production` file with Railway backend URL
- `vercel.json` with proper routing for React SPA

✅ **All New Features:**
- Dynamic Stripe checkout integration
- Payment status polling
- Complete Payment button (shows for approved posters with pending payment)
- Text change: "Explore The Platform"

✅ **Backend Integration:**
- Connects to Railway backend: https://curesite-production.up.railway.app
- All payment endpoints available:
  - POST /api/payments/create-checkout
  - GET /api/payments/status/{session_id}
  - POST /api/webhook/stripe

## After Deployment

### 1. Update DNS/Domain (Optional)
If you want to use a custom domain:
- Go to Vercel project settings
- Click "Domains"
- Add your custom domain
- Follow DNS configuration instructions

### 2. Test the Payment Flow
1. Go to your new Vercel URL
2. Sign in with Google
3. Go to Profile
4. You should see your approved poster with **"Complete Payment"** button
5. Click the button
6. Should redirect to Stripe checkout
7. Complete test payment
8. Return to site - poster becomes public

### 3. Configure Stripe Webhook (Important!)
For automatic payment verification:
1. Go to Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter: `https://curesite-production.up.railway.app/api/webhook/stripe`
4. Select events: `checkout.session.completed`
5. Click "Add endpoint"

## Verification Checklist

After deployment, verify:
- [ ] Site loads at your Vercel URL
- [ ] Homepage shows "Explore The Platform" (not "Our")
- [ ] Can sign in with Google
- [ ] Profile page shows approved poster
- [ ] **"Complete Payment" button appears** on approved poster
- [ ] Clicking button redirects to Stripe
- [ ] After payment, poster shows as "Paid"

## Troubleshooting

### If button still doesn't show:
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check browser console for errors (F12)
4. Verify poster in MongoDB has:
   - `status: "approved"`
   - `payment_status: "pending"`

### If getting CORS errors:
The backend should already allow your domain. If not, update Railway environment variables:
- Add your new Vercel URL to FRONTEND_URL

### If payment fails:
1. Check Stripe keys are correct in Railway
2. Verify webhook is configured in Stripe
3. Check Railway logs for errors

## Your Current Data

You have one poster ready to test:
- **ID:** c20718cf-3e16-4b77-bdd4-e1865d731cb9
- **Title:** "Poster"
- **Status:** approved
- **Payment Status:** pending
- **User:** f2456c7c-1e7f-4eff-899d-55b9f06e53d7

Once deployed, sign in with the account that owns this poster and you'll see the Complete Payment button immediately!

## Support

If you encounter any issues:
1. Check Vercel deployment logs
2. Check Railway backend logs
3. Check browser console (F12)
4. Verify environment variables are set correctly

## Next Steps After Successful Deployment

1. Delete old Vercel project (the one that was failing)
2. Update any links/bookmarks to new Vercel URL
3. Test full payment flow end-to-end
4. Push to production!
