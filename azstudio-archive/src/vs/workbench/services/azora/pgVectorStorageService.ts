import { Client } from 'pg';
import StorageService from './storageService';
import { EmbeddingService } from '../../../../main/services/embeddingService';

export interface PgVectorDoc { id: string; title: string; content: string; embedding: number[] }

export class PgVectorStorageService {
  private client: Client | null = null;
  private table = 'knowledge_docs';
  private embSvc: EmbeddingService;
  constructor(conn?: string) {
    this.embSvc = new EmbeddingService();
    if (!conn) conn = process.env.PGVECTOR_CONN || process.env.PG_CONN || 'postgresql://localhost/azora';
    try {
      this.client = new Client({ connectionString: conn });
      this.client.connect().catch(() => { this.client = null; });
    } catch (err) {
      this.client = null;
    }
  }

  async ensureTable() {
    if (!this.client) return;
    try {
      await this.client.query(`CREATE TABLE IF NOT EXISTS ${this.table} (id text PRIMARY KEY, title text, content text, embedding jsonb)`);
      // Attempts to create `vector` column if pgvector is available
      try { await this.client.query(`ALTER TABLE ${this.table} ADD COLUMN IF NOT EXISTS embedding_vec vector(1536)`); } catch { /* ignore if no pgvector */ }
    } catch (err) { /* ignore */ }
  }

  async indexDocs(docs: { id: string; title?: string; content: string }[]) {
    if (!this.client) return; // no-op if no connection
    await this.ensureTable();
    for (const d of docs) {
      const embed = await this.embSvc.embedText(d.content);
      const embJson = JSON.stringify(embed);
      try {
        // Upsert
        await this.client.query(`INSERT INTO ${this.table}(id,title,content,embedding) VALUES($1,$2,$3,$4) ON CONFLICT (id) DO UPDATE SET title = $2, content=$3, embedding=$4`, [d.id, d.title || '', d.content, embJson]);
        // If pgvector is present, try to store into embedding_vec
        try { await this.client.query(`UPDATE ${this.table} SET embedding_vec = $1 WHERE id = $2`, [embed, d.id]); } catch { /* ignore */ }
      } catch (err) { /* ignore */ }
    }
  }

  private cosine(a: number[], b: number[]): number {
    const da = a.reduce((s, v) => s + v * v, 0);
    const db = b.reduce((s, v) => s + v * v, 0);
    if (da === 0 || db === 0) return 0;
    const dot = a.reduce((s, v, i) => s + v * (b[i] || 0), 0);
    return dot / (Math.sqrt(da) * Math.sqrt(db));
  }

  async query(query: string, topK = 3): Promise<{ id: string; title: string; snippet: string; score: number; source?: string }[]> {
    const qEmbed = await this.embSvc.embedText(query);
    if (!this.client) return [];
    try {
      // If pgvector is available, attempt to use nearest neighbors SQL. Fallback to JSON search if not.
      try {
        const res = await this.client.query(`SELECT id, title, content, embedding_vec <#> $1 AS score FROM ${this.table} ORDER BY embedding_vec <#> $1 LIMIT $2`, [qEmbed, topK]);
        return res.rows.map((r: any) => ({ id: r.id, title: r.title, snippet: (r.content || '').slice(0, 400), score: r.score, source: `postgres://${r.id}` }));
      } catch (_err) {
        // fallback: fetch all, compute cosine with embeddings json
        const res = await this.client.query(`SELECT id, title, content, embedding FROM ${this.table}`);
        const scored = res.rows.map((r: any) => ({ id: r.id, title: r.title, content: r.content, score: this.cosine(qEmbed, JSON.parse(r.embedding || '[]')) }));
        return scored.sort((a, b) => b.score - a.score).slice(0, topK).map(s => ({ id: s.id, title: s.title, snippet: (s.content || '').slice(0, 400), score: s.score, source: `postgres://${s.id}` }));
      }
    } catch (err) {
      return [];
    }
  }
}

export default PgVectorStorageService;
