import axios from 'axios';
import { logger } from './logger';

export interface AIProviderResponse {
  embedding: number[];
}

export class AIProviderRouter {
  private providerUrl: string;
  constructor(providerUrl?: string) {
    this.providerUrl = providerUrl ?? process.env.AI_PROVIDER_URL ?? '';
  }

  async embedText(text: string): Promise<number[]> {
    if (!this.providerUrl) {
      // fall back to simple hash-based pseudo-embedding for dev
      return this.pseudoEmbedding(text);
    }
    try {
      const resp = await axios.post<AIProviderResponse>(`${this.providerUrl}/embed`, { text });
      return resp.data.embedding;
    } catch (err: any) {
      logger.error({ err }, 'embedText error');
      return this.pseudoEmbedding(text);
    }
  }

  private pseudoEmbedding(text: string): number[] {
    const arr = new Array(64).fill(0).map((_, i) => (text.charCodeAt(i % text.length) % 10) / 10);
    return arr;
  }
}
