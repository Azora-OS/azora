/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LAUNCH ORCHESTRATOR - Advanced Service Management System
*/

import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Service Configuration with Dependencies
interface ServiceConfig {
  name: string;
  port: number;
  dir: string;
  file: string;
  desc: string;
  priority: number; // 1 = critical, 2 = important, 3 = optional
  dependencies?: string[]; // Other services this depends on
  healthEndpoint?: string;
  retryAttempts?: number;
  startupTimeout?: number;
}

const services: ServiceConfig[] = [
  // Priority 1: Core Infrastructure Services
  {
    name: 'Azora Aegis',
    port: 4000,
    dir: './services/azora-aegis',
    file: 'index.js',
    desc: 'Security & Compliance - Core Infrastructure',
    priority: 1,
    dependencies: [],
    retryAttempts: 3,
    startupTimeout: 30000,
  },
  {
    name: 'Azora Covenant',
    port: 4099,
    dir: './services/azora-covenant',
    file: 'server.js',
    desc: 'Blockchain & Smart Contracts',
    priority: 1,
    dependencies: ['Azora Aegis'],
    retryAttempts: 3,
    startupTimeout: 30000,
  },
  
  // Priority 2: Essential Services
  {
    name: 'Azora Mint',
    port: 4300,
    dir: './services/azora-mint',
    file: 'src/index.ts',
    desc: 'Financial Services & Currency',
    priority: 2,
    dependencies: ['Azora Covenant', 'Azora Aegis'],
    retryAttempts: 2,
    startupTimeout: 25000,
  },
  {
    name: 'Azora Nexus',
    port: 3006,
    dir: './services/azora-nexus',
    file: 'src/index.ts',
    desc: 'AI Recommendations Engine',
    priority: 2,
    dependencies: ['Azora Aegis'],
    retryAttempts: 2,
    startupTimeout: 25000,
  },
  {
    name: 'Azora Sapiens',
    port: 4200,
    dir: './services/azora-sapiens',
    file: 'sapiens-service.js',
    desc: 'Education Platform',
    priority: 2,
    dependencies: ['Azora Aegis', 'Azora Mint'],
    retryAttempts: 2,
    startupTimeout: 20000,
  },
  
  // Priority 3: Application Services
  {
    name: 'Azora Forge',
    port: 12345,
    dir: './services/azora-forge',
    file: 'index.js',
    desc: 'Marketplace & Commerce',
    priority: 3,
    dependencies: ['Azora Mint', 'Azora Nexus'],
    retryAttempts: 1,
    startupTimeout: 20000,
  },
  
  // Nexus Sub-Services - Priority 3
  { name: 'Wallet', port: 4100, dir: './services/azora-nexus/services/wallet', file: 'index.js', desc: 'Wallet Service', priority: 3, dependencies: ['Azora Nexus'] },
  { name: 'Blockchain', port: 4101, dir: './services/azora-nexus/services/blockchain', file: 'index.js', desc: 'Blockchain Service', priority: 3, dependencies: ['Azora Nexus', 'Azora Covenant'] },
  { name: 'AI Trading', port: 4102, dir: './services/azora-nexus/services/ai-trading', file: 'index.js', desc: 'AI Trading Service', priority: 3, dependencies: ['Azora Nexus'] },
  { name: 'AI Valuation', port: 4103, dir: './services/azora-nexus/services/ai-valuation', file: 'index.js', desc: 'AI Valuation Service', priority: 3, dependencies: ['Azora Nexus'] },
  { name: 'Backed Valuation', port: 4104, dir: './services/azora-nexus/services/backed-valuation', file: 'index.js', desc: 'Backed Valuation Service', priority: 3, dependencies: ['Azora Nexus'] },
  { name: 'Compliance', port: 4105, dir: './services/azora-nexus/services/compliance', file: 'index.js', desc: 'Compliance Service', priority: 3, dependencies: ['Azora Nexus', 'Azora Aegis'] },
  { name: 'Dashboard', port: 4106, dir: './services/azora-nexus/services/dashboard', file: 'index.js', desc: 'Dashboard Service', priority: 3, dependencies: ['Azora Nexus'] },
  { name: 'DeFi', port: 4107, dir: './services/azora-nexus/services/defi', file: 'index.js', desc: 'DeFi Service', priority: 3, dependencies: ['Azora Nexus', 'Azora Covenant'] },
  { name: 'Global Adoption', port: 4108, dir: './services/azora-nexus/services/global-adoption', file: 'index.js', desc: 'Global Adoption Service', priority: 3, dependencies: ['Azora Nexus'] },
  { name: 'Guardian', port: 4109, dir: './services/azora-nexus/services/guardian', file: 'index.js', desc: 'Guardian Service', priority: 3, dependencies: ['Azora Nexus', 'Azora Aegis'] },
  { name: 'Identity', port: 4110, dir: './services/azora-nexus/services/identity', file: 'index.js', desc: 'Identity Service', priority: 3, dependencies: ['Azora Nexus', 'Azora Aegis'] },
  { name: 'Ledger', port: 4111, dir: './services/azora-nexus/services/ledger', file: 'index.js', desc: 'Ledger Service', priority: 3, dependencies: ['Azora Nexus'] },
  { name: 'Liquidity', port: 4112, dir: './services/azora-nexus/services/liquidity', file: 'index.js', desc: 'Liquidity Service', priority: 3, dependencies: ['Azora Nexus'] },
  { name: 'Marketplace', port: 4113, dir: './services/azora-nexus/services/marketplace', file: 'index.js', desc: 'Marketplace Service', priority: 3, dependencies: ['Azora Nexus'] },
  { name: 'NFT', port: 4114, dir: './services/azora-nexus/services/nft', file: 'index.js', desc: 'NFT Service', priority: 3, dependencies: ['Azora Nexus', 'Azora Covenant'] },
  { name: 'Partnerships', port: 4115, dir: './services/azora-nexus/services/partnerships', file: 'index.js', desc: 'Partnerships Service', priority: 3, dependencies: ['Azora Nexus'] },
  { name: 'Reporting', port: 4116, dir: './services/azora-nexus/services/reporting', file: 'index.js', desc: 'Reporting Service', priority: 3, dependencies: ['Azora Nexus'] },
  { name: 'Revenue', port: 4117, dir: './services/azora-nexus/services/revenue', file: 'index.js', desc: 'Revenue Service', priority: 3, dependencies: ['Azora Nexus', 'Azora Mint'] },
  { name: 'Staking', port: 4118, dir: './services/azora-nexus/services/staking', file: 'index.js', desc: 'Staking Service', priority: 3, dependencies: ['Azora Nexus', 'Azora Covenant'] },
  { name: 'User Growth', port: 4119, dir: './services/azora-nexus/services/user-growth', file: 'index.js', desc: 'User Growth Service', priority: 3, dependencies: ['Azora Nexus'] },
  { name: 'Subscription', port: 4129, dir: './services/azora-nexus/services/subscription', file: 'index.js', desc: 'Subscription Service', priority: 3, dependencies: ['Azora Nexus', 'Azora Mint'] },
];

interface ServiceStatus {
  name: string;
  status: 'pending' | 'starting' | 'running' | 'failed' | 'stopped';
  process: ChildProcess | null;
  port: number;
  startTime?: number;
  lastHealthCheck?: number;
  healthStatus?: 'healthy' | 'unhealthy' | 'unknown';
  restartCount: number;
  errorMessage?: string;
}

class LaunchOrchestrator {
  private serviceStatuses: Map<string, ServiceStatus> = new Map();
  private shutdownRequested = false;
  private dashboardServer: http.Server | null = null;

  constructor() {
    this.setupSignalHandlers();
  }

  private setupSignalHandlers() {
    process.on('SIGINT', async () => {
      await this.gracefulShutdown('SIGINT');
    });

    process.on('SIGTERM', async () => {
      await this.gracefulShutdown('SIGTERM');
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      this.gracefulShutdown('EXCEPTION');
    });
  }

  private async checkServiceHealth(service: ServiceConfig, maxAttempts = 10): Promise<boolean> {
    const endpoint = service.healthEndpoint || `/health`;
    const url = `http://localhost:${service.port}${endpoint}`;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(2000),
        });

        if (response.ok) {
          const status = this.serviceStatuses.get(service.name);
          if (status) {
            status.healthStatus = 'healthy';
            status.lastHealthCheck = Date.now();
          }
          return true;
        }
      } catch (error) {
        // Service not ready yet, continue waiting
      }

      await this.sleep(1000);
    }

    return false;
  }

  private async launchService(service: ServiceConfig): Promise<boolean> {
    const servicePath = path.resolve(__dirname, service.dir);
    const serviceFile = path.join(servicePath, service.file);

    // Check if file exists, try alternatives
    let actualFile = serviceFile;
    if (!fs.existsSync(serviceFile)) {
      const alternatives = ['index.js', 'index.ts', 'server.js', 'server.ts', 'main.js', 'main.ts'];
      let found = false;
      for (const alt of alternatives) {
        const altPath = path.join(servicePath, alt);
        if (fs.existsSync(altPath)) {
          actualFile = altPath;
          found = true;
          break;
        }
      }

      if (!found) {
        console.log(`⚠️  SKIP: ${service.name} - No entry file found`);
        this.serviceStatuses.set(service.name, {
          name: service.name,
          status: 'failed',
          process: null,
          port: service.port,
          restartCount: 0,
          errorMessage: 'Entry file not found',
        });
        return false;
      }
    }

    // Check dependencies
    const deps = service.dependencies || [];
    for (const dep of deps) {
      const depStatus = this.serviceStatuses.get(dep);
      if (!depStatus || depStatus.status !== 'running') {
        console.log(`⏸️  WAIT: ${service.name} - Waiting for dependency: ${dep}`);
        // Wait for dependency
        await this.waitForService(dep, 30000);
      }
    }

    console.log(`🚀 Launching ${service.name} (Priority ${service.priority}) on port ${service.port}...`);

    const isTypeScript = actualFile.endsWith('.ts');
    const command = isTypeScript ? 'tsx' : 'node';
    const args = [actualFile];

    const childProcess = spawn(command, args, {
      cwd: servicePath,
      env: {
        ...process.env,
        PORT: service.port.toString(),
        NODE_ENV: process.env.NODE_ENV || 'development',
        LOG_LEVEL: 'info',
      },
      stdio: 'pipe',
    });

    const status: ServiceStatus = {
      name: service.name,
      status: 'starting',
      process: childProcess,
      port: service.port,
      startTime: Date.now(),
      restartCount: 0,
      healthStatus: 'unknown',
    };

    this.serviceStatuses.set(service.name, status);

    let hasStarted = false;

    childProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      if (
        output.includes('running on') ||
        output.includes('listening') ||
        output.includes('started') ||
        output.includes('Server is running')
      ) {
        if (!hasStarted) {
          hasStarted = true;
          status.status = 'running';
          console.log(`✅ ${service.name} started successfully on port ${service.port}`);
        }
      }
    });

    childProcess.stderr?.on('data', (data) => {
      const error = data.toString();
      if (error.includes('EADDRINUSE')) {
        console.log(`⚠️  Port ${service.port} already in use - ${service.name} may already be running`);
        status.status = 'failed';
        status.errorMessage = 'Port already in use';
      } else if (error.includes('Error') && !error.includes('Warning')) {
        console.error(`❌ ${service.name} error:`, error.substring(0, 200));
        status.errorMessage = error.substring(0, 200);
      }
    });

    childProcess.on('exit', (code) => {
      if (!this.shutdownRequested && code !== 0) {
        console.error(`❌ ${service.name} exited with code ${code}`);
        status.status = 'stopped';
        
        // Auto-restart if within retry limit
        if (status.restartCount < (service.retryAttempts || 0)) {
          status.restartCount++;
          console.log(`🔄 Attempting to restart ${service.name} (Attempt ${status.restartCount}/${service.retryAttempts})...`);
          setTimeout(() => {
            this.launchService(service);
          }, 5000);
        } else {
          status.status = 'failed';
        }
      }
    });

    // Wait for service to start with timeout
    const timeout = service.startupTimeout || 20000;
    const startTime = Date.now();

    while (!hasStarted && Date.now() - startTime < timeout) {
      await this.sleep(500);
    }

    // Verify health if not confirmed started
    if (!hasStarted) {
      console.log(`⏳ ${service.name} startup taking longer, checking health...`);
      const healthy = await this.checkServiceHealth(service, 5);
      if (healthy) {
        console.log(`✅ ${service.name} is healthy on port ${service.port}`);
        status.status = 'running';
        return true;
      } else {
        console.log(`⚠️  ${service.name} did not respond to health check`);
        status.status = 'failed';
        return false;
      }
    }

    return true;
  }

  private async waitForService(serviceName: string, timeout: number): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const status = this.serviceStatuses.get(serviceName);
      if (status && status.status === 'running') {
        return true;
      }
      await this.sleep(1000);
    }
    return false;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private startDashboard() {
    const dashboardPort = 9999;

    this.dashboardServer = http.createServer((req, res) => {
      if (req.url === '/api/status') {
        const statusData = Array.from(this.serviceStatuses.values()).map((s) => ({
          name: s.name,
          status: s.status,
          port: s.port,
          healthStatus: s.healthStatus,
          restartCount: s.restartCount,
          uptime: s.startTime ? Date.now() - s.startTime : 0,
          errorMessage: s.errorMessage,
        }));

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(statusData, null, 2));
      } else {
        // Serve simple HTML dashboard
        const html = this.generateDashboardHTML();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      }
    });

    this.dashboardServer.listen(dashboardPort, () => {
      console.log(`\n📊 Launch Dashboard: http://localhost:${dashboardPort}\n`);
    });
  }

  private generateDashboardHTML(): string {
    const statusData = Array.from(this.serviceStatuses.values());

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Azora OS - Launch Dashboard</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            color: #ffffff;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 {
            font-size: 48px;
            font-weight: 900;
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .subtitle { color: #94a3b8; font-size: 18px; margin-bottom: 30px; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: rgba(139, 92, 246, 0.1);
            border: 2px solid rgba(139, 92, 246, 0.3);
            border-radius: 15px;
            padding: 20px;
        }
        .stat-value {
            font-size: 36px;
            font-weight: 800;
            background: linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .stat-label { color: #94a3b8; font-size: 14px; margin-top: 5px; }
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
        }
        .service-card {
            background: rgba(30, 41, 59, 0.5);
            border: 2px solid rgba(139, 92, 246, 0.2);
            border-radius: 12px;
            padding: 20px;
            transition: transform 0.2s, border-color 0.2s;
        }
        .service-card:hover {
            transform: translateY(-2px);
            border-color: rgba(139, 92, 246, 0.5);
        }
        .service-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        .service-name {
            font-size: 18px;
            font-weight: 700;
            color: #ffffff;
        }
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-running { background: #10b981; color: #ffffff; }
        .status-starting { background: #f59e0b; color: #ffffff; }
        .status-failed { background: #ef4444; color: #ffffff; }
        .status-stopped { background: #6b7280; color: #ffffff; }
        .service-info { font-size: 14px; color: #94a3b8; }
        .port { margin-right: 15px; }
        .health-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 6px;
        }
        .health-healthy { background: #10b981; }
        .health-unhealthy { background: #ef4444; }
        .health-unknown { background: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Azora OS Launch Dashboard</h1>
        <div class="subtitle">Real-time service monitoring and orchestration</div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${statusData.length}</div>
                <div class="stat-label">Total Services</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${statusData.filter(s => s.status === 'running').length}</div>
                <div class="stat-label">Running</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${statusData.filter(s => s.status === 'starting').length}</div>
                <div class="stat-label">Starting</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${statusData.filter(s => s.status === 'failed').length}</div>
                <div class="stat-label">Failed</div>
            </div>
        </div>

        <div class="services-grid">
            ${statusData.map((service) => `
                <div class="service-card">
                    <div class="service-header">
                        <div class="service-name">${service.name}</div>
                        <div class="status-badge status-${service.status}">${service.status}</div>
                    </div>
                    <div class="service-info">
                        <span class="port">Port: ${service.port}</span>
                        <span class="health">
                            <span class="health-indicator health-${service.healthStatus || 'unknown'}"></span>
                            ${service.healthStatus || 'unknown'}
                        </span>
                    </div>
                    ${service.errorMessage ? `<div style="color: #ef4444; font-size: 12px; margin-top: 8px;">${service.errorMessage}</div>` : ''}
                    ${service.restartCount > 0 ? `<div style="color: #f59e0b; font-size: 12px; margin-top: 5px;">Restarts: ${service.restartCount}</div>` : ''}
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        // Auto-refresh every 5 seconds
        setInterval(() => {
            window.location.reload();
        }, 5000);
    </script>
</body>
</html>
    `;
  }

  public async launch() {
    console.log('\n' + '='.repeat(80));
    console.log('🌌 AZORA OS - ADVANCED LAUNCH ORCHESTRATOR');
    console.log('   Intelligent service management with dependency resolution');
    console.log('='.repeat(80) + '\n');

    // Start dashboard
    this.startDashboard();

    // Sort services by priority
    const sortedServices = [...services].sort((a, b) => a.priority - b.priority);

    console.log(`📦 Launching ${sortedServices.length} services in priority order...\n`);

    // Launch by priority groups
    const priorityGroups = new Map<number, ServiceConfig[]>();
    sortedServices.forEach((service) => {
      const group = priorityGroups.get(service.priority) || [];
      group.push(service);
      priorityGroups.set(service.priority, group);
    });

    for (const [priority, group] of Array.from(priorityGroups.entries()).sort((a, b) => a[0] - b[0])) {
      console.log(`\n🎯 Priority ${priority} Services (${group.length} services):\n`);
      
      // Launch all services in this priority group in parallel
      await Promise.all(group.map((service) => this.launchService(service)));
      
      // Small delay before next priority group
      await this.sleep(3000);
    }

    // Final health check
    console.log('\n🔍 Performing final health checks...\n');
    await this.sleep(5000);

    for (const service of sortedServices) {
      const status = this.serviceStatuses.get(service.name);
      if (status && status.status === 'running') {
        await this.checkServiceHealth(service, 3);
      }
    }

    // Print summary
    this.printSummary();

    console.log('\n💡 Dashboard: http://localhost:9999');
    console.log('💡 Press Ctrl+C to stop all services\n');
  }

  private printSummary() {
    const statusData = Array.from(this.serviceStatuses.values());
    const running = statusData.filter((s) => s.status === 'running');
    const failed = statusData.filter((s) => s.status === 'failed');
    const healthy = statusData.filter((s) => s.healthStatus === 'healthy');

    console.log('\n' + '='.repeat(80));
    console.log('📊 LAUNCH SUMMARY:');
    console.log(`   Total Services: ${statusData.length}`);
    console.log(`   Running: ${running.length}`);
    console.log(`   Healthy: ${healthy.length}`);
    console.log(`   Failed: ${failed.length}`);
    console.log('='.repeat(80));

    if (running.length > 0) {
      console.log('\n✅ Running Services:');
      running.forEach((s) => {
        const healthIcon = s.healthStatus === 'healthy' ? '💚' : s.healthStatus === 'unhealthy' ? '💔' : '❓';
        console.log(`   ${healthIcon} ${s.name.padEnd(30)} http://localhost:${s.port}`);
      });
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed Services:');
      failed.forEach((s) => {
        console.log(`   ⚠️  ${s.name.padEnd(30)} ${s.errorMessage || 'Unknown error'}`);
      });
    }

    const successRate = (running.length / statusData.length) * 100;
    if (successRate === 100) {
      console.log('\n🎉 ALL SYSTEMS OPERATIONAL! 🚀');
    } else if (successRate >= 80) {
      console.log('\n✅ MOST SYSTEMS OPERATIONAL');
    } else if (successRate >= 50) {
      console.log('\n⚠️  PARTIAL SYSTEM OPERATION');
    } else {
      console.log('\n❌ CRITICAL: MANY SERVICES FAILED');
    }
  }

  private async gracefulShutdown(signal: string) {
    if (this.shutdownRequested) return;
    this.shutdownRequested = true;

    console.log(`\n\n🛑 Received ${signal} - Initiating graceful shutdown...`);

    // Close dashboard
    if (this.dashboardServer) {
      this.dashboardServer.close();
    }

    const services = Array.from(this.serviceStatuses.values());
    
    console.log(`   Stopping ${services.length} services...`);

    for (const service of services) {
      if (service.process && !service.process.killed) {
        console.log(`   Stopping ${service.name}...`);
        service.process.kill('SIGTERM');
        service.status = 'stopped';
      }
    }

    // Wait for graceful shutdown
    await this.sleep(3000);

    // Force kill any remaining
    for (const service of services) {
      if (service.process && !service.process.killed) {
        console.log(`   Force stopping ${service.name}...`);
        service.process.kill('SIGKILL');
      }
    }

    console.log('\n✅ All services stopped');
    console.log('👋 Azora OS shutdown complete\n');

    process.exit(0);
  }
}

// Launch everything
const orchestrator = new LaunchOrchestrator();
orchestrator.launch().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
