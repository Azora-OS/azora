import { AIOrchestrator } from '../AIOrchestrator';

describe('AIOrchestrator fallback streaming', () => {
  test('Fallback chunking yields multiple parts when provider streaming not available', async () => {
    const orchestrator = new AIOrchestrator();
    // Simulate no streaming supported
    orchestrator['openai'] = null;
    orchestrator['anthropic'] = null;
    // Stub generateCode to return a long string
    orchestrator['generateCode'] = async (prompt: string, ctx: any, model?: any) => {
      const long = 'A'.repeat(300); // long content
      return { content: long, model: 'stub', tokensUsed: 0, cost: 0 };
    } as any;

    const chunks: string[] = [];
    const gen = orchestrator.generateCodeStreaming('test fallback', { files: [], projectInfo: { frameworks: [], conventions: {} }, userPrompt: '' });
    for await (const c of gen) {
      chunks.push(c.chunk);
    }
    // Expect multiple chunks due to chunking behavior
    expect(chunks.length).toBeGreaterThan(1);
    // Ensure combined length equals 300
    expect(chunks.join('').length).toBe(300);
  });
});
