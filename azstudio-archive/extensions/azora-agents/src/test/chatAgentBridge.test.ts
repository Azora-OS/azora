import { getAzoraAgentRegistry } from '../../../src/vs/workbench/services/azora/agentRegistryService';
import { IChatAgentService } from '../../../src/vs/workbench/services/chat/common';
import { getChatAgentService } from '../../../src/vs/workbench/services/chat/chatAgentService';
import { ElaraService } from '../../../src/vs/workbench/services/azora/elaraService';
// Ensure bridge is loaded
require('../../../src/vs/workbench/contrib/azora/browser/chatBridgeContribution');
import { SankofaService } from '../../../src/vs/workbench/services/azora/sankofaService';

describe('ChatAgentBridge', () => {
  it('should register Azora agents into the chat service', async () => {
    const registry = getAzoraAgentRegistry();
    if ((registry as any).clear) (registry as any).clear();
    // Instantiate both agents so they register
    new ElaraService();
    new SankofaService();

    // Acquire the chat service via instantiation helper and verify
    const chatSvc = getChatAgentService();
    const list = chatSvc.listAgents();
    expect(list.some(a => a.id === 'azora.elara')).toBeTruthy();
    expect(list.some(a => a.id === 'azora.sankofa')).toBeTruthy();

    // Validate invokeAgent proxies to registry as expected
    const elaraResp = await chatSvc.invokeAgent('azora.elara', 'Small test');
    expect(elaraResp.content).toContain('Elara');
  });
});
