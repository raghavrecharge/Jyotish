# Backend Dockerfile for Astro Jyotish
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for pyswisseph and curl for healthcheck
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    libffi-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy ephemeris data
COPY ephe/ ./ephe/

# Copy application code
COPY . .

# Create directory for SQLite database
RUN mkdir -p /app/data

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV EPHEMERIS_PATH=/app/ephe
ENV DATABASE_URL=sqlite:////app/data/astroos.db
ENV SECRET_KEY=astrojyotish-secret-key-docker-2025

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/api/health || exit 1

# Run the application
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
