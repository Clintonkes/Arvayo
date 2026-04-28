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

# Start server
echo "Starting FastAPI server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
