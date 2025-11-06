/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Copy Premium Assets to Public Directory
 * Utility script to sync premium marketing assets to public folder
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function syncPremiumAssets() {
  const rootDir = path.join(__dirname, '..');
  const premiumDir = path.join(rootDir, 'marketing', 'premium');
  const publicDir = path.join(rootDir, 'public', 'images');

  console.log('🔄 Syncing premium assets to public directory...\n');

  // Ensure public/images directories exist
  const logosDir = path.join(publicDir, 'logos', 'premium');
  const iconsDir = path.join(publicDir, 'icons');

  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Copy geometric logos (primary style)
  const geometricSrc = path.join(premiumDir, 'logos', 'geometric');
  if (fs.existsSync(geometricSrc)) {
    console.log('📦 Copying geometric logos...');
    copyDirectory(geometricSrc, logosDir);
    console.log(`   ✓ Copied ${fs.readdirSync(logosDir).length} logos`);
  }

  // Copy icons
  const iconsSrc = path.join(premiumDir, 'logos', 'icons');
  if (fs.existsSync(iconsSrc)) {
    console.log('📦 Copying icons...');
    copyDirectory(iconsSrc, iconsDir);
    console.log(`   ✓ Copied ${fs.readdirSync(iconsDir).length} icons`);
  }

  console.log('\n✅ Premium assets synced successfully!');
  console.log(`📁 Public directory: ${publicDir}`);
}

// Run if executed directly
syncPremiumAssets();

export { syncPremiumAssets };

