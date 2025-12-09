import { agentSessionManager } from '../sessionManager';
import { ElaraService } from '../../../src/vs/workbench/services/azora/elaraService';
import { SankofaService } from '../../../src/vs/workbench/services/azora/sankofaService';

describe('AgentSessionManager', () => {
  it('should create a session and send a message', async () => {
    // Ensure agents are registered
    const registry = require('../../../src/vs/workbench/services/azora/agentRegistryService').getAzoraAgentRegistry();
    if (registry && registry.clear) registry.clear();
    new ElaraService();
    new SankofaService();

    const session = agentSessionManager.createSession('azora.sankofa');
    expect(session.agentId).toBe('azora.sankofa');

    const resp = await agentSessionManager.sendMessage(session.id, 'Hello Sankofa');
    expect(resp).toBeDefined();
    expect(resp.role).toBe('agent');
    const s = agentSessionManager.getSession(session.id);
    expect(s?.messages.length).toBeGreaterThanOrEqual(2);
  });
});
