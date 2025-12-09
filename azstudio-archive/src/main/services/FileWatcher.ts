import chokidar, { FSWatcher } from 'chokidar';
import * as path from 'path';

export type FileChangeType = 'add' | 'change' | 'unlink';

export interface FileChangeEvent {
  type: FileChangeType;
  path: string;
  timestamp: number;
}

export type FileChangeCallback = (event: FileChangeEvent) => void;

export class FileWatcher {
  private watcher: FSWatcher | null = null;
  private callbacks: FileChangeCallback[] = [];
  private watchedPath: string | null = null;
  private changeBuffer: Map<string, FileChangeEvent> = new Map();
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_MS = 300;

  watch(rootPath: string, callback: FileChangeCallback): void {
    if (this.watcher) {
      this.stop();
    }

    this.watchedPath = rootPath;
    this.callbacks.push(callback);

    console.log(`Starting file watcher for: ${rootPath}`);

    this.watcher = chokidar.watch(rootPath, {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/coverage/**',
        '**/.next/**',
        '**/out/**',
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.watcher
      .on('add', (filePath) => this.handleChange('add', filePath))
      .on('change', (filePath) => this.handleChange('change', filePath))
      .on('unlink', (filePath) => this.handleChange('unlink', filePath))
      .on('error', (error) => console.error('File watcher error:', error))
      .on('ready', () => console.log('File watcher ready'));
  }

  private handleChange(type: FileChangeType, filePath: string): void {
    // Only watch relevant file types
    const ext = path.extname(filePath).toLowerCase();
    const relevantExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.html', '.md'];
    
    if (!relevantExtensions.includes(ext)) {
      return;
    }

    const event: FileChangeEvent = {
      type,
      path: filePath,
      timestamp: Date.now(),
    };

    // Buffer changes to debounce rapid file changes
    this.changeBuffer.set(filePath, event);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flushChanges();
    }, this.DEBOUNCE_MS);
  }

  private flushChanges(): void {
    if (this.changeBuffer.size === 0) {
      return;
    }

    const events = Array.from(this.changeBuffer.values());
    this.changeBuffer.clear();

    console.log(`File changes detected: ${events.length} files`);

    for (const callback of this.callbacks) {
      for (const event of events) {
        callback(event);
      }
    }
  }

  stop(): void {
    if (this.watcher) {
      console.log('Stopping file watcher');
      this.watcher.close();
      this.watcher = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.callbacks = [];
    this.changeBuffer.clear();
    this.watchedPath = null;
  }

  isWatching(): boolean {
    return this.watcher !== null;
  }

  getWatchedPath(): string | null {
    return this.watchedPath;
  }
}
