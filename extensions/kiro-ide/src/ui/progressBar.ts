import * as vscode from 'vscode';
import { ProgressCalculator } from '../utils/progressCalculator';
import { Task } from '../parsers/taskParser';

export class ProgressBar {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.command = 'kiro.showDashboard';
  }

  update(tasks: Task[]): void {
    const summary = ProgressCalculator.getProgressSummary(tasks);
    const percentage = summary.percentage;

    // Create progress bar visualization
    const barLength = 20;
    const filledLength = Math.round((percentage / 100) * barLength);
    const emptyLength = barLength - filledLength;

    const bar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);

    this.statusBarItem.text = `$(rocket) Kiro: ${bar} ${percentage}% (${summary.completed}/${summary.total})`;
    this.statusBarItem.tooltip = `
Kiro Progress
━━━━━━━━━━━━━━━━━━━━━━
Total Tasks: ${summary.total}
Completed: ${summary.completed}
Remaining: ${summary.remaining}
Optional: ${summary.optional}
Progress: ${percentage}%
━━━━━━━━━━━━━━━━━━━━━━
Click to view dashboard
    `;

    this.statusBarItem.show();
  }

  show(): void {
    this.statusBarItem.show();
  }

  hide(): void {
    this.statusBarItem.hide();
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}
