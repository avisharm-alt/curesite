# Use Python 3.11 slim image
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory to backend
WORKDIR /app/backend

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application
COPY backend/ ./

# Copy test script for debugging
COPY test-startup.py ./

# Copy uploads directory to app level (one level up)
COPY uploads/ ../uploads/

# Create uploads directory if it doesn't exist
RUN mkdir -p ../uploads

# Expose port (Railway will set this dynamically)
EXPOSE $PORT

# Start the server with enhanced logging
CMD ["sh", "-c", "echo 'Starting CURE Backend on port ${PORT:-8000}' && python -m uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info"]