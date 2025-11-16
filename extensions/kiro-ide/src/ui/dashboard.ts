import * as vscode from 'vscode';
import { Task, TaskFile } from '../parsers/taskParser';
import { ProgressCalculator } from '../utils/progressCalculator';

export class Dashboard {
  private panel: vscode.WebviewPanel | undefined;

  show(taskFiles: TaskFile[]): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'kiroDashboard',
      'Kiro Progress Dashboard',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    this.panel.webview.html = this.getHtmlContent(taskFiles);

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  private getHtmlContent(taskFiles: TaskFile[]): string {
    const allTasks = taskFiles.flatMap((tf) => tf.tasks);
    const summary = ProgressCalculator.getProgressSummary(allTasks);
    const timeEstimate = ProgressCalculator.estimateTimeToCompletion(allTasks);

    const tasksByFile = taskFiles.map((tf) => ({
      title: tf.title,
      path: tf.path,
      summary: ProgressCalculator.getProgressSummary(tf.tasks),
    }));

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kiro Progress Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        h1 {
            font-size: 28px;
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .summary-card {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-editor-lineHighlightBackground);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }

        .summary-card h3 {
            font-size: 12px;
            text-transform: uppercase;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
            letter-spacing: 1px;
        }

        .summary-card .value {
            font-size: 32px;
            font-weight: bold;
            color: var(--vscode-editor-foreground);
        }

        .progress-section {
            margin-bottom: 40px;
        }

        .progress-section h2 {
            font-size: 18px;
            margin-bottom: 15px;
            color: var(--vscode-editor-foreground);
        }

        .progress-bar-container {
            background: var(--vscode-editor-lineHighlightBackground);
            border-radius: 4px;
            height: 24px;
            overflow: hidden;
            margin-bottom: 10px;
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #0066CC, #3399FF);
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
        }

        .progress-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        .file-list {
            display: grid;
            gap: 15px;
        }

        .file-item {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-editor-lineHighlightBackground);
            border-radius: 6px;
            padding: 15px;
        }

        .file-item h3 {
            font-size: 14px;
            margin-bottom: 10px;
            color: var(--vscode-editor-foreground);
        }

        .file-item .path {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
            font-family: monospace;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            font-size: 12px;
        }

        .stat {
            text-align: center;
        }

        .stat-label {
            color: var(--vscode-descriptionForeground);
            font-size: 10px;
            text-transform: uppercase;
        }

        .stat-value {
            font-weight: bold;
            color: var(--vscode-editor-foreground);
            font-size: 16px;
        }

        .time-estimate {
            background: var(--vscode-editor-lineHighlightBackground);
            border-left: 3px solid #0066CC;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
            font-size: 13px;
        }

        .time-estimate strong {
            color: #0066CC;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid var(--vscode-editor-lineHighlightBackground);
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Kiro Progress Dashboard</h1>

        <div class="summary-grid">
            <div class="summary-card">
                <h3>Total Tasks</h3>
                <div class="value">${summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>Completed</h3>
                <div class="value">${summary.completed}</div>
            </div>
            <div class="summary-card">
                <h3>Remaining</h3>
                <div class="value">${summary.remaining}</div>
            </div>
            <div class="summary-card">
                <h3>Progress</h3>
                <div class="value">${summary.percentage}%</div>
            </div>
        </div>

        <div class="progress-section">
            <h2>Overall Progress</h2>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${summary.percentage}%">
                    ${summary.percentage > 5 ? summary.percentage + '%' : ''}
                </div>
            </div>
            <div class="progress-info">
                <span>${summary.completed} of ${summary.total} tasks completed</span>
                <span>${summary.optional} optional tasks</span>
            </div>
        </div>

        <div class="progress-section">
            <h2>By Spec</h2>
            <div class="file-list">
                ${tasksByFile
                  .map(
                    (file) => `
                <div class="file-item">
                    <h3>${file.title}</h3>
                    <div class="path">${file.path}</div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${file.summary.percentage}%">
                            ${file.summary.percentage > 5 ? file.summary.percentage + '%' : ''}
                        </div>
                    </div>
                    <div class="stats">
                        <div class="stat">
                            <div class="stat-label">Total</div>
                            <div class="stat-value">${file.summary.total}</div>
                        </div>
                        <div class="stat">
                            <div class="stat-label">Done</div>
                            <div class="stat-value">${file.summary.completed}</div>
                        </div>
                        <div class="stat">
                            <div class="stat-label">Left</div>
                            <div class="stat-value">${file.summary.remaining}</div>
                        </div>
                        <div class="stat">
                            <div class="stat-label">Progress</div>
                            <div class="stat-value">${file.summary.percentage}%</div>
                        </div>
                    </div>
                </div>
                `
                  )
                  .join('')}
            </div>
        </div>

        <div class="time-estimate">
            <strong>⏱️ Time Estimate:</strong> ${timeEstimate} minutes remaining at 30 min/task average
        </div>

        <div class="footer">
            Last updated: ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>
    `;
  }
}
