import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  fs: {
    readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath: string, content: string) =>
      ipcRenderer.invoke('fs:writeFile', filePath, content),
    readDir: (dirPath: string) => ipcRenderer.invoke('fs:readDir', dirPath),
    exists: (filePath: string) => ipcRenderer.invoke('fs:exists', filePath),
  },

  // Dialog operations
  dialog: {
    openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
    openFile: (filters?: any[]) => ipcRenderer.invoke('dialog:openFile', filters),
  },

  // Window operations
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },

  // App operations
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
  },

  // Project operations
  project: {
    index: (rootPath: string) => ipcRenderer.invoke('project:index', rootPath),
    findSymbol: (name: string) => ipcRenderer.invoke('project:findSymbol', name),
    findReferences: (symbolName: string) => ipcRenderer.invoke('project:findReferences', symbolName),
    getGraph: () => ipcRenderer.invoke('project:getGraph'),
    detectFrameworks: (rootPath: string) => ipcRenderer.invoke('project:detectFrameworks', rootPath),
    getConventions: (rootPath: string) => ipcRenderer.invoke('project:getConventions', rootPath),
    detectStructure: (rootPath: string) => ipcRenderer.invoke('project:detectStructure', rootPath),
  },

  // Network sandbox operations
  network: {
    request: (url: string, options?: any) =>
      ipcRenderer.invoke('network:request', url, options),
    get: (url: string, options?: any) =>
      ipcRenderer.invoke('network:get', url, options),
    post: (url: string, body: string, options?: any) =>
      ipcRenderer.invoke('network:post', url, body, options),
    put: (url: string, body: string, options?: any) =>
      ipcRenderer.invoke('network:put', url, body, options),
    delete: (url: string, options?: any) =>
      ipcRenderer.invoke('network:delete', url, options),
    getActiveRequests: () =>
      ipcRenderer.invoke('network:getActiveRequests'),
    getStatistics: () =>
      ipcRenderer.invoke('network:getStatistics'),
    blockDomain: (domain: string, reason?: string) =>
      ipcRenderer.invoke('network:blockDomain', domain, reason),
    unblockDomain: (domain: string, reason?: string) =>
      ipcRenderer.invoke('network:unblockDomain', domain, reason),
  },

  // Audit logging operations
  audit: {
    log: (type: string, action: string, resource: string, options?: any, projectPath?: string) =>
      ipcRenderer.invoke('audit:log', type, action, resource, options, projectPath),
    query: (options: any, projectPath?: string) =>
      ipcRenderer.invoke('audit:query', options, projectPath),
    getStatistics: (projectPath?: string) =>
      ipcRenderer.invoke('audit:getStatistics', projectPath),
    export: (outputPath: string, options: any, projectPath?: string) =>
      ipcRenderer.invoke('audit:export', outputPath, options, projectPath),
    clearOldLogs: (daysToKeep: number, projectPath?: string) =>
      ipcRenderer.invoke('audit:clearOldLogs', daysToKeep, projectPath),
  },

  // Permission operations
  permissions: {
    request: (options: any) => ipcRenderer.invoke('permissions:request', options),
    grant: (type: string, resource: string, permanent: boolean, duration?: number) =>
      ipcRenderer.invoke('permissions:grant', type, resource, permanent, duration),
    revoke: (type: string, resource: string) =>
      ipcRenderer.invoke('permissions:revoke', type, resource),
    getGrants: () => ipcRenderer.invoke('permissions:getGrants'),
    isNetworkAllowed: (domain: string) =>
      ipcRenderer.invoke('permissions:isNetworkAllowed', domain),
    addToNetworkAllowlist: (domain: string, allowed: boolean, reason?: string) =>
      ipcRenderer.invoke('permissions:addToNetworkAllowlist', domain, allowed, reason),
    removeFromNetworkAllowlist: (domain: string) =>
      ipcRenderer.invoke('permissions:removeFromNetworkAllowlist', domain),
    getNetworkAllowlist: () => ipcRenderer.invoke('permissions:getNetworkAllowlist'),
    getAuditLog: () => ipcRenderer.invoke('permissions:getAuditLog'),
    addAutoGrantPattern: (pattern: string) =>
      ipcRenderer.invoke('permissions:addAutoGrantPattern', pattern),
    removeAutoGrantPattern: (pattern: string) =>
      ipcRenderer.invoke('permissions:removeAutoGrantPattern', pattern),
    getAutoGrantPatterns: () => ipcRenderer.invoke('permissions:getAutoGrantPatterns'),
  },

  // Secrets vault operations
  secrets: {
    initialize: (projectPath?: string) => ipcRenderer.invoke('secrets:initialize', projectPath),
    set: (key: string, value: string, scope: 'global' | 'project', projectPath?: string) =>
      ipcRenderer.invoke('secrets:set', key, value, scope, projectPath),
    get: (key: string, scope: 'global' | 'project', projectPath?: string) =>
      ipcRenderer.invoke('secrets:get', key, scope, projectPath),
    delete: (key: string, scope: 'global' | 'project', projectPath?: string) =>
      ipcRenderer.invoke('secrets:delete', key, scope, projectPath),
    list: (scope: 'global' | 'project', projectPath?: string) =>
      ipcRenderer.invoke('secrets:list', scope, projectPath),
    getAuditLog: (projectPath?: string) =>
      ipcRenderer.invoke('secrets:getAuditLog', projectPath),
  },

  // Git operations
  git: {
    init: (projectPath: string) => ipcRenderer.invoke('git:init', projectPath),
    isRepo: (projectPath: string) => ipcRenderer.invoke('git:isRepo', projectPath),
    status: (projectPath: string) => ipcRenderer.invoke('git:status', projectPath),
    add: (projectPath: string, filepaths: string[]) => ipcRenderer.invoke('git:add', projectPath, filepaths),
    remove: (projectPath: string, filepaths: string[]) => ipcRenderer.invoke('git:remove', projectPath, filepaths),
    commit: (projectPath: string, message: string, config?: any) => ipcRenderer.invoke('git:commit', projectPath, message, config),
    log: (projectPath: string, depth?: number) => ipcRenderer.invoke('git:log', projectPath, depth),
    getCurrentBranch: (projectPath: string) => ipcRenderer.invoke('git:getCurrentBranch', projectPath),
    listBranches: (projectPath: string) => ipcRenderer.invoke('git:listBranches', projectPath),
    createBranch: (projectPath: string, branchName: string, checkout: boolean) => ipcRenderer.invoke('git:createBranch', projectPath, branchName, checkout),
    checkoutBranch: (projectPath: string, branchName: string) => ipcRenderer.invoke('git:checkoutBranch', projectPath, branchName),
    deleteBranch: (projectPath: string, branchName: string) => ipcRenderer.invoke('git:deleteBranch', projectPath, branchName),
    addRemote: (projectPath: string, name: string, url: string) => ipcRenderer.invoke('git:addRemote', projectPath, name, url),
    deleteRemote: (projectPath: string, name: string) => ipcRenderer.invoke('git:deleteRemote', projectPath, name),
    listRemotes: (projectPath: string) => ipcRenderer.invoke('git:listRemotes', projectPath),
    push: (projectPath: string, remote: string, branch?: string, credentials?: any) => ipcRenderer.invoke('git:push', projectPath, remote, branch, credentials),
    pull: (projectPath: string, remote: string, branch?: string, credentials?: any, config?: any) => ipcRenderer.invoke('git:pull', projectPath, remote, branch, credentials, config),
    fetch: (projectPath: string, remote: string, credentials?: any) => ipcRenderer.invoke('git:fetch', projectPath, remote, credentials),
    merge: (projectPath: string, theirBranch: string, config?: any) => ipcRenderer.invoke('git:merge', projectPath, theirBranch, config),
    getDiff: (projectPath: string, filepath: string) => ipcRenderer.invoke('git:getDiff', projectPath, filepath),
    clone: (url: string, dir: string, credentials?: any) => ipcRenderer.invoke('git:clone', url, dir, credentials),
  },

  // Deployment operations
  deployment: {
    getEnvironments: () => ipcRenderer.invoke('deployment:getEnvironments'),
    getEnvironment: (id: string) => ipcRenderer.invoke('deployment:getEnvironment', id),
    createEnvironment: (name: string, type: string, target?: string) =>
      ipcRenderer.invoke('deployment:createEnvironment', name, type, target),
    updateEnvironment: (id: string, updates: any) =>
      ipcRenderer.invoke('deployment:updateEnvironment', id, updates),
    deleteEnvironment: (id: string) =>
      ipcRenderer.invoke('deployment:deleteEnvironment', id),
    setEnvironmentVariable: (environmentId: string, key: string, value: string) =>
      ipcRenderer.invoke('deployment:setEnvironmentVariable', environmentId, key, value),
    removeEnvironmentVariable: (environmentId: string, key: string) =>
      ipcRenderer.invoke('deployment:removeEnvironmentVariable', environmentId, key),
    setEnvironmentSecret: (environmentId: string, key: string, secretId: string) =>
      ipcRenderer.invoke('deployment:setEnvironmentSecret', environmentId, key, secretId),
    removeEnvironmentSecret: (environmentId: string, key: string) =>
      ipcRenderer.invoke('deployment:removeEnvironmentSecret', environmentId, key),
    configureDeploymentTarget: (environmentId: string, target: string, config: any) =>
      ipcRenderer.invoke('deployment:configureDeploymentTarget', environmentId, target, config),
    getDeploymentStatus: (environmentId: string) =>
      ipcRenderer.invoke('deployment:getDeploymentStatus', environmentId),
    getDeploymentHistory: (environmentId: string) =>
      ipcRenderer.invoke('deployment:getDeploymentHistory', environmentId),
    deployToVercel: (environmentId: string) =>
      ipcRenderer.invoke('deployment:deployToVercel', environmentId),
    deployToRailway: (environmentId: string) =>
      ipcRenderer.invoke('deployment:deployToRailway', environmentId),
    deployToDocker: (environmentId: string) =>
      ipcRenderer.invoke('deployment:deployToDocker', environmentId),
  },

  // Version History operations
  versionHistory: {
    initialize: (workspaceId: string, storagePath: string) =>
      ipcRenderer.invoke('versionHistory:initialize', workspaceId, storagePath),
    createVersion: (workspaceId: string, user: any, branchId: string, message: string, changes: any[], tags?: string[]) =>
      ipcRenderer.invoke('versionHistory:createVersion', workspaceId, user, branchId, message, changes, tags),
    getVersion: (workspaceId: string, versionId: string) =>
      ipcRenderer.invoke('versionHistory:getVersion', workspaceId, versionId),
    getFileHistory: (workspaceId: string, fileId: string, limit?: number) =>
      ipcRenderer.invoke('versionHistory:getFileHistory', workspaceId, fileId, limit),
    getBranchHistory: (workspaceId: string, branchId: string, limit?: number) =>
      ipcRenderer.invoke('versionHistory:getBranchHistory', workspaceId, branchId, limit),
    getAllVersions: (workspaceId: string, limit?: number) =>
      ipcRenderer.invoke('versionHistory:getAllVersions', workspaceId, limit),
    revertToVersion: (workspaceId: string, versionId: string, user: any, branchId: string, message?: string) =>
      ipcRenderer.invoke('versionHistory:revertToVersion', workspaceId, versionId, user, branchId, message),
    createBranch: (workspaceId: string, name: string, user: any, description?: string, isDefault?: boolean) =>
      ipcRenderer.invoke('versionHistory:createBranch', workspaceId, name, user, description, isDefault),
    getBranch: (workspaceId: string, branchId: string) =>
      ipcRenderer.invoke('versionHistory:getBranch', workspaceId, branchId),
    getBranchByName: (workspaceId: string, name: string) =>
      ipcRenderer.invoke('versionHistory:getBranchByName', workspaceId, name),
    getAllBranches: (workspaceId: string) =>
      ipcRenderer.invoke('versionHistory:getAllBranches', workspaceId),
    deleteBranch: (workspaceId: string, branchId: string) =>
      ipcRenderer.invoke('versionHistory:deleteBranch', workspaceId, branchId),
    mergeBranches: (workspaceId: string, sourceBranchId: string, targetBranchId: string, user: any, message?: string) =>
      ipcRenderer.invoke('versionHistory:mergeBranches', workspaceId, sourceBranchId, targetBranchId, user, message),
    resolveMergeConflicts: (workspaceId: string, sourceBranchId: string, targetBranchId: string, user: any, resolvedChanges: any[], message?: string) =>
      ipcRenderer.invoke('versionHistory:resolveMergeConflicts', workspaceId, sourceBranchId, targetBranchId, user, resolvedChanges, message),
    compareVersions: (workspaceId: string, versionId1: string, versionId2: string) =>
      ipcRenderer.invoke('versionHistory:compareVersions', workspaceId, versionId1, versionId2),
    cleanup: (workspaceId: string, olderThanDays: number) =>
      ipcRenderer.invoke('versionHistory:cleanup', workspaceId, olderThanDays),
    getStats: (workspaceId: string) =>
      ipcRenderer.invoke('versionHistory:getStats', workspaceId),
  },

  // Update events
  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on('update:available', callback);
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('update:downloaded', callback);
  },
  onUpdateError: (callback: (error: string) => void) => {
    ipcRenderer.on('update:error', (_event, error: string) => callback(error));
  },
  onFileChanged: (callback: (event: any) => void) => {
    ipcRenderer.on('project:fileChanged', (_event, event) => callback(event));
  },

  // AI operations
  ai: {
    generateCode: (prompt: string, context: any, model?: any) =>
      ipcRenderer.invoke('ai:generateCode', prompt, context, model),
    estimateCost: (prompt: string, context: any) =>
      ipcRenderer.invoke('ai:estimateCost', prompt, context),
  },
});

// Type definitions for TypeScript
export interface ElectronAPI {
  fs: {
    readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
    writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
    readDir: (dirPath: string) => Promise<{ success: boolean; files?: any[]; error?: string }>;
    exists: (filePath: string) => Promise<{ success: boolean; exists?: boolean }>;
  };
  dialog: {
    openFolder: () => Promise<{ success: boolean; path?: string; canceled?: boolean }>;
    openFile: (filters?: any[]) => Promise<{ success: boolean; path?: string; canceled?: boolean }>;
  };
  window: {
    minimize: () => Promise<{ success: boolean }>;
    maximize: () => Promise<{ success: boolean }>;
    close: () => Promise<{ success: boolean }>;
  };
  app: {
    getVersion: () => Promise<{ success: boolean; version?: string }>;
    getPath: (name: string) => Promise<{ success: boolean; path?: string }>;
  };
  project: {
    index: (rootPath: string) => Promise<{ success: boolean; graph?: any; error?: string }>;
    findSymbol: (name: string) => Promise<{ success: boolean; results?: any[]; error?: string }>;
    findReferences: (symbolName: string) => Promise<{ success: boolean; references?: string[]; error?: string }>;
    getGraph: () => Promise<{ success: boolean; graph?: any; error?: string }>;
  };
  network: {
    request: (url: string, options?: any) => Promise<{ success: boolean; response?: any; error?: string }>;
    get: (url: string, options?: any) => Promise<{ success: boolean; response?: any; error?: string }>;
    post: (url: string, body: string, options?: any) => Promise<{ success: boolean; response?: any; error?: string }>;
    put: (url: string, body: string, options?: any) => Promise<{ success: boolean; response?: any; error?: string }>;
    delete: (url: string, options?: any) => Promise<{ success: boolean; response?: any; error?: string }>;
    getActiveRequests: () => Promise<{ success: boolean; requests?: any[]; error?: string }>;
    getStatistics: () => Promise<{ success: boolean; statistics?: any; error?: string }>;
    blockDomain: (domain: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
    unblockDomain: (domain: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  };
  audit: {
    log: (type: string, action: string, resource: string, options?: any, projectPath?: string) => Promise<{ success: boolean; error?: string }>;
    query: (options: any, projectPath?: string) => Promise<{ success: boolean; events?: any[]; error?: string }>;
    getStatistics: (projectPath?: string) => Promise<{ success: boolean; statistics?: any; error?: string }>;
    export: (outputPath: string, options: any, projectPath?: string) => Promise<{ success: boolean; error?: string }>;
    clearOldLogs: (daysToKeep: number, projectPath?: string) => Promise<{ success: boolean; deletedCount?: number; error?: string }>;
  };
  permissions: {
    request: (options: any) => Promise<{ success: boolean; granted?: boolean; error?: string }>;
    grant: (type: string, resource: string, permanent: boolean, duration?: number) => Promise<{ success: boolean; error?: string }>;
    revoke: (type: string, resource: string) => Promise<{ success: boolean; revoked?: boolean; error?: string }>;
    getGrants: () => Promise<{ success: boolean; grants?: any[]; error?: string }>;
    isNetworkAllowed: (domain: string) => Promise<{ success: boolean; allowed?: boolean; error?: string }>;
    addToNetworkAllowlist: (domain: string, allowed: boolean, reason?: string) => Promise<{ success: boolean; error?: string }>;
    removeFromNetworkAllowlist: (domain: string) => Promise<{ success: boolean; removed?: boolean; error?: string }>;
    getNetworkAllowlist: () => Promise<{ success: boolean; allowlist?: any[]; error?: string }>;
    getAuditLog: () => Promise<{ success: boolean; auditLog?: any[]; error?: string }>;
    addAutoGrantPattern: (pattern: string) => Promise<{ success: boolean; error?: string }>;
    removeAutoGrantPattern: (pattern: string) => Promise<{ success: boolean; removed?: boolean; error?: string }>;
    getAutoGrantPatterns: () => Promise<{ success: boolean; patterns?: string[]; error?: string }>;
  };
  secrets: {
    initialize: (projectPath?: string) => Promise<{ success: boolean; error?: string }>;
    set: (key: string, value: string, scope: 'global' | 'project', projectPath?: string) => Promise<{ success: boolean; error?: string }>;
    get: (key: string, scope: 'global' | 'project', projectPath?: string) => Promise<{ success: boolean; value?: string | null; error?: string }>;
    delete: (key: string, scope: 'global' | 'project', projectPath?: string) => Promise<{ success: boolean; deleted?: boolean; error?: string }>;
    list: (scope: 'global' | 'project', projectPath?: string) => Promise<{ success: boolean; keys?: string[]; error?: string }>;
    getAuditLog: (projectPath?: string) => Promise<{ success: boolean; auditLog?: any[]; error?: string }>;
  };
  git: {
    init: (projectPath: string) => Promise<{ success: boolean; error?: string }>;
    isRepo: (projectPath: string) => Promise<{ success: boolean; isRepo?: boolean; error?: string }>;
    status: (projectPath: string) => Promise<{ success: boolean; status?: any; error?: string }>;
    add: (projectPath: string, filepaths: string[]) => Promise<{ success: boolean; error?: string }>;
    remove: (projectPath: string, filepaths: string[]) => Promise<{ success: boolean; error?: string }>;
    commit: (projectPath: string, message: string, config?: any) => Promise<{ success: boolean; sha?: string; error?: string }>;
    log: (projectPath: string, depth?: number) => Promise<{ success: boolean; commits?: any[]; error?: string }>;
    getCurrentBranch: (projectPath: string) => Promise<{ success: boolean; branch?: string; error?: string }>;
    listBranches: (projectPath: string) => Promise<{ success: boolean; branches?: any[]; error?: string }>;
    createBranch: (projectPath: string, branchName: string, checkout: boolean) => Promise<{ success: boolean; error?: string }>;
    checkoutBranch: (projectPath: string, branchName: string) => Promise<{ success: boolean; error?: string }>;
    deleteBranch: (projectPath: string, branchName: string) => Promise<{ success: boolean; error?: string }>;
    addRemote: (projectPath: string, name: string, url: string) => Promise<{ success: boolean; error?: string }>;
    deleteRemote: (projectPath: string, name: string) => Promise<{ success: boolean; error?: string }>;
    listRemotes: (projectPath: string) => Promise<{ success: boolean; remotes?: any[]; error?: string }>;
    push: (projectPath: string, remote: string, branch?: string, credentials?: any) => Promise<{ success: boolean; error?: string }>;
    pull: (projectPath: string, remote: string, branch?: string, credentials?: any, config?: any) => Promise<{ success: boolean; error?: string }>;
    fetch: (projectPath: string, remote: string, credentials?: any) => Promise<{ success: boolean; error?: string }>;
    merge: (projectPath: string, theirBranch: string, config?: any) => Promise<{ success: boolean; error?: string }>;
    getDiff: (projectPath: string, filepath: string) => Promise<{ success: boolean; diff?: string; error?: string }>;
    clone: (url: string, dir: string, credentials?: any) => Promise<{ success: boolean; error?: string }>;
  };
  deployment: {
    getEnvironments: () => Promise<any[]>;
    getEnvironment: (id: string) => Promise<any>;
    createEnvironment: (name: string, type: string, target?: string) => Promise<any>;
    updateEnvironment: (id: string, updates: any) => Promise<any>;
    deleteEnvironment: (id: string) => Promise<void>;
    setEnvironmentVariable: (environmentId: string, key: string, value: string) => Promise<void>;
    removeEnvironmentVariable: (environmentId: string, key: string) => Promise<void>;
    setEnvironmentSecret: (environmentId: string, key: string, secretId: string) => Promise<void>;
    removeEnvironmentSecret: (environmentId: string, key: string) => Promise<void>;
    configureDeploymentTarget: (environmentId: string, target: string, config: any) => Promise<void>;
    getDeploymentStatus: (environmentId: string) => Promise<any>;
    getDeploymentHistory: (environmentId: string) => Promise<any[]>;
    deployToVercel: (environmentId: string) => Promise<void>;
    deployToRailway: (environmentId: string) => Promise<void>;
    deployToDocker: (environmentId: string) => Promise<void>;
  };
  onUpdateAvailable: (callback: () => void) => void;
  onUpdateDownloaded: (callback: () => void) => void;
  onUpdateError: (callback: (error: string) => void) => void;
  onFileChanged: (callback: (event: any) => void) => void;
  ai: {
    generateCode: (prompt: string, context: any, model?: any) => Promise<{ success: boolean; response?: any; error?: string }>;
    estimateCost: (prompt: string, context: any) => Promise<{ success: boolean; cost?: number; error?: string }>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    electron: {
      deployment: {
        getEnvironments: () => Promise<any[]>;
        getEnvironment: (id: string) => Promise<any>;
        createEnvironment: (name: string, type: string, target?: string) => Promise<any>;
        updateEnvironment: (id: string, updates: any) => Promise<any>;
        deleteEnvironment: (id: string) => Promise<void>;
        setEnvironmentVariable: (environmentId: string, key: string, value: string) => Promise<void>;
        removeEnvironmentVariable: (environmentId: string, key: string) => Promise<void>;
        setEnvironmentSecret: (environmentId: string, key: string, secretId: string) => Promise<void>;
        removeEnvironmentSecret: (environmentId: string, key: string) => Promise<void>;
        configureDeploymentTarget: (environmentId: string, target: string, config: any) => Promise<void>;
        getDeploymentStatus: (environmentId: string) => Promise<any>;
        getDeploymentHistory: (environmentId: string) => Promise<any[]>;
        deployToVercel: (environmentId: string) => Promise<void>;
        deployToRailway: (environmentId: string) => Promise<void>;
        deployToDocker: (environmentId: string) => Promise<void>;
      };
      secrets: {
        setSecret: (key: string, value: string, scope: string) => Promise<string>;
      };
      versionHistory: {
        initialize: (workspaceId: string, storagePath: string) => Promise<{ success: boolean; error?: string }>;
        createVersion: (workspaceId: string, user: any, branchId: string, message: string, changes: any[], tags?: string[]) => Promise<{ success: boolean; version?: any; error?: string }>;
        getVersion: (workspaceId: string, versionId: string) => Promise<{ success: boolean; version?: any; error?: string }>;
        getFileHistory: (workspaceId: string, fileId: string, limit?: number) => Promise<{ success: boolean; versions?: any[]; error?: string }>;
        getBranchHistory: (workspaceId: string, branchId: string, limit?: number) => Promise<{ success: boolean; versions?: any[]; error?: string }>;
        getAllVersions: (workspaceId: string, limit?: number) => Promise<{ success: boolean; versions?: any[]; error?: string }>;
        revertToVersion: (workspaceId: string, versionId: string, user: any, branchId: string, message?: string) => Promise<{ success: boolean; version?: any; error?: string }>;
        createBranch: (workspaceId: string, name: string, user: any, description?: string, isDefault?: boolean) => Promise<{ success: boolean; branch?: any; error?: string }>;
        getBranch: (workspaceId: string, branchId: string) => Promise<{ success: boolean; branch?: any; error?: string }>;
        getBranchByName: (workspaceId: string, name: string) => Promise<{ success: boolean; branch?: any; error?: string }>;
        getAllBranches: (workspaceId: string) => Promise<{ success: boolean; branches?: any[]; error?: string }>;
        deleteBranch: (workspaceId: string, branchId: string) => Promise<{ success: boolean; error?: string }>;
        mergeBranches: (workspaceId: string, sourceBranchId: string, targetBranchId: string, user: any, message?: string) => Promise<{ success: boolean; result?: any; error?: string }>;
        resolveMergeConflicts: (workspaceId: string, sourceBranchId: string, targetBranchId: string, user: any, resolvedChanges: any[], message?: string) => Promise<{ success: boolean; version?: any; error?: string }>;
        compareVersions: (workspaceId: string, versionId1: string, versionId2: string) => Promise<{ success: boolean; differences?: any[]; error?: string }>;
        cleanup: (workspaceId: string, olderThanDays: number) => Promise<{ success: boolean; deletedCount?: number; error?: string }>;
        getStats: (workspaceId: string) => Promise<{ success: boolean; stats?: any; error?: string }>;
      };
    };
  }
}
