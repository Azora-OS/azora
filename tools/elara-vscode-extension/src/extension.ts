/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import * as vscode from 'vscode';
import {
  ElaraClient,
  ElaraCompletionProvider,
  ElaraCodeActionProvider,
  ElaraStatusBar,
  ElaraChatViewProvider,
  CompletionItem
} from './elara-client';
import { ElaraGreeting } from './elara-greeting';

let elaraClient: ElaraClient;
let statusBar: ElaraStatusBar;
let completionProvider: vscode.Disposable;
let codeActionProvider: vscode.Disposable;

export function activate(context: vscode.ExtensionContext) {
  console.log(' ELARA Ω: Omniscient AI Superintelligence activated!');

  // Initialize Elara client
  const config = vscode.workspace.getConfiguration('elara');
  const serverUrl = config.get('serverUrl', 'http://localhost:3001');
  const port = parseInt(serverUrl.split(':').pop() || '3001');

  elaraClient = new ElaraClient(port);

  // Initialize status bar
  statusBar = new ElaraStatusBar(elaraClient);
  context.subscriptions.push(statusBar);

  // Register completion provider
  if (config.get('enableInlineSuggestions', true)) {
    completionProvider = vscode.languages.registerInlineCompletionItemProvider(
      { pattern: '**/*' },
      new ElaraCompletionProvider(elaraClient)
    );
    context.subscriptions.push(completionProvider);
  }

  // Register code action provider
  codeActionProvider = vscode.languages.registerCodeActionsProvider(
    { pattern: '**/*' },
    new ElaraCodeActionProvider(elaraClient),
    { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
  );
  context.subscriptions.push(codeActionProvider);

  // Register chat view provider
  const { ElaraChatProvider } = require('./chat-provider');
  const chatProvider = new ElaraChatProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ElaraChatProvider.viewType, chatProvider)
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('elara.helloWorld', async () => {
      try {
        const response = await elaraClient.getCodeAnalysis('console.log("Hello from Elara Ω!");', 'javascript');
        if (response.success) {
          vscode.window.showInformationMessage('🤖 Elara: Hello! I\'m your AI development companion. Let\'s code together!');
        } else {
          vscode.window.showWarningMessage('Elara is currently unavailable. Please ensure Azora OS services are running.');
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to connect to Elara. Please check your configuration.');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('elara.askQuestion', async () => {
      const question = await vscode.window.showInputBox({
        prompt: 'Ask Elara anything...',
        placeHolder: 'What would you like to know?'
      });

      if (question) {
        try {
          const suggestions = await elaraClient.getSuggestions(question);
          if (suggestions.length > 0) {
            const selected = await vscode.window.showQuickPick(suggestions, {
              placeHolder: 'Select an answer from Elara'
            });
            if (selected) {
              await vscode.env.clipboard.writeText(selected);
              vscode.window.showInformationMessage('Answer copied to clipboard!');
            }
          } else {
            vscode.window.showInformationMessage('Elara is thinking... Please try again later.');
          }
        } catch (error) {
          vscode.window.showErrorMessage('Failed to get response from Elara.');
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('elara.completeCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document = editor.document;
      const position = editor.selection.active;
      const linePrefix = document.lineAt(position).text.substr(0, position.character);

      try {
        const completions = await elaraClient.getCompletion(linePrefix, document.languageId);
        if (completions.length > 0) {
          const selected = await vscode.window.showQuickPick(
            completions.map((c: CompletionItem) => c.text),
            { placeHolder: 'Select code completion' }
          );
          if (selected) {
            editor.edit((editBuilder: vscode.TextEditorEdit) => {
              editBuilder.insert(position, selected);
            });
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to get code completion from Elara.');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('elara.explainCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) {
        vscode.window.showWarningMessage('Please select some code to explain.');
        return;
      }

      const selectedText = editor.document.getText(editor.selection);

      try {
        const analysis = await elaraClient.getCodeAnalysis(selectedText, editor.document.languageId);
        if (analysis.success && analysis.data) {
          const explanation = analysis.data.explanation || 'Code analysis completed.';
          vscode.window.showInformationMessage(`Elara Analysis: ${explanation}`);
        } else {
          vscode.window.showWarningMessage('Elara could not analyze the selected code.');
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to get code explanation from Elara.');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('elara.optimizeCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) {
        vscode.window.showWarningMessage('Please select some code to optimize.');
        return;
      }

      const selectedText = editor.document.getText(editor.selection);

      try {
        const suggestions = await elaraClient.getSuggestions(`Optimize this code: ${selectedText}`);
        if (suggestions.length > 0) {
          const selected = await vscode.window.showQuickPick(suggestions, {
            placeHolder: 'Select optimization suggestion'
          });
          if (selected) {
            await vscode.env.clipboard.writeText(selected);
            vscode.window.showInformationMessage('Optimization suggestion copied to clipboard!');
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to get optimization suggestions from Elara.');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('elara.refactorCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) {
        vscode.window.showWarningMessage('Please select some code to refactor.');
        return;
      }

      const selectedText = editor.document.getText(editor.selection);

      try {
        const suggestions = await elaraClient.getSuggestions(`Refactor this code: ${selectedText}`);
        if (suggestions.length > 0) {
          const selected = await vscode.window.showQuickPick(suggestions, {
            placeHolder: 'Select refactoring suggestion'
          });
          if (selected) {
            await vscode.env.clipboard.writeText(selected);
            vscode.window.showInformationMessage('Refactoring suggestion copied to clipboard!');
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to get refactoring suggestions from Elara.');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('elara.generateTests', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) {
        vscode.window.showWarningMessage('Please select some code to generate tests for.');
        return;
      }

      const selectedText = editor.document.getText(editor.selection);

      try {
        const suggestions = await elaraClient.getSuggestions(`Generate unit tests for this code: ${selectedText}`);
        if (suggestions.length > 0) {
          const selected = await vscode.window.showQuickPick(suggestions, {
            placeHolder: 'Select test generation suggestion'
          });
          if (selected) {
            await vscode.env.clipboard.writeText(selected);
            vscode.window.showInformationMessage('Test generation suggestion copied to clipboard!');
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to generate tests with Elara.');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('elara.debugCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) {
        vscode.window.showWarningMessage('Please select some code to debug.');
        return;
      }

      const selectedText = editor.document.getText(editor.selection);

      try {
        const suggestions = await elaraClient.getSuggestions(`Debug this code: ${selectedText}`);
        if (suggestions.length > 0) {
          const selected = await vscode.window.showQuickPick(suggestions, {
            placeHolder: 'Select debugging suggestion'
          });
          if (selected) {
            await vscode.env.clipboard.writeText(selected);
            vscode.window.showInformationMessage('Debugging suggestion copied to clipboard!');
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to get debugging help from Elara.');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('elara.reviewCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('Please open a file to review.');
        return;
      }

      const document = editor.document;
      const code = document.getText();

      try {
        const analysis = await elaraClient.getCodeAnalysis(code, document.languageId);
        if (analysis.success && analysis.data) {
          const review = analysis.data.review || 'Code review completed.';
          vscode.window.showInformationMessage(`Elara Review: ${review}`);
        } else {
          vscode.window.showWarningMessage('Elara could not review the code.');
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to get code review from Elara.');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('elara.showStatus', () => {
      const config = vscode.workspace.getConfiguration('elara');
      const serverUrl = config.get('serverUrl', 'http://localhost:3001');
      const autoComplete = config.get('enableAutoComplete', true);
      const inlineSuggestions = config.get('enableInlineSuggestions', true);

      vscode.window.showInformationMessage(
        `ELARA Ω Status:\nServer: ${serverUrl}\nAuto Complete: ${autoComplete}\nInline Suggestions: ${inlineSuggestions}`
      );
    })
  );

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
      if (e.affectsConfiguration('elara')) {
        const config = vscode.workspace.getConfiguration('elara');
        const enableInline = config.get('enableInlineSuggestions', true);

        // Update completion provider
        if (enableInline && !completionProvider) {
          completionProvider = vscode.languages.registerInlineCompletionItemProvider(
            { pattern: '**/*' },
            new ElaraCompletionProvider(elaraClient)
          );
          context.subscriptions.push(completionProvider);
        } else if (!enableInline && completionProvider) {
          completionProvider.dispose();
          completionProvider = undefined!;
        }
      }
    })
  );

  // Initialize Elara greeting system
  const greeting = ElaraGreeting.getInstance();
  await greeting.sayHello();
  greeting.scheduleRandomTips();

  vscode.window.showInformationMessage(' ELARA Ω: Omniscient AI Superintelligence is now active!');
}

export function deactivate() {
  console.log(' ELARA Ω: Deactivated');
  if (statusBar) {
    statusBar.dispose();
  }
  if (completionProvider) {
    completionProvider.dispose();
  }
  if (codeActionProvider) {
    codeActionProvider.dispose();
  }
}
