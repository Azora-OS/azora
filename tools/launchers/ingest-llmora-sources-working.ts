#!/usr/bin/env tsx

/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES

LLMORA KNOWLEDGE INGESTION - WORKING VERSION
============================================
*/

import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { AIIngestionService } from '../../core/system-core/ai-ingestion.js';
import { KnowledgeGraph } from '../../core/elara-brain/knowledge-graph.js';
import { PatternLearner } from '../../core/elara-brain/pattern-learner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LLMORA_TARGETS = [
  {
    owner: 'ollama',
    repo: 'ollama',
    focus: ['API design', 'Model loading', 'Local inference'],
    priority: 'HIGH' as const,
    learningGoals: ['How do they structure the API for local LLM inference?']
  },
  {
    owner: 'ggerganov',
    repo: 'llama.cpp',
    focus: ['Quantization', 'CPU optimization'],
    priority: 'HIGH' as const,
    learningGoals: ['How does quantization reduce model size?']
  }
];

async function ingestLLMoraSources() {
  console.log('🚀 Starting LLMora ingestion...');
  const root = path.resolve(__dirname, '../../');
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  const svc = new AIIngestionService(root, token);
  const knowledgeDir = path.join(root, '.elara', 'knowledge', 'repos');
  await fs.mkdir(knowledgeDir, { recursive: true });

  console.log('\n🔄 Starting repository ingestion...\n');
  const ingested = await svc.ingestMultiple(LLMORA_TARGETS);
  console.log(`\n✅ Successfully ingested ${ingested.length} repositories`);

  console.log('\n🧠 Starting pattern learning...');
  const kg = new KnowledgeGraph(root);
  await kg.initialize();

  const learner = new PatternLearner(kg);
  const patterns = await learner.learnFromRepos(knowledgeDir);

  console.log('\n📊 Pattern Learning Summary:');
  console.log(`   Patterns discovered: ${patterns.length}`);
  console.log(`   Files analyzed: ${ingested.length}`);
  console.log(`   Repos processed: ${LLMORA_TARGETS.length}`);

  const kgStats = kg.getStats();
  console.log('\n📚 Knowledge Graph Stats:');
  console.log(`   Total nodes: ${kgStats.totalNodes}`);
  console.log(`   Node types: ${Object.entries(kgStats.nodeTypes).map(([type, count]) => `${type}(${count})`).join(', ')}`);
  console.log(`   Average confidence: ${kgStats.avgConfidence.toFixed(2)}`);

  console.log('\n✨ LLMora knowledge ingestion complete!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestLLMoraSources().catch(err => {
    console.error('❌ Ingestion failed:', err);
    process.exit(1);
  });
}