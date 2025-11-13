require('dotenv').config();
const { spawn } = require('child_process');

const services = [
  { name: 'ai-family-service', port: 4010, path: './ai-family-service' },
  { name: 'azora-sapiens', port: 4015, path: './azora-sapiens' },
  { name: 'azora-mint', port: 4020, path: './azora-mint' },
  { name: 'azora-forge', port: 4030, path: './azora-forge' },
  { name: 'azora-lms', port: 4040, path: './azora-lms' },
  { name: 'azora-nexus', port: 4050, path: './azora-nexus' }
];

class ServiceOrchestrator {
  constructor() {
    this.processes = new Map();
  }

  startService(service) {
    console.log(`🚀 Starting ${service.name} on port ${service.port}...`);
    
    const process = spawn('node', ['index.js'], {
      cwd: `${__dirname}/${service.path}`,
      env: { ...process.env, PORT: service.port },
      stdio: 'inherit'
    });

    process.on('error', (error) => {
      console.error(`❌ Error starting ${service.name}:`, error.message);
    });

    process.on('exit', (code) => {
      console.log(`⚠️  ${service.name} exited with code ${code}`);
    });

    this.processes.set(service.name, process);
  }

  startAll() {
    console.log('🌟 Starting Azora OS Services...\n');
    services.forEach(service => this.startService(service));
    
    console.log('\n✅ All services started!');
    console.log('\n📊 Service Status:');
    services.forEach(s => {
      console.log(`   ${s.name}: http://localhost:${s.port}`);
    });
  }

  stopAll() {
    console.log('\n🛑 Stopping all services...');
    for (const [name, process] of this.processes.entries()) {
      console.log(`   Stopping ${name}...`);
      process.kill();
    }
    console.log('✅ All services stopped');
  }
}

const orchestrator = new ServiceOrchestrator();

process.on('SIGINT', () => {
  orchestrator.stopAll();
  process.exit(0);
});

orchestrator.startAll();
