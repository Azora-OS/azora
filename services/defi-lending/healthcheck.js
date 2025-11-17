const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3031,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('Health check passed');
    process.exit(0);
  } else {
    console.error(`Health check failed with status code: ${res.statusCode}`);
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('Health check timed out');
  process.exit(1);
});

request.end();