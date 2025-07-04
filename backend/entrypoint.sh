#!/bin/bash
set -e

echo "Starting AI Opportunity Scanner API..."

# Extract database connection info from DATABASE_URL for pg_isready
if [ -n "$DATABASE_URL" ]; then
    echo "Waiting for database connection..."
    # Parse DATABASE_URL to get host and port for pg_isready
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    
    # Wait for database to be ready
    until pg_isready -h "$DB_HOST" -p "$DB_PORT" -q; do
        echo "Database not ready, waiting..."
        sleep 2
    done
    echo "Database is ready!"
    
    echo "Running database migrations..."
    python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
    echo "Migrations complete!"
else
    echo "No DATABASE_URL provided, skipping database setup"
fi

echo "Starting application..."
exec uvicorn main:app --host 0.0.0.0 --port 8000