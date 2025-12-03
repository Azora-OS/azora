import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('azora');
  const agentUrl = config.get<string>('agentExecutionUrl') || 'http://localhost:4002';
  const knowledgeUrl = config.get<string>('knowledgeOceanUrl') || 'http://localhost:4003';

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '$(pulse) Azora';
  statusBarItem.command = 'azora.showAgentStatus';
  statusBarItem.show();

  context.subscriptions.push(
    vscode.commands.registerCommand('azora.executeTask', async () => {
      const action = await vscode.window.showInputBox({ prompt: 'Task action' });
      if (!action) return;

      try {
        const res = await fetch(`${agentUrl}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: 'vscode', payload: { action } })
        });
        const result = await res.json();
        vscode.window.showInformationMessage(`Task executed: ${result.success}`);
      } catch (err: any) {
        vscode.window.showErrorMessage(`Failed: ${err.message}`);
      }
    }),

    vscode.commands.registerCommand('azora.showAgentStatus', async () => {
      try {
        const res = await fetch(`${agentUrl}/agents`);
        const data = await res.json();
        const panel = vscode.window.createWebviewPanel('azoraStatus', 'Azora Agents', vscode.ViewColumn.One);
        panel.webview.html = `<html><body><pre>${JSON.stringify(data, null, 2)}</pre></body></html>`;
      } catch (err: any) {
        vscode.window.showErrorMessage(`Failed: ${err.message}`);
      }
    }),

    vscode.commands.registerCommand('azora.indexWorkspace', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) return;

      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Indexing workspace...',
        cancellable: false
      }, async () => {
        try {
          const files = await vscode.workspace.findFiles('**/*.{ts,js,md}', '**/node_modules/**', 100);
          const nodes = await Promise.all(files.map(async (file) => {
            const doc = await vscode.workspace.openTextDocument(file);
            return {
              id: file.fsPath,
              path: file.fsPath,
              type: file.fsPath.endsWith('.md') ? 'documentation' : 'code',
              content: doc.getText()
            };
          }));

          await fetch(`${knowledgeUrl}/index`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': config.get<string>('apiKey') || '' },
            body: JSON.stringify(nodes)
          });

          vscode.window.showInformationMessage(`Indexed ${nodes.length} files`);
        } catch (err: any) {
          vscode.window.showErrorMessage(`Indexing failed: ${err.message}`);
        }
      });
    })
  );
}

export function deactivate() {
  statusBarItem?.dispose();
}
