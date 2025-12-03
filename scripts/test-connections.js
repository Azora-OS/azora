const fetch = require('node-fetch');

const SERVICES = {
  'api-gateway': 4000,
  'auth-service': 4001,
  'azora-education': 4002,
  'health-monitor': 4005
};

async function testConnections() {
  console.log('🔍 Testing connections...');
  
  for (const [service, port] of Object.entries(SERVICES)) {
    try {
      const response = await fetch(`http://localhost:${port}/health`, { timeout: 3000 });
      console.log(`${response.ok ? '✅' : '❌'} ${service}:${port}`);
    } catch (error) {
      console.log(`❌ ${service}:${port} - offline`);
    }
  }
}

testConnections().catch(console.error);
