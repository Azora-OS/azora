import Anthropic from '@anthropic-ai/sdk';

export class AnthropicStreamingAdapter {
  private client: any;
  constructor(client: Anthropic) { this.client = client; }

  async *streamChat(fullPrompt: string, model: string, options?: { maxTokens?: number, temperature?: number }): AsyncGenerator<string, void, void> {
    try {
      if (typeof this.client.responses?.stream === 'function') {
        const stream = this.client.responses.stream({ model, input: fullPrompt, max_tokens: options?.maxTokens, temperature: options?.temperature });
        for await (const ev of stream) {
          const content = ev?.completion?.content || ev?.delta?.content || '';
          if (content) yield content;
        }
        return;
      }
    } catch (err) {
      // swallow, and fallback
    }
  }
}

export default AnthropicStreamingAdapter;
