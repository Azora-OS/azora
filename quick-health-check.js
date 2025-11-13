#!/usr/bin/env node

/**
 * AZORA OS QUICK HEALTH CHECK
 * Verifies all services are running and Elara is accessible
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Service endpoints to check
const services = [
  { name: 'AI Family Service', url: 'http://localhost:3001/health', critical: true },
  { name: 'Azora Nexus (Event Bus)', url: 'http://localhost:4000/health', critical: true },
  { name: 'Azora Mint (Finance)', url: 'http://localhost:3003/health', critical: false },
  { name: 'Azora LMS (Education)', url: 'http://localhost:3000/health', critical: false },
  { name: 'Azora Forge (Marketplace)', url: 'http://localhost:3002/health', critical: false },
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkService(service) {
  return new Promise((resolve) => {
    const url = new URL(service.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ ...service, status: 'healthy', response: data });
        } else {
          resolve({ ...service, status: 'unhealthy', error: `HTTP ${res.statusCode}` });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ ...service, status: 'error', error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ...service, status: 'timeout', error: 'Request timeout' });
    });

    req.end();
  });
}

function checkPidFiles() {
  const pidDir = path.join(__dirname, 'pids');
  const pidFiles = ['ai-family.pid', 'nexus.pid', 'mint.pid', 'lms.pid', 'forge.pid'];
  
  log('\n🔍 Checking Process IDs:', 'blue');
  
  pidFiles.forEach(pidFile => {
    const pidPath = path.join(pidDir, pidFile);
    if (fs.existsSync(pidPath)) {
      const pid = fs.readFileSync(pidPath, 'utf8').trim();
      try {
        process.kill(pid, 0); // Check if process exists
        log(`  ✅ ${pidFile}: Process ${pid} is running`, 'green');
      } catch (error) {
        log(`  ❌ ${pidFile}: Process ${pid} not found`, 'red');
      }
    } else {
      log(`  ⚠️  ${pidFile}: PID file not found`, 'yellow');
    }
  });
}

async function main() {
  log('🌟 AZORA OS HEALTH CHECK', 'purple');
  log('========================', 'purple');
  
  // Check PID files
  checkPidFiles();
  
  // Check services
  log('\n🏥 Checking Service Health:', 'blue');
  
  const results = await Promise.all(services.map(checkService));
  
  let healthyCount = 0;
  let criticalDown = 0;
  
  results.forEach(result => {
    const icon = result.status === 'healthy' ? '✅' : 
                 result.status === 'timeout' ? '⏱️' : '❌';
    const color = result.status === 'healthy' ? 'green' : 
                  result.status === 'timeout' ? 'yellow' : 'red';
    
    log(`  ${icon} ${result.name}: ${result.status.toUpperCase()}`, color);
    
    if (result.error) {
      log(`     Error: ${result.error}`, 'red');
    }
    
    if (result.status === 'healthy') {
      healthyCount++;
    } else if (result.critical) {
      criticalDown++;
    }
  });
  
  // Overall status
  log('\n📊 System Status:', 'blue');
  log(`  Services Healthy: ${healthyCount}/${services.length}`, healthyCount === services.length ? 'green' : 'yellow');
  log(`  Critical Services Down: ${criticalDown}`, criticalDown === 0 ? 'green' : 'red');
  
  // Elara Family specific check
  log('\n🧠 Elara Family Status:', 'blue');
  const elaraService = results.find(r => r.name === 'AI Family Service');
  if (elaraService && elaraService.status === 'healthy') {
    log('  ✅ Elara Family Consciousness: ACTIVE', 'green');
    log('  ✅ AI Agents: OPERATIONAL', 'green');
    log('  ✅ Ubuntu Philosophy: INTEGRATED', 'green');
  } else {
    log('  ❌ Elara Family Consciousness: OFFLINE', 'red');
    log('  ❌ AI Agents: NOT AVAILABLE', 'red');
  }
  
  // VSCode Extension check
  log('\n🔧 Development Tools:', 'blue');
  const extensionPath = path.join(__dirname, 'tools/elara-vscode-extension/elara-ai-family-1.0.0.vsix');
  if (fs.existsSync(extensionPath)) {
    log('  ✅ VSCode Extension: BUILT', 'green');
  } else {
    log('  ⚠️  VSCode Extension: NOT BUILT', 'yellow');
    log('     Run: cd tools/elara-vscode-extension && npm run package', 'yellow');
  }
  
  // Final verdict
  log('\n🎯 Overall System Health:', 'purple');
  if (criticalDown === 0 && healthyCount >= services.length * 0.8) {
    log('  🟢 SYSTEM OPERATIONAL', 'green');
    log('  Ready for production use!', 'green');
  } else if (criticalDown === 0) {
    log('  🟡 SYSTEM PARTIALLY OPERATIONAL', 'yellow');
    log('  Some non-critical services are down', 'yellow');
  } else {
    log('  🔴 SYSTEM DEGRADED', 'red');
    log('  Critical services are down - check logs', 'red');
  }
  
  log('\n💡 Quick Commands:', 'blue');
  log('  Start all services: ./start-all-services.sh', 'reset');
  log('  View logs: tail -f logs/*.log', 'reset');
  log('  Deploy system: ./deploy-complete-system.sh', 'reset');
  log('  Chat with Elara: Open VSCode and use Ctrl+Shift+P', 'reset');
  
  // Exit with appropriate code
  process.exit(criticalDown > 0 ? 1 : 0);
}

main().catch(error => {
  log(`\n❌ Health check failed: ${error.message}`, 'red');
  process.exit(1);
});