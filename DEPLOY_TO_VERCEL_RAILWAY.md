# 🚀 Deploy Stripe Payment Integration to Vercel/Railway

## ✅ Current Status

Your payment integration is complete and committed:
- ✅ Backend: Payment status tracking, Stripe links
- ✅ Frontend: Payment buttons, badges, admin controls
- ✅ No secrets in code (safe to push)
- ✅ All changes committed to git

---

## 🚀 Step 1: Push to GitHub

```bash
git push origin main
```

This will push to: `avisharm-alt/curesite`

---

## 🔄 Step 2: Auto-Deploy

### Vercel (Frontend):
- Vercel will auto-detect the push
- Auto-deploys frontend to: curesite.vercel.app
- Wait 2-3 minutes for build

### Railway (Backend):
- Railway will auto-detect the push
- Auto-deploys backend
- Wait 2-3 minutes for build

---

## 🗄️ Step 3: Fix Database for Production

Your production MongoDB needs the payment fields. Run this once:

**Option A: Via Railway Console**
1. Go to Railway dashboard
2. Open your backend service
3. Click "Terminal" or "Console"
4. Run:
```bash
python3 << 'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def fix_production():
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client['cure_db']
    
    # Set all approved posters to show in journal
    result = await db.poster_submissions.update_many(
        {"status": "approved"},
        {
            "$set": {
                "payment_status": "completed",
                "payment_link": "https://buy.stripe.com/cNi6oJdBXd8j4COeMqgrS00"
            }
        }
    )
    
    print(f"✅ Fixed {result.modified_count} approved posters")
    client.close()

asyncio.run(fix_production())
EOF
```

**Option B: Use MongoDB Compass or Atlas**
Connect to your production database and run:
```javascript
db.poster_submissions.updateMany(
  { "status": "approved" },
  { 
    $set: { 
      "payment_status": "completed",
      "payment_link": "https://buy.stripe.com/cNi6oJdBXd8j4COeMqgrS00"
    }
  }
)
```

---

## ✅ Step 4: Verify Deployment

### Check Frontend:
1. Go to https://curesite.vercel.app
2. Clear browser cache (Ctrl+Shift+R)
3. Check:
   - Approved posters show in journal
   - Profile shows payment badges
   - Admin panel has "Mark as Paid" button

### Check Backend:
1. Go to your Railway backend URL
2. Test: `https://your-backend.railway.app/health`
3. Should return: `{"status":"healthy","service":"CURE Backend"}`

### Check API:
```bash
curl https://your-backend.railway.app/api/posters
```
Should show posters with payment_status and payment_link fields.

---

## 🎯 What You'll See After Deploy

### Student Profile:
- Approved posters show "Approved" badge (green)
- If `payment_status="pending"`: Shows orange "Payment Pending" badge + blue "Complete Payment" button
- If `payment_status="completed"`: Shows green "Paid" badge + success message

### Admin Panel:
- Pending posters: "Approve" / "Reject" buttons
- Approved posters with pending payment: Green "Mark as Paid" button
- Payment status badges visible on all poster cards

### Public Journal:
- Only shows posters with `status="approved"` AND `payment_status="completed"`
- Unpaid posters are hidden from public

---

## 🔧 If You Don't See Changes

1. **Clear browser cache:** Hard refresh (Ctrl+Shift+R)
2. **Check deployment logs:**
   - Vercel: Dashboard → Deployments → Check latest build
   - Railway: Dashboard → Deployments → Check logs
3. **Verify git push worked:**
   - Go to https://github.com/avisharm-alt/curesite
   - Check latest commit includes payment files
4. **Check database was updated:** 
   - Run the fix script again if needed

---

## 📋 Files That Changed

Backend:
- `backend/server.py` - Payment logic
- `backend/requirements.txt` - Dependencies

Frontend:
- `frontend/src/pages/ProfilePage.js` - Payment UI
- `frontend/src/pages/AdminPanelPage.js` - Admin controls
- `frontend/src/App.css` - Payment styling

Docs:
- `STRIPE_PAYMENT_GUIDE.md` - Usage guide
- `HOW_IT_WORKS.md` - System explanation

---

## 🎯 Quick Test After Deploy

1. Go to curesite.vercel.app
2. Login as admin
3. Approve a poster
4. Login as that student
5. See payment button in profile ✅
6. Click button → Goes to Stripe ✅
7. Back to admin → Mark as paid ✅
8. Check public journal → Poster appears ✅

---

## 🆘 Troubleshooting

**"No payment buttons showing"**
- Clear cache and hard refresh
- Check database was updated (Step 3)
- Verify Vercel deployed successfully

**"Posters not in journal"**
- Check payment_status is "completed" in database
- Run the database fix script (Step 3)

**"Deployment failed"**
- Check Vercel/Railway logs
- Verify no build errors
- Check all dependencies in package.json/requirements.txt

---

## 🎉 You're Done!

Push to GitHub and wait for auto-deploy. Your payment system will be live!

```bash
git push origin main
```

Monitor:
- https://vercel.com/dashboard (Frontend build)
- https://railway.app/dashboard (Backend deploy)
- https://curesite.vercel.app (Live site)
