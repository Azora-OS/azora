
import * as vscode from 'vscode';
import { getPersonalities, sendMessage } from './api';
import { KnowledgeConnector } from './knowledge-connector';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'azora.chat';

  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly knowledgeConnector: KnowledgeConnector
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'getPersonalities': {
          const personalities = await getPersonalities();
          webviewView.webview.postMessage({ type: 'personalities', personalities });
          break;
        }
        case 'sendMessage': {
          const { personality, message } = data;
          
          // Enhance with knowledge base
          let enhancedMessage = message;
          if (message.includes('?') || message.toLowerCase().includes('what') || 
              message.toLowerCase().includes('how') || message.toLowerCase().includes('why')) {
            const knowledge = await this.knowledgeConnector.queryKnowledge(message);
            if (knowledge && !knowledge.includes('unavailable')) {
              enhancedMessage = `${message}\n\n[Knowledge Context: ${knowledge}]`;
            }
          }
          
          const reply = await sendMessage(personality, enhancedMessage);
          webviewView.webview.postMessage({ type: 'message', reply });
          break;
        }
        case 'queryKnowledge': {
          const { query } = data;
          const answer = await this.knowledgeConnector.queryKnowledge(query);
          webviewView.webview.postMessage({ type: 'knowledge', answer });
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css')
    );

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
        <title>Azora AI Chat</title>
      </head>
      <body>
        <div id="root"></div>
        <script src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}
