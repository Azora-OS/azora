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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistentServiceDaemon = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const child_process = __importStar(require("child_process"));
class PersistentServiceDaemon {
    constructor() {
        const azoraDir = path.join(os.homedir(), '.azora');
        if (!fs.existsSync(azoraDir)) {
            fs.mkdirSync(azoraDir, { recursive: true });
        }
        this.pidFile = path.join(azoraDir, 'services.pid');
        this.logFile = path.join(azoraDir, 'services.log');
    }
    async ensureServicesRunning(workspaceRoot) {
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
    async isPortInUse(port) {
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
    startPersistentService(workspaceRoot, service) {
        const servicePath = path.join(workspaceRoot, service.path);
        // Kill existing process on port first
        try {
            child_process.execSync(`lsof -ti:${service.port} | xargs kill -9 2>/dev/null || true`);
        }
        catch { }
        const proc = child_process.spawn('npm', ['start'], {
            cwd: servicePath,
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe']
        });
        proc.stdout?.pipe(fs.createWriteStream(this.logFile, { flags: 'a' }));
        proc.stderr?.pipe(fs.createWriteStream(this.logFile, { flags: 'a' }));
        proc.unref();
        const pids = this.readPids();
        pids[service.name] = proc.pid;
        this.writePids(pids);
    }
    readPids() {
        try {
            return JSON.parse(fs.readFileSync(this.pidFile, 'utf8'));
        }
        catch {
            return {};
        }
    }
    writePids(pids) {
        fs.writeFileSync(this.pidFile, JSON.stringify(pids, null, 2));
    }
    stopAll() {
        const pids = this.readPids();
        for (const [name, pid] of Object.entries(pids)) {
            try {
                process.kill(pid, 'SIGTERM');
            }
            catch (error) {
                console.log(`Could not stop ${name}:`, error);
            }
        }
        fs.unlinkSync(this.pidFile);
    }
}
exports.PersistentServiceDaemon = PersistentServiceDaemon;
//# sourceMappingURL=persistent-service-daemon.js.map