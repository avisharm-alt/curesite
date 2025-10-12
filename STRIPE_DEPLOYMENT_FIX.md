# Stripe Integration Deployment Fix

## Problem
Backend crashes on deployment with: `ModuleNotFoundError: No module named 'emergentintegrations'`

## Root Cause
The `emergentintegrations` library requires a special PyPI index URL for installation:
```
--extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
```

Standard `pip install -r requirements.txt` doesn't include this special index, causing deployment failures.

## Solution Applied

### 1. Added emergentintegrations to requirements.txt
```
emergentintegrations==0.1.0
```

### 2. Updated All Deployment Files

#### Dockerfile (all versions)
Changed from:
```dockerfile
RUN pip install --no-cache-dir -r requirements.txt
```

To:
```dockerfile
RUN pip install --no-cache-dir --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/ -r requirements.txt
```

#### nixpacks.toml (Railway deployment)
Changed from:
```toml
[phases.install]
cmds = ['pip install -r backend/requirements.txt']
```

To:
```toml
[phases.install]
cmds = ['pip install --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/ -r backend/requirements.txt']
```

#### start-railway.sh
Changed from:
```bash
pip install -r requirements.txt
```

To:
```bash
pip install --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/ -r requirements.txt
```

## Files Modified
1. `/app/Dockerfile` - Main Docker build
2. `/app/Dockerfile.minimal` - Minimal Docker build
3. `/app/Dockerfile.simple` - Simple Docker build
4. `/app/nixpacks.toml` - Railway nixpacks config
5. `/app/nixpacks-simple.toml` - Alternative nixpacks config
6. `/app/start-railway.sh` - Railway startup script
7. `/app/backend/requirements.txt` - Added emergentintegrations==0.1.0

## Deployment Instructions

### For Railway:
1. Push these changes to your git repository
2. Railway will automatically redeploy using the updated nixpacks.toml
3. The emergentintegrations library will be installed with the special index URL
4. Backend should start successfully with Stripe integration

### For Docker Deployment:
```bash
docker build -t cure-backend .
docker run -p 8000:8000 \
  -e STRIPE_API_KEY="your_stripe_key" \
  -e STRIPE_PUBLISHABLE_KEY="your_publishable_key" \
  -e MONGO_URL="your_mongo_url" \
  cure-backend
```

### Environment Variables Required:
```
STRIPE_API_KEY=sk_live_51SGR0IRUcgRYFlQP...
STRIPE_PUBLISHABLE_KEY=pk_live_51SGR0IRUcgRYFlQPhbs...
MONGO_URL=mongodb://...
DB_NAME=cure_db
```

## Verification
After deployment, check logs for:
```
✅ Stripe configured with live keys
```

If you see this message, the Stripe integration is working correctly.

## Troubleshooting

### If deployment still fails:
1. Check that Railway/Docker has access to https://d33sy5i8bnduwe.cloudfront.net
2. Verify the requirements.txt includes `emergentintegrations==0.1.0`
3. Ensure the pip install command includes `--extra-index-url`
4. Check deployment logs for any network/firewall issues

### Alternative: Manual Installation
If the special index URL doesn't work in your deployment environment, you can:
1. Download the emergentintegrations wheel file manually
2. Include it in your repository
3. Install from the local file: `pip install ./emergentintegrations-0.1.0-py3-none-any.whl`

## Testing
Once deployed, test the payment endpoints:
- POST `/api/payments/create-checkout` - Should return checkout URL
- GET `/api/payments/status/{session_id}` - Should check payment status
- POST `/api/webhook/stripe` - Should accept Stripe webhooks
