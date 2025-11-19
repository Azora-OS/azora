# Data Retention Policies

## Retention Periods by Data Type

### User Data
- **Profile Data**: 7 years after account deletion
- **Authentication Logs**: 2 years
- **Activity Logs**: 1 year
- **Session Data**: 30 days

### Financial Data
- **Transaction Records**: 7 years (regulatory requirement)
- **Payment Data**: 3 years
- **Invoice Data**: 7 years
- **Audit Logs**: 10 years

### Educational Data
- **Course Progress**: 5 years after completion
- **Certificates**: Permanent
- **Assessment Data**: 3 years
- **Learning Analytics**: 2 years

### System Data
- **Application Logs**: 90 days
- **Error Logs**: 1 year
- **Performance Metrics**: 6 months
- **Security Logs**: 2 years

## Automated Deletion Implementation

### Database Schema
```sql
-- Add retention metadata to tables
ALTER TABLE users ADD COLUMN retention_date TIMESTAMP;
ALTER TABLE transactions ADD COLUMN retention_date TIMESTAMP;
ALTER TABLE logs ADD COLUMN retention_date TIMESTAMP;

-- Create retention policy table
CREATE TABLE retention_policies (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    retention_days INTEGER NOT NULL,
    last_cleanup TIMESTAMP DEFAULT NOW()
);

-- Insert policies
INSERT INTO retention_policies (table_name, retention_days) VALUES
('user_sessions', 30),
('activity_logs', 365),
('application_logs', 90),
('error_logs', 365);
```

### Cleanup Service
```javascript
// services/data-retention/cleanup.js
const { Pool } = require('pg');

class DataRetentionService {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
    }

    async runCleanup() {
        const policies = await this.getPolicies();
        
        for (const policy of policies) {
            await this.cleanupTable(policy);
        }
    }

    async getPolicies() {
        const result = await this.pool.query(
            'SELECT * FROM retention_policies'
        );
        return result.rows;
    }

    async cleanupTable(policy) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - policy.retention_days);

        const query = `
            DELETE FROM ${policy.table_name} 
            WHERE created_at < $1
        `;
        
        const result = await this.pool.query(query, [cutoffDate]);
        
        await this.pool.query(
            'UPDATE retention_policies SET last_cleanup = NOW() WHERE id = $1',
            [policy.id]
        );

        console.log(`Cleaned ${result.rowCount} records from ${policy.table_name}`);
    }
}

module.exports = DataRetentionService;
```

### Cron Job Configuration
```yaml
# k8s/data-retention-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: data-retention-cleanup
spec:
  schedule: "0 2 * * 0"  # Weekly on Sunday 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cleanup
            image: azora/data-retention:latest
            command: ["node", "cleanup.js"]
            env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
          restartPolicy: OnFailure
```

## Data Archival Process

### Archive Configuration
```javascript
// Archive old data to cold storage
const archiveConfig = {
    transactions: {
        archiveAfterDays: 2555, // 7 years
        destination: 's3://azora-archives/transactions/'
    },
    user_activity: {
        archiveAfterDays: 365,
        destination: 's3://azora-archives/activity/'
    }
};

async function archiveData(tableName, config) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.archiveAfterDays);
    
    // Export to S3
    const data = await pool.query(
        `SELECT * FROM ${tableName} WHERE created_at < $1`,
        [cutoffDate]
    );
    
    await uploadToS3(config.destination, data.rows);
    
    // Delete archived data
    await pool.query(
        `DELETE FROM ${tableName} WHERE created_at < $1`,
        [cutoffDate]
    );
}
```

## Compliance Requirements

### GDPR Right to be Forgotten
```javascript
async function deleteUserData(userId) {
    const tables = [
        'users', 'user_profiles', 'user_sessions',
        'activity_logs', 'preferences', 'notifications'
    ];
    
    for (const table of tables) {
        await pool.query(
            `DELETE FROM ${table} WHERE user_id = $1`,
            [userId]
        );
    }
    
    // Anonymize transaction records (keep for financial compliance)
    await pool.query(
        `UPDATE transactions SET user_id = NULL, user_email = 'deleted@user.com' 
         WHERE user_id = $1`,
        [userId]
    );
}
```

### Data Retention Report
```javascript
async function generateRetentionReport() {
    const report = await pool.query(`
        SELECT 
            table_name,
            COUNT(*) as total_records,
            MIN(created_at) as oldest_record,
            MAX(created_at) as newest_record
        FROM information_schema.tables t
        JOIN retention_policies p ON t.table_name = p.table_name
        GROUP BY table_name
    `);
    
    return report.rows;
}
```