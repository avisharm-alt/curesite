# 📧 Manual Email Notification Guide

## Overview

Email notifications have been removed from the automated flow. When you approve a poster, you'll need to manually send an email to the student.

---

## How It Works Now

### 1. When Admin Approves a Poster:

The backend logs this information:
```
📧 Poster approved for [Student Name] ([student@email.com])
   Title: [Poster Title]
   Payment link set: https://buy.stripe.com/cNi6oJdBXd8j4COeMqgrS00
   ⚠️  Remember to notify student via email manually!
```

### 2. Admin Sends Email Manually:

You can send an email from your personal email or Gmail with this template:

---

## Email Template

**Subject:** 🎉 Congratulations! Your Research Poster Has Been Accepted

**Body:**

```
Hi [Student Name],

Congratulations! Your research poster "[Poster Title]" has been accepted for publication in the CURE Journal network!

Next Steps:
1. Visit your profile on the CURE platform
2. Find your accepted poster with the payment link
3. Complete the payment to publish your poster on the network
4. Your poster will be visible to the entire community after payment confirmation

Payment Link: https://buy.stripe.com/cNi6oJdBXd8j4COeMqgrS00

You can also find this payment link in your profile under "My Submissions".

Best regards,
The CURE Journal Team
```

---

## Where to Find Student Emails

**Option 1: Check Backend Logs**
- Railway: Go to your backend service > Logs
- Look for the "📧 Poster approved" message
- It shows the student's name and email

**Option 2: Check Admin Panel**
- Go to Admin Panel > Posters
- Click on the approved poster
- Student email should be visible in the submission details

**Option 3: Check Database**
- Query the `poster_submissions` collection
- Find the `submitted_by` user ID
- Look up the user in the `users` collection

---

## What Still Works Automatically

✅ Payment status set to "pending" when approved  
✅ Payment link added to poster  
✅ Student sees payment link in their profile  
✅ Admin can mark as paid  
✅ Paid posters appear on public network  

❌ Automated email sending (you do this manually)

---

## Payment Flow

1. **Admin approves poster** → Backend sets payment_status="pending"
2. **Admin sends email manually** → Student gets notified
3. **Student sees payment link in profile** → Clicks "Complete Payment"
4. **Student completes payment on Stripe** → Returns to platform
5. **Admin marks as paid** → Poster goes live

---

## Tips

- Keep a list of approved posters to email
- Send emails in batches at the end of the day
- Use Gmail's "Send Later" feature to schedule emails
- Copy/paste the email template for consistency

---

That's it! Simple and manual. 🎉
