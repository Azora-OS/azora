import OpenAI from 'openai';

export class OpenAIStreamingAdapter {
  private client: any;
  constructor(client: OpenAI) { this.client = client; }

  async *streamChat(fullPrompt: string, model: string, options?: { maxTokens?: number, temperature?: number }): AsyncGenerator<string, void, void> {
    // Try various SDK-specific interfaces
    try {
      const maybeIterator = this.client.chat?.completions?.create?.({ model, messages: [{ role: 'user', content: fullPrompt }], max_tokens: options?.maxTokens || 1024, temperature: options?.temperature || 0.2, stream: true }) as AsyncIterable<any> | undefined;
      if (maybeIterator && (maybeIterator as any)[Symbol.asyncIterator]) {
        for await (const chunk of maybeIterator) {
          const content = chunk.choices?.[0]?.delta?.content || chunk.choices?.[0]?.message?.content || ''; if (content) yield content; }
        return;
      }
      if (typeof this.client.responses?.stream === 'function') {
        const stream = this.client.responses.stream({ model, input: fullPrompt, max_tokens: options?.maxTokens, temperature: options?.temperature });
        for await (const ev of stream) {
          const content = ev?.output_text || ev?.delta?.content || ev?.message?.content || '';
          if (content) yield content;
        }
        return;
      }
    } catch (err) {
      // swallow and return to fallback
    }
    // No supported streaming: yield nothing and return
  }
}

export default OpenAIStreamingAdapter;
