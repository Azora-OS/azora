import { AIOrchestratorService } from '../../../src/vs/workbench/services/azora/aiOrchestratorService';
import { ElaraService } from '../../../src/vs/workbench/services/azora/elaraService';
import { SankofaService } from '../../../src/vs/workbench/services/azora/sankofaService';
import { getAzoraAgentRegistry } from '../../../src/vs/workbench/services/azora/agentRegistryService';

describe('Agent Integration — orchestrator + elara', () => {
  it('should invoke elara via orchestrator fallback', async () => {
    const orchestrator = new AIOrchestratorService();
    const registry = require('../../../src/vs/workbench/services/azora/agentRegistryService').getAzoraAgentRegistry();
    if (registry && registry.clear) registry.clear();
    const elara = new ElaraService();
    const sankofa = new SankofaService();

    // Simulate an orchestrator call that might be used by elara under the hood
    const codeResp = await orchestrator.generateCode('create index', { files: [], projectInfo: { frameworks: [], conventions: {} }, userPrompt: 'generate code' });
    expect(codeResp.content).toContain('Hello from AIOrchestrator');

    // Now call the elara invoke
    const elaraResp = await elara.invoke('Create a lesson');
    expect(elaraResp.agentId).toBe('azora.elara');
    expect(elaraResp.content).toBeDefined();

    // Ensure registry lists both
    const registry = getAzoraAgentRegistry();
    const agents = registry.listAgents();
    expect(agents.some(a => a.id === 'azora.elara')).toBeTruthy();
    expect(agents.some(a => a.id === 'azora.sankofa')).toBeTruthy();

    // create a session for elara and send a message via session manager
    const { agentSessionManager } = require('../sessionManager');
    const sess = agentSessionManager.createSession('azora.elara');
    const resp = await agentSessionManager.sendMessage(sess.id, 'Give me a short summary of unit tests');
    expect(resp).toBeDefined();
    // If using orchestrator stub, it should include model info in metadata
    if (resp.metadata) {
      expect(resp.metadata.model || resp.metadata.type).toBeDefined();
    }
  });
});
