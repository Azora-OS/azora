import * as vscode from 'vscode';
import { ElaraAPI } from './api';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private activeMember = 'elara';
    private messages: any[] = [];

    constructor(private readonly _extensionUri: vscode.Uri, private api: ElaraAPI) {}

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async data => {
            if (data.type === 'sendMessage') {
                await this.handleMessage(data.message);
            } else if (data.type === 'selectMember') {
                this.setActiveMember(data.memberId);
            }
        });
    }

    public setActiveMember(memberId: string) {
        this.activeMember = memberId;
        this._view?.webview.postMessage({ type: 'memberChanged', memberId });
    }

    public async sendMessage(message: string) {
        await this.handleMessage(message);
    }

    private async handleMessage(message: string) {
        this.messages.push({ role: 'user', content: message });
        this._view?.webview.postMessage({ type: 'userMessage', message });

        try {
            const response = await this.api.chat(this.activeMember, message);
            this.messages.push({ role: 'assistant', content: response.response, member: response.member });
            this._view?.webview.postMessage({ 
                type: 'assistantMessage', 
                message: response.response,
                member: response.member,
                mood: response.mood
            });
        } catch (error: any) {
            vscode.window.showErrorMessage(`Elara error: ${error.message}`);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 10px; font-family: var(--vscode-font-family); color: var(--vscode-foreground); }
        #chat { display: flex; flex-direction: column; height: calc(100vh - 60px); }
        #messages { flex: 1; overflow-y: auto; padding: 10px; }
        .message { margin: 10px 0; padding: 10px; border-radius: 8px; }
        .user { background: var(--vscode-input-background); margin-left: 20px; }
        .assistant { background: var(--vscode-editor-background); margin-right: 20px; border-left: 3px solid #3B4F6F; }
        .member-name { font-weight: bold; color: #3B4F6F; margin-bottom: 5px; }
        .mood { font-size: 0.8em; color: var(--vscode-descriptionForeground); }
        #input-area { display: flex; gap: 5px; padding: 10px; border-top: 1px solid var(--vscode-panel-border); }
        #message-input { flex: 1; padding: 8px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; }
        button { padding: 8px 16px; background: #3B4F6F; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #2d3d57; }
        #member-selector { margin-bottom: 10px; padding: 8px; background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border); border-radius: 4px; }
    </style>
</head>
<body>
    <select id="member-selector">
        <option value="elara">🤖 Elara - Mother & Teacher</option>
        <option value="themba">🧒 Themba - Student Success</option>
        <option value="naledi">👧 Naledi - Career Guide</option>
        <option value="jabari">🧑 Jabari - Security Guardian</option>
        <option value="amara">👶 Amara - Peacemaker</option>
        <option value="sankofa">👴 Sankofa - Ancient Wisdom</option>
        <option value="kofi">🤝 Kofi - Finance Guru</option>
        <option value="zola">🤝 Zola - Data Analyst</option>
        <option value="abeni">🤝 Abeni - Storyteller</option>
        <option value="thembo">👨 Thembo - Uncle & Mentor</option>
        <option value="nexus">⚪ Nexus - Unity Consciousness</option>
    </select>
    <div id="chat">
        <div id="messages"></div>
        <div id="input-area">
            <input type="text" id="message-input" placeholder="Ask Elara anything..." />
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const messagesDiv = document.getElementById('messages');
        const input = document.getElementById('message-input');
        const selector = document.getElementById('member-selector');

        selector.addEventListener('change', () => {
            vscode.postMessage({ type: 'selectMember', memberId: selector.value });
        });

        function sendMessage() {
            const message = input.value.trim();
            if (!message) return;
            vscode.postMessage({ type: 'sendMessage', message });
            input.value = '';
        }

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        window.addEventListener('message', event => {
            const { type, message, member, mood, memberId } = event.data;
            if (type === 'userMessage') {
                messagesDiv.innerHTML += \`<div class="message user">\${message}</div>\`;
            } else if (type === 'assistantMessage') {
                messagesDiv.innerHTML += \`
                    <div class="message assistant">
                        <div class="member-name">\${member?.name || 'Elara'}</div>
                        <div>\${message}</div>
                        <div class="mood">Mood: \${mood || 'helpful'}</div>
                    </div>
                \`;
            } else if (type === 'memberChanged') {
                selector.value = memberId;
            }
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
    </script>
</body>
</html>`;
    }
}
