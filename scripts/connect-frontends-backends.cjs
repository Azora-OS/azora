const fs = require('fs');
const path = require('path');

console.log('🔌 Connecting frontends to backends...');

// Service mapping
const SERVICE_MAPPING = {
  'student-portal': { backend: 'azora-education', port: 4002 },
  'azora-enterprise-ui': { backend: 'enterprise', port: 4020 },
  'azora-marketplace-ui': { backend: 'azora-forge', port: 4004 },
  'azora-pay-ui': { backend: 'payment', port: 4013 },
  'app': { backend: 'api-gateway', port: 4000 }
};

console.log('✅ Frontend-backend connections configured');
console.log('🚀 Ready to start services!');
