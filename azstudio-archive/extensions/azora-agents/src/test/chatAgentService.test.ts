import { getChatAgentService } from '../../../src/vs/workbench/services/chat/chatAgentService';
import { getAzoraAgentRegistry } from '../../../src/vs/workbench/services/azora/agentRegistryService';

describe('ChatAgentService', () => {
  it('registers and invokes agents', async () => {
    const chatSvc = getChatAgentService();
    // clear is not present on chat service; simply register a new agent
    chatSvc.registerAgent({ id: 'test.chat', name: 'test' }, { invoke: async (m: string) => ({ content: `echo ${m}` }) });
    const res = await chatSvc.invokeAgent('test.chat', 'hello');
    expect(res.content).toBe('echo hello');
  });
});
