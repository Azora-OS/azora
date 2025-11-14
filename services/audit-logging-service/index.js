const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const crypto = require('crypto');

class AuditLoggingService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3057;
    this.auditLogs = [];
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'audit-logging', logs: this.auditLogs.length });
    });

    this.app.post('/api/audit/log', this.createLog.bind(this));
    this.app.get('/api/audit/logs', this.getLogs.bind(this));
    this.app.get('/api/audit/logs/:userId', this.getUserLogs.bind(this));
    this.app.get('/api/audit/search', this.searchLogs.bind(this));
  }

  createLog(req, res) {
    const { userId, action, resource, details, ipAddress, userAgent } = req.body;
    
    const log = {
      id: `audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      userId,
      action,
      resource,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      hash: this.generateHash({ userId, action, resource, timestamp: Date.now() })
    };

    this.auditLogs.push(log);
    res.status(201).json({ success: true, log });
  }

  getLogs(req, res) {
    const { limit = 100, offset = 0 } = req.query;
    const logs = this.auditLogs.slice(-limit - offset, -offset || undefined).reverse();
    res.json({ logs, total: this.auditLogs.length });
  }

  getUserLogs(req, res) {
    const logs = this.auditLogs.filter(log => log.userId === req.params.userId);
    res.json({ logs, count: logs.length });
  }

  searchLogs(req, res) {
    const { action, resource, startDate, endDate } = req.query;
    let filtered = this.auditLogs;

    if (action) filtered = filtered.filter(log => log.action === action);
    if (resource) filtered = filtered.filter(log => log.resource === resource);
    if (startDate) filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(startDate));
    if (endDate) filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(endDate));

    res.json({ logs: filtered, count: filtered.length });
  }

  generateHash(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  listen() {
    this.app.listen(this.port, () => console.log(`Audit Logging on port ${this.port}`));
  }
}

const service = new AuditLoggingService();
if (require.main === module) service.listen();
module.exports = service.app;
