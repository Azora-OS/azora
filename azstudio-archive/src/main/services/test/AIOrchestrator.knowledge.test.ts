import { AIOrchestrator } from '../AIOrchestrator';

describe('AIOrchestrator Knowledge Ocean integration', () => {
  test('generateCode returns knowledge-ocean model when a direct answer exists', async () => {
    const orchestrator = new AIOrchestrator();
    const res = await orchestrator.generateCode('Introduction to Computer Science', { files: [], projectInfo: { frameworks: [], conventions: {}, }, userPrompt: '' });
    expect(res.model).toBe('knowledge-ocean');
    expect(res.content).toMatch(/Introduction to Computer Science/);
  });

  test('generateCodeStreaming yields knowledge-ocean chunk and final response', async () => {
    const orchestrator = new AIOrchestrator();
    const gen = orchestrator.generateCodeStreaming('Introduction to Computer Science', { files: [], projectInfo: { frameworks: [], conventions: {}, }, userPrompt: '' });
    const chunks: string[] = [];
    for await (const c of gen) {
      chunks.push(c.chunk);
    }
    const combined = chunks.join('');
    expect(combined).toMatch(/Introduction to Computer Science/);
  });
});
