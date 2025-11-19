# Data Export Capabilities

## Export API Endpoints

### User Data Export
```javascript
// GET /api/export/user/:userId
app.get('/api/export/user/:userId', async (req, res) => {
    const { userId } = req.params;
    const { format = 'json' } = req.query;
    
    const userData = await exportUserData(userId);
    
    if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.send(convertToCSV(userData));
    } else {
        res.json(userData);
    }
});

async function exportUserData(userId) {
    const [profile, transactions, courses, activity] = await Promise.all([
        pool.query('SELECT * FROM users WHERE id = $1', [userId]),
        pool.query('SELECT * FROM transactions WHERE user_id = $1', [userId]),
        pool.query('SELECT * FROM enrollments WHERE user_id = $1', [userId]),
        pool.query('SELECT * FROM activity_logs WHERE user_id = $1', [userId])
    ]);
    
    return {
        profile: profile.rows[0],
        transactions: transactions.rows,
        courses: courses.rows,
        activity: activity.rows,
        exportedAt: new Date().toISOString()
    };
}
```

### Bulk Export
```javascript
// POST /api/export/bulk
app.post('/api/export/bulk', async (req, res) => {
    const { tables, filters, format } = req.body;
    
    const exportJob = await createExportJob({
        tables,
        filters,
        format,
        requestedBy: req.user.id
    });
    
    res.json({ jobId: exportJob.id, status: 'queued' });
});

async function createExportJob(params) {
    const job = await pool.query(`
        INSERT INTO export_jobs (tables, filters, format, requested_by, status)
        VALUES ($1, $2, $3, $4, 'queued')
        RETURNING *
    `, [JSON.stringify(params.tables), JSON.stringify(params.filters), 
        params.format, params.requestedBy]);
    
    // Queue for processing
    await exportQueue.add('bulk-export', { jobId: job.rows[0].id });
    
    return job.rows[0];
}
```

## Export Formats

### JSON Export
```javascript
function exportToJSON(data) {
    return JSON.stringify(data, null, 2);
}
```

### CSV Export
```javascript
function exportToCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => 
                JSON.stringify(row[header] || '')
            ).join(',')
        )
    ].join('\n');
    
    return csvContent;
}
```

### XML Export
```javascript
function exportToXML(data, rootElement = 'data') {
    const js2xml = require('js2xmlparser');
    return js2xml.parse(rootElement, data);
}
```

## Scheduled Exports

### Export Configuration
```javascript
const exportSchedules = {
    daily_transactions: {
        schedule: '0 1 * * *', // Daily at 1 AM
        query: 'SELECT * FROM transactions WHERE DATE(created_at) = CURRENT_DATE - 1',
        destination: 's3://azora-exports/daily/transactions/',
        format: 'csv'
    },
    weekly_users: {
        schedule: '0 2 * * 0', // Weekly on Sunday
        query: 'SELECT id, email, created_at FROM users WHERE created_at >= NOW() - INTERVAL \'7 days\'',
        destination: 's3://azora-exports/weekly/users/',
        format: 'json'
    }
};
```

### Scheduled Export Service
```javascript
const cron = require('node-cron');

class ScheduledExportService {
    constructor() {
        this.setupSchedules();
    }
    
    setupSchedules() {
        Object.entries(exportSchedules).forEach(([name, config]) => {
            cron.schedule(config.schedule, () => {
                this.runExport(name, config);
            });
        });
    }
    
    async runExport(name, config) {
        try {
            const result = await pool.query(config.query);
            const data = this.formatData(result.rows, config.format);
            
            await this.uploadToDestination(config.destination, data, name);
            
            console.log(`Export ${name} completed successfully`);
        } catch (error) {
            console.error(`Export ${name} failed:`, error);
        }
    }
    
    formatData(data, format) {
        switch (format) {
            case 'csv': return exportToCSV(data);
            case 'xml': return exportToXML(data);
            default: return exportToJSON(data);
        }
    }
    
    async uploadToDestination(destination, data, filename) {
        const timestamp = new Date().toISOString().split('T')[0];
        const key = `${destination}${filename}_${timestamp}`;
        
        await s3.upload({
            Bucket: 'azora-exports',
            Key: key,
            Body: data
        }).promise();
    }
}
```

## Export Job Queue

### Queue Configuration
```javascript
const Queue = require('bull');
const exportQueue = new Queue('export processing', {
    redis: { host: 'redis', port: 6379 }
});

exportQueue.process('bulk-export', async (job) => {
    const { jobId } = job.data;
    
    await updateJobStatus(jobId, 'processing');
    
    try {
        const exportJob = await getExportJob(jobId);
        const data = await executeExport(exportJob);
        const fileUrl = await uploadExportFile(data, exportJob);
        
        await updateJobStatus(jobId, 'completed', { fileUrl });
    } catch (error) {
        await updateJobStatus(jobId, 'failed', { error: error.message });
    }
});

async function executeExport(exportJob) {
    const { tables, filters } = exportJob;
    const results = {};
    
    for (const table of tables) {
        const query = buildQuery(table, filters[table] || {});
        const result = await pool.query(query);
        results[table] = result.rows;
    }
    
    return results;
}

function buildQuery(table, filters) {
    let query = `SELECT * FROM ${table}`;
    const conditions = [];
    
    if (filters.dateFrom) {
        conditions.push(`created_at >= '${filters.dateFrom}'`);
    }
    if (filters.dateTo) {
        conditions.push(`created_at <= '${filters.dateTo}'`);
    }
    
    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    return query;
}
```

## Export Security

### Access Control
```javascript
function checkExportPermissions(req, res, next) {
    const { userId } = req.params;
    
    // Users can only export their own data
    if (req.user.id !== userId && !req.user.roles.includes('admin')) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
}

// Admin-only bulk exports
function requireAdminRole(req, res, next) {
    if (!req.user.roles.includes('admin')) {
        return res.status(403).json({ error: 'Admin role required' });
    }
    next();
}
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const exportLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 exports per window
    message: 'Too many export requests'
});

app.use('/api/export', exportLimiter);
```

## Export Monitoring

### Export Metrics
```javascript
const exportMetrics = {
    totalExports: 0,
    successfulExports: 0,
    failedExports: 0,
    averageExportTime: 0
};

function trackExportMetrics(startTime, success) {
    exportMetrics.totalExports++;
    
    if (success) {
        exportMetrics.successfulExports++;
    } else {
        exportMetrics.failedExports++;
    }
    
    const duration = Date.now() - startTime;
    exportMetrics.averageExportTime = 
        (exportMetrics.averageExportTime + duration) / 2;
}
```

### Export Audit Log
```javascript
async function logExportActivity(userId, exportType, status, details = {}) {
    await pool.query(`
        INSERT INTO export_audit_log 
        (user_id, export_type, status, details, created_at)
        VALUES ($1, $2, $3, $4, NOW())
    `, [userId, exportType, status, JSON.stringify(details)]);
}
```