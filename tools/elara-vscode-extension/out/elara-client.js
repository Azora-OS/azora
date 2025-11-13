"use strict";
/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElaraChatViewProvider = exports.ElaraStatusBar = exports.ElaraCodeActionProvider = exports.ElaraCompletionProvider = exports.ElaraClient = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
class ElaraClient {
    constructor(port = 4000) {
        this.baseUrl = `http://localhost:${port}`;
    }
    async getCompletion(prefix, language) {
        try {
            const query = `
        query GetCodeCompletion($prefix: String!, $language: String!) {
          codeCompletion(prefix: $prefix, language: $language) {
            text
            kind
            detail
            documentation
          }
        }
      `;
            const response = await axios_1.default.post(`${this.baseUrl}/graphql`, {
                query,
                variables: { prefix, language }
            }, { timeout: 5000 });
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return [];
        }
        catch (error) {
            console.error('Elara completion error:', error);
            return [];
        }
    }
    async getCodeAnalysis(code, language) {
        try {
            const query = `
        query AnalyzeCode($code: String!, $language: String!) {
          codeAnalysis(code: $code, language: $language) {
            explanation
            suggestions
            review
            complexity
            issues
          }
        }
      `;
            const response = await axios_1.default.post(`${this.baseUrl}/graphql`, {
                query,
                variables: { code, language }
            }, { timeout: 10000 });
            return response.data;
        }
        catch (error) {
            console.error('Elara analysis error:', error);
            return { success: false, error: 'Failed to analyze code' };
        }
    }
    async getSuggestions(query) {
        try {
            const gqlQuery = `
        query GetSuggestions($query: String!) {
          suggestions(query: $query)
        }
      `;
            const response = await axios_1.default.post(`${this.baseUrl}/graphql`, {
                query: gqlQuery,
                variables: { query }
            }, { timeout: 10000 });
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return [];
        }
        catch (error) {
            console.error('Elara suggestions error:', error);
            return [];
        }
    }
    async isConnected() {
        try {
            const query = `
        query HealthCheck {
          health
        }
      `;
            const response = await axios_1.default.post(`${this.baseUrl}/graphql`, { query }, { timeout: 2000 });
            return response.status === 200 && response.data?.data?.health === true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.ElaraClient = ElaraClient;
class ElaraCompletionProvider {
    constructor(client) {
        this.client = client;
    }
    async provideInlineCompletionItems(document, position, _context, _token) {
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
exports.ElaraCompletionProvider = ElaraCompletionProvider;
class ElaraCodeActionProvider {
    constructor(client) {
        this.client = client;
    }
    async provideCodeActions(document, range, context, token) {
        const selectedText = document.getText(range);
        if (!selectedText.trim()) {
            return [];
        }
        const actions = [];
        // Add quick fix for optimization
        const optimizeAction = new vscode.CodeAction('Optimize with Elara Ω', vscode.CodeActionKind.QuickFix);
        optimizeAction.command = {
            command: 'elara.optimizeCode',
            title: 'Optimize Code',
            arguments: [range]
        };
        actions.push(optimizeAction);
        // Add quick fix for refactoring
        const refactorAction = new vscode.CodeAction('Refactor with Elara Ω', vscode.CodeActionKind.QuickFix);
        refactorAction.command = {
            command: 'elara.refactorCode',
            title: 'Refactor Code',
            arguments: [range]
        };
        actions.push(refactorAction);
        return actions;
    }
}
exports.ElaraCodeActionProvider = ElaraCodeActionProvider;
class ElaraStatusBar {
    constructor(client) {
        this.client = client;
        this.connected = false;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'elara.showStatus';
        this.updateStatus();
        this.statusBarItem.show();
        // Update status every 30 seconds
        setInterval(() => this.updateStatus(), 30000);
    }
    async updateStatus() {
        this.connected = await this.client.isConnected();
        if (this.connected) {
            this.statusBarItem.text = '$(robot) ELARA Ω';
            this.statusBarItem.tooltip = 'Elara AI is connected and ready';
            this.statusBarItem.backgroundColor = undefined;
        }
        else {
            this.statusBarItem.text = '$(warning) ELARA Ω';
            this.statusBarItem.tooltip = 'Elara AI is disconnected - check Azora OS services';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        }
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.ElaraStatusBar = ElaraStatusBar;
class ElaraChatViewProvider {
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
    }
    resolveWebviewView(webviewView, context, token) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };
        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'askQuestion':
                    // Handle chat messages here
                    // This would integrate with the Elara client
                    break;
            }
        }, undefined, []);
    }
    getHtmlForWebview(webview) {
        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Elara Chat</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-sideBar-background);
            color: var(--vscode-foreground);
            height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .header {
            padding: 12px 16px;
            border-bottom: 1px solid var(--vscode-panel-border);
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .header-icon { font-size: 18px; }
          .header-title { font-weight: 600; font-size: 13px; }
          .messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .message {
            display: flex;
            gap: 12px;
            animation: fadeIn 0.2s ease-in;
          }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
          .message-avatar {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            flex-shrink: 0;
          }
          .message.user .message-avatar {
            background-color: var(--vscode-button-background);
          }
          .message.elara .message-avatar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .message-content {
            flex: 1;
            font-size: 13px;
            line-height: 1.6;
          }
          .message-sender {
            font-weight: 600;
            margin-bottom: 4px;
            font-size: 12px;
            opacity: 0.9;
          }
          .message-text {
            color: var(--vscode-foreground);
          }
          .input-container {
            padding: 12px 16px;
            border-top: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-sideBar-background);
          }
          .input-wrapper {
            display: flex;
            gap: 8px;
            align-items: flex-end;
          }
          .input {
            flex: 1;
            padding: 8px 12px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            font-size: 13px;
            font-family: var(--vscode-font-family);
            resize: none;
            min-height: 36px;
            max-height: 120px;
          }
          .input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
          }
          .send-button {
            padding: 8px 12px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: background-color 0.1s;
          }
          .send-button:hover:not(:disabled) {
            background-color: var(--vscode-button-hoverBackground);
          }
          .send-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .welcome {
            text-align: center;
            padding: 32px 16px;
            color: var(--vscode-descriptionForeground);
          }
          .welcome-icon { font-size: 48px; margin-bottom: 16px; }
          .welcome-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--vscode-foreground); }
          .welcome-text { font-size: 13px; line-height: 1.6; }
          .quick-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 16px;
          }
          .quick-action {
            padding: 8px 12px;
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            text-align: left;
            transition: background-color 0.1s;
          }
          .quick-action:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
          }
        </style>
      </head>
      <body>
        <div class="header">
          <span class="header-icon">🧠</span>
          <span class="header-title">ELARA Ω</span>
        </div>
        <div class="messages" id="messages">
          <div class="welcome">
            <div class="welcome-icon">🧠</div>
            <div class="welcome-title">Welcome to Elara</div>
            <div class="welcome-text">Your omniscient AI assistant for code, architecture, and development.</div>
            <div class="quick-actions">
              <button class="quick-action" onclick="sendQuickMessage('Explain this code')">💡 Explain selected code</button>
              <button class="quick-action" onclick="sendQuickMessage('Optimize this code')">⚡ Optimize code</button>
              <button class="quick-action" onclick="sendQuickMessage('Review this file')">🔍 Review current file</button>
            </div>
          </div>
        </div>
        <div class="input-container">
          <div class="input-wrapper">
            <textarea class="input" id="messageInput" placeholder="Ask Elara anything..." rows="1"></textarea>
            <button class="send-button" id="sendButton">Send</button>
          </div>
        </div>

        <script>
          const vscode = acquireVsCodeApi();
          const messagesDiv = document.getElementById('messages');
          const messageInput = document.getElementById('messageInput');
          const sendButton = document.getElementById('sendButton');
          let isFirstMessage = true;

          messageInput.addEventListener('input', () => {
            messageInput.style.height = 'auto';
            messageInput.style.height = messageInput.scrollHeight + 'px';
            sendButton.disabled = !messageInput.value.trim();
          });

          sendButton.addEventListener('click', sendMessage);

          messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          });

          function sendMessage() {
            const message = messageInput.value.trim();
            if (message) {
              if (isFirstMessage) {
                messagesDiv.innerHTML = '';
                isFirstMessage = false;
              }
              addMessage('user', message);
              messageInput.value = '';
              messageInput.style.height = 'auto';
              sendButton.disabled = true;
              vscode.postMessage({ type: 'askQuestion', text: message });
            }
          }

          function sendQuickMessage(text) {
            messageInput.value = text;
            messageInput.dispatchEvent(new Event('input'));
            sendMessage();
          }

          function addMessage(sender, text) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + sender;
            const avatar = sender === 'user' ? '👤' : '🧠';
            const senderName = sender === 'user' ? 'You' : 'Elara';
            messageDiv.innerHTML =
              '<div class="message-avatar">' + avatar + '</div>' +
              '<div class="message-content">' +
                '<div class="message-sender">' + senderName + '</div>' +
                '<div class="message-text">' + text + '</div>' +
              '</div>';
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
          }

          window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'response') {
              addMessage('elara', message.text);
            }
          });

          sendButton.disabled = true;
        </script>
      </body>
      </html>
    `;
    }
}
exports.ElaraChatViewProvider = ElaraChatViewProvider;
ElaraChatViewProvider.viewType = 'elara.chatView';
//# sourceMappingURL=elara-client.js.map