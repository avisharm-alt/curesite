# 🔧 Troubleshooting Payment Integration

## Issue: Payment Link Not Showing / Email Not Sent

If you're not seeing the payment button and emails aren't being sent when you approve posters, follow these steps:

---

## ✅ Step 1: Verify You're Logged in as Admin

**Check your user type:**
1. Open browser console (F12)
2. Type: `localStorage.getItem('user')`
3. Look for `"user_type":"admin"`

If you don't see admin, you're not logged in as an admin user!

**Solution:** Login with an admin account (curejournal@gmail.com or any user marked as admin in database)

---

## ✅ Step 2: Check Browser Console for Errors

When you click "Approve" button:

1. Open browser console (F12) → Console tab
2. Click "Approve" on a poster
3. Look for errors

**Common errors:**
- `403 Forbidden` → You're not admin
- `401 Unauthorized` → Token expired, login again
- `Network error` → Backend not running

---

## ✅ Step 3: Verify Backend is Running

```bash
curl http://localhost:8001/health
```

Should return: `{"status":"healthy","service":"CURE Backend"}`

If not, restart backend:
```bash
sudo supervisorctl restart backend
```

---

## ✅ Step 4: Check if Approval Actually Worked

Even if you don't see changes immediately, check the database:

```bash
cd /app && python3 << 'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['cure_db']
    
    posters = await db.poster_submissions.find({"status": "approved"}).to_list(100)
    
    print(f"Approved posters: {len(posters)}\n")
    for p in posters:
        print(f"Title: {p.get('title')}")
        print(f"  Status: {p.get('status')}")
        print(f"  Payment Status: {p.get('payment_status', 'NOT SET')}")
        print(f"  Payment Link: {'YES' if p.get('payment_link') else 'NO'}")
        print()
    
    client.close()

asyncio.run(check())
EOF
```

---

## ✅ Step 5: Manual Fix for Existing Approved Posters

If posters were approved but don't have payment fields:

```bash
python3 /app/fix_existing_approved_posters.py
```

This sets payment_status="pending" and adds payment link to all approved posters.

---

## ✅ Step 6: Test Email Sending

Check if SendGrid is working:

```bash
cd /app/backend && python3 << 'EOF'
import asyncio
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = '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'

async def test_email():
    message = Mail(
        from_email='curejournal@gmail.com',
        to_emails='YOUR_EMAIL_HERE',  # Replace with your email
        subject='Test Email from CURE',
        html_content='<p>If you receive this, SendGrid is working!</p>'
    )
    
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"✅ Email sent! Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

asyncio.run(test_email())
EOF
```

---

## ✅ Step 7: Check Backend Logs for Email Attempts

When you approve a poster, check logs:

```bash
tail -50 /var/log/supervisor/backend.out.log | grep -i "email\|approved"
```

You should see:
```
✅ Acceptance email sent to student@email.com - Status: 202
```

If you see errors, email isn't working.

---

## ✅ Step 8: Force Refresh Frontend

Sometimes the UI is cached:

1. Hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Close and reopen the page

---

## ✅ Step 9: Check Admin Panel URL

Make sure you're using the correct endpoint:

**Frontend should call:** `/api/admin/posters/{id}/review`

Check browser Network tab (F12 → Network):
- Click "Approve"
- Look for the API call
- Check if URL is correct
- Check response status

---

## 🎯 Quick Diagnostic Checklist

Run this to check everything:

```bash
cd /app && python3 << 'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def diagnostic():
    print("=== CURE Payment Integration Diagnostic ===\n")
    
    # Check MongoDB
    try:
        client = AsyncIOMotorClient('mongodb://localhost:27017')
        db = client['cure_db']
        
        # Count posters
        total = await db.poster_submissions.count_documents({})
        approved = await db.poster_submissions.count_documents({"status": "approved"})
        pending = await db.poster_submissions.count_documents({"status": "pending"})
        with_payment = await db.poster_submissions.count_documents({"payment_status": "pending"})
        
        print(f"✅ MongoDB Connected")
        print(f"   Total posters: {total}")
        print(f"   Approved: {approved}")
        print(f"   Pending: {pending}")
        print(f"   Awaiting payment: {with_payment}\n")
        
        # Check admin user
        admin = await db.users.find_one({"user_type": "admin"})
        if admin:
            print(f"✅ Admin user exists: {admin.get('email')}\n")
        else:
            print(f"❌ No admin user found!\n")
        
        # Check posters needing payment
        needs_payment = await db.poster_submissions.find({
            "status": "approved",
            "payment_status": "pending"
        }).to_list(10)
        
        if needs_payment:
            print(f"📋 Posters awaiting payment:")
            for p in needs_payment:
                print(f"   - {p.get('title')}")
                print(f"     Payment link: {'YES' if p.get('payment_link') else 'NO'}")
        
        client.close()
        
    except Exception as e:
        print(f"❌ MongoDB Error: {e}")
    
    # Check SendGrid
    print(f"\n📧 SendGrid API Key: {'SET' if os.environ.get('SENDGRID_API_KEY') or True else 'NOT SET'}")
    print(f"   Key in code: YES (hardcoded fallback)")
    
    # Check backend
    import subprocess
    try:
        result = subprocess.run(['curl', '-s', 'http://localhost:8001/health'], 
                              capture_output=True, text=True, timeout=5)
        if 'healthy' in result.stdout:
            print(f"\n✅ Backend is running")
        else:
            print(f"\n❌ Backend not responding correctly")
    except:
        print(f"\n❌ Backend not reachable")
    
    print(f"\n=== End Diagnostic ===")

asyncio.run(diagnostic())
EOF
```

---

## 🐛 Common Issues & Solutions

### Issue: Payment button doesn't show
**Cause:** Poster approved before payment integration added  
**Fix:** Run `python3 /app/fix_existing_approved_posters.py`

### Issue: Emails not sending  
**Cause:** SendGrid API key not loaded  
**Fix:** Backend should have hardcoded fallback, restart: `sudo supervisorctl restart backend`

### Issue: "403 Forbidden" when approving
**Cause:** Not logged in as admin  
**Fix:** Login with admin account

### Issue: Poster doesn't appear in journal
**Cause:** Public endpoint only shows PAID posters (payment_status="completed")  
**Fix:** Admin must mark as paid using "Mark as Paid" button

---

## 📞 Still Not Working?

If none of the above helps, check:
1. Browser console for JavaScript errors
2. Backend logs: `tail -f /var/log/supervisor/backend.err.log`
3. Network tab to see actual API calls being made
4. Make sure you're testing with the correct user (admin vs student)

---

**Most common issue:** You need to mark payment as completed for poster to show in public journal!
