import * as vscode from 'vscode';
import { getAzoraAgentRegistry } from '../../../src/vs/workbench/services/azora/agentRegistryService';
import { getChatSessionsService } from '../../../src/vs/workbench/services/chat/chatSessionsService';

export class AgentSessionsProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor() {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
    const chatSessions = getChatSessionsService();
    const sessions = chatSessions.listSessions();
    if (sessions.length === 0) return [];
    return sessions.map(s => {
      const item = new vscode.TreeItem(`${s.agentId} — ${s.id}`);
      item.command = { command: 'azora.openSessionChat', title: 'Open Chat Session', arguments: [s.id] };
      return item;
    });
  }
}

export default AgentSessionsProvider;
