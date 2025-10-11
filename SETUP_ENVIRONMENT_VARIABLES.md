# 🔐 Setting Up Environment Variables for Payment Integration

## ⚠️ IMPORTANT: Required Before Deployment

The Stripe payment integration requires the SendGrid API key to be set as an environment variable. **DO NOT hardcode it in the code!**

---

## 🚀 Quick Setup

### Your SendGrid API Key:
```
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
```

---

## 📍 Where to Set Environment Variables

### Option 1: Railway (Backend Hosting)

1. Go to your Railway project dashboard
2. Select your backend service
3. Click on **"Variables"** tab
4. Click **"+ New Variable"**
5. Add these variables:

```bash
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=curejournal@gmail.com
```

6. Click **"Deploy"** to restart with new variables

---

### Option 2: Vercel (If Backend is on Vercel)

1. Go to your Vercel project dashboard
2. Click **"Settings"** > **"Environment Variables"**
3. Add these variables:

```bash
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=curejournal@gmail.com
```

4. Redeploy your application

---

### Option 3: Local Development

Create a `.env` file in the backend directory:

```bash
# /app/backend/.env
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=curejournal@gmail.com
```

**⚠️ IMPORTANT:** Add `.env` to your `.gitignore` file:
```bash
echo ".env" >> .gitignore
```

---

## ✅ Verify Setup

After setting the environment variables, check the logs:

### Success (✅):
```
📊 Connecting to database: cure_db
🔗 MongoDB host: localhost:27017
📧 SendGrid configured for email notifications
```

### Warning (⚠️):
```
⚠️  WARNING: SENDGRID_API_KEY environment variable not set
   Email notifications will not be sent when posters are approved
   Set SENDGRID_API_KEY in your environment to enable email sending
```

If you see the warning, the API key is not set correctly.

---

## 🧪 Test Email Sending

To test if emails are working:

1. Login as admin
2. Go to Admin Panel > Posters
3. Approve a test poster
4. Check if the student receives an email
5. Check backend logs for email confirmation

---

## 🔒 Security Best Practices

✅ **DO:**
- Store API keys as environment variables
- Use `.env` files for local development
- Add `.env` to `.gitignore`
- Rotate API keys if they're exposed

❌ **DON'T:**
- Commit API keys to GitHub
- Share API keys in plain text
- Hardcode API keys in source code
- Use the same key for dev and production

---

## 🆘 Troubleshooting

### Problem: Emails not sending
**Check:**
1. Environment variable is set: `echo $SENDGRID_API_KEY`
2. Backend logs show SendGrid configuration
3. SendGrid account is active and verified
4. From email (curejournal@gmail.com) is verified in SendGrid

### Problem: "SendGrid API key not configured" warning
**Fix:**
1. Verify environment variable name is exactly `SENDGRID_API_KEY`
2. Restart your backend server after setting the variable
3. Check if the variable is accessible: `printenv | grep SENDGRID`

### Problem: Emails go to spam
**Fix:**
1. Verify sender domain in SendGrid
2. Add SPF and DKIM records to your domain
3. Use SendGrid's sender authentication

---

## 📞 Need Help?

If you encounter issues:
1. Check Railway/Vercel logs for errors
2. Verify SendGrid dashboard for delivery status
3. Test with a different email address
4. Check SendGrid API key is valid and active

---

**Generated:** January 2025  
**For:** CURE Platform - Stripe Payment Integration
