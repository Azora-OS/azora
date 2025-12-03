const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 4015,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  console.log(`Citadel Fund Health Status: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('✅ Citadel Fund is healthy');
    console.log('💰 Ubuntu Economics Engine operational');
    process.exit(0);
  } else {
    console.log('❌ Citadel Fund unhealthy');
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log('❌ Citadel Fund health check failed:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Citadel Fund health check timed out');
  req.destroy();
  process.exit(1);
});

req.end();
