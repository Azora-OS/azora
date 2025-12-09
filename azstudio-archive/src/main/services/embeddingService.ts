import OpenAI from 'openai';

export class EmbeddingService {
  private openai: OpenAI | null = null;
  constructor() {
    if (process.env.OPENAI_API_KEY) this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  async embedText(text: string): Promise<number[]> {
    if (this.openai) {
      try {
        const res = await (this.openai as any).embeddings.create({ model: 'text-embedding-3-large', input: text });
        return res.data[0].embedding as number[];
      } catch (err) {
        // fallthrough to fallback
      }
    }
    // Simple fallback embedding: normalized trigram counts hashed to vector
    const v: number[] = new Array(128).fill(0);
    const s = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    for (let i = 0; i < s.length - 2; i++) {
      const tri = s.substr(i, 3);
      let h = 0;
      for (let j = 0; j < tri.length; j++) h = (h * 31 + tri.charCodeAt(j)) % 1000000007;
      v[h % 128] += 1;
    }
    // normalize
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    if (norm === 0) return v;
    return v.map(x => x / norm);
  }
}

export default EmbeddingService;
