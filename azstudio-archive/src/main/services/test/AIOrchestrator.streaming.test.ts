import { AIOrchestrator } from '../AIOrchestrator';

describe('AIOrchestrator streaming behaviour', () => {
  test('OpenAI-like streaming yields chunks', async () => {
    const orchestrator = new AIOrchestrator();
    // Provide a fake openai client that yields 3 partial deltas
    orchestrator['openai'] = {
      chat: {
        completions: {
          create: async function*(opts: any) {
            yield { choices: [{ delta: { content: 'Hello' } }] };
            yield { choices: [{ delta: { content: ' world' } }] };
            yield { choices: [{ delta: { content: '!' } }] };
          }
        }
      }
    } as any;
    const chunks: string[] = [];
    const generator = orchestrator.generateCodeStreaming('Test streaming', { files: [], projectInfo: { frameworks: [], conventions: {} }, userPrompt: '' });
    for await (const chunk of generator) {
      chunks.push(chunk.chunk);
    }
    const combined = chunks.join('');
    expect(combined).toBe('Hello world!');
  });

  test('OpenAI streaming adapter yields chunks using responses.stream', async () => {
    const orchestrator = new AIOrchestrator();
    const fakeOpenAI = {
      responses: {
        stream: async function*(opts: any) {
          yield { output_text: 'Hello' };
          yield { output_text: ' world' };
          yield { output_text: '!' };
        }
      },
      chat: { completions: { create: async function*() { throw new Error('no'); } } }
    } as any;
    orchestrator['openai'] = fakeOpenAI;
    const OpenAIStreamingAdapter = require('../providerAdapters/openaiStreamingAdapter').OpenAIStreamingAdapter;
    orchestrator['openaiAdapter'] = new OpenAIStreamingAdapter(fakeOpenAI);
    const chunks: string[] = [];
    const generator = orchestrator.generateCodeStreaming('Test streaming', { files: [], projectInfo: { frameworks: [], conventions: {} }, userPrompt: '' });
    for await (const chunk of generator) {
      chunks.push(chunk.chunk);
    }
    expect(chunks.join('')).toBe('Hello world!');
  });

  test('streaming retry fallback on adapter error should call generateCode fallback', async () => {
    const orchestrator = new AIOrchestrator();
    // stub adapter that always throws to simulate no streaming
    orchestrator['openaiAdapter'] = {
      streamChat: async function*() { throw new Error('Transitional error'); }
    } as any;
    orchestrator['generateCode'] = async (prompt: string, ctx: any, model?: any) => ({ content: 'fallback content', model: 'stub', tokensUsed: 0, cost: 0 }) as any;
    const chunks: string[] = [];
    const generator = orchestrator.generateCodeStreaming('Test streaming retry', { files: [], projectInfo: { frameworks: [], conventions: {} }, userPrompt: '' });
    for await (const chunk of generator) {
      chunks.push(chunk.chunk);
    }
    // Should have fallback content because first stream failed and second wasn't invoked
    expect(chunks.join('')).toContain('fallback content');
  });

  test('assembler merges code blocks delivered in parts via adapter', async () => {
    const orchestrator = new AIOrchestrator();
    orchestrator['openaiAdapter'] = {
      streamChat: async function*() {
        yield 'Intro '; yield '```js\n'; yield 'console.log('; yield "'ok'\n"; yield ')\n```'; yield ' Done';
      }
    } as any;
    const chunks: string[] = [];
    const generator = orchestrator.generateCodeStreaming('Test assemble', { files: [], projectInfo: { frameworks: [], conventions: {} }, userPrompt: '' });
    for await (const chunk of generator) {
      chunks.push(chunk.chunk);
    }
    const combined = chunks.join('');
    expect(combined).toMatch(/```js[\s\S]*console.log\('ok'\)[\s\S]*```/); // We expect code block to exist (using some pattern)
    expect(combined).toMatch(/Intro/);
  });

  test('assembler dedupes repeated tokens from adapter', async () => {
    const orchestrator = new AIOrchestrator();
    orchestrator['openaiAdapter'] = {
      streamChat: async function*() {
        yield 'Hello'; yield 'Hello'; yield ' world';
      }
    } as any;
    const chunks: string[] = [];
    const generator = orchestrator.generateCodeStreaming('Test dedupe', { files: [], projectInfo: { frameworks: [], conventions: {} }, userPrompt: '' });
    for await (const chunk of generator) {
      chunks.push(chunk.chunk);
    }
    const combined = chunks.join('');
    expect(combined).toBe('Hello world');
  });
});
