#!/usr/bin/env node
// CLI to ingest knowledge documents into the KnowledgeOcean (local or pgvector)
import fs from 'fs';
import path from 'path';
import { KnowledgeOceanService } from '../src/vs/workbench/services/azora/knowledgeOceanService';
import IngestionQueue from '../src/vs/workbench/services/azora/ingestionQueue';

async function gatherDataDirs(): Promise<{ id: string; title?: string; content: string }[]> {
  const dataDirCandidates = [path.join(process.cwd(), 'data'), path.join(process.cwd(), '..', 'data')];
  const dir = dataDirCandidates.find(d => fs.existsSync(d));
  if (!dir) return [];
  const out: { id: string; title?: string; content: string }[] = [];
  const courseFile = path.join(dir, 'courses.json');
  if (fs.existsSync(courseFile)) {
    const ds = JSON.parse(fs.readFileSync(courseFile, 'utf-8')) as any[];
    for (const c of ds) {
      out.push({ id: c.id || c.title, title: c.title, content: (c.description || c.title || '') });
    }
  }
  // Add other JSON or md files as needed
  return out;
}

async function main() {
  const svc = new KnowledgeOceanService();
  const docs = await gatherDataDirs();
  if (!docs.length) {
    console.log('No docs found to ingest');
    process.exit(0);
  }
  console.log(`Enqueueing ingestion of ${docs.length} docs`);
  const priorityArgIndex = process.argv.indexOf('--priority');
  const priority = priorityArgIndex >= 0 ? parseInt(process.argv[priorityArgIndex + 1] || '100') : 100;
  try {
    const queue = new (IngestionQueue as any)();
    queue.enqueue({ id: `batch-${Date.now()}`, docs, priority });
  } catch (err) {
    console.log('Failed to use ingestion queue; fallback to direct indexing', err);
    await svc.indexLocal(docs);
  }
  console.log('Done');
}

main().catch(err => { console.error(err); process.exit(1); });
