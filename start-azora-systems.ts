/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

#!/usr/bin/env ts-node

/**
 * Start All Azora Systems
 *
 * Initializes and starts:
 * - Repository cleanup
 * - Azora IDE (with Cursor learning)
 * - Azorahub (with GitHub ingestion)
 * - Azora Workspaces (Codespaces equivalent)
 * - Elara Spark & Copilot
 */

import { execSync } from 'child_process';
import { AzoraIDE } from './azora-ide/azora-ide-core';
import { AzorahubGitHubIngestion } from './azorahub/github-ingestion-service';
import { AzoraWorkspaces } from './azorahub/azora-workspaces';
import { ElaraSparkCopilot } from './genome/elara-spark-copilot';

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         STARTING ALL AZORA SYSTEMS                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Step 1: Clean repository
  console.log('🧹 Step 1: Cleaning repository...');
  try {
    execSync('ts-node scripts/cleanup-spiritual-references.ts', {
      stdio: 'inherit'
    });
    console.log('✅ Repository cleaned\n');
  } catch (error) {
    console.log('⚠️ Cleanup script not run (may need manual execution)\n');
  }

  // Step 2: Initialize Azora IDE
  console.log('💻 Step 2: Initializing Azora IDE...');
  const ide = AzoraIDE.getInstance();
  await ide.initialize();
  console.log('✅ Azora IDE initialized\n');

  // Step 3: Start Azorahub GitHub ingestion
  console.log('🔄 Step 3: Starting Azorahub GitHub ingestion...');
  const azorahub = AzorahubGitHubIngestion.getInstance();
  await azorahub.startIngestion();
  console.log('✅ Azorahub ingestion started\n');

  // Step 4: Initialize Azora Workspaces
  console.log('🚀 Step 4: Initializing Azora Workspaces...');
  const workspaces = AzoraWorkspaces.getInstance();
  console.log('✅ Azora Workspaces ready\n');

  // Step 5: Initialize Elara Spark & Copilot
  console.log('🤖 Step 5: Initializing Elara Spark & Copilot...');
  const sparkCopilot = ElaraSparkCopilot.getInstance();
  console.log('✅ Elara Spark & Copilot ready\n');

  // Display status
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              ALL SYSTEMS OPERATIONAL                     ║');
  console.log('╠════════════════════════════════════════════════════════════╣');

  const ideStatus = ide.getStatus();
  console.log(`║ IDE:              ${ideStatus.learnedFeatures} features learned        ║`);

  const hubStats = azorahub.getStats();
  console.log(`║ Azorahub:         ${hubStats.ingested} repos ingested            ║`);

  const workspaceStats = workspaces.getStats();
  console.log(`║ Workspaces:       ${workspaceStats.total} workspaces              ║`);

  const sparkStats = sparkCopilot.getStats();
  console.log(`║ Spark/Copilot:    ${sparkStats.indexedFiles} files indexed        ║`);

  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📋 Available Services:');
  console.log('   • Azora IDE: http://localhost:3002');
  console.log('   • Azorahub: http://localhost:3000/azorahub');
  console.log('   • Workspaces: http://localhost:3000/workspaces');
  console.log('   • Spark: http://localhost:3000/spark');
  console.log('   • Copilot: Integrated in IDE\n');
}

if (require.main === module) {
  main().catch(console.error);
}

