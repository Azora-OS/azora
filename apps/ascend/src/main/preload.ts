import { contextBridge, ipcRenderer } from 'electron';

// ElectronAPI interface
interface ElectronAPI {
  app: {
    getVersion: () => Promise<{ success: boolean; version?: string; error?: string }>;
    getVersions: () => Promise<{ electron: string; node: string }>;
  };
  chat: {
    createSession: (agentId: string) => Promise<{ success: boolean; session?: any; error?: string }>;
    sendMessage: (sessionId: string, message: string) => Promise<{ success: boolean; response?: any; error?: string }>;
    getSession: (sessionId: string) => Promise<{ success: boolean; session?: any; error?: string }>;
  };
  orchestrator: {
    planTask: (task: string, context: any) => Promise<{ success: boolean; plan?: any; error?: string }>;
    executeTask: (planId: string) => Promise<{ success: boolean; result?: any; error?: string }>;
  };
  security: {
    checkLicense: () => Promise<{ success: boolean; valid?: boolean; error?: string }>;
    getSecret: (key: string) => Promise<{ success: boolean; secret?: string; error?: string }>;
  };
  fs: {
    openFolder: () => Promise<{ canceled: boolean; path?: string }>;
    readDir: (path: string) => Promise<{ success: boolean; entries?: any[]; error?: string }>;
    readFile: (path: string) => Promise<{ success: boolean; content?: string; error?: string }>;
    writeFile: (path: string, content: string) => Promise<{ success: boolean; error?: string }>;
    createEntry: (path: string, type: 'file' | 'directory') => Promise<{ success: boolean; error?: string }>;
    deleteEntry: (path: string) => Promise<{ success: boolean; error?: string }>;
  };
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getVersions: () => ipcRenderer.invoke('app:getVersions'),
  },
  chat: {
    createSession: (agentId: string) => ipcRenderer.invoke('chat:createSession', agentId),
    sendMessage: (sessionId: string, message: string) => ipcRenderer.invoke('chat:sendMessage', sessionId, message),
    getSession: (sessionId: string) => ipcRenderer.invoke('chat:getSession', sessionId),
  },
  orchestrator: {
    planTask: (task: string, context: any) => ipcRenderer.invoke('orchestrator:planTask', task, context),
    executeTask: (planId: string) => ipcRenderer.invoke('orchestrator:executeTask', planId),
  },
  security: {
    checkLicense: () => ipcRenderer.invoke('security:checkLicense'),
    getSecret: (key: string) => ipcRenderer.invoke('security:getSecret', key),
  },
  fs: {
    openFolder: () => ipcRenderer.invoke('fs:openFolder'),
    readDir: (path: string) => ipcRenderer.invoke('fs:readDir', path),
    readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path: string, content: string) => ipcRenderer.invoke('fs:writeFile', path, content),
    createEntry: (path: string, type: 'file' | 'directory') => ipcRenderer.invoke('fs:createEntry', path, type),
    deleteEntry: (path: string) => ipcRenderer.invoke('fs:deleteEntry', path),
  },
} as ElectronAPI);
