"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceManager = void 0;
const vscode = __importStar(require("vscode"));
const child_process = __importStar(require("child_process"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
class ServiceManager {
    constructor() {
        this.services = [
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
        this.outputChannel = vscode.window.createOutputChannel('Azora Services');
    }
    async startAll() {
        this.outputChannel.appendLine('🚀 Starting Azora Services...');
        for (const service of this.services) {
            await this.startService(service);
        }
        this.startHealthMonitoring();
        this.outputChannel.appendLine('✅ All services started');
    }
    async startService(service) {
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
        }
        catch { }
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
    async checkHealth(service) {
        try {
            const response = await axios_1.default.get(service.healthEndpoint, { timeout: 2000 });
            return response.status === 200;
        }
        catch {
            return false;
        }
    }
    async waitForHealth(service, maxAttempts = 30) {
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (await this.checkHealth(service)) {
                this.outputChannel.appendLine(`✅ ${service.name} is healthy`);
                return;
            }
        }
        throw new Error(`${service.name} failed to start`);
    }
    startHealthMonitoring() {
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
    dispose() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.outputChannel.dispose();
    }
}
exports.ServiceManager = ServiceManager;
//# sourceMappingURL=service-manager.js.map