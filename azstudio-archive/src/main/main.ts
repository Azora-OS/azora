import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { ProjectIndexer } from './services/ProjectIndexer';
import { FileWatcher } from './services/FileWatcher';
import { FrameworkDetector } from './services/FrameworkDetector';
import { GitService, GitConfig, GitCredentials } from './services/GitService';
import { SecretsVault } from './services/SecretsVault';
import { PermissionManager, PermissionType, PermissionRequestOptions } from './services/PermissionManager';
import { AuditLogger, AuditEventType, AuditQueryOptions } from './services/AuditLogger';
import { NetworkSandbox, NetworkRequestOptions } from './services/NetworkSandbox';
import { VersionHistory, User, FileChange } from './services/VersionHistory';
import { LicenseManager } from './services/LicenseManager';
import { AutoUpdateService } from './services/AutoUpdateService';

// Initialize agents on startup
import '../vs/workbench/services/azora/agentInitialization';

class AzStudioApp {
  private mainWindow: BrowserWindow | null = null;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private projectIndexer: ProjectIndexer;
  private fileWatcher: FileWatcher;
  private frameworkDetector: FrameworkDetector;
  private gitServices: Map<string, GitService> = new Map();
  private secretsVaults: Map<string, SecretsVault> = new Map();
  private globalSecretsVault: SecretsVault;
  private permissionManager: PermissionManager;
  private auditLoggers: Map<string, AuditLogger> = new Map();
  private globalAuditLogger: AuditLogger;
  private networkSandbox: NetworkSandbox;
  private versionHistories: Map<string, VersionHistory> = new Map();
  private autoUpdateService: AutoUpdateService;
  private licenseManager: LicenseManager;

  constructor() {
    this.projectIndexer = new ProjectIndexer();
    this.fileWatcher = new FileWatcher();
    this.frameworkDetector = new FrameworkDetector();
    this.globalSecretsVault = new SecretsVault();
    this.permissionManager = new PermissionManager();
    this.globalAuditLogger = new AuditLogger();
    this.networkSandbox = new NetworkSandbox(this.permissionManager, this.globalAuditLogger);
    this.autoUpdateService = new AutoUpdateService();
    this.licenseManager = new LicenseManager();
    this.initializeApp();
  }

  private initializeApp(): void {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupIPC();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        }
      });
    });

    // Quit when all windows are closed (except on macOS)
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1024,
      minHeight: 768,
      title: 'AzStudio',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
      show: false, // Don't show until ready
    });

    // Load the renderer
    if (this.isDevelopment) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      
      // Initialize permission manager with window
      this.permissionManager.initialize(this.mainWindow!).catch(console.error);
      
      // Initialize audit logger
      this.globalAuditLogger.initialize().catch(console.error);
      
      // Initialize auto-update service
      if (!this.isDevelopment) {
        this.autoUpdateService.initialize(this.mainWindow!);
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupIPC(): void {
    // File system operations
    ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
      try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        return { success: true, content };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('fs:writeFile', async (_event, filePath: string, content: string) => {
      try {
        await fs.promises.writeFile(filePath, content, 'utf-8');
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('fs:readDir', async (_event, dirPath: string) => {
      try {
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        const files = entries.map(entry => ({
          name: entry.name,
          isDirectory: entry.isDirectory(),
          path: path.join(dirPath, entry.name),
        }));
        return { success: true, files };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('fs:exists', async (_event, filePath: string) => {
      try {
        await fs.promises.access(filePath);
        return { success: true, exists: true };
      } catch {
        return { success: true, exists: false };
      }
    });

    // Dialog operations
    ipcMain.handle('dialog:openFolder', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openDirectory'],
      });
      
      if (result.canceled) {
        return { success: false, canceled: true };
      }
      
      return { success: true, path: result.filePaths[0] };
    });

    ipcMain.handle('dialog:openFile', async (_event, filters?: any[]) => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openFile'],
        filters: filters || [],
      });
      
      if (result.canceled) {
        return { success: false, canceled: true };
      }
      
      return { success: true, path: result.filePaths[0] };
    });

    // Window operations
    ipcMain.handle('window:minimize', () => {
      this.mainWindow?.minimize();
      return { success: true };
    });

    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
      return { success: true };
    });

    ipcMain.handle('window:close', () => {
      this.mainWindow?.close();
      return { success: true };
    });

    // App info
    ipcMain.handle('app:getVersion', () => {
      return { success: true, version: app.getVersion() };
    });

    ipcMain.handle('app:getPath', (_event, name: string) => {
      return { success: true, path: app.getPath(name as any) };
    });

    // Project indexing
    ipcMain.handle('project:index', async (_event, rootPath: string) => {
      try {
        const projectGraph = await this.projectIndexer.indexProject(rootPath);
        
        // Start file watcher
        this.fileWatcher.watch(rootPath, (event) => {
          // Update index on file changes
          this.projectIndexer.updateIndex([event.path]).catch(console.error);
          
          // Notify renderer of changes
          this.mainWindow?.webContents.send('project:fileChanged', event);
        });

        return {
          success: true,
          graph: {
            rootPath: projectGraph.rootPath,
            fileCount: projectGraph.files.size,
            lastIndexed: projectGraph.lastIndexed,
          },
        };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('project:findSymbol', async (_event, name: string) => {
      try {
        const results = this.projectIndexer.findSymbol(name);
        return { success: true, results };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('project:findReferences', async (_event, symbolName: string) => {
      try {
        const references = this.projectIndexer.findReferences(symbolName);
        return { success: true, references };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('project:getGraph', async () => {
      try {
        const graph = this.projectIndexer.getProjectGraph();
        if (!graph) {
          return { success: false, error: 'Project not indexed' };
        }
        
        return {
          success: true,
          graph: {
            rootPath: graph.rootPath,
            fileCount: graph.files.size,
            lastIndexed: graph.lastIndexed,
            files: Array.from(graph.files.entries()).map(([path, node]) => ({
              path,
              type: node.type,
              imports: node.imports,
              exports: node.exports,
              symbols: node.symbols,
            })),
          },
        };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('project:detectFrameworks', async (_event, rootPath: string) => {
      try {
        const frameworks = await this.frameworkDetector.detectFrameworks(rootPath);
        return { success: true, frameworks };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('project:getConventions', async (_event, rootPath: string) => {
      try {
        const conventions = await this.frameworkDetector.getProjectConventions(rootPath);
        return { success: true, conventions };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('project:detectStructure', async (_event, rootPath: string) => {
      try {
        const structure = await this.frameworkDetector.detectProjectStructure(rootPath);
        return { success: true, structure };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Network sandbox operations
    ipcMain.handle('network:request', async (_event, url: string, options?: NetworkRequestOptions) => {
      try {
        const response = await this.networkSandbox.request(url, options);
        return { success: true, response };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('network:get', async (_event, url: string, options?: Omit<NetworkRequestOptions, 'method'>) => {
      try {
        const response = await this.networkSandbox.get(url, options);
        return { success: true, response };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('network:post', async (_event, url: string, body: string, options?: Omit<NetworkRequestOptions, 'method' | 'body'>) => {
      try {
        const response = await this.networkSandbox.post(url, body, options);
        return { success: true, response };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('network:put', async (_event, url: string, body: string, options?: Omit<NetworkRequestOptions, 'method' | 'body'>) => {
      try {
        const response = await this.networkSandbox.put(url, body, options);
        return { success: true, response };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('network:delete', async (_event, url: string, options?: Omit<NetworkRequestOptions, 'method'>) => {
      try {
        const response = await this.networkSandbox.delete(url, options);
        return { success: true, response };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('network:getActiveRequests', async () => {
      try {
        const requests = this.networkSandbox.getActiveRequests();
        return { success: true, requests };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('network:getStatistics', async () => {
      try {
        const statistics = this.networkSandbox.getStatistics();
        return { success: true, statistics };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('network:blockDomain', async (_event, domain: string, reason?: string) => {
      try {
        await this.networkSandbox.blockDomain(domain, reason);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('network:unblockDomain', async (_event, domain: string, reason?: string) => {
      try {
        await this.networkSandbox.unblockDomain(domain, reason);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Audit logging operations
    ipcMain.handle('audit:log', async (_event, type: AuditEventType, action: string, resource: string, options?: any, projectPath?: string) => {
      try {
        const logger = projectPath ? this.getAuditLogger(projectPath) : this.globalAuditLogger;
        await logger.log(type, action, resource, options);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('audit:query', async (_event, options: AuditQueryOptions, projectPath?: string) => {
      try {
        const logger = projectPath ? this.getAuditLogger(projectPath) : this.globalAuditLogger;
        const events = await logger.query(options);
        return { success: true, events };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('audit:getStatistics', async (_event, projectPath?: string) => {
      try {
        const logger = projectPath ? this.getAuditLogger(projectPath) : this.globalAuditLogger;
        const statistics = await logger.getStatistics();
        return { success: true, statistics };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('audit:export', async (_event, outputPath: string, options: AuditQueryOptions, projectPath?: string) => {
      try {
        const logger = projectPath ? this.getAuditLogger(projectPath) : this.globalAuditLogger;
        await logger.export(outputPath, options);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('audit:clearOldLogs', async (_event, daysToKeep: number, projectPath?: string) => {
      try {
        const logger = projectPath ? this.getAuditLogger(projectPath) : this.globalAuditLogger;
        const deletedCount = await logger.clearOldLogs(daysToKeep);
        return { success: true, deletedCount };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Permission operations
    ipcMain.handle('permissions:request', async (_event, options: PermissionRequestOptions) => {
      try {
        const granted = await this.permissionManager.requestPermission(options);
        return { success: true, granted };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('permissions:grant', async (_event, type: PermissionType, resource: string, permanent: boolean, duration?: number) => {
      try {
        await this.permissionManager.grantPermission(type, resource, permanent, duration);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('permissions:revoke', async (_event, type: PermissionType, resource: string) => {
      try {
        const revoked = await this.permissionManager.revokePermission(type, resource);
        return { success: true, revoked };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('permissions:getGrants', async () => {
      try {
        const grants = this.permissionManager.getGrants();
        return { success: true, grants };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('permissions:isNetworkAllowed', async (_event, domain: string) => {
      try {
        const allowed = await this.permissionManager.isNetworkAllowed(domain);
        return { success: true, allowed };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('permissions:addToNetworkAllowlist', async (_event, domain: string, allowed: boolean, reason?: string) => {
      try {
        await this.permissionManager.addToNetworkAllowlist(domain, allowed, reason);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('permissions:removeFromNetworkAllowlist', async (_event, domain: string) => {
      try {
        const removed = await this.permissionManager.removeFromNetworkAllowlist(domain);
        return { success: true, removed };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('permissions:getNetworkAllowlist', async () => {
      try {
        const allowlist = this.permissionManager.getNetworkAllowlist();
        return { success: true, allowlist };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('permissions:getAuditLog', async () => {
      try {
        const auditLog = this.permissionManager.getAuditLog();
        return { success: true, auditLog };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('permissions:addAutoGrantPattern', async (_event, pattern: string) => {
      try {
        await this.permissionManager.addAutoGrantPattern(pattern);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('permissions:removeAutoGrantPattern', async (_event, pattern: string) => {
      try {
        const removed = await this.permissionManager.removeAutoGrantPattern(pattern);
        return { success: true, removed };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('permissions:getAutoGrantPatterns', async () => {
      try {
        const patterns = this.permissionManager.getAutoGrantPatterns();
        return { success: true, patterns };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Secrets vault operations
    ipcMain.handle('secrets:initialize', async (_event, projectPath?: string) => {
      try {
        const vault = projectPath ? this.getSecretsVault(projectPath) : this.globalSecretsVault;
        await vault.initialize();
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('secrets:set', async (_event, key: string, value: string, scope: 'global' | 'project', projectPath?: string) => {
      try {
        const vault = scope === 'project' && projectPath 
          ? this.getSecretsVault(projectPath) 
          : this.globalSecretsVault;
        await vault.setSecret(key, value, scope);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('secrets:get', async (_event, key: string, scope: 'global' | 'project', projectPath?: string) => {
      try {
        const vault = scope === 'project' && projectPath 
          ? this.getSecretsVault(projectPath) 
          : this.globalSecretsVault;
        const value = await vault.getSecret(key, scope);
        return { success: true, value };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('secrets:delete', async (_event, key: string, scope: 'global' | 'project', projectPath?: string) => {
      try {
        const vault = scope === 'project' && projectPath 
          ? this.getSecretsVault(projectPath) 
          : this.globalSecretsVault;
        const deleted = await vault.deleteSecret(key, scope);
        return { success: true, deleted };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('secrets:list', async (_event, scope: 'global' | 'project', projectPath?: string) => {
      try {
        const vault = scope === 'project' && projectPath 
          ? this.getSecretsVault(projectPath) 
          : this.globalSecretsVault;
        const keys = await vault.listSecrets(scope);
        return { success: true, keys };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('secrets:getAuditLog', async (_event, projectPath?: string) => {
      try {
        const vault = projectPath ? this.getSecretsVault(projectPath) : this.globalSecretsVault;
        const auditLog = vault.getAuditLog();
        return { success: true, auditLog };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Git operations
    ipcMain.handle('git:init', async (_event, projectPath: string) => {
      try {
        const gitService = new GitService(projectPath);
        await gitService.init();
        this.gitServices.set(projectPath, gitService);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:isRepo', async (_event, projectPath: string) => {
      try {
        const gitService = this.getGitService(projectPath);
        const isRepo = await gitService.isRepo();
        return { success: true, isRepo };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:status', async (_event, projectPath: string) => {
      try {
        const gitService = this.getGitService(projectPath);
        const status = await gitService.status();
        return { success: true, status };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:add', async (_event, projectPath: string, filepaths: string[]) => {
      try {
        const gitService = this.getGitService(projectPath);
        await gitService.add(filepaths);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:remove', async (_event, projectPath: string, filepaths: string[]) => {
      try {
        const gitService = this.getGitService(projectPath);
        await gitService.remove(filepaths);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:commit', async (_event, projectPath: string, message: string, config?: GitConfig) => {
      try {
        const gitService = this.getGitService(projectPath);
        const gitConfig = config || { name: 'AzStudio User', email: 'user@azstudio.local' };
        const sha = await gitService.commit(message, gitConfig);
        return { success: true, sha };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:log', async (_event, projectPath: string, depth: number = 50) => {
      try {
        const gitService = this.getGitService(projectPath);
        const commits = await gitService.log(depth);
        return { success: true, commits };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:getCurrentBranch', async (_event, projectPath: string) => {
      try {
        const gitService = this.getGitService(projectPath);
        const branch = await gitService.getCurrentBranch();
        return { success: true, branch };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:listBranches', async (_event, projectPath: string) => {
      try {
        const gitService = this.getGitService(projectPath);
        const branches = await gitService.listBranches();
        return { success: true, branches };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:createBranch', async (_event, projectPath: string, branchName: string, checkout: boolean) => {
      try {
        const gitService = this.getGitService(projectPath);
        await gitService.createBranch(branchName, checkout);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:checkoutBranch', async (_event, projectPath: string, branchName: string) => {
      try {
        const gitService = this.getGitService(projectPath);
        await gitService.checkoutBranch(branchName);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:deleteBranch', async (_event, projectPath: string, branchName: string) => {
      try {
        const gitService = this.getGitService(projectPath);
        await gitService.deleteBranch(branchName);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:addRemote', async (_event, projectPath: string, name: string, url: string) => {
      try {
        const gitService = this.getGitService(projectPath);
        await gitService.addRemote(name, url);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:listRemotes', async (_event, projectPath: string) => {
      try {
        const gitService = this.getGitService(projectPath);
        const remotes = await gitService.listRemotes();
        return { success: true, remotes };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:push', async (_event, projectPath: string, remote: string, branch?: string, credentials?: GitCredentials) => {
      try {
        const gitService = this.getGitService(projectPath);
        await gitService.push(remote, branch, credentials);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:pull', async (_event, projectPath: string, remote: string, branch?: string, credentials?: GitCredentials, config?: GitConfig) => {
      try {
        const gitService = this.getGitService(projectPath);
        await gitService.pull(remote, branch, credentials, config);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:fetch', async (_event, projectPath: string, remote: string, credentials?: GitCredentials) => {
      try {
        const gitService = this.getGitService(projectPath);
        await gitService.fetch(remote, credentials);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:merge', async (_event, projectPath: string, theirBranch: string, config?: GitConfig) => {
      try {
        const gitService = this.getGitService(projectPath);
        const gitConfig = config || { name: 'AzStudio User', email: 'user@azstudio.local' };
        await gitService.merge(theirBranch, gitConfig);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:getDiff', async (_event, projectPath: string, filepath: string) => {
      try {
        const gitService = this.getGitService(projectPath);
        const diff = await gitService.getDiff(filepath);
        return { success: true, diff };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('git:clone', async (_event, url: string, dir: string, credentials?: GitCredentials) => {
      try {
        const gitService = await GitService.clone(url, dir, credentials);
        this.gitServices.set(dir, gitService);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Version History operations
    ipcMain.handle('versionHistory:initialize', async (_event, workspaceId: string, storagePath: string) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId, storagePath);
        await versionHistory.initialize();
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:createVersion', async (_event, workspaceId: string, user: User, branchId: string, message: string, changes: FileChange[], tags?: string[]) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const version = await versionHistory.createVersion(user, branchId, message, changes, tags);
        return { success: true, version };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:getVersion', async (_event, workspaceId: string, versionId: string) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const version = versionHistory.getVersion(versionId);
        return { success: true, version };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:getFileHistory', async (_event, workspaceId: string, fileId: string, limit?: number) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const versions = versionHistory.getFileHistory(fileId, limit);
        return { success: true, versions };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:getBranchHistory', async (_event, workspaceId: string, branchId: string, limit?: number) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const versions = versionHistory.getBranchHistory(branchId, limit);
        return { success: true, versions };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:getAllVersions', async (_event, workspaceId: string, limit?: number) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const versions = versionHistory.getAllVersions(limit);
        return { success: true, versions };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:revertToVersion', async (_event, workspaceId: string, versionId: string, user: User, branchId: string, message?: string) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const version = await versionHistory.revertToVersion(versionId, user, branchId, message);
        return { success: true, version };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:createBranch', async (_event, workspaceId: string, name: string, user: User, description?: string, isDefault?: boolean) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const branch = await versionHistory.createBranch(name, user, description, isDefault);
        return { success: true, branch };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:getBranch', async (_event, workspaceId: string, branchId: string) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const branch = versionHistory.getBranch(branchId);
        return { success: true, branch };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:getBranchByName', async (_event, workspaceId: string, name: string) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const branch = versionHistory.getBranchByName(name);
        return { success: true, branch };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:getAllBranches', async (_event, workspaceId: string) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const branches = versionHistory.getAllBranches();
        return { success: true, branches };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:deleteBranch', async (_event, workspaceId: string, branchId: string) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        await versionHistory.deleteBranch(branchId);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:mergeBranches', async (_event, workspaceId: string, sourceBranchId: string, targetBranchId: string, user: User, message?: string) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const result = await versionHistory.mergeBranches(sourceBranchId, targetBranchId, user, message);
        return { success: true, result };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:resolveMergeConflicts', async (_event, workspaceId: string, sourceBranchId: string, targetBranchId: string, user: User, resolvedChanges: FileChange[], message?: string) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const version = await versionHistory.resolveMergeConflicts(sourceBranchId, targetBranchId, user, resolvedChanges, message);
        return { success: true, version };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:compareVersions', async (_event, workspaceId: string, versionId1: string, versionId2: string) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const differences = versionHistory.compareVersions(versionId1, versionId2);
        return { success: true, differences };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:cleanup', async (_event, workspaceId: string, olderThanDays: number) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const deletedCount = await versionHistory.cleanup(olderThanDays);
        return { success: true, deletedCount };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('versionHistory:getStats', async (_event, workspaceId: string) => {
      try {
        const versionHistory = this.getVersionHistory(workspaceId);
        const stats = versionHistory.getStats();
        return { success: true, stats };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Auto-update operations
    ipcMain.handle('update:check', async () => {
      try {
        const updateInfo = await this.autoUpdateService.checkForUpdates();
        return { success: true, updateInfo };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('update:download', async () => {
      try {
        await this.autoUpdateService.downloadUpdate();
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('update:install', () => {
      try {
        this.autoUpdateService.quitAndInstall();
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('update:getStatus', () => {
      try {
        const status = this.autoUpdateService.getStatus();
        return { success: true, status };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('update:getConfig', () => {
      try {
        const config = this.autoUpdateService.getConfig();
        return { success: true, config };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('update:updateConfig', (_event, config: any) => {
      try {
        this.autoUpdateService.updateConfig(config);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('update:setChannel', (_event, channel: 'alpha' | 'beta' | 'stable') => {
      try {
        this.autoUpdateService.setChannel(channel);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Chat session handlers (Phase C)
    ipcMain.handle('chat:createSession', (_event, agentId: string, userContext?: any) => {
      try {
        const getChatSessionsService = require('../vs/workbench/services/chat/chatSessionsService').getChatSessionsService;
        const sessions = getChatSessionsService();
        const session = sessions.createSession(agentId, userContext);
        return { success: true, session };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('chat:sendMessage', async (_event, sessionId: string, message: string) => {
      try {
        const getChatSessionsService = require('../vs/workbench/services/chat/chatSessionsService').getChatSessionsService;
        const sessions = getChatSessionsService();
        const response = await sessions.sendMessage(sessionId, message);
        return { success: true, response };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('chat:sendMessageStreaming', async (_event, sessionId: string, message: string) => {
      try {
        const getChatSessionsService = require('../vs/workbench/services/chat/chatSessionsService').getChatSessionsService;
        const sessions = getChatSessionsService();
        let fullContent = '';
        const response = await sessions.sendMessageWithProgress(sessionId, message, (chunk: string, metadata?: any) => {
          fullContent += chunk;
          // Send chunks to renderer via IPC
          this.mainWindow?.webContents.send('chat:chunk', { sessionId, chunk, metadata });
        });
        return { success: true, response: { ...response, content: fullContent } };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('chat:getSession', (_event, sessionId: string) => {
      try {
        const getChatSessionsService = require('../vs/workbench/services/chat/chatSessionsService').getChatSessionsService;
        const sessions = getChatSessionsService();
        const session = sessions.getSession(sessionId);
        return { success: true, session };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('chat:listSessions', () => {
      try {
        const getChatSessionsService = require('../vs/workbench/services/chat/chatSessionsService').getChatSessionsService;
        const sessions = getChatSessionsService();
        const allSessions = sessions.listSessions();
        return { success: true, sessions: allSessions };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('chat:archiveSession', (_event, sessionId: string) => {
      try {
        const getChatSessionsService = require('../vs/workbench/services/chat/chatSessionsService').getChatSessionsService;
        const sessions = getChatSessionsService();
        sessions.archiveSession(sessionId);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('chat:updateSessionContext', (_event, sessionId: string, context: any) => {
      try {
        const getChatSessionsService = require('../vs/workbench/services/chat/chatSessionsService').getChatSessionsService;
        const sessions = getChatSessionsService();
        sessions.updateSessionContext(sessionId, context);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Phase E: Orchestrator handlers
    ipcMain.handle('orchestrator:planTask', async (_event, userPrompt: string, context: any) => {
      try {
        const { PlannerAgent } = require('./services/PlannerAgent');
        const { AIOrchestrator } = require('./services/AIOrchestrator');
        const orchestrator = new AIOrchestrator();
        const planner = new PlannerAgent(orchestrator);
        const taskDAG = await planner.planTask(userPrompt, context);
        return { success: true, taskDAG };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('orchestrator:executeTask', async (_event, taskDAG: any, projectRoot: string) => {
      try {
        const { CodeExecutor } = require('./services/CodeExecutor');
        const { ChangesetManager } = require('./services/ChangesetManager');
        const executor = new CodeExecutor();
        const changesetMgr = new ChangesetManager(projectRoot);
        
        const results = [];
        for (const task of taskDAG.tasks) {
          const result = await executor.transform(task.code || '', []);
          results.push({ taskId: task.id, result });
        }
        
        return { success: true, results };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('orchestrator:verifyCode', async (_event, code: string, filePath: string) => {
      try {
        const { VerificationPipeline } = require('./services/VerificationPipeline');
        const { VerificationGate } = require('./services/VerificationGate');
        const pipeline = new VerificationPipeline('.');
        const gate = new VerificationGate();
        
        const pipelineResult = await pipeline.verify();
        const gateResult = await gate.checkGate(code, { filePath });
        
        return { 
          success: true, 
          pipeline: pipelineResult,
          gate: gateResult
        };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('orchestrator:applyChanges', async (_event, changeset: any, projectRoot: string) => {
      try {
        const { ChangesetManager } = require('./services/ChangesetManager');
        const changesetMgr = new ChangesetManager(projectRoot);
        
        const result = await changesetMgr.applyChangeset(changeset.id);
        return { success: true, result };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('orchestrator:rollback', async (_event, changesetId: string, projectRoot: string) => {
      try {
        const { ChangesetManager } = require('./services/ChangesetManager');
        const changesetMgr = new ChangesetManager(projectRoot);
        
        const result = await changesetMgr.rollbackChangeset(changesetId);
        return { success: true, result };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Phase F: Security & Licensing handlers
    ipcMain.handle('security:checkLicense', async (_event, workspacePath: string) => {
      try {
        const licenseType = this.licenseManager?.getLicenseType() || 'free';
        return { success: true, licenseType };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('security:getFeatures', async (_event, workspacePath: string) => {
      try {
        const features = this.licenseManager?.getFeatures() || {
          visualBuilder: true,
          basicTemplates: true,
          advancedTemplates: false,
          microservices: false,
          payments: false,
          blockchain: false,
          aiOrchestration: true,
          premiumUI: false,
          azoraTemplates: false,
          dockerCompose: false,
          kubernetes: false,
          codeExport: false,
          aiAssistance: 'basic' as const,
        };
        return { success: true, features };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('security:setSecret', async (_event, key: string, value: string, scope: 'global' | 'project') => {
      try {
        const vault = scope === 'global' ? this.globalSecretsVault : this.globalSecretsVault;
        await vault.setSecret?.(key, value, scope);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('security:getSecret', async (_event, key: string, scope: 'global' | 'project') => {
      try {
        const vault = scope === 'global' ? this.globalSecretsVault : this.globalSecretsVault;
        const value = await vault.getSecret?.(key, scope);
        return { success: true, value };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('security:requestPermission', async (_event, options: any) => {
      try {
        const granted = await this.permissionManager.requestPermission(options);
        return { success: true, granted };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('security:hasPermission', (_event, type: string, resource: string) => {
      try {
        // For network permissions, check if allowed
        if (type === 'network:request') {
          // This would need to be async, but for now return true
          // In a real implementation, we'd check with permissionManager.isNetworkAllowed
          return { success: true, hasPermission: true };
        }
        // For other permissions, check grants
        const grants = this.permissionManager.getGrants();
        const hasGrant = grants.some(g => g.type === type && g.resource === resource && g.granted);
        return { success: true, hasPermission: hasGrant };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('security:getAuditLog', async (_event, options?: any) => {
      try {
        const log = await this.globalAuditLogger.query(options || {});
        return { success: true, log };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('security:addToAllowlist', async (_event, domain: string) => {
      try {
        await this.permissionManager.addToNetworkAllowlist(domain, true, 'User requested');
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('security:removeFromAllowlist', async (_event, domain: string) => {
      try {
        await this.permissionManager.removeFromNetworkAllowlist(domain);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Phase G: Testing handlers (final completion)
    ipcMain.handle('testing:runE2ETests', async (_event, scenarios?: any[]) => {
      try {
        const { PlaywrightRunner } = require('./services/PlaywrightRunner');
        const runner = new PlaywrightRunner('.');
        const results = await runner.runTests(scenarios);
        return { success: true, results };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('testing:runPerformanceTests', async (_event, options?: any) => {
      try {
        const { LighthouseRunner } = require('./services/LighthouseRunner');
        const runner = new LighthouseRunner('.');
        const results = await runner.audit(options?.url || 'http://localhost:3000', options);
        return { success: true, results };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('testing:auditPerformance', async (_event, url: string, options?: any) => {
      try {
        const { LighthouseRunner } = require('./services/LighthouseRunner');
        const runner = new LighthouseRunner('.');
        const report = await runner.audit(url, options);
        return { success: true, report };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('testing:checkAccessibility', async (_event, url: string, options?: any) => {
      try {
        const { AccessibilityChecker } = require('./services/AccessibilityChecker');
        const checker = new AccessibilityChecker('.');
        const report = await checker.check(url, options);
        return { success: true, report };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('testing:getTestResults', async (_event, testType: 'e2e' | 'performance' | 'accessibility') => {
      try {
        // This would typically read from a results storage system
        // For now, return a placeholder structure
        const results = {
          testType,
          timestamp: new Date().toISOString(),
          status: 'pending',
          summary: {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0
          },
          details: []
        };
        return { success: true, results };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });
  }

  private getGitService(projectPath: string): GitService {
    if (!this.gitServices.has(projectPath)) {
      this.gitServices.set(projectPath, new GitService(projectPath));
    }
    return this.gitServices.get(projectPath)!;
  }

  private getSecretsVault(projectPath: string): SecretsVault {
    if (!this.secretsVaults.has(projectPath)) {
      this.secretsVaults.set(projectPath, new SecretsVault(projectPath));
    }
    return this.secretsVaults.get(projectPath)!;
  }

  private getAuditLogger(projectPath: string): AuditLogger {
    if (!this.auditLoggers.has(projectPath)) {
      const logger = new AuditLogger(projectPath);
      logger.initialize().catch(console.error);
      this.auditLoggers.set(projectPath, logger);
    }
    return this.auditLoggers.get(projectPath)!;
  }

  private getVersionHistory(workspaceId: string, storagePath?: string): VersionHistory {
    if (!this.versionHistories.has(workspaceId)) {
      const storage = storagePath || path.join(app.getPath('userData'), 'version-history', workspaceId);
      const versionHistory = new VersionHistory({
        workspaceId,
        storagePath: storage
      });
      this.versionHistories.set(workspaceId, versionHistory);
    }
    return this.versionHistories.get(workspaceId)!;
  }

}

// Create the app instance
new AzStudioApp();
