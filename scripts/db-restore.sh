#!/bin/bash

# Azora OS Database Restore Script
# Supports point-in-time recovery from backups

set -e

# Configuration
BACKUP_DIR="/var/backups/azora"
TIMESTAMP=${1:-latest}

# Database connection details (from environment)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-azora}
DB_USER=${DB_USER:-azora}
DB_PASSWORD=${DB_PASSWORD}

# Function to show usage
usage() {
    echo "Usage: $0 [backup_timestamp]"
    echo "Examples:"
    echo "  $0                    # Restore from latest backup"
    echo "  $0 20241114_120000   # Restore from specific backup"
    echo ""
    echo "Available backups:"
    ls -la "$BACKUP_DIR"/azora_backup_*.sql.gz 2>/dev/null | head -10 || echo "No backups found"
    exit 1
}

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: Backup directory $BACKUP_DIR does not exist"
    exit 1
fi

# Determine backup file
if [ "$TIMESTAMP" = "latest" ]; then
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/azora_backup_*.sql.gz | head -1)
    if [ -z "$BACKUP_FILE" ]; then
        echo "Error: No backup files found"
        exit 1
    fi
else
    BACKUP_FILE="$BACKUP_DIR/azora_backup_${TIMESTAMP}.sql.gz"
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "Error: Backup file $BACKUP_FILE not found"
        echo "Available backups:"
        ls "$BACKUP_DIR"/azora_backup_*.sql.gz 2>/dev/null || echo "None"
        exit 1
    fi
fi

echo "Starting database restore from: $BACKUP_FILE"

# Confirm destructive operation
echo "WARNING: This will overwrite the current database!"
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled."
    exit 1
fi

# Export password for pg_restore
export PGPASSWORD="$DB_PASSWORD"

# Optional: Create backup of current state before restore
CURRENT_BACKUP="$BACKUP_DIR/pre_restore_$(date +"%Y%m%d_%H%M%S").sql.gz"
echo "Creating backup of current state: $CURRENT_BACKUP"
pg_dump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --no-password \
  --format=custom \
  --compress=9 \
  --file="$CURRENT_BACKUP"

# Terminate active connections to the database
echo "Terminating active connections..."
psql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="postgres" \
  --no-password \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"

# Drop and recreate database
echo "Dropping and recreating database..."
psql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="postgres" \
  --no-password \
  -c "DROP DATABASE IF EXISTS $DB_NAME;"

psql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="postgres" \
  --no-password \
  -c "CREATE DATABASE $DB_NAME;"

# Restore from backup
echo "Restoring database..."
pg_restore \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --no-password \
  --format=custom \
  --clean \
  --if-exists \
  --create \
  --verbose \
  "$BACKUP_FILE"

# Verify restore
echo "Verifying restore..."
psql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --no-password \
  -c "SELECT version();" > /dev/null

echo "Database restore completed successfully!"

# Optional: Run post-restore checks
echo "Running post-restore health checks..."
# Add your health check commands here

echo "Restore summary:"
echo "  Restored from: $BACKUP_FILE"
echo "  Current backup saved: $CURRENT_BACKUP"