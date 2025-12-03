import chokidar from 'chokidar';
import { KnowledgeNode } from './types';
import fs from 'fs/promises';
import { logger } from './logger';

export class FileWatcher {
  private watcher: chokidar.FSWatcher | null = null;

  constructor(private workspacePath: string, private onChange: (nodes: KnowledgeNode[]) => Promise<void>) {}

  start() {
    this.watcher = chokidar.watch(['**/*.ts', '**/*.js', '**/*.md', '**/*.json'], {
      cwd: this.workspacePath,
      ignoreInitial: false,
      ignored: ['node_modules', '.git']
    });

    this.watcher.on('add', path => this.handleEvent(path));
    this.watcher.on('change', path => this.handleEvent(path));
    this.watcher.on('unlink', path => this.handleEvent(path));
  }

  async handleEvent(path: string) {
    try {
      const text = await fs.readFile(`${this.workspacePath}/${path}`, 'utf-8');
      const node: KnowledgeNode = {
        id: path,
        path,
        type: path.split('.').pop() ?? 'file',
        content: text
      };
      await this.onChange([node]);
    } catch (err) {
      logger.error({ err, path }, 'fileWatcher.handleEvent');
    }
  }

  stop() {
    this.watcher?.close();
    this.watcher = null;
  }
}
