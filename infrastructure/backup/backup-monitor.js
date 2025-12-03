const express = require('express');
const AWS = require('aws-sdk');
const app = express();

const s3 = new AWS.S3();
const BACKUP_BUCKET = process.env.BACKUP_BUCKET || 'azora-backups';

class BackupMonitor {
    async getBackupStatus() {
        try {
            const [dbBackups, configBackups] = await Promise.all([
                this.listBackups('database/'),
                this.listBackups('config/')
            ]);

            const status = {
                database: this.analyzeBackups(dbBackups),
                config: this.analyzeBackups(configBackups),
                lastCheck: new Date().toISOString()
            };

            return status;
        } catch (error) {
            console.error('Error getting backup status:', error);
            throw error;
        }
    }

    async listBackups(prefix) {
        const params = {
            Bucket: BACKUP_BUCKET,
            Prefix: prefix,
            MaxKeys: 100
        };

        const result = await s3.listObjectsV2(params).promise();
        return result.Contents || [];
    }

    analyzeBackups(backups) {
        if (backups.length === 0) {
            return {
                status: 'error',
                message: 'No backups found',
                count: 0,
                lastBackup: null
            };
        }

        const sortedBackups = backups.sort((a, b) => 
            new Date(b.LastModified) - new Date(a.LastModified)
        );

        const lastBackup = sortedBackups[0];
        const hoursSinceLastBackup = 
            (Date.now() - new Date(lastBackup.LastModified)) / (1000 * 60 * 60);

        let status = 'healthy';
        let message = 'Backups are up to date';

        if (hoursSinceLastBackup > 25) {
            status = 'warning';
            message = `Last backup was ${Math.round(hoursSinceLastBackup)} hours ago`;
        }

        if (hoursSinceLastBackup > 48) {
            status = 'error';
            message = `Backups are severely overdue (${Math.round(hoursSinceLastBackup)} hours)`;
        }

        return {
            status,
            message,
            count: backups.length,
            lastBackup: lastBackup.LastModified,
            totalSize: backups.reduce((sum, backup) => sum + backup.Size, 0)
        };
    }

    async checkBackupIntegrity() {
        try {
            const dbBackups = await this.listBackups('database/');
            const results = [];

            for (const backup of dbBackups.slice(0, 5)) { // Check last 5 backups
                const integrity = await this.verifyBackupIntegrity(backup);
                results.push({
                    file: backup.Key,
                    size: backup.Size,
                    lastModified: backup.LastModified,
                    integrity
                });
            }

            return results;
        } catch (error) {
            console.error('Error checking backup integrity:', error);
            throw error;
        }
    }

    async verifyBackupIntegrity(backup) {
        try {
            // Check if file exists and is accessible
            const headParams = {
                Bucket: BACKUP_BUCKET,
                Key: backup.Key
            };

            await s3.headObject(headParams).promise();

            // Basic integrity check - file size should be reasonable
            if (backup.Size < 1000) {
                return { valid: false, reason: 'File too small' };
            }

            if (backup.Size > 10 * 1024 * 1024 * 1024) { // 10GB
                return { valid: false, reason: 'File suspiciously large' };
            }

            return { valid: true, reason: 'File appears valid' };
        } catch (error) {
            return { valid: false, reason: error.message };
        }
    }
}

const monitor = new BackupMonitor();

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/backup-status', async (req, res) => {
    try {
        const status = await monitor.getBackupStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/backup-integrity', async (req, res) => {
    try {
        const integrity = await monitor.checkBackupIntegrity();
        res.json(integrity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/metrics', async (req, res) => {
    try {
        const status = await monitor.getBackupStatus();
        
        const metrics = [
            `# HELP backup_count Number of backups`,
            `# TYPE backup_count gauge`,
            `backup_count{type="database"} ${status.database.count}`,
            `backup_count{type="config"} ${status.config.count}`,
            ``,
            `# HELP backup_status Backup status (0=error, 1=warning, 2=healthy)`,
            `# TYPE backup_status gauge`,
            `backup_status{type="database"} ${status.database.status === 'healthy' ? 2 : status.database.status === 'warning' ? 1 : 0}`,
            `backup_status{type="config"} ${status.config.status === 'healthy' ? 2 : status.config.status === 'warning' ? 1 : 0}`,
        ].join('\n');

        res.set('Content-Type', 'text/plain');
        res.send(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Backup monitor running on port ${PORT}`);
});