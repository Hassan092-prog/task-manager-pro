FROM python:3.11-slim

WORKDIR /app

# Install system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY . .

# Ensure instance directory exists for SQLite database persistence
RUN mkdir -p /app/instance

# Runtime environment configuration
ENV PORT=5001 \
    PYTHONUNBUFFERED=1

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5001/ || exit 1

CMD ["gunicorn", "--workers", "2", "--bind", "0.0.0.0:5001", "wsgi:app"]
