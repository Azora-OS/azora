import * as vscode from 'vscode';
import { ChatViewProvider } from './chatViewProvider';
import { FamilyTreeProvider } from './familyTreeProvider';
import { ElaraAPI } from './api';

export function activate(context: vscode.ExtensionContext) {
    const api = new ElaraAPI();
    const chatProvider = new ChatViewProvider(context.extensionUri, api);
    const familyTreeProvider = new FamilyTreeProvider(api);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('elara.chatView', chatProvider),
        vscode.window.registerTreeDataProvider('elara.familyTree', familyTreeProvider),
        
        vscode.commands.registerCommand('elara.openChat', () => {
            vscode.commands.executeCommand('elara.chatView.focus');
        }),

        vscode.commands.registerCommand('elara.selectFamily', async () => {
            const members = await api.getFamilyMembers();
            const selected = await vscode.window.showQuickPick(
                members.map(m => ({ label: `${m.name} - ${m.role}`, id: m.id })),
                { placeHolder: 'Choose an AI family member to chat with' }
            );
            if (selected) {
                chatProvider.setActiveMember(selected.id);
            }
        }),

        vscode.commands.registerCommand('elara.explainCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;
            const selection = editor.document.getText(editor.selection);
            chatProvider.sendMessage(`Explain this code:\n\`\`\`\n${selection}\n\`\`\``);
        }),

        vscode.commands.registerCommand('elara.fixCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;
            const selection = editor.document.getText(editor.selection);
            chatProvider.sendMessage(`Fix any issues in this code:\n\`\`\`\n${selection}\n\`\`\``);
        }),

        vscode.commands.registerCommand('elara.optimizeCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;
            const selection = editor.document.getText(editor.selection);
            chatProvider.sendMessage(`Optimize this code:\n\`\`\`\n${selection}\n\`\`\``);
        })
    );

    vscode.window.showInformationMessage('Elara AI Family is ready! 💚');
}

export function deactivate() {}
