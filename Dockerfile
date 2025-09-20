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

# Copy uploads directory to app level (one level up)
COPY uploads/ ../uploads/

# Create uploads directory if it doesn't exist
RUN mkdir -p ../uploads

# Expose port (Railway will set this)
EXPOSE 8000

# Health check disabled for debugging
# HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:$PORT/health || exit 1

# Start the server directly (we're already in backend directory)
CMD ["sh", "-c", "python -m uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]