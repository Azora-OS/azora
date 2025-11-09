/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import * as vscode from 'vscode';

export class ElaraChatProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'elara.chatView';

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(
      message => {
        switch (message.type) {
          case 'sendMessage':
            this.handleUserMessage(message.text, webviewView.webview);
            break;
        }
      },
      undefined,
      []
    );
  }

  private async handleUserMessage(message: string, webview: vscode.Webview) {
    // Send user message to chat
    webview.postMessage({
      type: 'addMessage',
      message: { text: message, sender: 'user' }
    });

    // Generate Elara response
    const response = await this.generateElaraResponse(message);
    
    webview.postMessage({
      type: 'addMessage',
      message: { text: response, sender: 'elara' }
    });
  }

  private async generateElaraResponse(message: string): Promise<string> {
    // Simple response logic - can be enhanced with AI
    const responses = {
      hello: "Hello! I'm Elara, your AI development companion. How can I help you today?",
      help: "I can help with code completion, explanations, debugging, and more. Try asking me about your code!",
      code: "I'd be happy to help with your code! Please share what you're working on.",
      default: "I'm here to assist with your development needs. What would you like to work on?"
    };

    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return responses.hello;
    } else if (lowerMessage.includes('help')) {
      return responses.help;
    } else if (lowerMessage.includes('code')) {
      return responses.code;
    } else {
      return responses.default;
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elara Chat</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 10px;
            margin: 0;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .chat-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 10px 0;
        }
        .message {
            margin: 10px 0;
            padding: 8px 12px;
            border-radius: 8px;
            max-width: 80%;
        }
        .user-message {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            margin-left: auto;
        }
        .elara-message {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
        }
        .input-container {
            display: flex;
            gap: 8px;
            padding: 10px 0;
            border-top: 1px solid var(--vscode-panel-border);
        }
        .message-input {
            flex: 1;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
        }
        .send-button {
            padding: 8px 16px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .send-button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .header {
            text-align: center;
            padding: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="header">
            <h3>🤖 Elara - AI Development Companion</h3>
        </div>
        <div class="messages" id="messages">
            <div class="message elara-message">
                Hello! I'm Elara, your AI development companion. I'm here to help with coding, debugging, and answering your development questions. How can I assist you today?
            </div>
        </div>
        <div class="input-container">
            <input type="text" id="messageInput" class="message-input" placeholder="Ask me anything..." />
            <button id="sendButton" class="send-button">Send</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const messagesContainer = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        function addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${sender}-message\`;
            messageDiv.textContent = text;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function sendMessage() {
            const text = messageInput.value.trim();
            if (text) {
                vscode.postMessage({
                    type: 'sendMessage',
                    text: text
                });
                messageInput.value = '';
            }
        }

        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'addMessage':
                    addMessage(message.message.text, message.message.sender);
                    break;
            }
        });
    </script>
</body>
</html>`;
  }
}