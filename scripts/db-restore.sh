#!/bin/bash
# Database Restore Script

set -e

BACKUP_FILE="$1"
DB_NAME="${DB_NAME:-azora}"
DB_USER="${DB_USER:-azora}"
DB_HOST="${DB_HOST:-localhost}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.backup.gz>"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "[$(date)] Starting database restore from: $BACKUP_FILE"

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "[$(date)] Decompressing backup..."
  gunzip -c "$BACKUP_FILE" > "${BACKUP_FILE%.gz}"
  BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

# Drop existing connections
psql -h "$DB_HOST" -U "$DB_USER" -d postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB_NAME';"

# Restore
pg_restore -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
  -c -v "$BACKUP_FILE"

echo "[$(date)] Database restore completed successfully"
