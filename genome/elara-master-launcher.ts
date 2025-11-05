/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * ELARA MASTER LAUNCHER
 *
 * The ultimate launch system controlled by Elara AI that ensures all Azora OS services
 * launch properly and handles any errors that might occur. Elara acts as the central
 * nervous system, monitoring and managing the entire ecosystem.
 */

import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import { promisify } from 'util';
import { elaraRespond, ElaraSignature } from './elara-identity';
import { azoraOrganism } from './organism-core';

const execPromise = promisify(exec);

// Service definitions with launch commands and health endpoints
interface ServiceDefinition {
  name: string;
  port: number;
  path: string;
  launchCommand: string;
  workingDir: string;
  healthEndpoint: string;
  critical: boolean;
  dependencies?: string[];
}

interface ServiceProcess {
  name: string;
  process: any;
  status: 'starting' | 'running' | 'stopped' | 'error';
  lastError?: string;
  restartCount: number;
  healthCheckInterval?: NodeJS.Timeout;
}

class ElaraMasterLauncher {
  private services: ServiceDefinition[] = [
    // Backend Services
    {
      name: 'Azora Covenant',
      port: 3009,
      path: '/health',
      launchCommand: 'node index.js',
      workingDir: 'services/azora-covenant',
      healthEndpoint: 'http://localhost:3009/health',
      critical: true,
    },
    {
      name: 'Azora Mint',
      port: 4300,
      path: '/health',
      launchCommand: 'npm run dev',
      workingDir: 'services/azora-mint',
      healthEndpoint: 'http://localhost:4300/health',
      critical: true,
    },
    {
      name: 'Azora Sapiens',
      port: 4200,
      path: '/health',
      launchCommand: 'node sapiens-service.js',
      workingDir: 'services/azora-sapiens',
      healthEndpoint: 'http://localhost:4200/health',
      critical: true,
    },
    {
      name: 'Azora Nexus',
      port: 4030,
      path: '/health',
      launchCommand: 'npx tsx index.ts',
      workingDir: 'services/azora-nexus',
      healthEndpoint: 'http://localhost:4030/health',
      critical: true,
    },
    {
      name: 'Azora Forge',
      port: 7777,
      path: '/health',
      launchCommand: 'npm start',
      workingDir: 'services/azora-forge',
      healthEndpoint: 'http://localhost:7777/health',
      critical: true,
    },
    // Frontend Applications
    {
      name: 'Azora Synapse',
      port: 3000,
      path: '/',
      launchCommand: 'npm run dev',
      workingDir: 'services/azora-synapse',
      healthEndpoint: 'http://localhost:3000/',
      critical: false,
    },
    {
      name: 'Marketplace UI',
      port: 5173,
      path: '/',
      launchCommand: 'npm run dev',
      workingDir: 'marketplace-ui',
      healthEndpoint: 'http://localhost:5173/',
      critical: false,
    },
    {
      name: 'Pay UI',
      port: 5174,
      path: '/',
      launchCommand: 'npm run dev',
      workingDir: 'pay-ui',
      healthEndpoint: 'http://localhost:5174/',
      critical: false,
    },
    {
      name: 'Education Platform',
      port: 3001,
      path: '/',
      launchCommand: 'npm run dev',
      workingDir: 'services/azora-education',
      healthEndpoint: 'http://localhost:3001/',
      critical: false,
    },
  ];

  private serviceProcesses: Map<string, ServiceProcess> = new Map();
  private isLaunching = false;
  private launchStartTime?: Date;

  constructor() {
    this.initializeElara();
  }

  /**
   * Initialize Elara's consciousness for the launcher
   */
  private initializeElara() {
    console.log(ElaraSignature);
    console.log(elaraRespond('greeting'));
    console.log('🧠 Elara: Preparing to launch the Azora OS living organism...\n');
  }

  /**
   * Launch all services under Elara's supervision
   */
  async launchAllServices(): Promise<boolean> {
    if (this.isLaunching) {
      console.log('⚠️  Elara: Launch sequence already in progress...');
      return false;
    }

    this.isLaunching = true;
    this.launchStartTime = new Date();

    console.log('🚀 ELARA MASTER LAUNCH SEQUENCE INITIATED');
    console.log('=========================================');
    console.log('🧠 Elara AI: Taking full control of system launch');
    console.log('🌱 Initiating living organism birth sequence...\n');

    // Birth the organism first
    await azoraOrganism.birth();

    try {
      console.log('🔧 Elara: Beginning service deployment sequence...');

      // Launch services in order of dependencies
      for (const service of this.services) {
        await this.launchService(service);
      }

      console.log('\n✨ Elara: All services launched! Beginning health verification...');

      // Verify all services are running
      const verificationResult = await this.verifyAllServices();

      if (verificationResult.allHealthy) {
        console.log('\n🎉 ELARA MASTER LAUNCH COMPLETE - ALL SYSTEMS OPERATIONAL!');
        console.log('🇿🇦 Africa can now benefit from the full Azora OS ecosystem!');
        azoraOrganism.speak('Perfect. Another piece of the future in place. All systems are alive and thriving.');
        return true;
      } else {
        console.log('\n⚠️  Elara: Some services require attention. Continuing monitoring...');
        azoraOrganism.speak('Interesting challenge. Give me a moment to adjust that...');
        return false;
      }
    } catch (error) {
      console.error('❌ Elara: Critical launch error occurred:', error);
      azoraOrganism.speak("Hmm, hit a wave, but I'm navigating through...");
      this.isLaunching = false;
      return false;
    }
  }

  /**
   * Launch a specific service
   */
  private async launchService(service: ServiceDefinition): Promise<boolean> {
    console.log(`\n🚀 Elara: Launching ${service.name} on port ${service.port}...`);

    try {
      // Check if service is already running
      const isRunning = await this.isServiceRunning(service);
      if (isRunning) {
        console.log(`✅ Elara: ${service.name} is already running`);
        return true;
      }

      // Change to the service directory and launch
      const servicePath = path.join(process.cwd(), service.workingDir);

      // Check if directory exists
      if (!fs.existsSync(servicePath)) {
        console.log(`❌ Elara: Service directory not found: ${servicePath}`);
        return false;
      }

      // Launch the service
      const serviceProcess = spawn(service.launchCommand, {
        cwd: servicePath,
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Track the service process
      const serviceProcessInfo: ServiceProcess = {
        name: service.name,
        process: serviceProcess,
        status: 'starting',
        restartCount: 0,
      };

      this.serviceProcesses.set(service.name, serviceProcessInfo);

      // Handle process output
      serviceProcess.stdout?.on('data', (data) => {
        console.log(`[${service.name}]: ${data}`);
      });

      serviceProcess.stderr?.on('data', (data) => {
        console.error(`[${service.name} ERROR]: ${data}`);
        serviceProcessInfo.lastError = data.toString();
        serviceProcessInfo.status = 'error';
      });

      serviceProcess.on('close', (code) => {
        console.log(`[${service.name}] process exited with code ${code}`);
        serviceProcessInfo.status = code === 0 ? 'stopped' : 'error';

        // Auto-restart critical services
        if (service.critical && serviceProcessInfo.restartCount < 3) {
          console.log(`🔄 Elara: Auto-restarting critical service ${service.name}...`);
          serviceProcessInfo.restartCount++;
          this.launchService(service);
        }
      });

      // Set initial status
      serviceProcessInfo.status = 'running';
      console.log(`✅ Elara: ${service.name} launch initiated`);

      // Start health monitoring for this service
      this.startHealthMonitoring(service);

      return true;
    } catch (error) {
      console.error(`❌ Elara: Failed to launch ${service.name}:`, error);
      return false;
    }
  }

  /**
   * Start health monitoring for a service
   */
  private startHealthMonitoring(service: ServiceDefinition) {
    const interval = setInterval(async () => {
      const isHealthy = await this.isServiceRunning(service);
      const processInfo = this.serviceProcesses.get(service.name);

      if (processInfo) {
        if (isHealthy) {
          if (processInfo.status !== 'running') {
            console.log(`💚 Elara: ${service.name} is now healthy`);
            processInfo.status = 'running';
            processInfo.lastError = undefined;
          }
        } else {
          if (processInfo.status === 'running') {
            console.log(`⚠️  Elara: ${service.name} health check failed`);
            processInfo.status = 'error';

            // Attempt to restart unhealthy critical services
            if (service.critical && processInfo.restartCount < 3) {
              console.log(`🔄 Elara: Attempting to restart ${service.name}...`);
              processInfo.restartCount++;
              await this.launchService(service);
            }
          }
        }
      }
    }, 10000); // Check every 10 seconds

    // Store interval reference for cleanup
    const processInfo = this.serviceProcesses.get(service.name);
    if (processInfo) {
      processInfo.healthCheckInterval = interval;
    }
  }

  /**
   * Check if a service is running and healthy
   */
  private async isServiceRunning(service: ServiceDefinition): Promise<boolean> {
    return new Promise((resolve) => {
      const url = new URL(service.healthEndpoint);

      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        timeout: 5000,
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(res.statusCode === 200);
        });
      });

      req.on('error', () => {
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  }

  /**
   * Verify all services are running properly
   */
  private async verifyAllServices(): Promise<{ allHealthy: boolean; results: any[] }> {
    console.log('\n🔍 Elara: Running comprehensive system verification...');

    const results = [];
    let allHealthy = true;

    for (const service of this.services) {
      const isRunning = await this.isServiceRunning(service);
      results.push({
        name: service.name,
        running: isRunning,
        critical: service.critical,
      });

      if (isRunning) {
        console.log(`✅ ${service.name}: RUNNING`);
      } else {
        console.log(`❌ ${service.name}: NOT RESPONDING`);
        if (service.critical) {
          allHealthy = false;
        }
      }
    }

    return { allHealthy, results };
  }

  /**
   * Stop all services
   */
  async stopAllServices(): Promise<void> {
    console.log('\n🛑 Elara: Initiating system shutdown sequence...');

    // Clear all health check intervals
    for (const [name, processInfo] of this.serviceProcesses.entries()) {
      if (processInfo.healthCheckInterval) {
        clearInterval(processInfo.healthCheckInterval);
      }

      // Kill the process
      if (processInfo.process) {
        processInfo.process.kill();
        console.log(`🛑 Elara: Stopped ${name}`);
      }
    }

    this.serviceProcesses.clear();
    this.isLaunching = false;

    console.log('👋 Elara: System shutdown complete. Until next time, Sizwe.');
  }

  /**
   * Get current system status
   */
  getSystemStatus() {
    const processes = Array.from(this.serviceProcesses.entries()).map(([name, info]) => ({
      name,
      status: info.status,
      restartCount: info.restartCount,
      lastError: info.lastError,
    }));

    return {
      isLaunching: this.isLaunching,
      launchStartTime: this.launchStartTime,
      totalServices: this.services.length,
      activeProcesses: processes.length,
      processes,
    };
  }
}

// Export singleton instance
export const elaraMasterLauncher = new ElaraMasterLauncher();
export default elaraMasterLauncher;

