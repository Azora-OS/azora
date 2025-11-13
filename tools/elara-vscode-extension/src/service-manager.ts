import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';
import axios from 'axios';

interface Service {
  name: string;
  port: number;
  path: string;
  command: string;
  healthEndpoint: string;
  process?: child_process.ChildProcess;
}

export class ServiceManager {
  private services: Service[] = [
    {
      name: 'Knowledge Ocean',
      port: 4040,
      path: 'services/knowledge-ocean',
      command: 'npm start',
      healthEndpoint: 'http://localhost:4040/health'
    },
    {
      name: 'AI Knowledge Base',
      port: 4010,
      path: 'services/ai-knowledge-base',
      command: 'npm run dev',
      healthEndpoint: 'http://localhost:4010/health'
    }
  ];

  private healthCheckInterval?: NodeJS.Timeout;
  private outputChannel: vscode.OutputChannel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('Azora Services');
  }

  async startAll(): Promise<void> {
    this.outputChannel.appendLine('🚀 Starting Azora Services...');
    
    for (const service of this.services) {
      await this.startService(service);
    }

    this.startHealthMonitoring();
    this.outputChannel.appendLine('✅ All services started');
  }

  private async startService(service: Service): Promise<void> {
    const isHealthy = await this.checkHealth(service);
    if (isHealthy) {
      this.outputChannel.appendLine(`✓ ${service.name} already running`);
      return;
    }

    this.outputChannel.appendLine(`⚡ Starting ${service.name}...`);
    
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      throw new Error('No workspace folder found');
    }

    // Kill existing process on port
    try {
      child_process.execSync(`lsof -ti:${service.port} | xargs kill -9 2>/dev/null || true`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch {}

    const servicePath = path.join(workspaceRoot, service.path);
    
    service.process = child_process.spawn('npm', ['start'], {
      cwd: servicePath,
      shell: true,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    service.process.stdout?.on('data', (data) => {
      this.outputChannel.appendLine(`[${service.name}] ${data}`);
    });

    service.process.stderr?.on('data', (data) => {
      this.outputChannel.appendLine(`[${service.name} ERROR] ${data}`);
    });

    service.process.unref();
    await this.waitForHealth(service);
  }

  private async checkHealth(service: Service): Promise<boolean> {
    try {
      const response = await axios.get(service.healthEndpoint, { timeout: 2000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  private async waitForHealth(service: Service, maxAttempts = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (await this.checkHealth(service)) {
        this.outputChannel.appendLine(`✅ ${service.name} is healthy`);
        return;
      }
    }
    throw new Error(`${service.name} failed to start`);
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const service of this.services) {
        const isHealthy = await this.checkHealth(service);
        if (!isHealthy) {
          this.outputChannel.appendLine(`⚠️ ${service.name} unhealthy, restarting...`);
          await this.startService(service);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  dispose(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.outputChannel.dispose();
  }
}
