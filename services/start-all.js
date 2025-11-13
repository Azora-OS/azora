#!/usr/bin/env node
/**
 * Azora OS Master Service Orchestrator
 * Starts and manages all microservices
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const services = [
  { name: 'api-gateway', port: 4000, priority: 1 },
  { name: 'auth-service', port: 3001, priority: 1 },
  { name: 'database-service', port: 3026, priority: 1 },
  { name: 'logger-service', port: 3034, priority: 1 },
  { name: 'ai-ethics-monitor', port: 3010, priority: 2 },
  { name: 'ai-enhancement-service', port: 3020, priority: 2 },
  { name: 'ai-ml-service', port: 3021, priority: 2 },
  { name: 'ai-orchestrator', port: 3022, priority: 2 },
  { name: 'billing-service', port: 3009, priority: 2 },
  { name: 'lending-service', port: 3010, priority: 2 },
  { name: 'exchange-rate-service', port: 3008, priority: 2 },
  { name: 'virtual-card-service', port: 3007, priority: 2 },
  { name: 'kyc-aml-service', port: 3043, priority: 2 },
  { name: 'security-service', port: 3044, priority: 2 },
  { name: 'course-management-service', port: 3055, priority: 3 },
  { name: 'job-matching-service', port: 3056, priority: 3 },
  { name: 'ai-tutor-service', port: 3057, priority: 3 },
  { name: 'assessment-service', port: 3058, priority: 3 },
  { name: 'airtime-rewards-service', port: 3023, priority: 3 },
  { name: 'payment-gateway', port: 3038, priority: 3 },
  { name: 'payment-service', port: 3039, priority: 3 },
  { name: 'notification-service', port: 3037, priority: 3 },
  { name: 'api-integration-service', port: 3024, priority: 4 },
  { name: 'blockchain-service', port: 3025, priority: 4 },
  { name: 'devops-service', port: 3027, priority: 4 },
  { name: 'dna-service', port: 3028, priority: 4 },
  { name: 'documentation-service', port: 3029, priority: 4 },
  { name: 'email-service', port: 3030, priority: 4 },
  { name: 'enterprise-service', port: 3031, priority: 4 },
  { name: 'global-service', port: 3032, priority: 4 },
  { name: 'governance-service', port: 3033, priority: 4 },
  { name: 'master-ui-service', port: 3035, priority: 4 },
  { name: 'mobile-service', port: 3036, priority: 4 },
  { name: 'student-earnings-service', port: 3040, priority: 4 },
  { name: 'testing-service', port: 3041, priority: 4 },
  { name: 'ui-enhancement-service', port: 3042, priority: 4 },
  { name: 'audit-logging-service', port: 3045, priority: 4 },
  { name: 'token-exchange', port: 3046, priority: 4 },
  { name: 'swarm-coordination', port: 3047, priority: 4 },
  { name: 'quantum-tracking', port: 3048, priority: 4 },
  { name: 'tamper-proof-data-service', port: 3049, priority: 4 },
  { name: 'decentralized-banking', port: 3050, priority: 4 },
  { name: 'ai-evolution-engine', port: 3051, priority: 4 },
  { name: 'ai-system-monitor', port: 3052, priority: 4 },
  { name: 'azora-coin-service', port: 3053, priority: 4 },
  { name: 'founder-ledger-service', port: 3054, priority: 4 }
];

const processes = new Map();
let startedCount = 0;

function startService(service) {
  return new Promise((resolve, reject) => {
    const servicePath = path.join(__dirname, service.name);
    
    if (!fs.existsSync(servicePath)) {
      console.log(`⚠️  ${service.name} - Directory not found, skipping`);
      resolve();
      return;
    }

    const indexPath = path.join(servicePath, 'index.js');
    if (!fs.existsSync(indexPath)) {
      console.log(`⚠️  ${service.name} - index.js not found, skipping`);
      resolve();
      return;
    }

    console.log(`🚀 Starting ${service.name} on port ${service.port}...`);

    const proc = spawn('node', ['index.js'], {
      cwd: servicePath,
      env: { ...process.env, PORT: service.port },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    proc.stdout.on('data', (data) => {
      console.log(`[${service.name}] ${data.toString().trim()}`);
    });

    proc.stderr.on('data', (data) => {
      console.error(`[${service.name}] ERROR: ${data.toString().trim()}`);
    });

    proc.on('error', (error) => {
      console.error(`❌ ${service.name} failed to start:`, error.message);
      reject(error);
    });

    proc.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ ${service.name} exited with code ${code}`);
      }
      processes.delete(service.name);
    });

    processes.set(service.name, proc);
    startedCount++;

    // Give service time to start
    setTimeout(() => {
      console.log(`✅ ${service.name} started (${startedCount}/${services.length})`);
      resolve();
    }, 1000);
  });
}

async function startAllServices() {
  console.log('🌟 Azora OS - Starting All Services\n');
  console.log('═'.repeat(60));
  
  // Sort by priority
  const sortedServices = services.sort((a, b) => a.priority - b.priority);
  
  // Start services by priority
  for (const priority of [1, 2, 3, 4]) {
    const priorityServices = sortedServices.filter(s => s.priority === priority);
    console.log(`\n📦 Starting Priority ${priority} Services (${priorityServices.length})...\n`);
    
    await Promise.all(priorityServices.map(startService));
    
    // Wait between priority levels
    if (priority < 4) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`\n🎉 Started ${startedCount}/${services.length} services successfully!\n`);
  console.log('📊 Service Status:');
  console.log(`   Running: ${processes.size}`);
  console.log(`   Total: ${services.length}\n`);
  console.log('🌐 Key Access Points:');
  console.log('   🌐 API Gateway: http://localhost:4000');
  console.log('   🔐 Auth Service: http://localhost:3001');
  console.log('   🤖 AI Ethics: http://localhost:3010');  console.log('   💰 Billing: http://localhost:3009');  console.log('   🎓 Courses: http://localhost:3055');  console.log('   💼 Jobs: http://localhost:3056\n');
  console.log('Press Ctrl+C to stop all services\n');
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down all services...\n');
  
  processes.forEach((proc, name) => {
    console.log(`   Stopping ${name}...`);
    proc.kill('SIGTERM');
  });

  setTimeout(() => {
    console.log('\n✅ All services stopped\n');
    process.exit(0);
  }, 2000);
});

// Start all services
startAllServices().catch(error => {
  console.error('❌ Failed to start services:', error);
  process.exit(1);
});
