# Use official Python image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first (to leverage Docker layer caching)
COPY requirements.txt ./

# Copy rest of backend code
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose Flask default port
EXPOSE 5000

# Set environment variables for Flask
ENV FLASK_RUN_HOST=0.0.0.0

# Start Gunicorn with error logging
CMD flask db upgrade && gunicorn -w 4 -b 0.0.0.0:${PORT:-5000} main:app --log-level=debug
