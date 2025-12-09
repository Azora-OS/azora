import { ElaraService } from '../elaraService';

describe('ElaraService knowledge ocean integration', () => {
  test('invoke returns knowledge-ocean response when available in orchestrator', async () => {
    // no OPENAI_API_KEY set, so elara will use orchestrator in stub mode
    const elara = new ElaraService();
    const res = await elara.invoke('Introduction to Computer Science');
    expect(res.content).toMatch(/Elara \(orchestrator proxy\):/);
    expect(res.metadata).toBeDefined();
    expect((res.metadata as any).model).toBe('knowledge-ocean');
  });
});
