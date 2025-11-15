/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

OpenAI Client Wrapper
Provides a thin, typed wrapper around the OpenAI SDK with sensible defaults
and basic safeguards (timeouts, simple retry on rate limit).
*/

import OpenAI from 'openai';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface CompletionOptions extends ChatOptions {}

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey = process.env.OPENAI_API_KEY) {
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }
    this.client = new OpenAI({ apiKey });
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
    const { model = DEFAULT_MODEL, temperature = 0.7, maxTokens = 800, timeoutMs = 60000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await this.client.chat.completions.create(
        {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        },
        { signal: controller.signal as any }
      );
      return res.choices?.[0]?.message?.content ?? '';
    } catch (err: any) {
      if (err?.status === 429) {
        await new Promise(r => setTimeout(r, 250));
        const res = await this.client.chat.completions.create({ model, messages, temperature, max_tokens: maxTokens });
        return res.choices?.[0]?.message?.content ?? '';
      }
      throw err;
    } finally {
      clearTimeout(id);
    }
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'user', content: prompt },
    ];
    return this.chat(messages, options);
  }

  async embed(text: string): Promise<number[]> {
    const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
    const res = await this.client.embeddings.create({ model, input: text });
    return (res.data?.[0]?.embedding as number[]) || [];
  }

  async moderate(content: string): Promise<{ flagged: boolean; categories?: Record<string, boolean> }>{
    // The new OpenAI SDK v4 no longer exposes moderation as a first-class method in all setups;
    // use the HTTP endpoint via client as recommended.
    const model = process.env.OPENAI_MODERATION_MODEL || 'omni-moderation-latest';
    try {
      // @ts-expect-error: moderation endpoint may not be typed depending on SDK version
      const res = await this.client.moderations.create({ model, input: content });
      const result = res.results?.[0];
      return { flagged: Boolean(result?.flagged), categories: result?.categories };
    } catch {
      // Fail-open but unflagged if moderation not available
      return { flagged: false };
    }
  }
}
