# Production Dockerfile for AegisX Autonomous Multi-Agent SOC Platform
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_SYSTEM_PYTHON=1 \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency configuration
COPY pyproject.toml uv.lock ./

# Install project dependencies into system Python
RUN uv pip install -r pyproject.toml

# Copy application source code and assets
COPY backend/ ./backend/
COPY css/ ./css/
COPY js/ ./js/
COPY index.html ./
COPY test_backend_complete.py ./

# Create volume for persistent SQLite WAL storage
VOLUME ["/app/backend"]

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Launch production server
CMD ["python", "-m", "uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
