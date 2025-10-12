#!/bin/bash
set -e

echo "🚀 CURE Backend Startup Script"
echo "================================"

# Debug environment
echo "🔍 Environment Debug:"
echo "PORT: ${PORT:-'NOT SET'}"
echo "MONGO_URL: ${MONGO_URL:0:20}... (truncated)"
echo "DB_NAME: ${DB_NAME:-'NOT SET'}"
echo "PWD: $(pwd)"
echo "Python: $(python --version)"

# Determine port
if [ -n "$PORT" ]; then
    USE_PORT=$PORT
    echo "✅ Using Railway PORT: $USE_PORT"
else
    USE_PORT=8000
    echo "⚠️  No PORT set, using default: $USE_PORT"
fi

# Change to backend directory
if [ -d "backend" ]; then
    cd backend
    echo "📁 Changed to backend directory"
else
    echo "📁 Already in backend directory"
fi

# Check if server.py exists
if [ ! -f "server.py" ]; then
    echo "❌ server.py not found!"
    ls -la
    exit 1
fi

# Install dependencies if needed
if [ ! -f ".deps_installed" ]; then
    echo "📦 Installing dependencies..."
    pip install --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/ -r requirements.txt
    touch .deps_installed
fi

# Start server
echo "🚀 Starting uvicorn on 0.0.0.0:$USE_PORT"
exec python -m uvicorn server:app --host 0.0.0.0 --port $USE_PORT