
import * as vscode from 'vscode';
import { getPersonalities } from './api';

export class FamilyTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor() {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      const personalities: any = await getPersonalities();
      return Promise.resolve(
        personalities.map(
          (p: any) =>
            new vscode.TreeItem(p.name, vscode.TreeItemCollapsibleState.None)
        )
      );
    }
  }
}
