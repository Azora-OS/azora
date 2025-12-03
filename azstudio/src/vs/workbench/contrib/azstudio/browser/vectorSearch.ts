import { IAIProviderRouter } from './aiProviderRouter.js';

export interface IVectorNode {
  id: string;
  title?: string;
  content: string;
  embedding?: number[];
}

export class VectorEngine {
  private store: Map<string, IVectorNode> = new Map();
  constructor(private aiRouter?: IAIProviderRouter) {}

  async upsert(node: IVectorNode) {
    if (this.aiRouter && !node.embedding) {
      try {
        const resp = await this.aiRouter.embedText(node.content);
        node.embedding = resp.embedding;
      } catch (err) {
        node.embedding = this.pseudoEmbedding(node.content);
      }
    }
    this.store.set(node.id, node);
  }

  async similaritySearch(queryEmbedding: number[], limit = 5) {
    const items: { node: IVectorNode; score: number }[] = [];
    for (const node of this.store.values()) {
      const score = this.cosineSimilarity(queryEmbedding, node.embedding || []);
      items.push({ node, score });
    }
    items.sort((a, b) => b.score - a.score);
    return items.slice(0, limit).map(i => i.node);
  }

  private cosineSimilarity(a: number[], b: number[]) {
    if (!a || !b || !a.length || !b.length) return 0;
    let adot = 0, anorm = 0, bnorm = 0;
    const min = Math.min(a.length, b.length);
    for (let i = 0; i < min; i++) { adot += a[i] * b[i]; anorm += a[i] * a[i]; bnorm += b[i] * b[i]; }
    if (anorm === 0 || bnorm === 0) return 0;
    return adot / (Math.sqrt(anorm) * Math.sqrt(bnorm));
  }

  private pseudoEmbedding(text: string): number[] {
    const arr = new Array(64).fill(0).map((_, i) => (text.charCodeAt(i % text.length) % 10) / 10);
    return arr;
  }
}
