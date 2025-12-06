#!/bin/sh
set -e

echo "Running database migrations..."
# Run migrations using the DB_URL environment variable
./goose -dir sql/schema postgres "$DB_URL" up

echo "Starting application..."
exec ./vaultdrive-backend
