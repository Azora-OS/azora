const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3033;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'analytics-dashboard' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// In-memory storage for analytics data (in production, use a database)
const metricsData = new Map();
const reports = new Map();
const visualizations = new Map();

// Initialize with sample data
metricsData.set('users', {
  total: 12500,
  active: 8750,
  new: 450
});

metricsData.set('revenue', {
  total: 2500000,
  monthly: 325000,
  growth: 12.5
});

metricsData.set('engagement', {
  avgSession: '15m',
  pageViews: 45000,
  bounceRate: 32
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'analytics-dashboard',
    timestamp: new Date().toISOString()
  });
});

// Get all dashboard metrics
app.get('/api/metrics', (req, res) => {
  try {
    const metrics = {};
    for (const [key, value] of metricsData) {
      metrics[key] = value;
    }

    res.json({
      success: true,
      data: {
        metrics,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific metric
app.get('/api/metrics/:metricType', (req, res) => {
  try {
    const { metricType } = req.params;
    const metric = metricsData.get(metricType);

    if (!metric) {
      return res.status(404).json({ error: 'Metric not found' });
    }

    res.json({
      success: true,
      data: {
        type: metricType,
        value: metric,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching metric:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update metrics
app.put('/api/metrics/:metricType', (req, res) => {
  try {
    const { metricType } = req.params;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }

    metricsData.set(metricType, value);

    logger.info(`Metric ${metricType} updated`);

    res.json({
      success: true,
      data: {
        type: metricType,
        value,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error updating metric:', error);
    res.status(500).json({ error: error.message });
  }
});

// Report generation endpoint
app.post('/api/reports', (req, res) => {
  try {
    const { type, period, filters } = req.body;

    if (!type || !period) {
      return res.status(400).json({ error: 'Type and period are required' });
    }

    const reportId = uuidv4();
    const report = {
      id: reportId,
      type,
      period,
      filters: filters || {},
      status: 'generated',
      data: generateSampleReportData(type, period),
      generatedAt: new Date().toISOString()
    };

    reports.set(reportId, report);

    logger.info(`Report ${reportId} generated`);

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error generating report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all reports
app.get('/api/reports', (req, res) => {
  try {
    const reportList = Array.from(reports.values());

    res.json({
      success: true,
      data: reportList
    });
  } catch (error) {
    logger.error('Error fetching reports:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific report
app.get('/api/reports/:reportId', (req, res) => {
  try {
    const { reportId } = req.params;
    const report = reports.get(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error fetching report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Data visualization endpoint
app.get('/api/visualizations/:type', (req, res) => {
  try {
    const { type } = req.params;
    const { period, filters } = req.query;

    const visualization = {
      id: uuidv4(),
      type,
      period: period || 'monthly',
      filters: filters || {},
      data: generateSampleVisualizationData(type, period),
      createdAt: new Date().toISOString()
    };

    visualizations.set(visualization.id, visualization);

    res.json({
      success: true,
      data: visualization
    });
  } catch (error) {
    logger.error('Error generating visualization:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all visualizations
app.get('/api/visualizations', (req, res) => {
  try {
    const visualizationList = Array.from(visualizations.values());

    res.json({
      success: true,
      data: visualizationList
    });
  } catch (error) {
    logger.error('Error fetching visualizations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate sample report data
function generateSampleReportData(type, period) {
  switch (type) {
    case 'user-engagement':
      return {
        totalUsers: 12500,
        activeUsers: 8750,
        newUserGrowth: 450,
        engagementRate: 72.5,
        avgSessionDuration: '15m 32s'
      };
    case 'revenue':
      return {
        totalRevenue: 2500000,
        monthlyRevenue: 325000,
        growthRate: 12.5,
        topRevenueSources: ['Subscriptions', 'Premium Features', 'Marketplace']
      };
    case 'performance':
      return {
        uptime: 99.9,
        responseTime: '125ms',
        errorRate: 0.2,
        throughput: '1500 req/s'
      };
    default:
      return {
        message: `Sample report for ${type} during ${period}`,
        dataPoints: Array.from({length: 10}, (_, i) => ({
          label: `Point ${i+1}`,
          value: Math.floor(Math.random() * 1000) + 100
        }))
      };
  }
}

// Helper function to generate sample visualization data
function generateSampleVisualizationData(type, period) {
  return Array.from({length: 12}, (_, i) => ({
    label: period === 'daily' ? `Day ${i+1}` :
           period === 'weekly' ? `Week ${i+1}` :
           `Month ${i+1}`,
    value: Math.floor(Math.random() * 1000) + 100
  }));
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`Analytics Dashboard Service running on port ${PORT}`);
});

module.exports = app;
