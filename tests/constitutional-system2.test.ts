import { AIOrchestrator } from '../azstudio/src/main/services/AIOrchestrator';
import { ConstitutionalValidator } from '../azstudio/src/main/services/ConstitutionalCore';

describe('Constitutional System 2 integration', () => {
  it('propagates veto metadata when ConstitutionalCore returns a veto', async () => {
    // Arrange: mock validator to return a veto-style analysis
    const vetoAnalysis = {
      approved: false,
      score: 0.02,
      concerns: ['Detected high-risk content: kill'],
      modifications: [],
      vetoId: 'VETO-deadbeef',
      fallbackActions: [{ action: 'reject', message: 'Rejected by policy' }]
    } as any;

    const spyValidate = jest.spyOn(ConstitutionalValidator.prototype, 'validateContent').mockResolvedValue(vetoAnalysis);

    // Create orchestrator and stub generateWithOpenAI to return a benign response
    const orchestrator = new AIOrchestrator();
    // @ts-ignore - override private method for test
    orchestrator.generateWithOpenAI = async (_prompt: string, _model: any) => ({ content: 'dangerous code', model: 'gpt-test', tokensUsed: 10, cost: 0.0 });

    // Act & Assert
    await expect(orchestrator.generateCode('some prompt', { files: [], projectInfo: { frameworks: [], conventions: { packageManager: 'npm', typescript: true, testing: [] } }, userPrompt: 'some prompt' })).rejects.toMatchObject({
      analysis: {
        vetoId: 'VETO-deadbeef',
        fallbackActions: expect.any(Array),
      }
    });

    spyValidate.mockRestore();
  });
});
