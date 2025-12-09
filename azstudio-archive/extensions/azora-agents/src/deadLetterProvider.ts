import * as vscode from 'vscode';
import StorageService from '../../../src/vs/workbench/services/azora/storageService';
import IngestionQueue, { getIngestionQueue } from '../../../src/vs/workbench/services/azora/ingestionQueue';

export default class DeadLetterProvider implements vscode.TreeDataProvider<any> {
  private _onDidChangeTreeData: vscode.EventEmitter<any | undefined> = new vscode.EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: vscode.Event<any | undefined> = this._onDidChangeTreeData.event;
  private storage = new StorageService();
  constructor(private context?: vscode.ExtensionContext) {}
  refresh() { this._onDidChangeTreeData.fire(undefined); }
  getTreeItem(element: any): vscode.TreeItem {
    const item = new vscode.TreeItem(element.id, vscode.TreeItemCollapsibleState.None);
    const shortErr = (element.error || element.reason || '').toString().split('\n')[0] || '';
    item.description = `${shortErr} ${element.retries ? `| retries:${element.retries}` : ''}`.trim();
    item.tooltip = `${element.id} — ${element.error || ''}`;
    item.command = { title: 'Retry', command: 'azora.deadLetter.retry', arguments: [element] };
    return item;
  }
  async getChildren(): Promise<any[]> {
    try {
      const q = getIngestionQueue();
      const list = await q.listDeadLetter();
      return list.slice(0, 200);
    } catch (err) {
      const dead = this.storage.readJson<any[]>('ingestionDead.json') || [];
      return dead.slice(0, 200);
    }
  }
  async retry(item: any) {
    // open ingestion queue and re-enqueue item
    try {
      const q = getIngestionQueue();
      // If the queue implementation supports retry by id, use it
      if (typeof (q as any).retry === 'function') {
        const ok = await (q as any).retry(item.id || item);
        if (!ok) throw new Error('Retry failed');
      } else {
        item.retries = 0;
        q.enqueue(item);
      }
      // Remove item from dead file (if FS-based)
      const dead = this.storage.readJson<any[]>('ingestionDead.json') || [];
      const next = dead.filter(d => d.id !== item.id);
      await this.storage.writeJson('ingestionDead.json', next);
      vscode.window.showInformationMessage(`Re-enqueued ${item.id}`);
      this.refresh();
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to retry ${item.id}: ${err.message || err}`);
    }
  }
}
