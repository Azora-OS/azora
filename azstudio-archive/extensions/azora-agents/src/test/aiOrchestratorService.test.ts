import { AIOrchestratorService } from '../../../src/vs/workbench/services/azora/aiOrchestratorService';

describe('AIOrchestratorService', () => {
  let service: AIOrchestratorService;

  beforeEach(() => {
    service = new AIOrchestratorService();
  });

  it('should return a stubbed response when no keys are set', async () => {
    const result = await service.generateCode('test prompt', { files: [], projectInfo: { frameworks: [], conventions: {} }, userPrompt: 'test' });
    expect(result.content).toContain('Hello from AIOrchestrator');
    expect(result.model).toBe('stub');
  });

  it('should estimate cost as zero for fallback', async () => {
    const cost = await service.estimateCost('test prompt', { files: [], projectInfo: { frameworks: [], conventions: {} }, userPrompt: 'test' });
    expect(cost).toBeDefined();
  });
});