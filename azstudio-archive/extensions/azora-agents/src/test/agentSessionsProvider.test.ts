import { AgentSessionsProvider } from '../../agentSessionsProvider';
import { SankofaService } from '../../../src/vs/workbench/services/azora/sankofaService';
import { ElaraService } from '../../../src/vs/workbench/services/azora/elaraService';
import { getChatSessionsService } from '../../../src/vs/workbench/services/chat/chatSessionsService';

describe('AgentSessionsProvider', () => {
  it('should return registered agents as tree children', async () => {
    // Ensure two agents are registered
    new ElaraService();
    new SankofaService();

    const chatSessions = getChatSessionsService();
    chatSessions.createSession('azora.elara');
    chatSessions.createSession('azora.sankofa');
    const provider = new AgentSessionsProvider();
    const children = await provider.getChildren();
    expect(children.length).toBeGreaterThanOrEqual(2);
    const labels = children.map(c => c.label as string);
    expect(labels.some(l => l.indexOf('elara') >= 0 || l.indexOf('Elara') >= 0)).toBeTruthy();
    expect(labels.some(l => l.indexOf('sankofa') >= 0 || l.indexOf('Sankofa') >= 0)).toBeTruthy();

    // Programmatically open a session chat (calls handler) — here we just ensure no errors
    const chatId = (children[0].label as string).split(' — ')[1];
    // Directly construct panel and open (non-UI open, ensures no exceptions)
    const { AgentChatPanel } = require('../chatPanel');
    const panel = new AgentChatPanel(chatId);
    panel.open();
  });
});
