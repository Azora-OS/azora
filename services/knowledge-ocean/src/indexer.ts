import { KnowledgeIndexer, KnowledgeNode } from './types';
import { logger } from './logger';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

export class DatabaseIndexer implements KnowledgeIndexer {
  private prisma: PrismaClient;
  private aiRouterUrl: string;

  constructor(aiRouterUrl = 'http://localhost:4010') {
    this.prisma = new PrismaClient();
    this.aiRouterUrl = aiRouterUrl;
  }

  async indexFile(filePath: string): Promise<KnowledgeNode[]> {
    // For now, assume nodes are provided externally; this method can be used to re-index
    return [];
  }

  async indexNodes(nodes: KnowledgeNode[]): Promise<void> {
    for (const node of nodes) {
      if (!node.embedding) {
        try {
          const resp = await axios.post(`${this.aiRouterUrl}/v1/embeddings`, { input: node.content });
          node.embedding = resp.data.data[0].embedding;
        } catch (err) {
          logger.error({ err }, 'Failed to generate embedding');
          // Fallback to pseudo embedding
          node.embedding = this.pseudoEmbedding(node.content);
        }
      }
      await this.prisma.knowledgeNode.upsert({
        where: { id: node.id },
        update: {
          path: node.path,
          type: node.type,
          title: node.title,
          content: node.content,
          embeddingJson: node.embedding,
          metadata: node.metadata
        },
        create: {
          id: node.id,
          path: node.path,
          type: node.type,
          title: node.title,
          content: node.content,
          embeddingJson: node.embedding,
          metadata: node.metadata
        }
      });
      // Attempt to update the vector column if present. This will fail gracefully if pgvector isn't present yet.
      try {
        if (node.embedding && Array.isArray(node.embedding)) {
          // Parameterized update to avoid injection
          const vectorLiteral = '[' + node.embedding.join(',') + ']';
          await this.prisma.$executeRaw(`UPDATE knowledge_nodes SET embedding = $1::vector WHERE id = $2`, vectorLiteral, node.id);
        }
      } catch (err) {
        // If column not present or extension missing, ignore the error and keep embeddingJson only
        logger.debug({ err, nodeId: node.id }, 'Vector column update skipped');
      }
    }
  }

  async search(query: string, limit = 10): Promise<KnowledgeNode[]> {
    // Generate embedding for query
    let queryEmbedding: number[];
    try {
      const resp = await axios.post(`${this.aiRouterUrl}/v1/embeddings`, { input: query });
      queryEmbedding = resp.data.data[0].embedding;
    } catch (err) {
      logger.error({ err }, 'Failed to generate query embedding');
      queryEmbedding = this.pseudoEmbedding(query);
    }

    // Use pgvector similarity search
    const vectorLiteral = '[' + queryEmbedding.join(',') + ']';
    let results: any[] = [];
    try {
      results = await this.prisma.$queryRaw`
        SELECT id, path, type, title, content, metadata, embedding::text as embedding_text
        FROM knowledge_nodes
        ORDER BY embedding <-> ${vectorLiteral}::vector
        LIMIT ${limit}
      ` as any[];
    } catch (err) {
      logger.warn({ err }, 'Vector search failed - falling back to in-memory scan of JSON embeddings');
      const all = await this.prisma.knowledgeNode.findMany();
      // Basic L2 distance fallback on JSON embeddings
      const withDist = all
        .map((k: any) => ({
          node: k as KnowledgeNode,
          dist: k.embeddingJson ? this.l2Distance(k.embeddingJson as number[], queryEmbedding) : Number.POSITIVE_INFINITY
        }))
        .sort((a: {dist:number}, b: {dist:number}) => a.dist - b.dist)
        .slice(0, limit);
      return withDist.map((w: {node: KnowledgeNode}) => ({
        id: w.node.id,
        path: w.node.path,
        type: w.node.type,
        title: w.node.title,
        content: w.node.content,
        embedding: w.node.embeddingJson,
        metadata: w.node.metadata
      }));
    }

    return results.map(row => ({
      id: row.id,
      path: row.path,
      type: row.type,
      title: row.title,
      content: row.content,
      embedding: row.embedding_text ? JSON.parse(row.embedding_text) : undefined,
      metadata: row.metadata
    }));
  }

  private pseudoEmbedding(text: string): number[] {
    return new Array(1536).fill(0).map((_, i) => (text.charCodeAt(i % text.length) % 100) / 100);
  }

  private l2Distance(a: number[], b: number[]) {
    if (!a || !b) return Number.POSITIVE_INFINITY;
    const len = Math.min(a.length, b.length);
    let sum = 0;
    for (let i = 0; i < len; i++) {
      const d = (a[i] ?? 0) - (b[i] ?? 0);
      sum += d * d;
    }
    return Math.sqrt(sum);
  }
}

export class InMemoryIndexer implements KnowledgeIndexer {
  private nodes: Map<string, KnowledgeNode> = new Map();
  private aiRouter: any;
  constructor(aiRouterUrl?: string) {
    // Optionally call AI router for embeddings
    if (aiRouterUrl) this.aiRouter = aiRouterUrl;
  }
  async indexFile(filePath: string): Promise<KnowledgeNode[]> { return []; }
  async indexNodes(nodes: KnowledgeNode[]): Promise<void> {
    for (const node of nodes) {
      if (!node.embedding) node.embedding = new Array(1536).fill(0).map(c => Math.random());
      this.nodes.set(node.id, node);
    }
  }
  async search(query: string, limit = 10): Promise<KnowledgeNode[]> {
    // naive similarity: cosine on stored embeddings
    const qembedding = new Array(1536).fill(0).map(c => Math.random());
    const arr = Array.from(this.nodes.values());
    const scored = arr.map(n => ({node: n, score: this.cosineSimilarity(qembedding, n.embedding ?? [])}));
    scored.sort((a,b)=>b.score-a.score);
    return scored.slice(0, limit).map(s => s.node);
  }
  private cosineSimilarity(a: number[], b: number[]) { if (!a || !b) return 0; const min = Math.min(a.length, b.length); let adot=0, anorm=0, bnorm=0; for (let i=0;i<min;i++){ adot += a[i]*b[i]; anorm += a[i]*a[i]; bnorm += b[i]*b[i]; } if (anorm===0 || bnorm===0) return 0; return adot/(Math.sqrt(anorm)*Math.sqrt(bnorm)); }
}
