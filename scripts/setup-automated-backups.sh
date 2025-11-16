#!/bin/bash

# Setup automated database backups using cron
# This script configures daily backups at 2 AM

set -e

BACKUP_SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/db-backup.sh"
CRON_JOB="0 2 * * * $BACKUP_SCRIPT"

echo "Setting up automated database backups..."

# Check if cron is available (Linux/Mac)
if command -v crontab >/dev/null 2>&1; then
    echo "Using cron for scheduling..."

    # Check if backup job already exists
    if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
        echo "Backup job already exists in crontab"
    else
        # Add the backup job to crontab
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        echo "Added backup job to crontab: $CRON_JOB"
    fi

    echo "Current crontab:"
    crontab -l

# Check if Windows Task Scheduler is available
elif command -v schtasks >/dev/null 2>&1; then
    echo "Using Windows Task Scheduler..."

    TASK_NAME="AzoraDatabaseBackup"

    # Check if task already exists
    if schtasks /query /tn "$TASK_NAME" 2>/dev/null; then
        echo "Backup task already exists: $TASK_NAME"
    else
        # Create daily task at 2 AM
        schtasks /create /tn "$TASK_NAME" /tr "$BACKUP_SCRIPT" /sc daily /st 02:00 /ru System
        echo "Created Windows scheduled task: $TASK_NAME"
    fi

else
    echo "Warning: Neither cron nor schtasks found. Please manually schedule:"
    echo "  Linux/Mac: Add to crontab -e: $CRON_JOB"
    echo "  Windows: Use Task Scheduler to run $BACKUP_SCRIPT daily at 2:00 AM"
fi

echo "Automated backup setup complete!"
echo "Backup script: $BACKUP_SCRIPT"
echo "Schedule: Daily at 2:00 AM"