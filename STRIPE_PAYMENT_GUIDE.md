# 💳 Stripe Payment Integration Guide

## Overview

Simple payment workflow for accepted research posters. No automated emails - you'll notify students manually.

---

## 🔄 Complete Workflow

### 1. Admin Approves Poster
- Login as admin
- Go to Admin Panel → Posters
- Click "Approve" on a pending poster
- Backend automatically:
  - Sets `payment_status = "pending"`
  - Adds Stripe payment link
  - Logs student email to console

### 2. Admin Sends Email Manually
Check backend logs for student email:
```bash
tail -50 /var/log/supervisor/backend.out.log | grep "approved"
```

You'll see:
```
✅ Poster approved: 'Poster Title'
   Student: John Doe (student@email.com)
   Payment link set: https://buy.stripe.com/cNi6oJdBXd8j4COeMqgrS00
   ⚠️  Send acceptance email manually to student!
```

Send your own email with the payment link.

### 3. Student Sees Payment Link
- Student logs into their profile
- Sees "Payment Pending" badge (orange)
- Green notice box with "Complete Payment" button
- Clicks button → Goes to Stripe checkout

### 4. Student Completes Payment
- Pays via Stripe: https://buy.stripe.com/cNi6oJdBXd8j4COeMqgrS00
- Returns to platform

### 5. Admin Marks as Paid
- Go to Admin Panel → Posters
- Find the approved poster
- Click "Mark as Paid" button (green)
- Poster status changes to `payment_status = "completed"`

### 6. Poster Goes Live
- Poster automatically appears on public Journal/Posters page
- Only posters with `status="approved"` AND `payment_status="completed"` show publicly

---

## 🎨 What Students See

### In Profile (After Approval):
- ✅ "Approved" badge (green)
- ⚠️ "Payment Pending" badge (orange)
- 📦 Green notice box:
  ```
  🎉 Your poster has been accepted! 
  Complete payment to publish it on the network.
  
  [Complete Payment Button]
  ```

### In Profile (After Payment Marked):
- ✅ "Approved" badge (green)
- ✅ "Paid" badge (green)
- ✅ Success message: "Payment completed! Your poster is live on the network."

---

## 🛠️ Admin Controls

### Admin Panel → Posters:
- **Pending posters:** "Approve" / "Reject" buttons
- **Approved (unpaid):** "Mark as Paid" button (green)
- **Approved (paid):** Shows "Paid" badge

---

## 📋 Payment Statuses

| Status | Meaning | Visible Publicly? |
|--------|---------|-------------------|
| `not_required` | Default for new submissions | No |
| `pending` | Approved, awaiting payment | No |
| `completed` | Payment confirmed by admin | **Yes** |

---

## 🔧 Fix Old Approved Posters

If you approved posters BEFORE this integration, they won't have payment fields. Fix them:

```bash
cd /app && python3 << 'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def fix_old_posters():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['cure_db']
    
    result = await db.poster_submissions.update_many(
        {
            "status": "approved",
            "$or": [
                {"payment_status": {"$exists": False}},
                {"payment_status": "not_required"}
            ]
        },
        {
            "$set": {
                "payment_status": "pending",
                "payment_link": "https://buy.stripe.com/cNi6oJdBXd8j4COeMqgrS00"
            }
        }
    )
    
    print(f"✅ Fixed {result.modified_count} old approved posters")
    client.close()

asyncio.run(fix_old_posters())
EOF
```

---

## 📧 Email Template (For Manual Sending)

**Subject:** Your Research Poster Has Been Accepted!

**Body:**
```
Hi [Student Name],

Congratulations! Your research poster "[Poster Title]" has been accepted!

To publish your poster on the CURE Journal network, please complete the payment:
https://buy.stripe.com/cNi6oJdBXd8j4COeMqgrS00

You can also find the payment link in your profile under "My Submissions".

After payment, your poster will be visible to the entire community.

Best regards,
The CURE Journal Team
```

---

## 🧪 Testing

### Test the complete flow:
1. Approve a test poster
2. Check backend logs for student email
3. Login as that student
4. Verify payment button shows in profile
5. Click "Complete Payment" (goes to Stripe)
6. Go back to admin panel
7. Click "Mark as Paid"
8. Check public Posters page → Poster should appear

---

## ✅ What Works

- ✅ Payment status tracking
- ✅ Stripe payment link integration
- ✅ Student payment UI (badges, buttons, notices)
- ✅ Admin payment controls
- ✅ Public filtering (only paid posters visible)
- ✅ Logs student email for manual notification

---

## 🚀 Ready to Push

```bash
git add .
git commit -m "Add Stripe payment integration for poster submissions"
git push origin main
```

No API keys, no secrets, all clean!

---

**Simple, manual, and working!** 🎉
