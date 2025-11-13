#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

class AnalyticsService {
  constructor() {
    this.metrics = new Map();
    this.events = [];
    this.dashboards = new Map();
    this.initMetrics();
  }

  initMetrics() {
    this.metrics.set('users.active', { value: 1250, trend: '+12%' });
    this.metrics.set('courses.completed', { value: 450, trend: '+8%' });
    this.metrics.set('tokens.earned', { value: 125000, trend: '+25%' });
    this.metrics.set('jobs.matched', { value: 380, trend: '+15%' });
  }

  trackEvent(eventType, data) {
    const event = {
      id: `event_${Date.now()}`,
      type: eventType,
      data,
      timestamp: new Date(),
      userId: data.userId || 'anonymous'
    };
    this.events.push(event);
    this.updateMetrics(eventType, data);
    return event;
  }

  updateMetrics(eventType, data) {
    switch (eventType) {
      case 'user.login':
        this.incrementMetric('users.active');
        break;
      case 'course.completed':
        this.incrementMetric('courses.completed');
        break;
      case 'token.earned':
        this.incrementMetric('tokens.earned', data.amount || 1);
        break;
      case 'job.matched':
        this.incrementMetric('jobs.matched');
        break;
    }
  }

  incrementMetric(key, amount = 1) {
    const metric = this.metrics.get(key);
    if (metric) {
      metric.value += amount;
      metric.lastUpdated = new Date();
    }
  }

  generateDashboard(type = 'overview') {
    const dashboard = {
      id: `dashboard_${Date.now()}`,
      type,
      generatedAt: new Date(),
      metrics: Array.from(this.metrics.entries()).map(([key, value]) => ({
        key,
        ...value
      })),
      recentEvents: this.events.slice(-10)
    };
    this.dashboards.set(dashboard.id, dashboard);
    return dashboard;
  }

  getInsights() {
    return {
      totalUsers: this.metrics.get('users.active')?.value || 0,
      growthRate: '+18%',
      topCourses: ['JavaScript Fundamentals', 'Python Basics', 'Blockchain 101'],
      userEngagement: 94.5,
      revenueGrowth: '+25%'
    };
  }
}

const analytics = new AnalyticsService();

app.post('/api/track', (req, res) => {
  try {
    const { eventType, data } = req.body;
    const event = analytics.trackEvent(eventType, data);
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/metrics', (req, res) => {
  const metrics = Array.from(analytics.metrics.entries()).map(([key, value]) => ({
    key,
    ...value
  }));
  res.json({ success: true, data: metrics });
});

app.get('/api/dashboard/:type?', (req, res) => {
  try {
    const dashboard = analytics.generateDashboard(req.params.type);
    res.json({ success: true, data: dashboard });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/insights', (req, res) => {
  const insights = analytics.getInsights();
  res.json({ success: true, data: insights });
});

app.get('/api/events', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const events = analytics.events.slice(-limit);
  res.json({ success: true, data: events });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'Analytics Service',
    status: 'healthy',
    timestamp: new Date(),
    stats: { metrics: analytics.metrics.size, events: analytics.events.length },
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 4017;
app.listen(PORT, () => {
  console.log(`📊 Analytics Service running on port ${PORT}`);
});

module.exports = app;