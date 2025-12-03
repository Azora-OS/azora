const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 4000,
  path: '/health',
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Ubuntu health check passed');
    process.exit(0);
  } else {
    console.log('❌ Ubuntu health check failed');
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log('❌ Ubuntu health check error:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Ubuntu health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();