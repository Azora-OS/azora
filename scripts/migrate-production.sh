#!/bin/bash
# Production Migration Script

set -e

echo "[$(date)] PRODUCTION MIGRATION - Requires approval"
read -p "Continue with production migration? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Migration cancelled"
  exit 1
fi

# Backup before migration
./scripts/db-backup.sh

echo "[$(date)] Starting production database migration..."

export DATABASE_URL="${PRODUCTION_DATABASE_URL}"

npx prisma migrate deploy

npx prisma db pull

echo "[$(date)] Production migration completed successfully"
