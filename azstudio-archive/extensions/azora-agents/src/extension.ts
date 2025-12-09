import * as vscode from 'vscode';
import { IElaraAgentService } from '../../../src/vs/workbench/services/azora/common';
import { registerSingleton, InstantiationType } from '../../../src/vs/platform/instantiation/common/simpleExtensions.js';
import { ElaraService } from '../../../src/vs/workbench/services/azora/elaraService';
import { SankofaService } from '../../../src/vs/workbench/services/azora/sankofaService';
import { KofiService } from '../../../src/vs/workbench/services/azora/agents/kofiService';
import { ImaniService } from '../../../src/vs/workbench/services/azora/agents/imaniService';
import { NiaService } from '../../../src/vs/workbench/services/azora/agents/niaService';
import { AmaraService } from '../../../src/vs/workbench/services/azora/agents/amaraService';
import { JabariService } from '../../../src/vs/workbench/services/azora/agents/jabariService';
import { ThaboService } from '../../../src/vs/workbench/services/azora/agents/thaboService';
import { ZuriService } from '../../../src/vs/workbench/services/azora/agents/zuriService';
import { AgentSessionsProvider } from './agentSessionsProvider';
import { ChatExplorerProvider } from './chatExplorerProvider';
import DeadLetterProvider from './deadLetterProvider';
import { agentSessionManager } from './sessionManager';
import { getChatSessionsService } from '../../../src/vs/workbench/services/chat/chatSessionsService';
import { getChatAgentService } from '../../../src/vs/workbench/services/chat/chatAgentService';
import { AgentChatPanel } from './chatPanel';
import { AzoraInlineChatController } from '../../../src/vs/workbench/contrib/inlineChat/azoraInlineChatController';

// This extension is a minimal registration plus a command that invokes Elara
export function activate(context: vscode.ExtensionContext) {
  // Ensure the Elara service is registered (singleton)
  registerSingleton(IElaraAgentService as any, ElaraService as any, InstantiationType.Delayed);

  // Pre-instantiate Sankofa to ensure it registers with the global agent registry at startup
  try { new SankofaService(); } catch (err) { /* ignore */ }
  // instantiate additional built-in agents
  try { new KofiService(); } catch (err) {}
  try { new ImaniService(); } catch (err) {}
  try { new NiaService(); } catch (err) {}
  try { new AmaraService(); } catch (err) {}
  try { new JabariService(); } catch (err) {}
  try { new ThaboService(); } catch (err) {}
  try { new ZuriService(); } catch (err) {}

  // Also ensure chat service has the registered agents (bridge in workbench may also do this)
  try {
    const registry = require('../../../src/vs/workbench/services/azora/agentRegistryService').getAzoraAgentRegistry();
    const chatSvc = getChatAgentService();
    for (const agent of registry.listAgents()) {
      chatSvc.registerAgent({ id: agent.id, name: agent.name, description: agent.fullName || agent.description }, { invoke: async (msg) => registry.invokeAgent(agent.id, msg) });
    }
  } catch (err) { /* ignore */ }

  const disposable = vscode.commands.registerCommand('azora.elara.invoke', async () => {
    // In a real activation we would use VS Code service injection but this is a simple command for now
    const service = new ElaraService();
    const result = await service.invoke('Hello from extension command');
    vscode.window.showInformationMessage(result.content);
  });

  context.subscriptions.push(disposable);

  // List agents command
  const listCmd = vscode.commands.registerCommand('azora.listAgents', async () => {
    const registry = require('../../../src/vs/workbench/services/azora/agentRegistryService').getAzoraAgentRegistry();
    const agents = registry.listAgents();
    vscode.window.showInformationMessage(`Agents: ${agents.map(a => a.name).join(', ')}`);
  });
  context.subscriptions.push(listCmd);

  // Start chat command (simple)
  const startCmd = vscode.commands.registerCommand('azora.startChat', async () => {
    const registry = require('../../../src/vs/workbench/services/azora/agentRegistryService').getAzoraAgentRegistry();
    const agents = registry.listAgents();
    if (agents.length === 0) {
      vscode.window.showInformationMessage('No agents available');
      return;
    }
    const quick = agents.map(a => ({ label: a.name, description: a.fullName || a.id, id: a.id }));
    const selection = await vscode.window.showQuickPick(quick, { placeHolder: 'Select an agent to chat with' });
    if (!selection) return;
    const prompt = await vscode.window.showInputBox({ prompt: `Message to ${selection.label}` });
    if (prompt === undefined) return;
    // Create or reuse a session and open a webview chat
    const chatSessions = getChatSessionsService();
    const session = chatSessions.createSession(selection.id);
    const panel = new AgentChatPanel(session.id);
    panel.open();
  });
  context.subscriptions.push(startCmd);

  // Open agent sessions: show placeholder message for now
  const sessionsCmd = vscode.commands.registerCommand('azora.openAgentSessions', async () => {
    vscode.window.showInformationMessage('Azora Agent Sessions view (placeholder)');
  });
  context.subscriptions.push(sessionsCmd);

  const sankofaDisposable = vscode.commands.registerCommand('azora.sankofa.invoke', async () => {
    // Ensure Sankofa service registers
    const sankofa = new SankofaService();
    const result = await sankofa.invoke('Please analyze system architecture for scaling');
    vscode.window.showInformationMessage(result.content);
  });
  context.subscriptions.push(sankofaDisposable);

  // Register the Agent Sessions view provider
  const provider = new AgentSessionsProvider();
  vscode.window.registerTreeDataProvider('azora.agentSessions', provider);
  context.subscriptions.push(vscode.commands.registerCommand('azora.agentSessions.refresh', () => provider.refresh()));
  const chatProvider = new ChatExplorerProvider();
  vscode.window.registerTreeDataProvider('azora.chatAgents', chatProvider);
  context.subscriptions.push(vscode.commands.registerCommand('azora.chatAgents.refresh', () => chatProvider.refresh()));

  const deadLetterProvider = new DeadLetterProvider(context);
  vscode.window.registerTreeDataProvider('azora.deadLetterExplorer', deadLetterProvider);
  context.subscriptions.push(vscode.commands.registerCommand('azora.deadLetter.refresh', () => deadLetterProvider.refresh()));
  context.subscriptions.push(vscode.commands.registerCommand('azora.deadLetter.retry', (it) => deadLetterProvider.retry(it)));

  // Inline chat command: uses the inline chat controller to call the selected agent
  const inlineCmd = vscode.commands.registerCommand('azora.inlineChat', async () => {
    const active = vscode.window.activeTextEditor;
    if (!active) {
      vscode.window.showInformationMessage('Open a file and select text to use Azora Inline Chat');
      return;
    }
    const registry = require('../../../src/vs/workbench/services/azora/agentRegistryService').getAzoraAgentRegistry();
    const agents = registry.listAgents();
    if (agents.length === 0) {
      vscode.window.showInformationMessage('No agents available');
      return;
    }
    const quick = agents.map(a => ({ label: a.name, description: a.fullName || a.id, id: a.id }));
    const selection = await vscode.window.showQuickPick(quick, { placeHolder: 'Select an agent for Inline Chat' });
    if (!selection) return;
    const selectionRange = active.selection;
    const contextText = active.document.getText(selectionRange) || active.document.getText();
    const prompt = await vscode.window.showInputBox({ prompt: `Message to ${selection.label}`, value: contextText.substring(0, 200) });
    if (prompt === undefined) return;

    const controller = new AzoraInlineChatController();
    const resp = await controller.ask(selection.id, prompt);
    const badge = resp.metadata && resp.metadata.ethicalAnalysis && resp.metadata.ethicalAnalysis.approved ? '✓ Approved' : resp.metadata && resp.metadata.ethicalAnalysis ? '⚠ VETOED' : '';
    const insert = await vscode.window.showInformationMessage(`${selection.label}: ${resp.content} ${badge}`, 'Insert');
    if (insert === 'Insert') {
      active.edit(e => e.insert(active.selection.active, `\n/* ${selection.label} */\n${resp.content}\n`));
    }
  });
  context.subscriptions.push(inlineCmd);

  const openWithCmd = vscode.commands.registerCommand('azora.openChatWithAgent', async (agentId: string) => {
    if (!agentId) return;
    const chatSessions = getChatSessionsService();
    const session = chatSessions.createSession(agentId);
    const panel = new AgentChatPanel(session.id);
    panel.open();
  });
  context.subscriptions.push(openWithCmd);

  const openSessionCmd = vscode.commands.registerCommand('azora.openSessionChat', async (sessionId: string) => {
    const panel = new AgentChatPanel(sessionId);
    panel.open();
  });
  context.subscriptions.push(openSessionCmd);
  // Export for tests
  (module as any).exports.openSessionCmd = async (sessionId: string) => await (openSessionCmd as any)._callback ? (openSessionCmd as any)._callback(sessionId) : await vscode.commands.executeCommand('azora.openSessionChat', sessionId);
}

export function deactivate() {
  // No-op: cleanup handled by the workbench
}
