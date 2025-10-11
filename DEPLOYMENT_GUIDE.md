# 🚀 Stripe Payment Integration - Deployment Guide

## ⚠️ CRITICAL: Environment Variables Required

The Stripe payment integration requires SendGrid API key to be set as an environment variable.

---

## 🔐 Required Environment Variables

Set these in Railway/Vercel (contact admin for actual values):

```bash
SENDGRID_API_KEY=<your_sendgrid_key>
SENDGRID_FROM_EMAIL=curejournal@gmail.com
```

---

## 📍 How to Set Variables in Railway

1. Go to Railway Dashboard
2. Select your backend service  
3. Click **"Variables"** tab
4. Add SENDGRID_API_KEY and SENDGRID_FROM_EMAIL
5. Deploy

---

## 📋 What Changed

### Backend (backend/server.py):
- Payment status tracking (pending/completed)
- SendGrid email integration
- Admin payment completion endpoint
- Public posters filtered by payment status

### Frontend:
- ProfilePage.js - Payment UI for students
- AdminPanelPage.js - Payment controls for admins
- App.css - Payment styling

---

## ✅ Testing

1. Approve a poster as admin
2. Check if email sent
3. Verify payment link in student profile
4. Test "Mark as Paid" button
5. Confirm paid posters visible publicly

---

## 🔄 Database Migration

For existing approved posters:
```bash
python migrate_existing_posters.py
```

---

**Remember:** Never commit API keys to GitHub!
