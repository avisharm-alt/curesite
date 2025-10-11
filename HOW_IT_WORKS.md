# How the Stripe Payment System Works

## The Two States

### State 1: PENDING PAYMENT (Shows Button)
- `payment_status = "pending"`
- Student sees: Stripe "Complete Payment" button in their profile
- Public sees: Nothing (poster NOT in journal yet)

### State 2: PAID (Shows in Journal)
- `payment_status = "completed"`  
- Student sees: "Payment completed" message
- Public sees: Poster appears in journal

---

## You Can't Have Both At Once!

**Either:**
- Poster shows button in profile (pending) → NOT in journal
- Poster is in journal (completed) → NO button (already paid)

---

## Current Test Setup

I've set it up so you can see both:

1. **"Sustainable Energy" poster:**
   - Status: `pending`
   - Student profile: Shows Stripe button ✅
   - Public journal: NOT visible

2. **"Machine Learning" & "Biomedical" posters:**
   - Status: `completed`
   - Student profile: Shows "paid" badge ✅
   - Public journal: VISIBLE ✅

---

## To See the Stripe Button

1. Go to your profile as the student who submitted "Sustainable Energy"
2. Hard refresh: Ctrl+Shift+R
3. You'll see the green box with "Complete Payment" button

---

## Quick Commands

### Make ALL approved posters show in journal (no payment):
```bash
cd /app && python3 << 'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def all_paid():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['cure_db']
    await db.poster_submissions.update_many(
        {"status": "approved"},
        {"$set": {"payment_status": "completed"}}
    )
    print("✅ All approved posters now in journal")
    client.close()

asyncio.run(all_paid())
EOF
```

### Make a poster show the payment button:
```bash
cd /app && python3 << 'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def show_button():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['cure_db']
    await db.poster_submissions.update_one(
        {"title": "YOUR_POSTER_TITLE_HERE"},
        {"$set": {
            "payment_status": "pending",
            "payment_link": "https://buy.stripe.com/cNi6oJdBXd8j4COeMqgrS00"
        }}
    )
    print("✅ Poster now shows payment button")
    client.close()

asyncio.run(show_button())
EOF
```

---

## Nothing is Broken!

Everything is working exactly as designed:
- ✅ Payment buttons show when status="pending"
- ✅ Posters appear in journal when status="completed"
- ✅ Backend is working
- ✅ Frontend is working
- ✅ Database is correct

You just need to understand the two states can't exist at the same time for the same poster.
