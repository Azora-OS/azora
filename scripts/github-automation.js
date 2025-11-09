/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class GitHubAutomation {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
  }

  async setupAutomation() {
    console.log('🔄 GitHub Automation Setup');
    
    try {
      await this.updateWorkflows();
      await this.setupHooks();
      await this.createReleaseScript();
      
      console.log('✅ GitHub automation setup complete');
    } catch (error) {
      console.error('❌ GitHub automation setup failed:', error);
      process.exit(1);
    }
  }

  async updateWorkflows() {
    console.log('⚙️ Updating GitHub workflows...');
    
    const workflowsDir = path.join(this.rootDir, '.github', 'workflows');
    
    // Enhanced CI workflow
    const ciWorkflow = `name: Azora OS CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm install
    - run: npm test
    - run: npm run docs:generate

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - run: npm audit --audit-level high

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v4
    - run: echo "Deploying Azora OS..."
`;

    await fs.writeFile(path.join(workflowsDir, 'ci.yml'), ciWorkflow);
    
    // Auto-documentation workflow
    const docsWorkflow = `name: Auto Documentation

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * *'

jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm install
    - run: node scripts/update-all-docs.js
    - uses: stefanzweifel/git-auto-commit-action@v4
      with:
        commit_message: '📝 Auto-update documentation'
`;

    await fs.writeFile(path.join(workflowsDir, 'auto-docs.yml'), docsWorkflow);
    
    console.log('✅ GitHub workflows updated');
  }

  async setupHooks() {
    console.log('🪝 Setting up Git hooks...');
    
    const hooksDir = path.join(this.rootDir, '.husky');
    
    try {
      execSync('npx husky install', { cwd: this.rootDir });
      
      // Pre-commit hook
      const preCommit = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."
npm run lint
npm run test
node scripts/update-all-docs.js
`;

      await fs.writeFile(path.join(hooksDir, 'pre-commit'), preCommit);
      
      // Pre-push hook
      const prePush = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 Running pre-push checks..."
npm run build:all
npm run security:scan
`;

      await fs.writeFile(path.join(hooksDir, 'pre-push'), prePush);
      
    } catch (error) {
      console.log('⚠️ Husky not installed, skipping hooks setup');
    }
    
    console.log('✅ Git hooks configured');
  }

  async createReleaseScript() {
    console.log('📦 Creating release automation...');
    
    const releaseScript = `#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

const version = process.argv[2];
if (!version) {
  console.error('Usage: npm run release <version>');
  process.exit(1);
}

console.log(\`🚀 Creating release \${version}\`);

// Update version
execSync(\`npm version \${version}\`);

// Update documentation
execSync('node scripts/update-all-docs.js');

// Build everything
execSync('npm run build:all');

// Commit and tag
execSync('git add .');
execSync(\`git commit -m "🎉 Release \${version}"\`);
execSync(\`git tag v\${version}\`);

// Push
execSync('git push origin main --tags');

console.log(\`✅ Release \${version} created successfully\`);
`;

    await fs.writeFile(path.join(this.rootDir, 'scripts', 'release.js'), releaseScript);
    
    console.log('✅ Release automation created');
  }
}

if (require.main === module) {
  const automation = new GitHubAutomation();
  automation.setupAutomation();
}

module.exports = GitHubAutomation;