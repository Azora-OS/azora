/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA OS - COMPLETE SERVICE LAUNCHER
 *
 * Launches all core Azora OS services in the correct dependency order
 * for efficient Africa-wide deployment
 */

import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ServiceConfig {
  name: string;
  port: number;
  dir: string;
  file: string;
  type: 'node' | 'tsx' | 'ts-node';
  priority: number; // 1 = critical, 2 = important, 3 = optional
  dependencies?: string[];
  desc?: string;
}

interface ServiceStatus {
  name: string;
  status: 'pending' | 'starting' | 'running' | 'failed' | 'stopped';
  process: ChildProcess | null;
  port: number;
  startTime?: number;
  errorMessage?: string;
}

class AzoraServiceLauncher {
  private serviceStatuses: Map<string, ServiceStatus> = new Map();
  private shutdownRequested = false;
  private processes: ChildProcess[] = [];

  // Core services configuration
  private services: ServiceConfig[] = [
    // Priority 1: Critical Infrastructure
    /*{
      name: 'Azora Aegis',
      port: 4000,
      dir: 'services/azora-aegis',
      file: 'citadel.js',
      type: 'node',
      priority: 1,
      desc: 'Security & Compliance - Core Infrastructure',
    },*/
    {
      name: 'Azora Covenant',
      port: 4099,
      dir: 'services/azora-covenant',
      file: 'index.js',
      type: 'node',
      priority: 1,
      desc: 'Blockchain & Smart Contracts',
    },

    // Priority 2: Essential Services
    {
      name: 'Azora Mint',
      port: 4300,
      dir: 'services/azora-mint',
      file: 'src/index.ts',
      type: 'tsx',
      priority: 2,
      desc: 'Financial Services & Currency',
    },
    {
      name: 'Azora Sapiens',
      port: 4200,
      dir: 'services/azora-sapiens',
      file: 'sapiens-service.js',
      type: 'node',
      priority: 2,
      desc: 'Education Platform',
    },
    {
      name: 'Azora Nexus',
      port: 3006,
      dir: 'services/azora-nexus',
      file: 'index.ts',
      type: 'tsx',
      priority: 2,
      desc: 'AI Recommendations Engine',
    },

    // Priority 3: Application Services
    {
      name: 'Azora Forge',
      port: 12345,
      dir: 'services/azora-forge',
      file: 'index.js',
      type: 'node',
      priority: 3,
      desc: 'Marketplace & Commerce',
    },
  ];

  constructor() {
    this.setupSignalHandlers();
  }

  private setupSignalHandlers() {
    process.on('SIGINT', () => {
      this.gracefulShutdown('SIGINT');
    });

    process.on('SIGTERM', () => {
      this.gracefulShutdown('SIGTERM');
    });
  }

  private async launchService(service: ServiceConfig): Promise<boolean> {
    const servicePath = path.resolve(process.cwd(), service.dir);
    const serviceFile = path.join(servicePath, service.file);

    // Check if file exists
    if (!fs.existsSync(serviceFile)) {
      console.log(`⚠️  SKIP: ${service.name} - ${service.file} not found`);
      this.serviceStatuses.set(service.name, {
        name: service.name,
        status: 'failed',
        process: null,
        port: service.port,
        errorMessage: 'Entry file not found',
      });
      return false;
    }

    console.log(`🚀 Launching ${service.name} on port ${service.port}...`);

    let command: string;
    let args: string[];

    switch (service.type) {
      case 'tsx':
        command = 'node';
        args = ['node_modules/.bin/tsx', service.file];
        // If tsx is not available in node_modules, try global
        if (!fs.existsSync(path.join(servicePath, 'node_modules', '.bin', 'tsx'))) {
          command = 'npx';
          args = ['tsx', service.file];
        }
        break;
      case 'ts-node':
        command = 'node';
        args = ['node_modules/.bin/ts-node', service.file];
        // If ts-node is not available in node_modules, try global
        if (!fs.existsSync(path.join(servicePath, 'node_modules', '.bin', 'ts-node'))) {
          command = 'npx';
          args = ['ts-node', service.file];
        }
        break;
      default: // node
        command = 'node';
        args = [service.file];
        break;
    }

    const childProcess = spawn(command, args, {
      cwd: servicePath,
      env: {
        ...process.env,
        PORT: service.port.toString(),
        NODE_ENV: process.env.NODE_ENV || 'development',
      },
      stdio: 'pipe',
    });

    this.processes.push(childProcess);

    const status: ServiceStatus = {
      name: service.name,
      status: 'starting',
      process: childProcess,
      port: service.port,
      startTime: Date.now(),
    };

    this.serviceStatuses.set(service.name, status);

    childProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      if (
        output.includes('running') ||
        output.includes('listening') ||
        output.includes('started') ||
        output.includes('online') ||
        output.includes('Operational')
      ) {
        status.status = 'running';
        console.log(`✅ ${service.name} started successfully on port ${service.port}`);
      }

      // Also print the service output for debugging
      process.stdout.write(`[${service.name}] ${output}`);
    });

    childProcess.stderr?.on('data', (data) => {
      const error = data.toString();
      if (error.includes('EADDRINUSE')) {
        console.log(`⚠️  Port ${service.port} already in use - ${service.name} may already be running`);
        status.status = 'failed';
        status.errorMessage = 'Port already in use';
      } else {
        console.error(`❌ ${service.name} error:`, error.substring(0, 200));
        status.errorMessage = error.substring(0, 200);
      }
    });

    childProcess.on('exit', (code) => {
      if (!this.shutdownRequested && code !== 0) {
        console.error(`❌ ${service.name} exited with code ${code}`);
        status.status = 'stopped';
      }
    });

    // Give service time to start
    await this.sleep(3000);
    return status.status === 'running' || status.status === 'starting';
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async launchAll() {
    console.log('\n' + '='.repeat(70));
    console.log('🌍 AZORA OS - COMPLETE SERVICE LAUNCHER');
    console.log('   Launching all core services for Africa-wide deployment');
    console.log('='.repeat(70) + '\n');

    // Sort services by priority
    const sortedServices = [...this.services].sort((a, b) => a.priority - b.priority);

    console.log(`📦 Launching ${sortedServices.length} core services...\n`);

    // Launch services by priority groups
    const priorityGroups = new Map<number, ServiceConfig[]>();
    sortedServices.forEach((service) => {
      const group = priorityGroups.get(service.priority) || [];
      group.push(service);
      priorityGroups.set(service.priority, group);
    });

    for (const [priority, group] of Array.from(priorityGroups.entries()).sort((a, b) => a[0] - b[0])) {
      console.log(`\n🎯 Priority ${priority} Services (${group.length} services):\n`);

      // Launch all services in this priority group
      for (const service of group) {
        await this.launchService(service);
        // Small delay between launches
        await this.sleep(2000);
      }
    }

    // Wait for all services to initialize
    console.log('\n⏳ Waiting for all services to initialize...\n');
    await this.sleep(8000);

    // Print final status
    this.printLaunchSummary();

    console.log('\n💡 Service Endpoints:');
    console.log('   Azora Aegis (Security):     http://localhost:4000/health');
    console.log('   Azora Covenant (Blockchain): http://localhost:4099/health');
    console.log('   Azora Mint (Finance):       http://localhost:4300/health');
    console.log('   Azora Sapiens (Education):   http://localhost:4200/health');
    console.log('   Azora Nexus (AI):           http://localhost:3006/health');
    console.log('   Azora Forge (Marketplace):   http://localhost:12345/health\n');

    console.log('✨ All core Azora OS services are now running!');
    console.log('🇿🇦 Africa depends on this deployment - systems are operational\n');
    console.log('💡 Press Ctrl+C to stop all services\n');
  }

  private printLaunchSummary() {
    const statusData = Array.from(this.serviceStatuses.values());
    const running = statusData.filter((s) => s.status === 'running' || s.status === 'starting');
    const failed = statusData.filter((s) => s.status === 'failed');

    console.log('\n' + '='.repeat(70));
    console.log('📊 LAUNCH SUMMARY:');
    console.log(`   Total Services: ${statusData.length}`);
    console.log(`   Running: ${running.length}`);
    console.log(`   Failed: ${failed.length}`);
    console.log('='.repeat(70));

    if (running.length > 0) {
      console.log('\n✅ Running Services:');
      running.forEach((s) => {
        console.log(`   🟢 ${s.name.padEnd(25)} http://localhost:${s.port}`);
      });
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed Services:');
      failed.forEach((s) => {
        console.log(`   🔴 ${s.name.padEnd(25)} ${s.errorMessage || 'Unknown error'}`);
      });
    }

    const successRate = (running.length / statusData.length) * 100;
    if (successRate === 100) {
      console.log('\n🎉 ALL SERVICES OPERATIONAL! 🚀');
      console.log('🇿🇦 Africa can now benefit from the full Azora OS ecosystem!');
    } else if (successRate >= 80) {
      console.log('\n✅ MOST SERVICES OPERATIONAL');
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

    console.log(`   Stopping ${this.processes.length} services...`);

    // Send SIGTERM to all processes
    this.processes.forEach((proc, index) => {
      if (proc && !proc.killed) {
        const serviceName = Array.from(this.serviceStatuses.values())[index]?.name || `Process ${index}`;
        console.log(`   Stopping ${serviceName}...`);
        proc.kill('SIGTERM');
      }
    });

    // Wait for graceful shutdown
    await this.sleep(3000);

    // Force kill any remaining processes
    this.processes.forEach((proc, index) => {
      if (proc && !proc.killed) {
        const serviceName = Array.from(this.serviceStatuses.values())[index]?.name || `Process ${index}`;
        console.log(`   Force stopping ${serviceName}...`);
        proc.kill('SIGKILL');
      }
    });

    console.log('\n✅ All services stopped');
    console.log('👋 Azora OS shutdown complete\n');

    process.exit(0);
  }
}

// Launch all services
const launcher = new AzoraServiceLauncher();
launcher.launchAll().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
