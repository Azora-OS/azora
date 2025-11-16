import * as vscode from 'vscode';
import { TaskTreeProvider } from './providers/taskTreeProvider';
import { TaskFileWatcher } from './watchers/taskFileWatcher';
import { TaskParser } from './parsers/taskParser';
import { CommandHandler } from './commands/commandHandler';
import { ProgressBar } from './ui/progressBar';
import { Dashboard } from './ui/dashboard';

let taskTreeProvider: TaskTreeProvider;
let taskFileWatcher: TaskFileWatcher;
let commandHandler: CommandHandler;
let progressBarInstance: ProgressBar;
let dashboard: Dashboard;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log('Kiro IDE extension activating...');

  try {
    // Initialize providers
    taskTreeProvider = new TaskTreeProvider();
    taskFileWatcher = new TaskFileWatcher(taskTreeProvider);
    commandHandler = new CommandHandler(taskTreeProvider);
    progressBarInstance = new ProgressBar();
    dashboard = new Dashboard();

    // Register tree view
    vscode.window.registerTreeDataProvider('kiroTasksView', taskTreeProvider);

    // Register commands
    registerCommands(context, commandHandler, taskTreeProvider, progressBarInstance, dashboard);

    // Start file watcher
    await taskFileWatcher.start();

    // Load initial tasks
    await taskTreeProvider.refresh();

    // Update progress bar
    updateProgressBar();

    // Show welcome message
    vscode.window.showInformationMessage('Kiro IDE activated successfully!');

    console.log('Kiro IDE extension activated');
  } catch (error) {
    console.error('Error activating Kiro IDE:', error);
    vscode.window.showErrorMessage(`Failed to activate Kiro IDE: ${error}`);
  }
}

function registerCommands(
  context: vscode.ExtensionContext,
  commandHandler: CommandHandler,
  taskTreeProvider: TaskTreeProvider,
  progressBar: ProgressBar,
  dashboard: Dashboard
): void {
  // Refresh tasks
  context.subscriptions.push(
    vscode.commands.registerCommand('kiro.refreshTasks', async () => {
      await taskTreeProvider.refresh();
      updateProgressBar();
      vscode.window.showInformationMessage('Tasks refreshed');
    })
  );

  // Open tasks file
  context.subscriptions.push(
    vscode.commands.registerCommand('kiro.openTasksFile', async () => {
      await commandHandler.openTasksFile();
    })
  );

  // Toggle task status
  context.subscriptions.push(
    vscode.commands.registerCommand('kiro.toggleTask', async (task: any) => {
      await commandHandler.toggleTask(task);
      updateProgressBar();
    })
  );

  // Start task
  context.subscriptions.push(
    vscode.commands.registerCommand('kiro.startTask', async (task: any) => {
      await commandHandler.startTask(task);
    })
  );

  // Complete task
  context.subscriptions.push(
    vscode.commands.registerCommand('kiro.completeTask', async (task: any) => {
      await commandHandler.completeTask(task);
      updateProgressBar();
    })
  );

  // Show dashboard
  context.subscriptions.push(
    vscode.commands.registerCommand('kiro.showDashboard', async () => {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (workspaceRoot) {
        const taskFilePaths = TaskParser.findTaskFiles(workspaceRoot);
        const taskFiles = taskFilePaths.map((filePath) => TaskParser.parseTaskFile(filePath));
        dashboard.show(taskFiles);
      }
    })
  );
}

function updateProgressBar(): void {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (workspaceRoot) {
    const taskFilePaths = TaskParser.findTaskFiles(workspaceRoot);
    const allTasks = taskFilePaths.flatMap((filePath) => TaskParser.parseTaskFile(filePath).tasks);
    progressBar.update(allTasks);
  }
}

export function deactivate(): void {
  console.log('Kiro IDE extension deactivating...');
  if (taskFileWatcher) {
    taskFileWatcher.stop();
  }
  if (progressBarInstance) {
    progressBarInstance.dispose();
  }
}
