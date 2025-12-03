const promClient = require('prom-client');

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});

register.registerMetric(httpDuration);
register.registerMetric(httpTotal);

function middleware(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    httpDuration.observe({ method: req.method, route, status: res.statusCode }, duration);
    httpTotal.inc({ method: req.method, route, status: res.statusCode });
  });
  next();
}

module.exports = {
  register,
  middleware,
  endpoint: (req, res) => {
    res.set('Content-Type', register.contentType);
    register.metrics().then(data => res.send(data));
  }
};
