const http = require('http');

// Simple health check script for Docker
const options = {
  host: 'localhost',
  port: process.env.PORT || 3011,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log('Health check failed:', err);
  process.exit(1);
});

request.end();
