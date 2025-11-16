import * as vscode from 'vscode';
import { Task } from '../parsers/taskParser';

export class TaskDetailPanel {
  private panel: vscode.WebviewPanel | undefined;

  show(task: Task): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Beside);
    } else {
      this.panel = vscode.window.createWebviewPanel(
        'kiroTaskDetail',
        'Task Details',
        vscode.ViewColumn.Beside,
        { enableScripts: true }
      );

      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });
    }

    this.panel.webview.html = this.getHtmlContent(task);
  }

  private getHtmlContent(task: Task): string {
    const statusIcon = task.completed ? '✓' : '○';
    const statusText = task.completed ? 'Completed' : 'Incomplete';
    const statusColor = task.completed ? '#00AA44' : '#FF9900';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Details</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
            line-height: 1.6;
        }

        .container {
            max-width: 600px;
        }

        .header {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--vscode-editor-lineHighlightBackground);
        }

        .status-icon {
            font-size: 32px;
            flex-shrink: 0;
        }

        .header-content h1 {
            font-size: 20px;
            margin-bottom: 8px;
            word-break: break-word;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-badge.completed {
            background: rgba(0, 170, 68, 0.2);
            color: #00AA44;
            border: 1px solid #00AA44;
        }

        .status-badge.incomplete {
            background: rgba(255, 153, 0, 0.2);
            color: #FF9900;
            border: 1px solid #FF9900;
        }

        .section {
            margin-bottom: 25px;
        }

        .section-title {
            font-size: 12px;
            text-transform: uppercase;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
            letter-spacing: 1px;
            font-weight: 600;
        }

        .section-content {
            background: var(--vscode-editor-lineHighlightBackground);
            border-radius: 6px;
            padding: 15px;
            font-size: 13px;
        }

        .metadata {
            display: grid;
            gap: 12px;
        }

        .metadata-item {
            display: grid;
            grid-template-columns: 120px 1fr;
            gap: 10px;
        }

        .metadata-label {
            color: var(--vscode-descriptionForeground);
            font-weight: 600;
            font-size: 12px;
        }

        .metadata-value {
            color: var(--vscode-editor-foreground);
            font-family: monospace;
            word-break: break-all;
        }

        .requirements {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .requirement-tag {
            background: #0066CC;
            color: white;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }

        .optional-badge {
            background: rgba(255, 153, 0, 0.2);
            color: #FF9900;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid #FF9900;
        }

        .actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 20px;
        }

        button {
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-primary {
            background: #0066CC;
            color: white;
        }

        .btn-primary:hover {
            background: #0052A3;
        }

        .btn-secondary {
            background: var(--vscode-editor-lineHighlightBackground);
            color: var(--vscode-editor-foreground);
            border: 1px solid var(--vscode-editor-lineHighlightBackground);
        }

        .btn-secondary:hover {
            background: var(--vscode-editor-background);
            border-color: var(--vscode-editor-foreground);
        }

        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--vscode-descriptionForeground);
        }

        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="status-icon">${statusIcon}</div>
            <div class="header-content">
                <h1>${task.title}</h1>
                <span class="status-badge ${task.completed ? 'completed' : 'incomplete'}">
                    ${statusText}
                </span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Metadata</div>
            <div class="section-content">
                <div class="metadata">
                    <div class="metadata-item">
                        <div class="metadata-label">File</div>
                        <div class="metadata-value">${task.filePath}</div>
                    </div>
                    <div class="metadata-item">
                        <div class="metadata-label">Line</div>
                        <div class="metadata-value">${task.lineNumber}</div>
                    </div>
                    <div class="metadata-item">
                        <div class="metadata-label">Level</div>
                        <div class="metadata-value">Level ${task.level}</div>
                    </div>
                    ${task.optional ? `
                    <div class="metadata-item">
                        <div class="metadata-label">Type</div>
                        <div class="metadata-value">
                            <span class="optional-badge">Optional</span>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>

        ${
          task.requirements && task.requirements.length > 0
            ? `
        <div class="section">
            <div class="section-title">Requirements</div>
            <div class="section-content">
                <div class="requirements">
                    ${task.requirements.map((req) => `<span class="requirement-tag">${req}</span>`).join('')}
                </div>
            </div>
        </div>
        `
            : ''
        }

        <div class="actions">
            <button class="btn-primary" onclick="toggleTask()">
                ${task.completed ? '↩️ Reopen' : '✓ Complete'}
            </button>
            <button class="btn-secondary" onclick="openFile()">
                📄 Open File
            </button>
        </div>
    </div>

    <script>
        function toggleTask() {
            vscode.postMessage({
                command: 'toggleTask',
                task: ${JSON.stringify(task)}
            });
        }

        function openFile() {
            vscode.postMessage({
                command: 'openFile',
                filePath: '${task.filePath}',
                lineNumber: ${task.lineNumber}
            });
        }

        const vscode = acquireVsCodeApi();
    </script>
</body>
</html>
    `;
  }

  dispose(): void {
    if (this.panel) {
      this.panel.dispose();
    }
  }
}
