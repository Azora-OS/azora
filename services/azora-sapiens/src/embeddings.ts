import { OpenAI } from 'openai';
import NodeCache from 'node-cache';

interface EmbeddingCache {
  text: string;
  embedding: number[];
  timestamp: number;
}

export class EmbeddingService {
  private openai: OpenAI;
  private cache: NodeCache;
  private model = 'text-embedding-3-small';

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.cache = new NodeCache({ stdTTL: 86400 }); // 24 hour TTL
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cached = this.cache.get<EmbeddingCache>(text);
    if (cached) {
      return cached.embedding;
    }

    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: text,
      });

      const embedding = response.data[0].embedding;

      // Cache the result
      this.cache.set(text, {
        text,
        embedding,
        timestamp: Date.now(),
      });

      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    const uncachedTexts: { index: number; text: string }[] = [];

    // Check cache for each text
    for (let i = 0; i < texts.length; i++) {
      const cached = this.cache.get<EmbeddingCache>(texts[i]);
      if (cached) {
        embeddings[i] = cached.embedding;
      } else {
        uncachedTexts.push({ index: i, text: texts[i] });
      }
    }

    // If all cached, return early
    if (uncachedTexts.length === 0) {
      return embeddings;
    }

    // Process uncached texts in batches of 100
    const batchSize = 100;
    for (let i = 0; i < uncachedTexts.length; i += batchSize) {
      const batch = uncachedTexts.slice(i, i + batchSize);
      const batchTexts = batch.map((item) => item.text);

      try {
        const response = await this.openai.embeddings.create({
          model: this.model,
          input: batchTexts,
        });

        for (let j = 0; j < response.data.length; j++) {
          const originalIndex = batch[j].index;
          const embedding = response.data[j].embedding;
          embeddings[originalIndex] = embedding;

          // Cache each result
          this.cache.set(batch[j].text, {
            text: batch[j].text,
            embedding,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error('Error generating batch embeddings:', error);
        throw error;
      }
    }

    return embeddings;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.flushAll();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

export default EmbeddingService;
