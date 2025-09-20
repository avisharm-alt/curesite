#!/bin/bash
set -e

echo "🚀 Starting CURE Backend..."
echo "Port: $PORT"
echo "Environment: $RAILWAY_ENVIRONMENT"

# Change to backend directory if it exists, otherwise assume we're already there
if [ -d "backend" ]; then
    cd backend
    echo "📁 Changed to backend directory"
fi

# Start the FastAPI server
echo "🔥 Starting uvicorn server..."
exec python -m uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}