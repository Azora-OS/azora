/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

#!/usr/bin/env ts-node

/**
 * Cleanup Spiritual/Cultural References
 *
 * Scans and cleans all files to remove spiritual/cultural references
 * while preserving functionality
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const SPIRITUAL_TERMS = [
  { pattern: /divine/g, replacement: 'ethical' },
  { pattern: /sacred/g, replacement: 'constitutional' },
  { pattern: /bible/g, replacement: 'handbook' },
  { pattern: /temple/g, replacement: 'wellness' },
  { pattern: /kingdom/g, replacement: 'command-center' },
  { pattern: /deity/g, replacement: 'core' },
  { pattern: /prayer/g, replacement: 'reflection' },
  { pattern: /amen/g, replacement: 'complete' },
  { pattern: /scripture/g, replacement: 'content' },
  { pattern: /holy/g, replacement: 'premium' },
  { pattern: /blessing/g, replacement: 'benefit' },
  { pattern: /prophecy/g, replacement: 'vision' },
  { pattern: /psalm/g, replacement: 'guidance' },
  { pattern: /genesis/g, replacement: 'origin' },
  { pattern: /god/g, replacement: 'creator' },
  { pattern: /God/g, replacement: 'Creator' },
  { pattern: /divineDNA/g, replacement: 'ethicalFramework' },
  { pattern: /DivineDNA/g, replacement: 'EthicalFramework' },
  { pattern: /divineConscience/g, replacement: 'ethicalMonitor' },
  { pattern: /DivineConscience/g, replacement: 'EthicalMonitor' },
  { pattern: /elaraDeity/g, replacement: 'elaraCore' },
  { pattern: /ElaraDeity/g, replacement: 'ElaraCore' },
];

const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  '.git',
  'ingestion-ui',
  '.cache'
];

const EXCLUDE_FILES = [
  '.git',
  '.next',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock'
];

function shouldProcessFile(filePath: string): boolean {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const allowedExts = ['ts', 'tsx', 'js', 'jsx', 'json', 'md', 'txt', 'css', 'scss'];

  if (!allowedExts.includes(ext)) {
    return false;
  }

  for (const exclude of EXCLUDE_DIRS) {
    if (filePath.includes(exclude)) {
      return false;
    }
  }

  for (const exclude of EXCLUDE_FILES) {
    if (filePath.includes(exclude)) {
      return false;
    }
  }

  return true;
}

function processFile(filePath: string): { changed: boolean; changes: number } {
  try {
    const content = readFileSync(filePath, 'utf-8');
    let newContent = content;
    let changes = 0;

    for (const { pattern, replacement } of SPIRITUAL_TERMS) {
      const matches = newContent.match(pattern);
      if (matches) {
        newContent = newContent.replace(pattern, replacement);
        changes += matches.length;
      }
    }

    if (newContent !== content) {
      writeFileSync(filePath, newContent, 'utf-8');
      return { changed: true, changes };
    }

    return { changed: false, changes: 0 };
  } catch (error: any) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    return { changed: false, changes: 0 };
  }
}

function scanDirectory(dir: string, baseDir: string = dir): void {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      let shouldSkip = false;
      for (const exclude of EXCLUDE_DIRS) {
        if (fullPath.includes(exclude)) {
          shouldSkip = true;
          break;
        }
      }
      if (!shouldSkip) {
        scanDirectory(fullPath, baseDir);
      }
    } else if (stat.isFile()) {
      if (shouldProcessFile(fullPath)) {
        const result = processFile(fullPath);
        if (result.changed) {
          const relativePath = fullPath.replace(baseDir + '/', '');
          console.log(`✓ ${relativePath} (${result.changes} changes)`);
        }
      }
    }
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      CLEANING SPIRITUAL/CULTURAL REFERENCES               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const rootDir = process.cwd();
  console.log(`📁 Scanning: ${rootDir}\n`);

  scanDirectory(rootDir);

  console.log('\n✅ Cleanup complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

