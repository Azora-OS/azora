#!/bin/bash
# Database Backup Script
# RPO: 1 hour | RTO: 4 hours

set -e

BACKUP_DIR="${BACKUP_DIR:-/backup/postgres}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="${DB_NAME:-azora}"
DB_USER="${DB_USER:-azora}"
DB_HOST="${DB_HOST:-localhost}"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting PostgreSQL backup..."

# Full backup
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
  -F c -b -v -f "$BACKUP_DIR/azora_${TIMESTAMP}.backup"

# Compress
gzip "$BACKUP_DIR/azora_${TIMESTAMP}.backup"

echo "[$(date)] Backup completed: azora_${TIMESTAMP}.backup.gz"

# Cleanup old backups
find "$BACKUP_DIR" -name "*.backup.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Cleanup completed. Backups older than $RETENTION_DAYS days removed."

# Verify backup
if [ -f "$BACKUP_DIR/azora_${TIMESTAMP}.backup.gz" ]; then
  SIZE=$(du -h "$BACKUP_DIR/azora_${TIMESTAMP}.backup.gz" | cut -f1)
  echo "[$(date)] Backup verified. Size: $SIZE"
  exit 0
else
  echo "[$(date)] ERROR: Backup file not found!"
  exit 1
fi
