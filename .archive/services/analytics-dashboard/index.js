const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

class AnalyticsDashboard {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3055;
    this.metrics = new Map();
    this.reports = new Map();
    this.dashboards = new Map();
    this.setupMiddleware();
    this.setupRoutes();
    this.initializeDefaultDashboards();
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
        service: 'analytics-dashboard',
        timestamp: new Date().toISOString(),
        metrics: this.metrics.size,
        reports: this.reports.size,
        dashboards: this.dashboards.size
      });
    });

    // Metrics endpoints
    this.app.post('/api/metrics/track', this.trackMetric.bind(this));
    this.app.get('/api/metrics', this.getMetrics.bind(this));
    this.app.get('/api/metrics/:type', this.getMetricsByType.bind(this));

    // Reports endpoints
    this.app.post('/api/reports/generate', this.generateReport.bind(this));
    this.app.get('/api/reports', this.getReports.bind(this));
    this.app.get('/api/reports/:id', this.getReport.bind(this));

    // Dashboard endpoints
    this.app.get('/api/dashboards', this.getDashboards.bind(this));
    this.app.get('/api/dashboards/:id', this.getDashboard.bind(this));
    this.app.post('/api/dashboards', this.createDashboard.bind(this));

    // Business Intelligence endpoints
    this.app.get('/api/bi/overview', this.getBusinessOverview.bind(this));
    this.app.get('/api/bi/trends', this.getTrends.bind(this));
    this.app.get('/api/bi/insights', this.getInsights.bind(this));
  }

  trackMetric(req, res) {
    try {
      const { type, value, metadata = {} } = req.body;
      
      if (!type || value === undefined) {
        return res.status(400).json({ error: 'Type and value are required' });
      }

      const metricId = `${type}_${Date.now()}`;
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
        message: 'Metric tracked successfully' 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getMetrics(req, res) {
    try {
      const { limit = 100, offset = 0 } = req.query;
      const allMetrics = Array.from(this.metrics.values())
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(offset, offset + parseInt(limit));

      res.json({
        metrics: allMetrics,
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

  generateReport(req, res) {
    try {
      const { type, dateRange, filters = {} } = req.body;
      
      if (!type) {
        return res.status(400).json({ error: 'Report type is required' });
      }

      const reportId = `report_${Date.now()}`;
      const report = {
        id: reportId,
        type,
        dateRange,
        filters,
        generatedAt: new Date().toISOString(),
        status: 'completed',
        data: this.generateReportData(type, dateRange, filters)
      };

      this.reports.set(reportId, report);
      
      res.json({ 
        success: true, 
        reportId,
        report
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  generateReportData(type, dateRange, filters) {
    return {
      summary: {
        totalUsers: 1250,
        activeUsers: 890,
        revenue: 125000,
        growth: 15.5
      },
      charts: [
        {
          type: 'line',
          title: 'User Growth',
          data: Array.from({length: 30}, (_, i) => ({
            date: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: Math.floor(Math.random() * 100) + 800
          }))
        }
      ]
    };
  }

  getReports(req, res) {
    try {
      const reports = Array.from(this.reports.values())
        .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
      res.json({ reports });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getReport(req, res) {
    try {
      const { id } = req.params;
      const report = this.reports.get(id);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json({ report });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  initializeDefaultDashboards() {
    this.dashboards.set('business-overview', {
      id: 'business-overview',
      name: 'Business Overview',
      description: 'High-level business metrics and KPIs',
      widgets: [
        { type: 'metric', title: 'Total Users', value: 1250, trend: '+15%' },
        { type: 'metric', title: 'Revenue', value: '$125K', trend: '+22%' },
        { type: 'chart', title: 'User Growth', chartType: 'line' }
      ],
      createdAt: new Date().toISOString()
    });
  }

  getDashboards(req, res) {
    try {
      const dashboards = Array.from(this.dashboards.values());
      res.json({ dashboards });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getDashboard(req, res) {
    try {
      const { id } = req.params;
      const dashboard = this.dashboards.get(id);
      
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      res.json({ dashboard });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  createDashboard(req, res) {
    try {
      const { name, description, widgets = [] } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Dashboard name is required' });
      }

      const dashboardId = `dashboard_${Date.now()}`;
      const dashboard = {
        id: dashboardId,
        name,
        description,
        widgets,
        createdAt: new Date().toISOString()
      };

      this.dashboards.set(dashboardId, dashboard);
      
      res.json({ 
        success: true, 
        dashboardId,
        dashboard
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getBusinessOverview(req, res) {
    try {
      const overview = {
        kpis: {
          totalUsers: 1250,
          activeUsers: 890,
          revenue: 125000,
          growth: 15.5
        },
        trends: {
          userGrowth: '+15%',
          revenueGrowth: '+22%'
        }
      };

      res.json({ overview });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getTrends(req, res) {
    try {
      const { period = '30d' } = req.query;
      const days = period === '7d' ? 7 : 30;
      
      const trends = {
        period,
        userTrends: Array.from({length: days}, (_, i) => ({
          date: new Date(Date.now() - (days-1-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 1000) + 500
        }))
      };

      res.json({ trends });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getInsights(req, res) {
    try {
      const insights = [
        {
          type: 'growth',
          title: 'User Growth Acceleration',
          description: 'User registration increased by 35% this week',
          impact: 'high'
        }
      ];

      res.json({ insights });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`✅ Analytics Dashboard Service running on port ${this.port}`);
    });
  }
}

const service = new AnalyticsDashboard();
if (require.main === module) service.start();
module.exports = service;
