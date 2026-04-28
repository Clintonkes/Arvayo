#!/bin/bash
set -e

echo "Starting Arvayo LLC Backend..."

# Run migrations
echo "Running database migrations..."
alembic upgrade head

# Seed database if needed
if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  python seed.py
fi

# Start server — Railway injects $PORT; fall back to 8000 for local dev
echo "Starting FastAPI server on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
