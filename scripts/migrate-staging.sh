#!/bin/bash
# Staging Migration Script

set -e

echo "[$(date)] Starting staging database migration..."

# Set staging database URL
export DATABASE_URL="${STAGING_DATABASE_URL}"

# Run migrations
npx prisma migrate deploy

# Verify migration
npx prisma db pull

echo "[$(date)] Migration completed successfully"
