/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/// <reference types="node" />
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { existsSync } from 'fs';

export interface ServiceConfig {
  id: string;
  name: string;
  command: string;
  args: string[];
  cwd?: string;
  healthUrl?: string;
}

interface ServiceRuntime extends ServiceConfig {
  process?: ChildProcess | null;
  startedAt?: number | null;
  status: 'stopped' | 'starting' | 'running' | 'error';
  error?: string | null;
}

// Lightweight elara master launcher
const services: ServiceRuntime[] = [
  {
    id: 'ai-orchestrator',
    name: 'AI Orchestrator',
    // Use node to run the service file relative to workspace
    command: process.execPath, // node executable
    args: [path.join(process.cwd(), 'services', 'ai-orchestrator', 'index.js')],
    cwd: path.join(process.cwd(), 'services', 'ai-orchestrator'),
    healthUrl: 'http://localhost:3014/health',
    process: null,
    startedAt: null,
    status: 'stopped',
    error: null
  }
];

export const elaraMasterLauncher = {
  async launchAllServices() {
    // Start all registered services if not already running
    for (const svc of services) {
      if (svc.process && !svc.process.killed) {
        console.log(`${svc.name} is already running (pid=${svc.process.pid})`);
        continue;
      }

      // Check if script exists
      if (!existsSync(svc.args[0])) {
        const errMsg = `Service entrypoint not found: ${svc.args[0]}`;
        console.warn(errMsg);
        svc.status = 'error';
        svc.error = errMsg;
        continue;
      }

      try {
        if (process.env.ELARA_LAUNCHER_DRY_RUN === '1' || process.env.ELARA_LAUNCHER_DRY_RUN === 'true') {
          console.log(`[DRY RUN] Starting ${svc.name} (simulated)`);
          svc.status = 'running';
          svc.startedAt = Date.now();
          continue;
        }
        console.log(`Starting ${svc.name}...`);
        svc.status = 'starting';
        const cp = spawn(svc.command, svc.args, {
          cwd: svc.cwd || process.cwd(),
          stdio: ['ignore', 'pipe', 'pipe']
        });

        svc.process = cp;
        svc.startedAt = Date.now();

        cp.stdout?.on('data', (chunk: Buffer | string) => {
          process.stdout.write(`[${svc.name} | stdout] ${String(chunk)}`);
        });

        cp.stderr?.on('data', (chunk: Buffer | string) => {
          process.stderr.write(`[${svc.name} | stderr] ${String(chunk)}`);
        });

        cp.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
          console.log(`${svc.name} exited with code=${code} signal=${signal}`);
          svc.status = 'stopped';
          svc.process = null;
        });

        // Wait a short period and assume running, or keep in starting state
        await new Promise((resolve) => setTimeout(resolve, 1000));
        svc.status = 'running';
        console.log(`${svc.name} started (pid=${cp.pid})`);
      } catch (error) {
        svc.status = 'error';
        svc.error = (error as Error).message;
        console.error(`Failed to start ${svc.name}:`, error);
      }
    }
  },

  async stopAllServices() {
    for (const svc of services) {
      if (!svc.process && !(process.env.ELARA_LAUNCHER_DRY_RUN === '1' || process.env.ELARA_LAUNCHER_DRY_RUN === 'true')) {
        console.log(`${svc.name} is not running`);
        svc.status = 'stopped';
        continue;
      }

      try {
        if (process.env.ELARA_LAUNCHER_DRY_RUN === '1' || process.env.ELARA_LAUNCHER_DRY_RUN === 'true') {
          console.log(`[DRY RUN] Stopping ${svc.name} (simulated)`);
          svc.status = 'stopped';
          svc.process = null;
          svc.startedAt = null;
          continue;
        }
        console.log(`Stopping ${svc.name} pid=${svc.process.pid}...`);
        // Attempt graceful shutdown
        try {
          svc.process.kill('SIGTERM');
        } catch (err) {
          // Fallback to force kill
          svc.process.kill();
        }

        // Wait for a short period for the process to exit
        await new Promise((resolve) => setTimeout(resolve, 500));
        svc.status = 'stopped';
        svc.process = null;
        svc.startedAt = null;
        console.log(`${svc.name} stopped`);
      } catch (error) {
        svc.status = 'error';
        svc.error = (error as Error).message;
        console.error(`Failed to stop ${svc.name}:`, error);
      }
    }
  },

  getSystemStatus() {
    const status = services.map(svc => ({
      id: svc.id,
      name: svc.name,
      status: svc.status,
      pid: svc.process?.pid ?? null,
      startedAt: svc.startedAt ? new Date(svc.startedAt).toISOString() : null,
      error: svc.error || null
    }));

    return {
      hostname: process.env['HOSTNAME'] || 'local',
      uptimeMs: process.uptime() * 1000,
      services: status,
      timestamp: new Date().toISOString()
    };
  }
};

export default elaraMasterLauncher;

// CLI runner for executing the launcher directly (eg: npx tsx genome/elara-master-launcher.ts launch)
if (require.main === module) {
  (async () => {
    const command = process.argv[2] || 'launch';
    try {
      switch (command) {
        case 'launch':
          console.log('🔮 Starting Elara Master Launcher');
          await elaraMasterLauncher.launchAllServices();
          break;
        case 'stop':
          console.log('🛑 Stopping Elara Master Launcher');
          await elaraMasterLauncher.stopAllServices();
          break;
        case 'status':
          console.log(JSON.stringify(elaraMasterLauncher.getSystemStatus(), null, 2));
          break;
        default:
          console.log('Unknown command:', command);
          console.log('Usage: tsx genome/elara-master-launcher.ts [launch|stop|status]');
      }
    } catch (err) {
      console.error('Launcher error:', err);
      process.exit(1);
    }
  })();
}
