#!/bin/bash
set -e

echo "Waiting for database..."
while ! pg_isready -h postgres -p 5432 -U postgres; do
    sleep 1
done
echo "Database is ready!"

echo "Running migrations..."
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
echo "Migrations complete!"

echo "Starting application..."
exec "$@"