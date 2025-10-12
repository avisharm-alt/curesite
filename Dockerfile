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
RUN pip install --no-cache-dir --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/ -r requirements.txt

# Copy the backend application
COPY backend/ ./

# Copy test script for debugging
COPY test-startup.py ./

# Copy uploads directory to app level (one level up)
COPY uploads/ ../uploads/

# Create uploads directory if it doesn't exist
RUN mkdir -p ../uploads

# Railway will set PORT dynamically

# Start the server with fixed port
CMD ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]