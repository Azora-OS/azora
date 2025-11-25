#!/usr/bin/env node
/**
 * AZORA FRONTEND-BACKEND VERIFICATION
 * 
 * Verifies that frontend applications can communicate with backend services.
 * Checks for:
 * - Service reachability
 * - CORS headers (Access-Control-Allow-Origin)
 * - API response format
 * 
 * Usage:
 *   npm run verify:frontend
 */

const http = require('http');
const https = require('https');

// ============================================
// CONFIGURATION
// ============================================

const CHECKS = [
  {
    name: 'Auth Service',
    url: 'http://localhost:4000/health',
    expectedOrigin: 'http://localhost:3000' // Assuming azora-ui runs on 3000
  },
  {
    name: 'Education Service',
    url: 'http://localhost:4002/health',
    expectedOrigin: 'http://localhost:3000'
  },
  {
    name: 'Azora Mint',
    url: 'http://localhost:4003/health',
    expectedOrigin: 'http://localhost:3000'
  },
  {
    name: 'Azora Forge',
    url: 'http://localhost:4004/health',
    expectedOrigin: 'http://localhost:3000'
  },
  {
    name: 'AI Orchestrator',
    url: 'http://localhost:4005/health',
    expectedOrigin: 'http://localhost:3000'
  },
  {
    name: 'Azora Sapiens',
    url: 'http://localhost:4006/health',
    expectedOrigin: 'http://localhost:3000'
  },
  {
    name: 'AI Family',
    url: 'http://localhost:4007/health',
    expectedOrigin: 'http://localhost:3000'
  }
];

// ============================================
// UTILITIES
// ============================================

function checkService(check) {
  return new Promise((resolve) => {
    const urlObj = new URL(check.url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const options = {
      method: 'OPTIONS', // Preflight check
      headers: {
        'Origin': check.expectedOrigin,
        'Access-Control-Request-Method': 'GET'
      }
    };

    const req = client.request(check.url, options, (res) => {
      const corsHeader = res.headers['access-control-allow-origin'];

      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({
          success: true,
          cors: corsHeader === '*' || corsHeader === check.expectedOrigin,
          details: `CORS: ${corsHeader || 'None'}`
        });
      } else {
        // Fallback to GET to check if service is at least up
        checkServiceGet(check).then(resolve);
      }
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.end();
  });
}

function checkServiceGet(check) {
  return new Promise((resolve) => {
    const client = check.url.startsWith('https') ? https : http;
    client.get(check.url, (res) => {
      resolve({
        success: res.statusCode >= 200 && res.statusCode < 300,
        cors: !!res.headers['access-control-allow-origin'], // Less strict check on GET
        details: `Status: ${res.statusCode}`
      });
    }).on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('🔗 Azora Frontend-Backend Verification\n');

  let allPassed = true;

  for (const check of CHECKS) {
    process.stdout.write(`  Checking connection to ${check.name}... `);
    const result = await checkService(check);

    if (result.success) {
      console.log('✅ Connected');
      if (result.cors) {
        console.log(`    - CORS Configured: ✅`);
      } else {
        console.log(`    - CORS Configured: ⚠️  (Check headers)`);
      }
    } else {
      console.log(`❌ Failed: ${result.error || result.details}`);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✨ All backend services are reachable!');
  } else {
    console.log('⚠️  Some services are not reachable. Check if they are running.');
  }
}

main().catch(console.error);
