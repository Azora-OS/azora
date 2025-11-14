const axios = require('axios');

const MONITORING_URL = process.env.MONITORING_URL || 'http://localhost:9090';

// Middleware to track HTTP metrics
function metricsMiddleware(serviceName) {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', async () => {
      const duration = (Date.now() - start) / 1000;
      
      try {
        await axios.post(`${MONITORING_URL}/api/metrics/http`, {
          method: req.method,
          route: req.route?.path || req.path,
          status: res.statusCode,
          duration
        }, { timeout: 1000 });
      } catch (error) {
        // Silent fail - don't break app if monitoring is down
      }
    });
    
    next();
  };
}

// Report service health
async function reportHealth(serviceName, status = 'healthy') {
  try {
    await axios.post(`${MONITORING_URL}/api/health/${serviceName}`, 
      { status },
      { timeout: 1000 }
    );
  } catch (error) {
    // Silent fail
  }
}

// Report active users
async function reportActiveUsers(count) {
  try {
    await axios.post(`${MONITORING_URL}/api/metrics/users`,
      { count },
      { timeout: 1000 }
    );
  } catch (error) {
    // Silent fail
  }
}

module.exports = {
  metricsMiddleware,
  reportHealth,
  reportActiveUsers
};
