#!/bin/sh
set -e

echo "Applying database migrations..."
# Execute migrations. (Note: The CI/CD environment MUST provide PRISMA_DATABASE_URL to this step)
npx prisma migrate deploy

echo "Starting the flying-class-backend application..."
exec "$@"