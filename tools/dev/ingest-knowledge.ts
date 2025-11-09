/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface KnowledgeSource {
  name: string;
  path: string;
  type: 'education' | 'library' | 'research' | 'institutional';
  quality: number;
}

interface Chunk {
  content: string;
  metadata: {
    source: string;
    title: string;
    subject: string;
    quality: number;
  };
  embedding?: number[];
}

const SOURCES: KnowledgeSource[] = [
  { name: 'Azora Education', path: 'services/azora-education', type: 'education', quality: 0.7 },
  { name: 'Azora Library', path: 'services/azora-library', type: 'library', quality: 0.8 },
  { name: 'Research Center', path: 'services/azora-research-center', type: 'research', quality: 0.9 },
  { name: 'Institutional', path: 'services/azora-institutional-system', type: 'institutional', quality: 0.7 }
];

async function discoverContent(source: KnowledgeSource): Promise<string[]> {
  const files: string[] = [];
  const basePath = path.join(process.cwd(), source.path);
  
  if (!fs.existsSync(basePath)) {
    console.log(`⚠️  ${source.name} path not found, skipping`);
    return files;
  }

  function scanDir(dir: string) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDir(fullPath);
      } else if (stat.isFile() && (item.endsWith('.md') || item.endsWith('.txt'))) {
        files.push(fullPath);
      }
    }
  }

  scanDir(basePath);
  return files;
}

function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
  }

  return chunks;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return response.data[0].embedding;
}

async function storeChunk(chunk: Chunk): Promise<void> {
  await supabase.from('knowledge_base').insert({
    content: chunk.content,
    metadata: chunk.metadata,
    embedding: chunk.embedding
  });
}

async function processFile(filePath: string, source: KnowledgeSource): Promise<number> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const chunks = chunkText(content);
  
  let processed = 0;
  for (const chunkText of chunks) {
    const chunk: Chunk = {
      content: chunkText,
      metadata: {
        source: source.name,
        title: path.basename(filePath),
        subject: source.type,
        quality: source.quality
      }
    };

    try {
      chunk.embedding = await generateEmbedding(chunkText);
      await storeChunk(chunk);
      processed++;
    } catch (error) {
      console.error(`Error processing chunk: ${error}`);
    }
  }

  return processed;
}

async function main() {
  console.log('🌍 UNIVERSAL KNOWLEDGE INGESTION PIPELINE');
  console.log('==========================================\n');

  let totalChunks = 0;

  for (const source of SOURCES) {
    console.log(`📚 Processing: ${source.name}`);
    const files = await discoverContent(source);
    
    if (files.length === 0) {
      console.log(`  ⚠️  No files found\n`);
      continue;
    }

    console.log(`  📖 Found ${files.length} files`);
    
    for (const file of files.slice(0, 5)) { // Limit to 5 files per source for demo
      const chunks = await processFile(file, source);
      totalChunks += chunks;
      console.log(`  ✅ ${path.basename(file)}: ${chunks} chunks`);
    }
    
    console.log();
  }

  console.log('==========================================');
  console.log(`✅ INGESTION COMPLETE!`);
  console.log(`📊 Total chunks processed: ${totalChunks}`);
  console.log(`🧠 Elara now has universal knowledge!\n`);
}

main().catch(console.error);
