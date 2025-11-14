const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3012;

const events = [];
const metrics = new Map();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'analytics-service' });
});

app.post('/api/analytics/track', (req, res) => {
  const event = {
    id: Date.now().toString(),
    ...req.body,
    timestamp: new Date()
  };
  
  events.push(event);
  updateMetrics(event);
  
  res.json({ tracked: true, eventId: event.id });
});

app.get('/api/analytics/metrics', (req, res) => {
  const { startDate, endDate, type } = req.query;
  
  let filtered = events;
  
  if (startDate) {
    filtered = filtered.filter(e => new Date(e.timestamp) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(e => new Date(e.timestamp) <= new Date(endDate));
  }
  if (type) {
    filtered = filtered.filter(e => e.type === type);
  }
  
  const summary = {
    totalEvents: filtered.length,
    byType: {},
    byUser: {},
    timeline: []
  };
  
  filtered.forEach(event => {
    summary.byType[event.type] = (summary.byType[event.type] || 0) + 1;
    if (event.userId) {
      summary.byUser[event.userId] = (summary.byUser[event.userId] || 0) + 1;
    }
  });
  
  res.json(summary);
});

app.get('/api/analytics/dashboard', (req, res) => {
  const now = new Date();
  const last24h = new Date(now - 24 * 60 * 60 * 1000);
  
  const recent = events.filter(e => new Date(e.timestamp) >= last24h);
  
  res.json({
    totalEvents: events.length,
    last24h: recent.length,
    activeUsers: new Set(recent.map(e => e.userId).filter(Boolean)).size,
    topEvents: getTopEvents(recent),
    metrics: Object.fromEntries(metrics)
  });
});

function updateMetrics(event) {
  const key = `${event.type}_count`;
  metrics.set(key, (metrics.get(key) || 0) + 1);
}

function getTopEvents(events) {
  const counts = {};
  events.forEach(e => {
    counts[e.type] = (counts[e.type] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([type, count]) => ({ type, count }));
}

app.listen(PORT, () => {
  console.log(`📊 Analytics service running on port ${PORT}`);
});
