#!/bin/bash

# Azora OS Database Backup Script
# Creates automated backups with rotation and point-in-time recovery

set -e

# Configuration
BACKUP_DIR="/var/backups/azora"
RETENTION_DAYS=30
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="azora_backup_${TIMESTAMP}.sql.gz"

# Database connection details (from environment)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-azora}
DB_USER=${DB_USER:-azora}
DB_PASSWORD=${DB_PASSWORD}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting database backup: $BACKUP_NAME"

# Export password for pg_dump
export PGPASSWORD="$DB_PASSWORD"

# Create backup
pg_dump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --no-password \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/$BACKUP_NAME" \
  --verbose

# Verify backup integrity
echo "Verifying backup integrity..."
pg_restore --list "$BACKUP_DIR/$BACKUP_NAME" > /dev/null

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
echo "Backup created successfully: $BACKUP_SIZE"

# Rotate old backups (keep last 30 days)
echo "Rotating old backups..."
find "$BACKUP_DIR" -name "azora_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List current backups
echo "Current backups:"
ls -la "$BACKUP_DIR"/azora_backup_*.sql.gz

# Optional: Upload to cloud storage (uncomment and configure)
# aws s3 cp "$BACKUP_DIR/$BACKUP_NAME" "s3://azora-backups/$BACKUP_NAME"
# gcloud storage cp "$BACKUP_DIR/$BACKUP_NAME" "gs://azora-backups/$BACKUP_NAME"

echo "Database backup completed successfully!"

# Send notification (optional)
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"Database backup completed: '$BACKUP_NAME' ('$BACKUP_SIZE')"}' \
#   $SLACK_WEBHOOK_URL