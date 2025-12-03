/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * Type definitions for cross-platform workspace
 * Stub types to resolve TypeScript errors
 */

export class VirtualFileSystem {
  initialize(): Promise<void> { return Promise.resolve(); }
  watch(path: string, callback?: any): any { return null; }
  readFile(path: string): Promise<any> { return Promise.resolve(null); }
  writeFile(path: string, content: string): Promise<void> { return Promise.resolve(); }
  deleteFile(path: string): Promise<void> { return Promise.resolve(); }
  listFiles(path: string): Promise<any[]> { return Promise.resolve([]); }
  on(event: string, callback: any): void {}
}

export class TerminalManager {
  initialize(): Promise<void> { return Promise.resolve(); }
  createTerminal(options?: any): Promise<any> { return Promise.resolve({}); }
  generateTerminalId(): string { return ''; }
  getDefaultShell(): string { return ''; }
  platform: string = '';
  terminals: Map<string, any> = new Map();
}

export class DebuggerManager {
  initialize(): Promise<void> { return Promise.resolve(); }
}

export class ExtensionManager {
  initialize(): Promise<void> { return Promise.resolve(); }
  getInstalled(): Promise<any[]> { return Promise.resolve([]); }
  extensions: Map<string, any> = new Map();
  on(event: string, callback: any): void {}
}

export class ThemeManager {
  initialize(): Promise<void> { return Promise.resolve(); }
}

export class SyncManager {
  initialize(): Promise<void> { return Promise.resolve(); }
  syncFile(path: string): Promise<void> { return Promise.resolve(); }
  updateConfig(config: any): void {}
  config: any = {};
  enabled: boolean = false;
  on(event: string, callback: any): void {}
}

export class CollaborationManager {
  initialize(): Promise<void> { return Promise.resolve(); }
  joinSession(sessionId: string, userId: string, userName: string): Promise<void> { return Promise.resolve(); }
  on(event: string, callback: any): void {}
}

export class PerformanceMonitor {
  initialize(): Promise<void> { return Promise.resolve(); }
  getMetrics(): Promise<any> { return Promise.resolve({}); }
  optimize(): Promise<any> { return Promise.resolve({}); }
}

export class SecurityManager {
  initialize(): Promise<void> { return Promise.resolve(); }
  shutdown(): Promise<void> { return Promise.resolve(); }
}

export interface FileContent {
  path: string;
  content: string;
  encoding: string;
}

export interface FileInfo {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size: number;
  modified: number;
}

