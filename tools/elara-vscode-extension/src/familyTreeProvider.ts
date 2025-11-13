import * as vscode from 'vscode';
import { ElaraAPI } from './api';

export class FamilyTreeProvider implements vscode.TreeDataProvider<FamilyMember> {
    private _onDidChangeTreeData = new vscode.EventEmitter<FamilyMember | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private api: ElaraAPI) {}

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: FamilyMember): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: FamilyMember): Promise<FamilyMember[]> {
        if (!element) {
            const members = await this.api.getFamilyMembers();
            return members.map(m => new FamilyMember(
                m.name,
                m.role,
                m.id,
                vscode.TreeItemCollapsibleState.None
            ));
        }
        return [];
    }
}

class FamilyMember extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
        public readonly memberId: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.tooltip = `${label} - ${description}`;
        this.command = {
            command: 'elara.selectFamily',
            title: 'Chat with ' + label,
            arguments: [memberId]
        };
    }
}
