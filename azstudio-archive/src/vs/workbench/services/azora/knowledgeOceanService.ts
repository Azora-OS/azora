import { registerSingleton, InstantiationType } from '../../../platform/instantiation/common/simpleExtensions';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import LocalVectorOcean from './knowledgeOceanLocal';
import PgVectorStorageService from './pgVectorStorageService';
import StorageService from './storageService';

export interface KnowledgeResult { id: string; title?: string; snippet: string; source?: string; score?: number; redacted?: boolean }

export interface IKnowledgeOceanService {
  tryAnswer(query: string, agentId?: string): Promise<string | null>;
  getRelevantContext(query: string): Promise<string>;
  querySnippets(query: string, topK?: number): Promise<KnowledgeResult[]>;
}

export class KnowledgeOceanService implements IKnowledgeOceanService {
  private httpUrl: string | undefined;
  private local: LocalVectorOcean | null = null;
  private storage: StorageService;
  private pgSvc: any;
  private cache: Map<string, { snippets: KnowledgeResult[]; ts: number }> = new Map();
  private cacheTTL = Number(process.env.AZORA_KNOWLEDGE_OCEAN_CACHE_TTL || '60000'); // default 60s
  constructor() {
    this.httpUrl = process.env.AZORA_KNOWLEDGE_OCEAN_API_URL;
    this.storage = new StorageService();
    const backend = process.env.AZORA_KNOWLEDGE_OCEAN_BACKEND || process.env.KNOWLEDGE_OCEAN_BACKEND || 'local';
    if (backend === 'pgvector') {
      const conn = process.env.PGVECTOR_CONN || process.env.PG_CONN;
      this.pgSvc = new PgVectorStorageService(conn);
      this.local = null;
    } else if (!this.httpUrl) {
      this.local = new LocalVectorOcean();
      // Seed with data/courses.json if available
      try {
        const candidates = [path.join(process.cwd(), 'data', 'courses.json'), path.join(process.cwd(), '..', 'data', 'courses.json')];
        const file = candidates.find(f => fs.existsSync(f));
        if (file) {
          const ds = JSON.parse(fs.readFileSync(file, 'utf-8')) as any[];
          const docs = ds.map(d => ({ id: d.id || (d.title || '').slice(0, 24), title: d.title, content: d.description || d.title || '' }));
          if (docs.length) {
            if (this.local) this.local.indexDocs(docs).catch(() => {});
            if (this.pgSvc) this.pgSvc.indexDocs(docs).catch(() => {});
          }
        }
      } catch (e) { /* ignore */ }
    }
  }
    async tryAnswer(query: string, agentId?: string): Promise<string | null> {
      const cacheKey = `answer:${query}:${agentId || ''}`;
      const hit = this.cache.get(cacheKey);
      if (hit && (Date.now() - hit.ts) < this.cacheTTL) {
        const first = hit.snippets[0];
        return first ? `${first.snippet} (source: ${first.source})` : null;
      }
      // Try remote service first
      if (this.httpUrl) {
        try {
          const url = `${this.httpUrl}/tryAnswer`;
          const res = await axios.post(url, { query, agentId });
          return res.data?.answer || null;
        } catch (err) { /* ignore */ }
      }
      if (this.local) {
        const raw = await this.querySnippets(query, 1);
        const results = raw.map(r => ({ id: r.id, title: r.title, snippet: r.snippet, source: r.source }));
        // sanitize and redact if necessary
        const processed = results.map(r => this.processSnippet(r));
        if (processed && processed.length > 0) {
          this.cache.set(cacheKey, { snippets: processed, ts: Date.now() });
          const first = processed[0];
          return `From Knowledge Ocean (local): ${first.title || first.id} - ${first.snippet}`;
        }
      }
      if (this.pgSvc) {
        const raw = await this.querySnippets(query, 1);
        const results = raw.map((r: any) => ({ id: r.id, title: r.title, snippet: r.snippet, source: r.source }));
        const processed = results.map((r) => this.processSnippet(r));
        if (processed && processed.length > 0) {
          this.cache.set(cacheKey, { snippets: processed, ts: Date.now() });
          const first = processed[0];
          return `From Knowledge Ocean (pgvector): ${first.title || first.id} - ${first.snippet}`;
        }
      }
      return null;
  }
    async getRelevantContext(query: string, topK = 3): Promise<string> {
      const cacheKey = `context:${query}:${topK}`;
      const hit = this.cache.get(cacheKey);
      if (hit && (Date.now() - hit.ts) < this.cacheTTL) {
        return hit.snippets.map(s => `- ${s.title || s.id}: ${s.snippet} (source: ${s.source})`).join('\n');
      }
      if (this.httpUrl) {
        try {
          const url = `${this.httpUrl}/getContext`;
          const res = await axios.post(url, { query, topK });
          return (res.data?.snippets || []).join('\n');
        } catch (err) { /* ignore */ }
      }
        if (this.local) {
          const processed = await this.querySnippets(query, topK);
          this.cache.set(cacheKey, { snippets: processed, ts: Date.now() });
          return processed.map(r => `- ${r.title || r.id}: ${r.snippet} (score: ${r.score?.toFixed(2)}) (source: ${r.source})`).join('\n');
        }
      if (this.pgSvc) {
        const processed = await this.querySnippets(query, topK);
        this.cache.set(cacheKey, { snippets: processed, ts: Date.now() });
        return processed.map((r: any) => `- ${r.title || r.id}: ${r.snippet} (score: ${r.score?.toFixed(2)}) (source: ${r.source})`).join('\n');
      }
      return '';
  }
  
    async indexLocal(docs: { id: string; title?: string; content: string }[]): Promise<void> {
      if (this.local) await this.local.indexDocs(docs);
    }

    async querySnippets(query: string, topK = 3): Promise<KnowledgeResult[]> {
      const cacheKey = `snippets:${query}:${topK}`;
      const hit = this.cache.get(cacheKey);
      if (hit && (Date.now() - hit.ts) < this.cacheTTL) return hit.snippets;
      let raw: any[] = [];
      if (this.httpUrl) {
        try {
          const url = `${this.httpUrl}/querySnippets`;
          const res = await axios.post(url, { query, topK });
          raw = res.data?.snippets || [];
        } catch (_err) { /* ignore */ }
      }
      if (!raw.length && this.local) {
        raw = await this.local.query(query, topK);
      }
      if (!raw.length && this.pgSvc) {
        raw = await this.pgSvc.query(query, topK);
      }
      const processed = raw.map((r: any) => this.processSnippet({ id: r.id, title: r.title, snippet: r.snippet, source: r.source, score: r.score }));
      this.cache.set(cacheKey, { snippets: processed, ts: Date.now() });
      return processed;
    }

    private processSnippet(r: KnowledgeResult): KnowledgeResult {
      // Basic redaction: redact emails and long sequences that might contain secrets
      const original = r.snippet || '';
      const step1 = original.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g, '[REDACTED_EMAIL]');
      const step2 = step1.replace(/\d{4,}/g, match => '#'.repeat(Math.min(match.length, 8)));
      const truncated = step2.slice(0, 500);
      r.snippet = truncated; // hard cap
      r.redacted = truncated !== original;
      return r;
    }
}

registerSingleton('IKnowledgeOceanService' as any, KnowledgeOceanService as any, InstantiationType.Delayed);
export default KnowledgeOceanService;
