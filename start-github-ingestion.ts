/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

#!/usr/bin/env ts-node

/**
 * Start GitHub Ingestion for Organism Growth
 *
 * Initiates continuous ingestion from GitHub to grow the Azora organism
 */

import { GitHubIngestionOrchestrator } from './genome/github-ingestion-orchestrator';
import { AzoraOrganism } from './genome/organism-core';

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     GITHUB INGESTION - ORGANISM GROWTH INITIATED          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Initialize organism
  const organism = new AzoraOrganism();
  await organism.birth();

  // Start GitHub ingestion
  const orchestrator = GitHubIngestionOrchestrator.getInstance();

  orchestrator.on('started', () => {
    console.log('\n✅ GitHub Ingestion Orchestrator started');
  });

  orchestrator.on('ingestion-started', (progress) => {
    console.log(`\n📦 Started: ${progress.repository}`);
  });

  orchestrator.on('file-processed', ({ repository, file }) => {
    console.log(`   ✓ ${file}`);
  });

  orchestrator.on('ingestion-completed', (progress) => {
    const duration = progress.endTime && progress.startTime
      ? Math.round((progress.endTime.getTime() - progress.startTime.getTime()) / 1000)
      : 0;
    console.log(`\n✅ Completed: ${progress.repository} (${duration}s)`);
    console.log(`   Files: ${progress.filesProcessed}/${progress.filesTotal}`);

    if (progress.errors.length > 0) {
      console.log(`   ⚠️ Errors: ${progress.errors.length}`);
    }
  });

  // Start ingestion
  await orchestrator.start();

  // Display status every 30 seconds
  setInterval(() => {
    const status = orchestrator.getStatus();
    console.log('\n📊 Ingestion Status:');
    console.log(`   Queue: ${status.queueLength}`);
    console.log(`   Active: ${status.active}`);
    console.log(`   Completed: ${status.completed}`);
  }, 30000);

  console.log('\n🔄 Continuous ingestion running...');
  console.log('Press Ctrl+C to stop\n');
}

if (require.main === module) {
  main().catch(console.error);
}

