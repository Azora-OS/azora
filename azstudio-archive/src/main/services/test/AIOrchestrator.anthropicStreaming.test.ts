import { AIOrchestrator } from '../AIOrchestrator';

describe('AIOrchestrator Anthropic streaming', () => {
  test('Anthropic-style streaming yields chunks', async () => {
    const orchestrator = new AIOrchestrator();
    // Provide a fake anthropic client that exposes responses.stream
    orchestrator['anthropic'] = {
      responses: {
        stream: async function*(opts: any) {
          yield { completion: { content: 'Hi' } };
          yield { completion: { content: ' there' } };
          yield { completion: { content: '!' } };
        }
      }
    } as any;
    // Adapter is set up in constructor only if env var set; set adapter manually
    const AnthropicStreamingAdapter = require('../providerAdapters/anthropicStreamingAdapter').AnthropicStreamingAdapter;
    orchestrator['anthropicAdapter'] = new AnthropicStreamingAdapter(orchestrator['anthropic']);

    const chunks: string[] = [];
    const gen = orchestrator.generateCodeStreaming('Test anthropic', { files: [], projectInfo: { frameworks: [], conventions: {} }, userPrompt: '' }, { provider: 'anthropic', model: 'claude-3-opus-20240229', maxTokens: 1024, temperature: 0.2 });
    for await (const c of gen) {
      chunks.push(c.chunk);
    }
    expect(chunks.join('')).toBe('Hi there!');
  });
});
