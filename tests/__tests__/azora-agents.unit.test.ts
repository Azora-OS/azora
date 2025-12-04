import { AIOrchestratorService } from '../../azstudio/src/vs/workbench/services/azora/aiOrchestratorService';
import { ElaraService } from '../../azstudio/src/vs/workbench/services/azora/elaraService';
import { AzoraInlineChatController } from '../../azstudio/src/vs/workbench/contrib/inlineChat/azoraInlineChatController';

describe('Azora Agents - Unit', () => {
  it('AIOrchestratorService returns fallback stub', async () => {
    const orchestrator = new AIOrchestratorService();
    const resp = await orchestrator.generateCode('test', { files: [], projectInfo: { frameworks: [], conventions: {} }, userPrompt: 'test' });
    expect(resp.content).toContain('Hello from AIOrchestrator');
    expect(resp.model).toBe('stub');
  });

  it('ElaraService returns a canned response', async () => {
    const elara = new ElaraService();
    const res = await elara.invoke('Make a lesson');
    expect(res.agentId).toBe('azora.elara');
    expect(res.content).toBeDefined();
  });

  it('AzoraInlineChatController routes to Elara service', async () => {
    const elara = new ElaraService();
    const controller = new AzoraInlineChatController(elara);
    const res = await controller.ask('Do something');
    expect(res.agentId).toBe('azora.elara');
    expect(res.content).toContain('Hello from Elara');
  });
});
