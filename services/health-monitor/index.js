const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const os = require('os');
const process = require('process');
require('dotenv').config();

class HealthMonitor {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3059;
    this.services = new Map();
    this.metrics = new Map();
    this.alerts = new Map();
    this.thresholds = {
      cpu: 80,
      memory: 85,
      disk: 90,
      responseTime: 5000
    };
    this.setupMiddleware();
    this.setupRoutes();
    this.startMonitoring();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        service: 'health-monitor',
        timestamp: new Date().toISOString(),
        systemHealth: this.getSystemHealth(),
        servicesMonitored: this.services.size
      });
    });

    // Service registration and monitoring
    this.app.post('/api/services/register', this.registerService.bind(this));
    this.app.get('/api/services', this.getServices.bind(this));
    this.app.get('/api/services/:id/health', this.checkServiceHealth.bind(this));
    this.app.delete('/api/services/:id', this.unregisterService.bind(this));

    // System monitoring
    this.app.get('/api/system/health', this.getSystemHealth.bind(this));
    this.app.get('/api/system/metrics', this.getSystemMetrics.bind(this));
    this.app.get('/api/system/performance', this.getPerformanceMetrics.bind(this));

    // Metrics and monitoring
    this.app.post('/api/metrics/record', this.recordMetric.bind(this));
    this.app.get('/api/metrics', this.getMetrics.bind(this));
    this.app.get('/api/metrics/:type', this.getMetricsByType.bind(this));

    // Alerts and notifications
    this.app.get('/api/alerts', this.getAlerts.bind(this));
    this.app.post('/api/alerts/acknowledge', this.acknowledgeAlert.bind(this));
    this.app.get('/api/alerts/active', this.getActiveAlerts.bind(this));

    // Dashboard and reporting
    this.app.get('/api/dashboard', this.getDashboard.bind(this));
    this.app.get('/api/reports/uptime', this.getUptimeReport.bind(this));
    this.app.get('/api/reports/performance', this.getPerformanceReport.bind(this));
  }

  registerService(req, res) {
    try {
      const { name, url, healthEndpoint, checkInterval = 30000 } = req.body;
      
      if (!name || !url) {
        return res.status(400).json({ error: 'Service name and URL are required' });
      }

      const serviceId = `service_${Date.now()}`;
      const service = {
        id: serviceId,
        name,
        url,
        healthEndpoint: healthEndpoint || '/health',
        checkInterval,
        status: 'unknown',
        lastCheck: null,
        uptime: 0,
        responseTime: 0,
        registeredAt: new Date().toISOString()
      };

      this.services.set(serviceId, service);
      this.startServiceMonitoring(serviceId);
      
      res.json({ 
        success: true, 
        serviceId,
        message: 'Service registered successfully' 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async startServiceMonitoring(serviceId) {
    const service = this.services.get(serviceId);
    if (!service) return;

    const checkHealth = async () => {
      try {
        const startTime = Date.now();
        const response = await fetch(`${service.url}${service.healthEndpoint}`);
        const responseTime = Date.now() - startTime;
        
        service.status = response.ok ? 'healthy' : 'unhealthy';
        service.responseTime = responseTime;
        service.lastCheck = new Date().toISOString();
        
        if (response.ok) {
          service.uptime = (service.uptime || 0) + 1;
        } else {
          this.createAlert('service_down', `Service ${service.name} is down`, 'high');
        }
        
        if (responseTime > this.thresholds.responseTime) {
          this.createAlert('slow_response', `Service ${service.name} response time: ${responseTime}ms`, 'medium');
        }
        
        this.services.set(serviceId, service);
      } catch (error) {
        service.status = 'error';
        service.lastCheck = new Date().toISOString();
        this.createAlert('service_error', `Service ${service.name} error: ${error.message}`, 'high');
        this.services.set(serviceId, service);
      }
    };

    // Initial check
    await checkHealth();
    
    // Schedule regular checks
    setInterval(checkHealth, service.checkInterval);
  }

  getServices(req, res) {
    try {
      const services = Array.from(this.services.values());
      res.json({ services });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  checkServiceHealth(req, res) {
    try {
      const { id } = req.params;
      const service = this.services.get(id);
      
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      res.json({ service });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  unregisterService(req, res) {
    try {
      const { id } = req.params;
      
      if (!this.services.has(id)) {
        return res.status(404).json({ error: 'Service not found' });
      }

      this.services.delete(id);
      res.json({ success: true, message: 'Service unregistered successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getSystemHealth(req, res) {
    try {
      const health = {
        cpu: {
          usage: this.getCpuUsage(),
          cores: os.cpus().length,
          model: os.cpus()[0]?.model
        },
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
        },
        disk: this.getDiskUsage(),
        network: os.networkInterfaces(),
        uptime: os.uptime(),
        loadAverage: os.loadavg(),
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        timestamp: new Date().toISOString()
      };

      // Check thresholds and create alerts
      if (health.cpu.usage > this.thresholds.cpu) {
        this.createAlert('high_cpu', `CPU usage: ${health.cpu.usage}%`, 'high');
      }
      
      if (parseFloat(health.memory.usage) > this.thresholds.memory) {
        this.createAlert('high_memory', `Memory usage: ${health.memory.usage}%`, 'high');
      }

      if (typeof res === 'object' && res.json) {
        res.json({ health });
      } else {
        return health;
      }
    } catch (error) {
      if (typeof res === 'object' && res.status) {
        res.status(500).json({ error: error.message });
      } else {
        throw error;
      }
    }
  }

  getCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (let type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    return ((1 - totalIdle / totalTick) * 100).toFixed(2);
  }

  getDiskUsage() {
    // Simplified disk usage - in production, use proper disk monitoring
    return {
      total: '100GB',
      used: '45GB',
      free: '55GB',
      usage: '45%'
    };
  }

  getSystemMetrics(req, res) {
    try {
      const metrics = {
        process: {
          pid: process.pid,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          version: process.version,
          platform: process.platform
        },
        system: this.getSystemHealth(),
        services: {
          total: this.services.size,
          healthy: Array.from(this.services.values()).filter(s => s.status === 'healthy').length,
          unhealthy: Array.from(this.services.values()).filter(s => s.status === 'unhealthy').length
        }
      };

      res.json({ metrics });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getPerformanceMetrics(req, res) {
    try {
      const services = Array.from(this.services.values());
      const avgResponseTime = services.reduce((sum, s) => sum + (s.responseTime || 0), 0) / services.length;
      
      const performance = {
        averageResponseTime: Math.round(avgResponseTime) || 0,
        totalRequests: this.metrics.size,
        errorRate: this.calculateErrorRate(),
        throughput: this.calculateThroughput(),
        availability: this.calculateAvailability()
      };

      res.json({ performance });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  calculateErrorRate() {
    const errorMetrics = Array.from(this.metrics.values())
      .filter(m => m.type === 'error');
    const totalMetrics = this.metrics.size;
    
    return totalMetrics > 0 ? (errorMetrics.length / totalMetrics * 100).toFixed(2) : 0;
  }

  calculateThroughput() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMetrics = Array.from(this.metrics.values())
      .filter(m => new Date(m.timestamp) > oneHourAgo);
    
    return recentMetrics.length;
  }

  calculateAvailability() {
    const services = Array.from(this.services.values());
    if (services.length === 0) return 100;
    
    const healthyServices = services.filter(s => s.status === 'healthy').length;
    return ((healthyServices / services.length) * 100).toFixed(2);
  }

  recordMetric(req, res) {
    try {
      const { type, value, metadata = {} } = req.body;
      
      if (!type || value === undefined) {
        return res.status(400).json({ error: 'Type and value are required' });
      }

      const metricId = `metric_${Date.now()}`;
      const metric = {
        id: metricId,
        type,
        value,
        metadata,
        timestamp: new Date().toISOString()
      };

      this.metrics.set(metricId, metric);
      
      res.json({ 
        success: true, 
        metricId,
        message: 'Metric recorded successfully' 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getMetrics(req, res) {
    try {
      const { limit = 100, offset = 0 } = req.query;
      const metrics = Array.from(this.metrics.values())
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(offset, offset + parseInt(limit));

      res.json({
        metrics,
        total: this.metrics.size,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getMetricsByType(req, res) {
    try {
      const { type } = req.params;
      const { limit = 100 } = req.query;
      
      const typeMetrics = Array.from(this.metrics.values())
        .filter(metric => metric.type === type)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, parseInt(limit));

      res.json({
        type,
        metrics: typeMetrics,
        count: typeMetrics.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  createAlert(type, message, severity = 'medium') {
    const alertId = `alert_${Date.now()}`;
    const alert = {
      id: alertId,
      type,
      message,
      severity,
      status: 'active',
      createdAt: new Date().toISOString(),
      acknowledgedAt: null
    };

    this.alerts.set(alertId, alert);
    console.log(`🚨 ALERT [${severity.toUpperCase()}]: ${message}`);
  }

  getAlerts(req, res) {
    try {
      const alerts = Array.from(this.alerts.values())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({ alerts });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  acknowledgeAlert(req, res) {
    try {
      const { alertId } = req.body;
      const alert = this.alerts.get(alertId);
      
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      alert.status = 'acknowledged';
      alert.acknowledgedAt = new Date().toISOString();
      this.alerts.set(alertId, alert);
      
      res.json({ 
        success: true, 
        message: 'Alert acknowledged successfully' 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getActiveAlerts(req, res) {
    try {
      const activeAlerts = Array.from(this.alerts.values())
        .filter(alert => alert.status === 'active')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({ alerts: activeAlerts, count: activeAlerts.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getDashboard(req, res) {
    try {
      const systemHealth = this.getSystemHealth();
      const services = Array.from(this.services.values());
      const activeAlerts = Array.from(this.alerts.values())
        .filter(alert => alert.status === 'active');

      const dashboard = {
        overview: {
          systemStatus: 'operational',
          servicesMonitored: services.length,
          healthyServices: services.filter(s => s.status === 'healthy').length,
          activeAlerts: activeAlerts.length,
          uptime: os.uptime()
        },
        systemHealth,
        services: services.slice(0, 10),
        recentAlerts: activeAlerts.slice(0, 5),
        performance: {
          avgResponseTime: services.reduce((sum, s) => sum + (s.responseTime || 0), 0) / services.length || 0,
          availability: this.calculateAvailability(),
          errorRate: this.calculateErrorRate()
        }
      };

      res.json({ dashboard });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getUptimeReport(req, res) {
    try {
      const services = Array.from(this.services.values());
      const report = services.map(service => ({
        name: service.name,
        uptime: service.uptime || 0,
        status: service.status,
        lastCheck: service.lastCheck,
        availability: service.uptime > 0 ? ((service.uptime / (service.uptime + 1)) * 100).toFixed(2) : 0
      }));

      res.json({ report, generatedAt: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getPerformanceReport(req, res) {
    try {
      const services = Array.from(this.services.values());
      const report = {
        summary: {
          totalServices: services.length,
          averageResponseTime: services.reduce((sum, s) => sum + (s.responseTime || 0), 0) / services.length || 0,
          availability: this.calculateAvailability()
        },
        services: services.map(service => ({
          name: service.name,
          responseTime: service.responseTime || 0,
          status: service.status,
          uptime: service.uptime || 0
        }))
      };

      res.json({ report, generatedAt: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  startMonitoring() {
    // Monitor system health every 30 seconds
    setInterval(() => {
      this.getSystemHealth();
    }, 30000);

    console.log('✅ Health monitoring started');
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`✅ Health Monitor Service running on port ${this.port}`);
    });
  }
}

const service = new HealthMonitor();
if (require.main === module) service.start();
module.exports = service;
