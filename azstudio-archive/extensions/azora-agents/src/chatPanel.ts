import * as vscode from 'vscode';
import { agentSessionManager } from './sessionManager';

export class AgentChatPanel {
  public static currentPanels = new Map<string, AgentChatPanel>();
  private panel: vscode.WebviewPanel | null = null;
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  open() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }
    this.panel = vscode.window.createWebviewPanel('azora.agentChat', 'Azora Chat', vscode.ViewColumn.One, { enableScripts: true });
    this.panel.webview.html = this.getHtml();
    this.panel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'send') {
        const chatSessions = require('../../../src/vs/workbench/services/chat/chatSessionsService').getChatSessionsService();
            if (chatSessions.sendMessageWithProgress) {
              let final: string = '';
              await chatSessions.sendMessageWithProgress(this.sessionId, msg.text, async (chunk, metadata) => {
                final += chunk;
                this.panel?.webview.postMessage({ type: 'message', from: 'agent', content: chunk, metadata });
              });
              // After streaming finishes, attempt to get followups
              try {
                const registry = require('../../../src/vs/workbench/services/azora/agentRegistryService').getAzoraAgentRegistry();
                const followups = await registry.getFollowups(this.getAgentIdForSession(), final);
                if (followups && followups.length > 0) this.panel?.webview.postMessage({ type: 'followups', data: followups });
              } catch (e) {}
            } else {
              const agentResp = await chatSessions.sendMessage(this.sessionId, msg.text);
              this.panel?.webview.postMessage({ type: 'message', from: 'agent', content: agentResp.content, metadata: agentResp.metadata });
              // Request followups
              try {
                const registry = require('../../../src/vs/workbench/services/azora/agentRegistryService').getAzoraAgentRegistry();
                const followups = await registry.getFollowups(this.getAgentIdForSession(), agentResp);
                if (followups && followups.length > 0) this.panel?.webview.postMessage({ type: 'followups', data: followups });
              } catch (e) {}
            }
      }
      if (msg.type === 'apply') {
        // Validate & apply change into active editor if allowed
        try {
          const validator = require('../../../src/main/services/ConstitutionalCore').ConstitutionalValidator.getInstance();
          const analysis = await validator.validateContent(msg.text, 'apply-patch');
          if (analysis.approved) {
            const active = require('vscode').window.activeTextEditor;
            if (active) {
              await active.edit((editBuilder: any) => {
                editBuilder.insert(active.selection.active, `\n/* Applied by Azora: */\n${msg.text}\n`);
              });
              this.panel?.webview.postMessage({ type: 'message', from: 'system', content: 'Change applied', metadata: { analysis } });
            } else {
              this.panel?.webview.postMessage({ type: 'message', from: 'system', content: 'No active editor to apply change', metadata: { analysis } });
            }
          } else {
            this.panel?.webview.postMessage({ type: 'message', from: 'system', content: `Change rejected by Constitution: ${analysis.concerns.join(', ')}`, metadata: { analysis } });
          }
        } catch (err) {
          this.panel?.webview.postMessage({ type: 'message', from: 'system', content: `Error validating change: ${err.message}` });
        }
      }
    });
    // Load current session messages
    const chatSessions = require('../../../src/vs/workbench/services/chat/chatSessionsService').getChatSessionsService();
    const session = chatSessions.getSession(this.sessionId) || agentSessionManager.getSession(this.sessionId);
    for (const m of session?.messages || []) {
      this.panel.webview.postMessage({ type: 'message', from: m.role, content: m.content, metadata: m.metadata });
    }
  }

  private getAgentIdForSession(): string | undefined {
    const chatSessions = require('../../../src/vs/workbench/services/chat/chatSessionsService').getChatSessionsService();
    const s = chatSessions.getSession(this.sessionId);
    return s?.agentId;
  }

  private getHtml() {
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'unsafe-inline' https://cdnjs.cloudflare.com;">
  <style>body{font-family: sans-serif; margin: 0; padding: 0;} #msgs{padding: 16px;} .user{color: blue;} .agent{color: green;} #input{position:fixed; bottom: 10px; left: 10px; right: 10px;}
  </style>
</head>
<body>
  <div id="msgs"></div>
  <div id="followups" style="padding: 8px"></div>
    <div id="input">
    <input id="textbox" style="width:80%" />
    <button id="send">Send</button>
    <button id="apply">Apply</button>
  </div>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/default.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
  <script>
  const vscode = acquireVsCodeApi();
  document.getElementById('send').addEventListener('click', () => {
    const text = (document.getElementById('textbox') as HTMLInputElement).value;
    vscode.postMessage({ type: 'send', text });
    append('user', text);
    (document.getElementById('textbox') as HTMLInputElement).value = '';
  });
  document.getElementById('apply').addEventListener('click', () => {
    const text = (document.getElementById('textbox') as HTMLInputElement).value;
    vscode.postMessage({ type: 'apply', text });
  });
  function append(cls, text, metadata){
    const el = document.createElement('div'); el.className = cls;
    // detect code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const match = codeBlockRegex.exec(text);
    if (match) {
      const [full, lang, code] = match;
      // Show intro text if any
      const intro = text.replace(full, '').trim();
      if (intro) {
        const p = document.createElement('div'); p.textContent = `${cls}: ${intro}`; el.appendChild(p);
      }
      const codeEl = document.createElement('pre'); const codeInner = document.createElement('code'); codeInner.className = lang || '';
      codeInner.textContent = code; codeEl.appendChild(codeInner); el.appendChild(codeEl);
      try { hljs.highlightElement(codeInner); } catch (e) { /* ignore */ }
      // Add partial flag UI: if metadata.partial, show opacity & pulsing border
      if (metadata && metadata.partial) {
        codeEl.style.opacity = '0.7'; codeEl.style.border = '1px dashed #ccc';
      }
      const btn = document.createElement('button'); btn.textContent = 'Insert Code'; btn.addEventListener('click', () => { vscode.postMessage({ type: 'apply', text: code }); }); el.appendChild(btn);
    } else {
      el.textContent = `${cls}: ${text}`;
    }
    if (metadata && metadata.ethicalAnalysis) {
      const b = document.createElement('span');
      b.style.marginLeft = '8px';
      if (metadata.ethicalAnalysis.approved) { b.textContent = '✓ Approved'; b.style.color = 'green'; } else { b.textContent = '⚠ VETOED'; b.style.color = 'red'; }
      el.appendChild(b);
    }
    if (metadata && metadata.model) {
      const m = document.createElement('span');
      m.style.marginLeft = '8px';
      m.textContent = `Model: ${metadata.model}`;
      m.style.fontSize = '0.85em';
      m.style.color = '#666';
      el.appendChild(m);
    }
    document.getElementById('msgs').appendChild(el);
  }
  window.addEventListener('message', event => {
    const msg = event.data;
    if (msg.type === 'message') append(msg.from, msg.content, msg.metadata);
    if (msg.type === 'followups') {
      const holder = document.getElementById('followups');
      holder.innerHTML = '';
      for (const f of msg.data) {
         const b = document.createElement('button');
         b.textContent = f.title;
         b.addEventListener('click', () => { vscode.postMessage({ type: 'send', text: f.text }); });
         holder.appendChild(b);
      }
    }
  });
  </script>
</body>
</html>`;
  }
}

export default AgentChatPanel;
