import { AzoraInlineChatController } from '../../../src/vs/workbench/contrib/inlineChat/azoraInlineChatController';
import { ElaraService } from '../../../src/vs/workbench/services/azora/elaraService';
import { getChatSessionsService } from '../../../src/vs/workbench/services/chat/chatSessionsService';
import { getChatAgentService } from '../../../src/vs/workbench/services/chat/chatAgentService';

describe('AzoraInlineChatController', () => {
  let controller: AzoraInlineChatController;
  let elaraService: ElaraService;

  beforeEach(() => {
    elaraService = new ElaraService();
    controller = new AzoraInlineChatController(elaraService);
  });

  it('should ask and get response from elara', async () => {
    const chatSessions = getChatSessionsService();
    const chatSvc = getChatAgentService();
    chatSvc.registerAgent({ id: 'azora.elara', name: 'elara' }, { invoke: async (m: string) => ({ content: `elara: ${m}` }) });
    const result = await controller.ask('azora.elara', 'test prompt');
      expect(result.content).toContain('elara:');
    expect(result.agentId).toBe('azora.elara');
  });
  
    it('should surface ethicalAnalysis metadata when agent returns it', async () => {
      const chatSvc = getChatAgentService();
      if ((chatSvc as any).registerAgent) chatSvc.registerAgent({ id: 'ethical.agent', name: 'ethic' }, { invoke: async (m) => ({ content: 'ok', metadata: { ethicalAnalysis: { approved: false, concerns: ['Test'] } } }) });
      const res = await controller.ask('ethical.agent', 'trigger');
      expect(res).toBeDefined();
      expect(res.metadata).toBeDefined();
      expect(res.metadata.ethicalAnalysis).toBeDefined();
      expect(res.metadata.ethicalAnalysis.approved).toBe(false);
    });
});