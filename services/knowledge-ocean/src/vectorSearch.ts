import { KnowledgeNode } from './types';
import { logger } from './logger';
import { Client } from 'pg';

// A simple dual-mode vector search: Postgres + pgvector (if configured) else in-memory fallback
export class VectorSearchEngine {
  private client: Client | null = null;
  private inMemory: Map<string, KnowledgeNode> = new Map();
  private usePgVector = false;

  constructor() {
    if (process.env.USE_PGVECTOR === 'true' && process.env.DATABASE_URL) {
      this.client = new Client({ connectionString: process.env.DATABASE_URL });
      this.client.connect().then(() => logger.info('PG connected'));
      this.usePgVector = true;
    }
  }

  async upsertNode(node: KnowledgeNode) {
    if (this.usePgVector && this.client) {
      // store embedding as a vector if pgvector enabled; else fallback to a JSON column
      try {
        // Convert embedding to a vector literal string for pgvector insertion
        const vectorStr = node.embedding ? '[' + node.embedding.join(',') + ']' : null;
        await this.client.query(
          'INSERT INTO knowledge_nodes (id, path, type, title, content, embedding, embedding_json, metadata) VALUES ($1,$2,$3,$4,$5,$6::vector,$7::jsonb,$8) ON CONFLICT (id) DO UPDATE SET content=$5, embedding=$6::vector, embedding_json=$7::jsonb, metadata=$8',
          [node.id, node.path, node.type, node.title, node.content, vectorStr, JSON.stringify(node.embedding ?? null), JSON.stringify(node.metadata)]
        );
        return;
      } catch (err: any) {
        logger.error({ err }, 'upsertNode pg error');
      }
    }
    this.inMemory.set(node.id, node);
  }

  async similaritySearch(queryEmbedding: number[], limit = 5) : Promise<KnowledgeNode[]> {
    if (this.usePgVector && this.client) {
      // This is simplified; we store embeddings in JSON for now and do a simple distance computation in node
      // Use pgvector intrinsic operator for efficient kNN search
      const vectorLiteral = '[' + queryEmbedding.join(',') + ']';
      const r = await this.client.query('SELECT id, path, content, embedding::text as embedding_text, embedding_json FROM knowledge_nodes ORDER BY embedding <-> $1::vector LIMIT $2', [vectorLiteral, limit]);
      const items = r.rows.map((row: any) => ({
        id: row.id,
        path: row.path,
        content: row.content,
        embedding: row.embedding_text ? JSON.parse(row.embedding_text) : (row.embedding_json ?? undefined)
      } as KnowledgeNode));
      const scored = items.map(i => ({ i, score: this.cosineSimilarity(queryEmbedding, i.embedding ?? []) }));
      scored.sort((a,b)=>b.score-a.score);
      return scored.slice(0, limit).map(s=>s.i);
    }
    // in-memory fallback: iterate and compute similarity
    const items: KnowledgeNode[] = [];
    for (const node of this.inMemory.values()) items.push(node);
    const scores = items.map(i => ({ i, score: this.cosineSimilarity(queryEmbedding, i.embedding ?? []) }));
    scores.sort((a,b)=>b.score-a.score);
    return scores.slice(0, limit).map(s=>s.i);
  }

  cosineSimilarity(a: number[], b: number[]) {
    if (!a || !b || !a.length || !b.length) return 0;
    const min = Math.min(a.length, b.length);
    let adot=0, anorm=0, bnorm=0;
    for (let i=0;i<min;i++) { adot += a[i]*b[i]; anorm += a[i]*a[i]; bnorm += b[i]*b[i]; }
    if (anorm === 0 || bnorm===0) return 0;
    return adot/(Math.sqrt(anorm)*Math.sqrt(bnorm));
  }
}
