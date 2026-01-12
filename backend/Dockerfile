FROM python:3.11-slim

WORKDIR /app

# Install system dependencies + netcat
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    default-libmysqlclient-dev \
    pkg-config \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

# Default command (overridden by docker-compose, but safe)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
