import * as vscode from 'vscode';
import { getChatAgentService } from '../../../src/vs/workbench/services/chat/chatAgentService';

export class ChatExplorerProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
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
    const chat = getChatAgentService();
    const agents = chat.listAgents();
    return agents.map(a => {
      const t = new vscode.TreeItem(`${a.name} — ${a.description || ''}`, vscode.TreeItemCollapsibleState.None);
      t.command = { command: 'azora.openChatWithAgent', title: 'Open Chat', arguments: [a.id] };
      return t;
    });
  }
}

export default ChatExplorerProvider;
