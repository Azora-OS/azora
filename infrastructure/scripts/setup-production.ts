#!/usr/bin/env tsx

/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CRITICAL_SERVICES = [
  'azora-education',
  'azora-mint', 
  'azora-forge',
  'retail-ai-service',
  'cold-chain-service',
  'community-safety-service',
  'arbiter-system'
];

async function setupProduction() {
  console.log('🚀 AZORA OS - PRODUCTION SETUP');
  console.log('================================\n');

  // 1. Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install pg ioredis http-proxy-middleware express-rate-limit', { stdio: 'inherit' });

  // 2. Create environment file
  console.log('⚙️  Creating environment configuration...');
  const envContent = `# Azora OS Production Configuration
DATABASE_URL=postgresql://azora:password@localhost:5432/azora_os
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
API_GATEWAY_PORT=8080
ALLOWED_ORIGINS=https://azora.es,https://app.azora.es

# Service Ports
EDUCATION_PORT=3001
MINT_PORT=3002
FORGE_PORT=3003
RETAIL_AI_PORT=3020
COLD_CHAIN_PORT=3021
SAFETY_PORT=3022
ARBITER_PORT=3025
`;

  fs.writeFileSync('.env.production', envContent);

  // 3. Create startup script
  console.log('🔧 Creating startup scripts...');
  const startupScript = `#!/bin/bash
# Azora OS Production Startup

echo "🚀 Starting Azora OS Production..."

# Start API Gateway
tsx infrastructure/api-gateway-master.ts &

# Start critical services
${CRITICAL_SERVICES.map(service => `cd services/${service} && npm start &`).join('\n')}

echo "✅ Azora OS started successfully"
echo "🌐 API Gateway: http://localhost:8080"
echo "📊 Health Check: http://localhost:8080/health"
`;

  fs.writeFileSync('start-production.sh', startupScript);
  execSync('chmod +x start-production.sh');

  console.log('\n✅ PRODUCTION SETUP COMPLETE!');
  console.log('\n🎯 Next Steps:');
  console.log('1. Configure your database: createdb azora_os');
  console.log('2. Start Redis: redis-server');
  console.log('3. Run: ./start-production.sh');
  console.log('\n🌍 Your Azora OS will be live at: http://localhost:8080');
}

setupProduction().catch(console.error);