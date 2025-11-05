/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';

export interface ElaraResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CodeAnalysis {
  explanation?: string;
  suggestions?: string[];
  review?: string;
  complexity?: number;
  issues?: string[];
}

export interface CompletionItem {
  text: string;
  kind?: vscode.CompletionItemKind;
  detail?: string;
  documentation?: string;
}

export class ElaraClient {
  private baseUrl: string;

  constructor(port: number = 3001) {
    this.baseUrl = `http://localhost:${port}`;
  }

  async getCompletion(prefix: string, language: string): Promise<CompletionItem[]> {
    try {
      const response: AxiosResponse<ElaraResponse<CompletionItem[]>> = await axios.post(
        `${this.baseUrl}/api/completion`,
        { prefix, language },
        { timeout: 5000 }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Elara completion error:', error);
      return [];
    }
  }

  async getCodeAnalysis(code: string, language: string): Promise<ElaraResponse<CodeAnalysis>> {
    try {
      const response: AxiosResponse<ElaraResponse<CodeAnalysis>> = await axios.post(
        `${this.baseUrl}/api/analyze`,
        { code, language },
        { timeout: 10000 }
      );

      return response.data;
    } catch (error) {
      console.error('Elara analysis error:', error);
      return { success: false, error: 'Failed to analyze code' };
    }
  }

  async getSuggestions(query: string): Promise<string[]> {
    try {
      const response: AxiosResponse<ElaraResponse<string[]>> = await axios.post(
        `${this.baseUrl}/api/suggestions`,
        { query },
        { timeout: 10000 }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Elara suggestions error:', error);
      return [];
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/health`, { timeout: 2000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export class ElaraCompletionProvider implements vscode.InlineCompletionItemProvider {
  constructor(private client: ElaraClient) {}

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionItem[]> {
    const linePrefix = document.lineAt(position).text.substr(0, position.character);

    if (linePrefix.trim().length < 2) {
      return [];
    }

    const completions = await this.client.getCompletion(linePrefix, document.languageId);

    return completions.map(completion => ({
      insertText: completion.text,
      range: new vscode.Range(position, position)
    }));
  }
}

export class ElaraCodeActionProvider implements vscode.CodeActionProvider {
  constructor(private client: ElaraClient) {}

  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.CodeAction[]> {
    const selectedText = document.getText(range);

    if (!selectedText.trim()) {
      return [];
    }

    const actions: vscode.CodeAction[] = [];

    // Add quick fix for optimization
    const optimizeAction = new vscode.CodeAction(
      'Optimize with Elara Ω',
      vscode.CodeActionKind.QuickFix
    );
    optimizeAction.command = {
      command: 'elara.optimizeCode',
      title: 'Optimize Code',
      arguments: [range]
    };
    actions.push(optimizeAction);

    // Add quick fix for refactoring
    const refactorAction = new vscode.CodeAction(
      'Refactor with Elara Ω',
      vscode.CodeActionKind.QuickFix
    );
    refactorAction.command = {
      command: 'elara.refactorCode',
      title: 'Refactor Code',
      arguments: [range]
    };
    actions.push(refactorAction);

    return actions;
  }
}

export class ElaraStatusBar {
  private statusBarItem: vscode.StatusBarItem;
  private connected: boolean = false;

  constructor(private client: ElaraClient) {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusBarItem.command = 'elara.showStatus';
    this.updateStatus();
    this.statusBarItem.show();

    // Update status every 30 seconds
    setInterval(() => this.updateStatus(), 30000);
  }

  private async updateStatus() {
    this.connected = await this.client.isConnected();

    if (this.connected) {
      this.statusBarItem.text = '$(robot) ELARA Ω';
      this.statusBarItem.tooltip = 'Elara AI is connected and ready';
      this.statusBarItem.backgroundColor = undefined;
    } else {
      this.statusBarItem.text = '$(warning) ELARA Ω';
      this.statusBarItem.tooltip = 'Elara AI is disconnected - check Azora OS services';
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    }
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}

export class ElaraChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'elara.chatView';

  constructor(private extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(
      async (message: any) => {
        switch (message.type) {
          case 'askQuestion':
            // Handle chat messages here
            // This would integrate with the Elara client
            break;
        }
      },
      undefined,
      []
    );
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Elara Chat</title>
        <style>
          body {
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            margin: 0;
            padding: 10px;
          }
          .chat-container {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          .messages {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 10px;
          }
          .message {
            margin: 5px 0;
            padding: 8px;
            border-radius: 4px;
          }
          .message.user {
            background-color: var(--vscode-textBlockQuote-background);
            margin-left: 20px;
          }
          .message.elara {
            background-color: var(--vscode-textPreformat-background);
            margin-right: 20px;
          }
          .input-container {
            display: flex;
          }
          .input {
            flex: 1;
            padding: 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
          }
          .send-button {
            margin-left: 8px;
            padding: 8px 16px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .send-button:hover {
            background-color: var(--vscode-button-hoverBackground);
          }
        </style>
      </head>
      <body>
        <div class="chat-container">
          <div class="messages" id="messages">
            <div class="message elara">
              <strong>ELARA Ω:</strong> Hello! I'm your omniscient AI assistant. How can I help you today?
            </div>
          </div>
          <div class="input-container">
            <input type="text" class="input" id="messageInput" placeholder="Ask me anything...">
            <button class="send-button" id="sendButton">Send</button>
          </div>
        </div>

        <script>
          const vscode = acquireVsCodeApi();
          const messagesDiv = document.getElementById('messages');
          const messageInput = document.getElementById('messageInput');
          const sendButton = document.getElementById('sendButton');

          sendButton.addEventListener('click', () => {
            const message = messageInput.value.trim();
            if (message) {
              addMessage('user', message);
              messageInput.value = '';
              vscode.postMessage({ type: 'askQuestion', text: message });
            }
          });

          messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              sendButton.click();
            }
          });

          function addMessage(sender, text) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + sender;
            messageDiv.innerHTML = '<strong>' + (sender === 'user' ? 'You:' : 'ELARA Ω:') + '</strong> ' + text;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
          }

          window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'response') {
              addMessage('elara', message.text);
            }
          });
        </script>
      </body>
      </html>
    `;
  }
}
