#!/bin/bash

# Database Backup and Restore Script
# Provides utilities for backing up and restoring the production database

set -e

# Configuration
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-azora_admin}"
POSTGRES_DB="${POSTGRES_DB:-azora_production}"
BACKUP_DIR="${BACKUP_DIR:-/var/lib/postgresql/backup}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
  echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Create backup
backup_database() {
  log_info "Starting database backup..."
  
  mkdir -p "$BACKUP_DIR"
  
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.sql.gz"
  
  log_info "Backup file: $BACKUP_FILE"
  
  if PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --verbose \
    --no-password | gzip > "$BACKUP_FILE"; then
    
    log_info "Backup completed successfully."
    log_info "Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
    
    # Create metadata file
    cat > "$BACKUP_FILE.meta" << EOF
{
  "timestamp": "$TIMESTAMP",
  "database": "$POSTGRES_DB",
  "host": "$POSTGRES_HOST",
  "port": "$POSTGRES_PORT",
  "size": "$(du -b "$BACKUP_FILE" | cut -f1)",
  "status": "completed"
}
EOF
    
    echo "$BACKUP_FILE"
  else
    log_error "Backup failed"
    exit 1
  fi
}

# List backups
list_backups() {
  log_info "Available backups:"
  
  if [ ! -d "$BACKUP_DIR" ]; then
    log_warn "Backup directory does not exist: $BACKUP_DIR"
    return
  fi
  
  if [ -z "$(ls -A "$BACKUP_DIR"/backup-*.sql.gz 2>/dev/null)" ]; then
    log_warn "No backups found in $BACKUP_DIR"
    return
  fi
  
  echo ""
  printf "%-30s %-15s %-20s\n" "Backup File" "Size" "Date"
  printf "%-30s %-15s %-20s\n" "$(printf '=%.0s' {1..30})" "$(printf '=%.0s' {1..15})" "$(printf '=%.0s' {1..20})"
  
  for backup in $(ls -t "$BACKUP_DIR"/backup-*.sql.gz 2>/dev/null); do
    filename=$(basename "$backup")
    size=$(du -h "$backup" | cut -f1)
    date=$(stat -f %Sm -t "%Y-%m-%d %H:%M:%S" "$backup" 2>/dev/null || stat -c %y "$backup" | cut -d' ' -f1-2)
    printf "%-30s %-15s %-20s\n" "$filename" "$size" "$date"
  done
  
  echo ""
}

# Restore from backup
restore_database() {
  local backup_file="$1"
  
  if [ -z "$backup_file" ]; then
    log_error "Backup file not specified"
    echo "Usage: $0 restore <backup-file>"
    exit 1
  fi
  
  if [ ! -f "$backup_file" ]; then
    log_error "Backup file not found: $backup_file"
    exit 1
  fi
  
  log_warn "This will restore the database from: $backup_file"
  log_warn "Current data will be overwritten!"
  read -p "Are you sure? (yes/no): " -r
  
  if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    log_info "Restore cancelled."
    exit 0
  fi
  
  log_info "Starting database restore..."
  
  # Drop existing connections
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "postgres" << EOF
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$POSTGRES_DB'
  AND pid <> pg_backend_pid();
EOF
  
  # Drop and recreate database
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "postgres" << EOF
DROP DATABASE IF EXISTS $POSTGRES_DB;
CREATE DATABASE $POSTGRES_DB;
EOF
  
  # Restore from backup
  if gunzip -c "$backup_file" | PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB"; then
    
    log_info "Restore completed successfully."
  else
    log_error "Restore failed"
    exit 1
  fi
}

# Clean old backups
cleanup_old_backups() {
  log_info "Cleaning backups older than $RETENTION_DAYS days..."
  
  if [ ! -d "$BACKUP_DIR" ]; then
    log_warn "Backup directory does not exist: $BACKUP_DIR"
    return
  fi
  
  find "$BACKUP_DIR" -name "backup-*.sql.gz" -mtime +$RETENTION_DAYS -delete
  find "$BACKUP_DIR" -name "backup-*.meta" -mtime +$RETENTION_DAYS -delete
  
  log_info "Cleanup completed."
}

# Verify backup integrity
verify_backup() {
  local backup_file="$1"
  
  if [ -z "$backup_file" ]; then
    log_error "Backup file not specified"
    echo "Usage: $0 verify <backup-file>"
    exit 1
  fi
  
  if [ ! -f "$backup_file" ]; then
    log_error "Backup file not found: $backup_file"
    exit 1
  fi
  
  log_info "Verifying backup integrity..."
  
  if gunzip -t "$backup_file" > /dev/null 2>&1; then
    log_info "Backup integrity verified successfully."
    
    # Show backup info
    if [ -f "$backup_file.meta" ]; then
      log_info "Backup metadata:"
      cat "$backup_file.meta" | sed 's/^/  /'
    fi
  else
    log_error "Backup integrity check failed"
    exit 1
  fi
}

# Get backup statistics
backup_stats() {
  log_info "Backup statistics:"
  
  if [ ! -d "$BACKUP_DIR" ]; then
    log_warn "Backup directory does not exist: $BACKUP_DIR"
    return
  fi
  
  total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
  backup_count=$(ls -1 "$BACKUP_DIR"/backup-*.sql.gz 2>/dev/null | wc -l)
  oldest_backup=$(ls -t "$BACKUP_DIR"/backup-*.sql.gz 2>/dev/null | tail -1)
  newest_backup=$(ls -t "$BACKUP_DIR"/backup-*.sql.gz 2>/dev/null | head -1)
  
  echo "  Total backups: $backup_count"
  echo "  Total size: $total_size"
  
  if [ -n "$oldest_backup" ]; then
    echo "  Oldest backup: $(basename "$oldest_backup")"
  fi
  
  if [ -n "$newest_backup" ]; then
    echo "  Newest backup: $(basename "$newest_backup")"
  fi
}

# Show usage
show_usage() {
  cat << EOF
Database Backup and Restore Utility

Usage: $0 <command> [options]

Commands:
  backup              Create a new database backup
  restore <file>      Restore database from backup file
  list                List all available backups
  verify <file>       Verify backup integrity
  cleanup             Remove backups older than $RETENTION_DAYS days
  stats               Show backup statistics
  help                Show this help message

Environment Variables:
  POSTGRES_HOST       PostgreSQL host (default: localhost)
  POSTGRES_PORT       PostgreSQL port (default: 5432)
  POSTGRES_USER       PostgreSQL user (default: azora_admin)
  POSTGRES_PASSWORD   PostgreSQL password (required)
  POSTGRES_DB         Database name (default: azora_production)
  BACKUP_DIR          Backup directory (default: /var/lib/postgresql/backup)
  RETENTION_DAYS      Backup retention days (default: 30)

Examples:
  # Create a backup
  $0 backup

  # List all backups
  $0 list

  # Restore from a specific backup
  $0 restore /var/lib/postgresql/backup/backup-20240101-120000.sql.gz

  # Verify backup integrity
  $0 verify /var/lib/postgresql/backup/backup-20240101-120000.sql.gz

  # Clean old backups
  $0 cleanup

  # Show backup statistics
  $0 stats

EOF
}

# Main execution
main() {
  local command="${1:-help}"
  
  case "$command" in
    backup)
      backup_database
      ;;
    restore)
      restore_database "$2"
      ;;
    list)
      list_backups
      ;;
    verify)
      verify_backup "$2"
      ;;
    cleanup)
      cleanup_old_backups
      ;;
    stats)
      backup_stats
      ;;
    help)
      show_usage
      ;;
    *)
      log_error "Unknown command: $command"
      show_usage
      exit 1
      ;;
  esac
}

main "$@"
