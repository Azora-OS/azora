import { ElaraAgenticService } from '../ElaraAgenticService';

describe('ElaraAgenticService knowledge ocean streaming integration', () => {
  test('generateWithConstitutionalCheckStreaming yields knowledge-ocean response when available', async () => {
    const elara = new ElaraAgenticService(''); // empty key — will not call OpenAI for this test
    const gen = elara.generateWithConstitutionalCheckStreaming('Introduction to Computer Science', 'system role');
    const parts: string[] = [];
    for await (const p of gen) {
      parts.push(p);
    }
    const combined = parts.join('');
    expect(combined).toMatch(/Introduction to Computer Science/);
  });
});
