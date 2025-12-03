// Azora OS Monitoring Service - Phase 3 Implementation
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const AlertManager = require('./alert-manager');
const DistributedTracing = require('./distributed-tracing');
const CustomMetrics = require('./custom-metrics');
const DashboardGenerator = require('./dashboard-generator');

class MonitoringService {
  constructor() {
    this.app = express();
    this.port = 4020;
    
    // Initialize Phase 3 components
    this.alertManager = new AlertManager();
    this.tracing = new DistributedTracing();
    this.metrics = new CustomMetrics();
    this.dashboards = new DashboardGenerator(this.metrics, this.alertManager);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupAlertHandlers();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100
    }));
    
    // Add distributed tracing middleware
    this.app.use(this.tracing.middleware());
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        service: 'monitoring-service',
        timestamp: new Date().toISOString(),
        phase3_status: 'implemented'
      });
    });

    // Task 10: Alert thresholds
    this.app.get('/alerts/thresholds', (req, res) => {
      res.json(this.alertManager.thresholds);
    });
    
    this.app.put('/alerts/thresholds/:metric/:level', (req, res) => {
      const { metric, level } = req.params;
      const { value } = req.body;
      this.alertManager.updateThreshold(metric, level, value);
      res.json({ success: true });
    });

    // Task 11: Distributed tracing
    this.app.get('/traces/:traceId', (req, res) => {
      const trace = this.tracing.getTrace(req.params.traceId);
      res.json(trace || { error: 'Trace not found' });
    });

    // Task 12: Custom metrics
    this.app.get('/metrics', (req, res) => {
      res.json(this.metrics.getMetrics());
    });
    
    this.app.get('/metrics/prometheus', (req, res) => {
      res.set('Content-Type', 'text/plain');
      res.send(this.metrics.exportPrometheus());
    });

    // Task 13: Advanced dashboards
    this.app.get('/dashboards', (req, res) => {
      res.json(this.dashboards.generateAllDashboards());
    });
    
    this.app.get('/dashboards/:type/grafana', (req, res) => {
      const dashboards = this.dashboards.generateAllDashboards();
      const dashboard = dashboards[req.params.type];
      if (dashboard) {
        res.json(this.dashboards.exportGrafanaDashboard(dashboard));
      } else {
        res.status(404).json({ error: 'Dashboard not found' });
      }
    });

    // Simulate metrics collection
    this.app.post('/simulate/metrics', (req, res) => {
      const { type, data } = req.body;
      
      switch (type) {
        case 'user_registration':
          this.metrics.recordUserRegistration(data.userId, data.source);
          break;
        case 'course_enrollment':
          this.metrics.recordCourseEnrollment(data.courseId, data.userId, data.price);
          break;
        case 'payment':
          this.metrics.recordPaymentTransaction(data.amount, data.currency, data.status);
          break;
      }
      
      res.json({ success: true });
    });
  }

  setupAlertHandlers() {
    this.alertManager.on('alert', (alert) => {
      console.log(`🚨 Alert: ${alert.message}`);
      // In production, send to notification system
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🔍 Monitoring Service running on port ${this.port}`);
      console.log('✅ Phase 3: Monitoring & Observability - IMPLEMENTED');
      console.log('   - Task 10: Alert thresholds ✅');
      console.log('   - Task 11: Distributed tracing ✅');
      console.log('   - Task 12: Custom metrics ✅');
      console.log('   - Task 13: Advanced dashboards ✅');
    });
  }
}

// Initialize and start service
const service = new MonitoringService();
service.start();

module.exports = service;