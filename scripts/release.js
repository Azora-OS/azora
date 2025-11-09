#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

const version = process.argv[2];
if (!version) {
  console.error('Usage: npm run release <version>');
  process.exit(1);
}

console.log(`🚀 Creating release ${version}`);

// Update version
execSync(`npm version ${version}`);

// Update documentation
execSync('node scripts/update-all-docs.js');

// Build everything
execSync('npm run build:all');

// Commit and tag
execSync('git add .');
execSync(`git commit -m "🎉 Release ${version}"`);
execSync(`git tag v${version}`);

// Push
execSync('git push origin main --tags');

console.log(`✅ Release ${version} created successfully`);
