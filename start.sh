#!/bin/bash
set -e

echo "🚀 Starting CURE Backend..."
echo "Port: $PORT"
echo "Environment: $RAILWAY_ENVIRONMENT"
echo "Current directory: $(pwd)"
echo "Python version: $(python --version)"
echo "Contents: $(ls -la)"

# Check if we need to install dependencies
if [ ! -d "__pycache__" ]; then
    echo "📦 Installing dependencies..."
    pip list | head -10
fi

# Change to backend directory if it exists, otherwise assume we're already there
if [ -d "backend" ]; then
    cd backend
    echo "📁 Changed to backend directory"
    echo "Backend contents: $(ls -la)"
fi

# Check if server.py exists
if [ -f "server.py" ]; then
    echo "✅ server.py found"
else
    echo "❌ server.py not found in $(pwd)"
    ls -la
    exit 1
fi

# Start the FastAPI server with verbose logging
echo "🔥 Starting uvicorn server on 0.0.0.0:${PORT:-8000}..."
exec python -m uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info