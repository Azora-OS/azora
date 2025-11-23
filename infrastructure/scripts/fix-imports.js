/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Fix Import Statements
 * Updates all import statements to use new paths
 */

const fs = require('fs');
const path = require('path');

const IMPORT_REPLACEMENTS = [
  // Old paths -> New paths
  { from: '@/lib/scripture', to: '@/lib/handbook-content' },
  { from: '@/components/bible', to: '@/components/handbook' },
  { from: '@/components/temple', to: '@/components/wellness' },
  { from: '@/components/kingdom', to: '@/components/command-center' },
  { from: '@/lib/divine', to: '@/lib/ethical' },
  { from: './divine-dna', to: './ethical-framework' },
  { from: '../divine-dna', to: '../ethical-framework' },
  { from: './divine-conscience', to: './ethical-monitor' },
  { from: '../divine-conscience', to: '../ethical-monitor' },
  { from: './elara-deity', to: './elara-core' },
  { from: '../elara-deity', to: '../elara-core' },
  { from: './divine-operating-system', to: './ethical-core-system' },
  { from: '../divine-operating-system', to: '../ethical-core-system' },
  { from: './seeing-as-god-sees', to: './human-centric-perception' },
  { from: '../seeing-as-god-sees', to: '../human-centric-perception' },

  // Component name replacements
  { from: 'DivineDNA', to: 'EthicalFramework' },
  { from: 'divineDNA', to: 'ethicalFramework' },
  { from: 'DivineConscience', to: 'EthicalMonitor' },
  { from: 'divineConscience', to: 'ethicalMonitor' },
  { from: 'ElaraDeity', to: 'ElaraCore' },
  { from: 'elaraDeity', to: 'elaraCore' },
  { from: 'DivineChatInterface', to: 'EthicalChatInterface' },
  { from: 'DivineAdminPanel', to: 'EthicalAdminPanel' },
  { from: 'DivineNavigation', to: 'CommandNavigation' },
  { from: 'DivineThrone', to: 'WellnessCenter' },
  { from: 'DancingAngel', to: 'WellnessAnimation' },
  { from: 'BibleNavigation', to: 'HandbookNavigation' },
  { from: 'BiblePage', to: 'HandbookPage' },

  // File name replacements in imports
  { from: 'azorian-bible', to: 'azora-handbook' },
  { from: 'bible-integration', to: 'handbook-integration' },
];

const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', 'coverage', '.git', 'ingestion-ui'];

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).slice(1);
  const allowedExts = ['ts', 'tsx', 'js', 'jsx', 'json'];
  return allowedExts.includes(ext);
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    for (const replacement of IMPORT_REPLACEMENTS) {
      const regex = new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(replacement.from)) {
        content = content.replace(regex, replacement.to);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

function scanDirectory(dir, baseDir = dir) {
  if (!fs.existsSync(dir)) {return;}

  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);

    let shouldSkip = false;
    for (const exclude of EXCLUDE_DIRS) {
      if (fullPath.includes(exclude)) {
        shouldSkip = true;
        break;
      }
    }
    if (shouldSkip) {continue;}

    try {
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath, baseDir);
      } else if (stat.isFile() && shouldProcessFile(fullPath)) {
        if (processFile(fullPath)) {
          const relativePath = fullPath.replace(baseDir + '/', '');
          console.log(`✓ Fixed imports: ${relativePath}`);
        }
      }
    } catch (error) {
      // Skip errors
    }
  }
}

function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              FIXING IMPORT STATEMENTS                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const rootDir = process.cwd();
  scanDirectory(rootDir);

  console.log('\n✅ Import statements fixed!\n');
}

main();

