# Data Backup Automation

## Backup Strategy

### Backup Types
- **Full Backup**: Complete database dump (Weekly)
- **Incremental Backup**: Changes since last backup (Daily)
- **Transaction Log Backup**: Continuous (Every 15 minutes)
- **File System Backup**: Application files and configs (Daily)

### Retention Schedule
- **Daily Backups**: 30 days
- **Weekly Backups**: 12 weeks
- **Monthly Backups**: 12 months
- **Yearly Backups**: 7 years

## Database Backup Automation

### PostgreSQL Backup Script
```bash
#!/bin/bash
# backup-database.sh

DB_NAME="azora_prod"
BACKUP_DIR="/backups/database"
S3_BUCKET="azora-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Full backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
    --verbose --clean --no-owner --no-privileges \
    --format=custom \
    --file="$BACKUP_DIR/full_backup_$DATE.dump"

# Compress backup
gzip "$BACKUP_DIR/full_backup_$DATE.dump"

# Upload to S3
aws s3 cp "$BACKUP_DIR/full_backup_$DATE.dump.gz" \
    "s3://$S3_BUCKET/database/full/"

# Verify backup integrity
pg_restore --list "$BACKUP_DIR/full_backup_$DATE.dump.gz" > /dev/null
if [ $? -eq 0 ]; then
    echo "Backup verification successful"
else
    echo "Backup verification failed" >&2
    exit 1
fi

# Cleanup old local backups
find $BACKUP_DIR -name "*.dump.gz" -mtime +7 -delete
```

### Incremental Backup
```bash
#!/bin/bash
# incremental-backup.sh

LAST_BACKUP_TIME=$(cat /var/lib/postgresql/last_backup_time)
CURRENT_TIME=$(date -Iseconds)

# WAL archiving for point-in-time recovery
pg_receivewal -h $DB_HOST -U $DB_USER -D /backups/wal --synchronous

# Archive WAL files to S3
aws s3 sync /backups/wal/ s3://$S3_BUCKET/wal/

# Update last backup time
echo $CURRENT_TIME > /var/lib/postgresql/last_backup_time
```

## Kubernetes Backup Configuration

### Database Backup CronJob
```yaml
# k8s/database-backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15
            command: ["/bin/bash", "/scripts/backup-database.sh"]
            env:
            - name: DB_HOST
              value: "postgres-primary"
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: username
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: password
            volumeMounts:
            - name: backup-scripts
              mountPath: /scripts
            - name: backup-storage
              mountPath: /backups
          volumes:
          - name: backup-scripts
            configMap:
              name: backup-scripts
              defaultMode: 0755
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

### File System Backup
```yaml
# k8s/filesystem-backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: filesystem-backup
spec:
  schedule: "0 3 * * *"  # Daily at 3 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: azora/backup-tools:latest
            command: ["/bin/bash", "/scripts/backup-filesystem.sh"]
            volumeMounts:
            - name: app-data
              mountPath: /app-data
              readOnly: true
            - name: backup-storage
              mountPath: /backups
          volumes:
          - name: app-data
            persistentVolumeClaim:
              claimName: app-data-pvc
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

## Backup Service Implementation

### Backup Manager
```javascript
const AWS = require('aws-sdk');
const { exec } = require('child_process');
const fs = require('fs').promises;

class BackupManager {
    constructor() {
        this.s3 = new AWS.S3();
        this.backupConfig = {
            database: {
                schedule: '0 2 * * *',
                retention: 30,
                type: 'full'
            },
            files: {
                schedule: '0 3 * * *',
                retention: 7,
                type: 'incremental'
            }
        };
    }
    
    async createDatabaseBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `db_backup_${timestamp}.sql`;
        const localPath = `/tmp/${filename}`;
        
        try {
            // Create backup
            await this.execCommand(
                `pg_dump ${process.env.DATABASE_URL} > ${localPath}`
            );
            
            // Compress
            await this.execCommand(`gzip ${localPath}`);
            
            // Upload to S3
            const s3Key = `database/${filename}.gz`;
            await this.uploadToS3(`${localPath}.gz`, s3Key);
            
            // Verify backup
            await this.verifyBackup(`${localPath}.gz`);
            
            // Cleanup local file
            await fs.unlink(`${localPath}.gz`);
            
            return { success: true, key: s3Key, size: await this.getFileSize(`${localPath}.gz`) };
        } catch (error) {
            console.error('Database backup failed:', error);
            throw error;
        }
    }
    
    async createFileSystemBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `files_backup_${timestamp}.tar.gz`;
        const localPath = `/tmp/${filename}`;
        
        try {
            // Create compressed archive
            await this.execCommand(
                `tar -czf ${localPath} -C /app uploads configs logs`
            );
            
            // Upload to S3
            const s3Key = `filesystem/${filename}`;
            await this.uploadToS3(localPath, s3Key);
            
            // Cleanup
            await fs.unlink(localPath);
            
            return { success: true, key: s3Key };
        } catch (error) {
            console.error('Filesystem backup failed:', error);
            throw error;
        }
    }
    
    async uploadToS3(localPath, s3Key) {
        const fileContent = await fs.readFile(localPath);
        
        const params = {
            Bucket: process.env.BACKUP_BUCKET,
            Key: s3Key,
            Body: fileContent,
            StorageClass: 'STANDARD_IA'
        };
        
        return this.s3.upload(params).promise();
    }
    
    async verifyBackup(backupPath) {
        // Test if backup can be restored
        const testDb = 'backup_test_' + Date.now();
        
        try {
            await this.execCommand(`createdb ${testDb}`);
            await this.execCommand(`gunzip -c ${backupPath} | psql ${testDb}`);
            await this.execCommand(`dropdb ${testDb}`);
            return true;
        } catch (error) {
            console.error('Backup verification failed:', error);
            throw new Error('Backup verification failed');
        }
    }
    
    async execCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }
    
    async getFileSize(filePath) {
        const stats = await fs.stat(filePath);
        return stats.size;
    }
}
```

## Backup Monitoring

### Backup Status Tracking
```javascript
class BackupMonitor {
    async trackBackupJob(type, status, metadata = {}) {
        await pool.query(`
            INSERT INTO backup_jobs (type, status, metadata, created_at)
            VALUES ($1, $2, $3, NOW())
        `, [type, status, JSON.stringify(metadata)]);
    }
    
    async getBackupStatus() {
        const result = await pool.query(`
            SELECT 
                type,
                status,
                COUNT(*) as count,
                MAX(created_at) as last_backup
            FROM backup_jobs 
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY type, status
            ORDER BY type, status
        `);
        
        return result.rows;
    }
    
    async checkBackupHealth() {
        const issues = [];
        
        // Check if backups are running on schedule
        const lastBackup = await pool.query(`
            SELECT type, MAX(created_at) as last_run
            FROM backup_jobs 
            WHERE status = 'success'
            GROUP BY type
        `);
        
        for (const backup of lastBackup.rows) {
            const hoursSinceLastBackup = 
                (Date.now() - new Date(backup.last_run)) / (1000 * 60 * 60);
            
            if (backup.type === 'database' && hoursSinceLastBackup > 25) {
                issues.push(`Database backup overdue: ${hoursSinceLastBackup}h`);
            }
            
            if (backup.type === 'filesystem' && hoursSinceLastBackup > 25) {
                issues.push(`Filesystem backup overdue: ${hoursSinceLastBackup}h`);
            }
        }
        
        return issues;
    }
}
```

## Backup Recovery Procedures

### Database Recovery
```bash
#!/bin/bash
# restore-database.sh

BACKUP_FILE=$1
TARGET_DB=${2:-azora_prod}

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file> [target_db]"
    exit 1
fi

# Download backup from S3 if needed
if [[ $BACKUP_FILE == s3://* ]]; then
    LOCAL_FILE="/tmp/$(basename $BACKUP_FILE)"
    aws s3 cp "$BACKUP_FILE" "$LOCAL_FILE"
    BACKUP_FILE="$LOCAL_FILE"
fi

# Stop application services
kubectl scale deployment api-gateway --replicas=0
kubectl scale deployment auth-service --replicas=0

# Drop and recreate database
dropdb $TARGET_DB
createdb $TARGET_DB

# Restore from backup
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | pg_restore -d $TARGET_DB --verbose
else
    pg_restore -d $TARGET_DB --verbose "$BACKUP_FILE"
fi

# Restart services
kubectl scale deployment api-gateway --replicas=3
kubectl scale deployment auth-service --replicas=2

echo "Database restore completed"
```

### Point-in-Time Recovery
```bash
#!/bin/bash
# point-in-time-recovery.sh

RECOVERY_TIME=$1  # Format: 2024-01-15 14:30:00

# Stop database
kubectl scale statefulset postgres --replicas=0

# Restore base backup
pg_basebackup -h postgres-primary -D /var/lib/postgresql/data -U postgres

# Configure recovery
cat > /var/lib/postgresql/data/recovery.conf << EOF
restore_command = 'aws s3 cp s3://azora-backups/wal/%f %p'
recovery_target_time = '$RECOVERY_TIME'
recovery_target_action = 'promote'
EOF

# Start database in recovery mode
kubectl scale statefulset postgres --replicas=1

echo "Point-in-time recovery initiated to $RECOVERY_TIME"
```

## Backup Retention Management

### Automated Cleanup
```javascript
class BackupRetentionManager {
    async cleanupOldBackups() {
        const retentionPolicies = {
            'database/daily/': 30,    // 30 days
            'database/weekly/': 84,   // 12 weeks
            'database/monthly/': 365, // 12 months
            'filesystem/': 7          // 7 days
        };
        
        for (const [prefix, retentionDays] of Object.entries(retentionPolicies)) {
            await this.cleanupPrefix(prefix, retentionDays);
        }
    }
    
    async cleanupPrefix(prefix, retentionDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        
        const params = {
            Bucket: process.env.BACKUP_BUCKET,
            Prefix: prefix
        };
        
        const objects = await this.s3.listObjectsV2(params).promise();
        const toDelete = objects.Contents.filter(obj => 
            new Date(obj.LastModified) < cutoffDate
        );
        
        if (toDelete.length > 0) {
            const deleteParams = {
                Bucket: process.env.BACKUP_BUCKET,
                Delete: {
                    Objects: toDelete.map(obj => ({ Key: obj.Key }))
                }
            };
            
            await this.s3.deleteObjects(deleteParams).promise();
            console.log(`Deleted ${toDelete.length} old backups from ${prefix}`);
        }
    }
}
```

## Backup Testing

### Automated Backup Testing
```javascript
class BackupTester {
    async testBackupRecovery() {
        const testResults = [];
        
        // Test database backup
        try {
            const dbResult = await this.testDatabaseRestore();
            testResults.push({ type: 'database', success: true, ...dbResult });
        } catch (error) {
            testResults.push({ type: 'database', success: false, error: error.message });
        }
        
        // Test filesystem backup
        try {
            const fsResult = await this.testFilesystemRestore();
            testResults.push({ type: 'filesystem', success: true, ...fsResult });
        } catch (error) {
            testResults.push({ type: 'filesystem', success: false, error: error.message });
        }
        
        return testResults;
    }
    
    async testDatabaseRestore() {
        const testDb = 'backup_test_' + Date.now();
        const latestBackup = await this.getLatestBackup('database/');
        
        // Create test database and restore
        await this.execCommand(`createdb ${testDb}`);
        await this.restoreBackup(latestBackup, testDb);
        
        // Verify data integrity
        const tableCount = await this.getTableCount(testDb);
        
        // Cleanup
        await this.execCommand(`dropdb ${testDb}`);
        
        return { tableCount, backupFile: latestBackup };
    }
}
```