import fs from 'fs';
import path from 'path';
import StorageService from './storageService';
import { EmbeddingService } from '../../../../main/services/embeddingService';

export interface LocalDoc { id: string; title: string; content: string; embed?: number[] }

export class LocalVectorOcean {
  private storage: StorageService;
  private storeFile = 'knowledgeIndex.json';
  private docs: LocalDoc[] = [];
  private embSvc: EmbeddingService;

  constructor() {
    this.storage = new StorageService();
    this.embSvc = new EmbeddingService();
    const loaded = this.storage.readJson<LocalDoc[]>(this.storeFile);
    if (loaded && Array.isArray(loaded)) this.docs = loaded;
  }

  async indexDocs(docs: { id: string; title?: string; content: string }[]): Promise<void> {
    for (const d of docs) {
      const existing = this.docs.find(x => x.id === d.id);
      const embed = await this.embSvc.embedText(d.content);
      if (existing) {
        existing.title = d.title || existing.title;
        existing.content = d.content;
        existing.embed = embed;
      } else {
        this.docs.push({ id: d.id, title: d.title || '', content: d.content, embed });
      }
    }
    // persist
    this.storage.writeJson(this.storeFile, this.docs);
  }

  // similarity via cosine of normalized vectors
  private cosine(a: number[], b: number[]): number {
    const da = a.reduce((s, x) => s + x * x, 0);
    const db = b.reduce((s, x) => s + x * x, 0);
    if (da === 0 || db === 0) return 0;
    const dot = a.reduce((s, x, i) => s + x * (b[i] || 0), 0);
    return dot / (Math.sqrt(da) * Math.sqrt(db));
  }

  async query(query: string, topK = 3): Promise<{ id: string; title: string; snippet: string; score: number; source?: string }[]> {
    const qEmbed = await this.embSvc.embedText(query);
    const scored = this.docs.map((d) => ({ d, score: d.embed ? this.cosine(qEmbed, d.embed) : 0 }));
    const sorted = scored.sort((a, b) => b.score - a.score).slice(0, topK);
    return sorted.map(s => ({ id: s.d.id, title: s.d.title, snippet: s.d.content.slice(0, 400), score: s.score, source: `local://${s.d.id}` }));
  }
}

export default LocalVectorOcean;
