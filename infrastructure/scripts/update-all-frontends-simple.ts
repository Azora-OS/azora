/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Simple Update All Frontends - Copy Components Only
 * This script copies premium components to all frontend applications
 */

import * as fs from 'fs';
import * as path from 'path';

const NEXTJS_FRONTENDS = [
  'synapse/academy-ui',
  'synapse/atlas-ui',
  'synapse/council-ui',
  'synapse/pulse-ui',
  'synapse/signal-ui',
  'synapse/vault-ui',
  'synapse/vigil-ui',
  'synapse/main-app',
  'elara-ide',
  'azora-ui',
  'ui',
];

const VITE_FRONTENDS = [
  'marketplace-ui',
  'pay-ui',
  'cloud-ui',
  'dev-ui',
  'enterprise-ui',
  'learn-ui',
  'compliance-ui',
];

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyRecursive(source: string, dest: string): void {
  if (!fs.existsSync(source)) {
    console.log(`  ⏭️  Source not found: ${source}`);
    return;
  }

  ensureDir(dest);

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

function copyFile(source: string, dest: string): void {
  if (!fs.existsSync(source)) {
    console.log(`  ⏭️  File not found: ${source}`);
    return;
  }

  ensureDir(path.dirname(dest));
  fs.copyFileSync(source, dest);
  console.log(`  ✅ Copied ${path.basename(source)}`);
}

async function updateNextJSApp(appPath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), appPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipped ${appPath} (not found)`);
    return;
  }

  console.log(`\n📦 Updating ${appPath}...`);

  // Copy UI components
  const componentsDest = path.join(fullPath, 'components', 'ui');
  copyRecursive('components/ui', componentsDest);

  // Copy theme provider
  copyFile('components/theme-provider.tsx', path.join(fullPath, 'components', 'theme-provider.tsx'));

  // Copy utils
  copyFile('lib/utils.ts', path.join(fullPath, 'lib', 'utils.ts'));

  // Copy design tokens
  copyFile('lib/design-system/premium-tokens.ts', path.join(fullPath, 'lib', 'design-system', 'premium-tokens.ts'));

  console.log(`✅ Completed ${appPath}`);
}

async function updateViteApp(appPath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), appPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipped ${appPath} (not found)`);
    return;
  }

  console.log(`\n📦 Updating ${appPath} (Vite)...`);

  // Copy to src directory
  const componentsDest = path.join(fullPath, 'src', 'components', 'ui');
  copyRecursive('components/ui', componentsDest);

  copyFile('components/theme-provider.tsx', path.join(fullPath, 'src', 'components', 'theme-provider.tsx'));
  copyFile('lib/utils.ts', path.join(fullPath, 'src', 'lib', 'utils.ts'));
  copyFile('lib/design-system/premium-tokens.ts', path.join(fullPath, 'src', 'lib', 'design-system', 'premium-tokens.ts'));

  console.log(`✅ Completed ${appPath}`);
}

async function main() {
  console.log('🚀 Starting UI Component Distribution...\n');
  console.log(`Found ${NEXTJS_FRONTENDS.length} Next.js apps and ${VITE_FRONTENDS.length} Vite apps\n`);

  // Update Next.js apps
  for (const app of NEXTJS_FRONTENDS) {
    await updateNextJSApp(app);
  }

  // Update Vite apps
  for (const app of VITE_FRONTENDS) {
    await updateViteApp(app);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ All components copied!');
  console.log('='.repeat(60));
  console.log('\n📝 Next steps:');
  console.log('   1. Update layout.tsx files to include ThemeProvider');
  console.log('   2. Update globals.css/index.css with premium colors');
  console.log('   3. Update tailwind.config.ts files');
  console.log('   4. Test each application');
}

if (require.main === module) {
  main().catch(console.error);
}

