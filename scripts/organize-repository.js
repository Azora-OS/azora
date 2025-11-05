#!/usr/bin/env node
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

Repository Organization Script
Moves files to their proper locations and cleans up the root directory
*/

import fs from 'fs';
import path from 'path';

console.log('🧹 Organizing Azora OS Repository Structure...\n');

// Files that should stay in root
const rootFiles = [
  'README.md',
  'LICENSE', 
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'package.json',
  'package-lock.json',
  '.gitignore',
  '.env.example',
  'VERSION',
  'Dockerfile',
  'docker-compose.yml',
  'next.config.js',
  'tailwind.config.js',
  'tsconfig.json',
  'components.json'
];

// Directories that should stay in root
const rootDirectories = [
  'app',
  'components', 
  'lib',
  'public',
  'styles',
  'types',
  'hooks',
  'utils',
  'services',
  'api',
  'ui',
  'docs',
  'assets',
  'scripts',
  'tests',
  'node_modules',
  'dist',
  '.git',
  '.next'
];

// Move patterns
const movePatterns = [
  // Scripts and executables
  { pattern: /\.(bat|ps1|sh)$/, target: 'scripts/platform/' },
  { pattern: /^(LAUNCH|START|DEPLOY|BUILD).*\.(js|ts|bat|ps1|sh)$/, target: 'scripts/automation/' },
  
  // Documentation
  { pattern: /^[A-Z_]+\.md$/, target: 'docs/project/' },
  { pattern: /\.txt$/, target: 'docs/notes/' },
  
  // Configuration files
  { pattern: /^(Dockerfile\.|docker-compose\.)/, target: 'deploy/docker/' },
  { pattern: /\.ya?ml$/, target: 'deploy/k8s/' },
  
  // Build outputs
  { pattern: /^build-/, target: 'scripts/build/' },
  { pattern: /^deploy-/, target: 'scripts/deploy/' },
  
  // Temporary/test files
  { pattern: /^(test|temp|tmp)/, target: 'temp/' },
  { pattern: /\.log$/, target: 'logs/' }
];

function shouldStayInRoot(filename) {
  return rootFiles.includes(filename) || 
         rootDirectories.includes(filename) ||
         filename.startsWith('.');
}

function getTargetDirectory(filename) {
  for (const pattern of movePatterns) {
    if (pattern.pattern.test(filename)) {
      return pattern.target;
    }
  }
  
  // Default categorization
  if (filename.endsWith('.md')) return 'docs/misc/';
  if (filename.endsWith('.js') || filename.endsWith('.ts')) return 'scripts/misc/';
  if (filename.endsWith('.json')) return 'config/';
  
  return 'misc/';
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function moveFile(source, target) {
  try {
    const targetDir = path.dirname(target);
    ensureDirectoryExists(targetDir);
    
    fs.renameSync(source, target);
    console.log(`📦 Moved: ${source} → ${target}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to move ${source}: ${error.message}`);
    return false;
  }
}

// Main organization logic
function organizeRepository() {
  const rootPath = process.cwd();
  const items = fs.readdirSync(rootPath, { withFileTypes: true });
  
  let movedCount = 0;
  let skippedCount = 0;
  
  for (const item of items) {
    if (item.isDirectory()) {
      if (!shouldStayInRoot(item.name)) {
        console.log(`📂 Directory ${item.name} - keeping in root (manual review needed)`);
      }
      continue;
    }
    
    const filename = item.name;
    
    if (shouldStayInRoot(filename)) {
      skippedCount++;
      continue;
    }
    
    const targetDir = getTargetDirectory(filename);
    const sourcePath = path.join(rootPath, filename);
    const targetPath = path.join(rootPath, targetDir, filename);
    
    if (moveFile(sourcePath, targetPath)) {
      movedCount++;
    }
  }
  
  console.log(`\n✅ Organization complete!`);
  console.log(`   Files moved: ${movedCount}`);
  console.log(`   Files kept in root: ${skippedCount}`);
  
  // Create a clean root directory listing
  console.log('\n📋 Current root directory structure:');
  const finalItems = fs.readdirSync(rootPath);
  finalItems.sort().forEach(item => {
    const stat = fs.statSync(path.join(rootPath, item));
    const type = stat.isDirectory() ? '📁' : '📄';
    console.log(`   ${type} ${item}`);
  });
}

// Run the organization
organizeRepository();

console.log('\n🎯 Repository organization complete!');
console.log('   Root directory is now clean and organized.');
console.log('   All files are in their proper locations.');