"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const api_1 = require("./api");
class ChatViewProvider {
    constructor(_extensionUri, knowledgeConnector) {
        this._extensionUri = _extensionUri;
        this.knowledgeConnector = knowledgeConnector;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'getPersonalities': {
                    const personalities = await (0, api_1.getPersonalities)();
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
                    const reply = await (0, api_1.sendMessage)(personality, enhancedMessage);
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
    _getHtmlForWebview(webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css'));
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
exports.ChatViewProvider = ChatViewProvider;
ChatViewProvider.viewType = 'azora.chat';
//# sourceMappingURL=chatViewProvider.js.map