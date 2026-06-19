# Use official Python slim image
FROM python:3.11-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Copy requirements first for caching
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application source code
COPY backend/ .

# Runtime stage
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /app /app

# Create a non‑root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Expose the port (Render default)
EXPOSE 8000

# Start the server
CMD ["sh", "-c", "alembic upgrade head && python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
