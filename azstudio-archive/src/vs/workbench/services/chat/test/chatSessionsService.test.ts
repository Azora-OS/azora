import { getChatSessionsService } from '../chatSessionsService';
import { getChatAgentService } from '../chat/chatAgentService';

describe('ChatSessionsService', () => {
  it('should create session and send message via chat service', async () => {
    const chatSvc = getChatAgentService();
    if ((chatSvc as any).registerAgent) chatSvc.registerAgent({ id: 'test.agent', name: 'tester' }, { invoke: async (m: string) => ({ content: `echo:${m}` }) });
    const sessionsSvc = getChatSessionsService();
    const s = sessionsSvc.createSession('test.agent');
    const resp = await sessionsSvc.sendMessage(s.id, 'hello');
    expect(resp.content).toBe('echo:hello');
  });

  it('should return metadata from agent in session responses', async () => {
    const chatSvc = getChatAgentService();
    chatSvc.registerAgent({ id: 'eth.agent', name: 'eth' }, { invoke: async (m: string) => ({ content: 'ok', metadata: { ethicalAnalysis: { approved: false, concerns: ['test'] } } }) });
    const sessionsSvc = getChatSessionsService();
    const s = sessionsSvc.createSession('eth.agent');
    const resp = await sessionsSvc.sendMessage(s.id, 'hi');
    expect(resp.metadata).toBeDefined();
    expect(resp.metadata.ethicalAnalysis).toBeDefined();
    expect(resp.metadata.ethicalAnalysis.approved).toBe(false);
  });
});
