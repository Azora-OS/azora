import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as child_process from 'child_process';

export class PersistentServiceDaemon {
  private pidFile: string;
  private logFile: string;

  constructor() {
    const azoraDir = path.join(os.homedir(), '.azora');
    if (!fs.existsSync(azoraDir)) {
      fs.mkdirSync(azoraDir, { recursive: true });
    }
    this.pidFile = path.join(azoraDir, 'services.pid');
    this.logFile = path.join(azoraDir, 'services.log');
  }

  async ensureServicesRunning(workspaceRoot: string): Promise<void> {
    const services = [
      { name: 'knowledge-ocean', port: 4040, path: 'services/knowledge-ocean' },
      { name: 'ai-knowledge-base', port: 4010, path: 'services/ai-knowledge-base' }
    ];

    for (const service of services) {
      if (!await this.isPortInUse(service.port)) {
        this.startPersistentService(workspaceRoot, service);
      }
    }
  }

  private async isPortInUse(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const net = require('net');
      const tester = net.createServer()
        .once('error', () => resolve(true))
        .once('listening', () => {
          tester.once('close', () => resolve(false)).close();
        })
        .listen(port);
    });
  }

  private startPersistentService(workspaceRoot: string, service: any): void {
    const servicePath = path.join(workspaceRoot, service.path);
    
    // Kill existing process on port first
    try {
      child_process.execSync(`lsof -ti:${service.port} | xargs kill -9 2>/dev/null || true`);
    } catch {}
    
    const proc = child_process.spawn('npm', ['start'], {
      cwd: servicePath,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    proc.stdout?.pipe(fs.createWriteStream(this.logFile, { flags: 'a' }));
    proc.stderr?.pipe(fs.createWriteStream(this.logFile, { flags: 'a' }));
    
    proc.unref();

    const pids = this.readPids();
    pids[service.name] = proc.pid!;
    this.writePids(pids);
  }

  private readPids(): Record<string, number> {
    try {
      return JSON.parse(fs.readFileSync(this.pidFile, 'utf8'));
    } catch {
      return {};
    }
  }

  private writePids(pids: Record<string, number>): void {
    fs.writeFileSync(this.pidFile, JSON.stringify(pids, null, 2));
  }

  stopAll(): void {
    const pids = this.readPids();
    for (const [name, pid] of Object.entries(pids)) {
      try {
        process.kill(pid, 'SIGTERM');
      } catch (error) {
        console.log(`Could not stop ${name}:`, error);
      }
    }
    fs.unlinkSync(this.pidFile);
  }
}
