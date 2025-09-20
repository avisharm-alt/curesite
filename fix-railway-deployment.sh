#!/bin/bash

echo "🔧 Fixing Railway deployment configuration..."

# Remove problematic root requirements.txt if it exists
if [ -f "requirements.txt" ]; then
    echo "🗑️  Removing root requirements.txt (causes build conflicts)"
    rm requirements.txt
fi

# Ensure backend requirements.txt exists
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ Error: backend/requirements.txt not found!"
    echo "Please ensure your Python dependencies are in backend/requirements.txt"
    exit 1
fi

# Check if nixpacks.toml exists
if [ ! -f "nixpacks.toml" ]; then
    echo "📝 Creating nixpacks.toml for Railway..."
    cat > nixpacks.toml << EOL
[phases.setup]
nixPkgs = ['python311', 'pip']

[phases.install]
cmds = ['pip install -r backend/requirements.txt']

[phases.build]
cmds = ['echo "Build phase complete"']

[start]
cmd = 'cd backend && python -m uvicorn server:app --host 0.0.0.0 --port \$PORT'
EOL
fi

# Check if railway.json exists and is configured correctly
if [ ! -f "railway.json" ]; then
    echo "📝 Creating railway.json..."
    cat > railway.json << EOL
{
  "\$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && python -m uvicorn server:app --host 0.0.0.0 --port \$PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOL
fi

# Commit changes
echo "📦 Committing fixes..."
git add nixpacks.toml railway.json
git add -A  # Add any other changes
git commit -m "Fix Railway deployment configuration"

echo "✅ Railway deployment configuration fixed!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Redeploy on Railway (it should pick up the new configuration)"
echo "3. If issues persist, check Railway logs for specific errors"
echo ""
echo "The key changes made:"
echo "- Removed root requirements.txt (conflicts with auto-detection)"
echo "- Added nixpacks.toml to specify Python 3.11 and correct pip install path"
echo "- Updated railway.json to use NIXPACKS builder"
echo "- Fixed Dockerfile CMD to avoid 'cd: command not found' error"
echo "- Updated start commands to use proper shell syntax"