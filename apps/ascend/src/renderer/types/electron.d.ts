// Electron API types for TypeScript
export interface ElectronAPI {
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

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
