#!/usr/bin/env tsx

/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LEGACY GEMS EXTRACTION
=====================
*/

import fs from 'fs';
import path from 'path';

const LEGACY_PATH = '../../../old';

async function extractLegacyGems() {
  console.log('💎 EXTRACTING LEGACY GEMS');
  console.log('=========================\n');

  // Check for specific valuable files
  const valuableFiles = [
    'azora-supreme-organism.ts',
    'elara-organism-manager.ts', 
    'ethical-consciousness.ts',
    'davids-victory-components.tsx',
    'launch-azora-complete.ts',
    'organism-git-monitor.js'
  ];

  const extractedGems = [];

  valuableFiles.forEach(file => {
    const legacyFilePath = path.join(LEGACY_PATH, file);
    if (fs.existsSync(legacyFilePath)) {
      const content = fs.readFileSync(legacyFilePath, 'utf8');
      const targetPath = path.join('core/legacy-gems', file);
      
      // Create directory if it doesn't exist
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      
      // Add header and copy
      const enhancedContent = `/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LEGACY GEM - EXTRACTED FROM V1
==============================
Original file: ${file}
Extraction date: ${new Date().toISOString()}
*/

${content}`;

      fs.writeFileSync(targetPath, enhancedContent);
      extractedGems.push(file);
      console.log(`💎 Extracted: ${file}`);
    }
  });

  // Create gems index
  const gemsIndex = `/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LEGACY GEMS INDEX
================
*/

// Extracted valuable components from V1
${extractedGems.map(gem => {
  const name = gem.replace(/\.[^/.]+$/, "").replace(/-/g, '');
  return `export * from './${gem}';`;
}).join('\n')}

// Legacy gems manifest
export const LEGACY_GEMS = [
${extractedGems.map(gem => `  '${gem}'`).join(',\n')}
];

export const GEMS_METADATA = {
  extractionDate: '${new Date().toISOString()}',
  totalGems: ${extractedGems.length},
  source: 'Azora OS V1'
};
`;

  fs.writeFileSync('core/legacy-gems/index.ts', gemsIndex);

  console.log('\n✨ LEGACY GEMS EXTRACTION COMPLETE!');
  console.log(`\n📊 Extracted ${extractedGems.length} valuable components:`);
  extractedGems.forEach(gem => console.log(`  • ${gem}`));
  
  console.log('\n🎯 Gems available at: core/legacy-gems/');
  console.log('💡 Import with: import { ... } from "core/legacy-gems"');
}

extractLegacyGems().catch(console.error);