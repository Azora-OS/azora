/**
 * AZORA OS - REPOSITORY ORGANIZATION SCRIPT
 *
 * Organizes the repository structure to be enterprise-grade and supreme
 */

import * as fs from 'fs';
import * as path from 'path';

interface DirectoryStructure {
  [key: string]: string[];
}

class RepositoryOrganizer {
  private rootDir: string;
  private structure: DirectoryStructure;

  constructor() {
    this.rootDir = process.cwd();
    this.structure = this.defineStructure();
  }

  /**
   * Define the desired directory structure
   */
  private defineStructure(): DirectoryStructure {
    return {
      // Core application directories
      app: [
        'api',
        'components',
        'hooks',
        'lib',
        'providers',
        'styles',
        'types',
        'utils',
      ],

      // Documentation
      docs: [
        'api',
        'architecture',
        'deployment',
        'development',
        'guides',
        'legal',
        'security',
        'standards',
      ],

      // Source code
      src: ['components', 'hooks', 'lib', 'services', 'types', 'utils'],

      // Backend services
      services: [
        'aegis', // Security
        'covenant', // Blockchain
        'education', // Learning platform
        'forge', // Marketplace
        'mail', // Communication
        'mint', // Economic system
        'nexus', // AI agent
        'oracle', // Data intelligence
        'sapiens', // Education system
        'synapse', // Neural network
        'workspace', // Collaboration
        'shared', // Shared utilities
      ],

      // Tests
      tests: ['unit', 'integration', 'e2e', 'performance', 'security'],

      // Configuration
      config: ['environments', 'schemas', 'templates'],

      // Infrastructure
      infrastructure: ['docker', 'kubernetes', 'terraform', 'scripts'],

      // Research
      research: ['papers', 'experiments', 'datasets', 'models', 'findings'],

      // Assets
      assets: ['icons', 'images', 'fonts', 'videos', 'audio'],

      // Build and deployment
      build: ['scripts', 'configs', 'artifacts'],

      // CI/CD
      ci: ['pipelines', 'scripts', 'templates'],

      // Scripts
      scripts: ['build', 'deploy', 'test', 'utils', 'maintenance'],
    };
  }

  /**
   * Create directory structure
   */
  private createDirectoryStructure(): void {
    console.log('🏗️  Creating enterprise-grade directory structure...');

    for (const [dir, subdirs] of Object.entries(this.structure)) {
      const dirPath = path.join(this.rootDir, dir);

      // Create main directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }

      // Create subdirectories
      for (const subdir of subdirs) {
        const subdirPath = path.join(dirPath, subdir);
        if (!fs.existsSync(subdirPath)) {
          fs.mkdirSync(subdirPath, { recursive: true });
          console.log(`   📁 Created subdirectory: ${subdir}`);
        }
      }
    }
  }

  /**
   * Move files to appropriate directories
   */
  private organizeFiles(): void {
    console.log('\n📂 Organizing files...');

    // Move root documentation files to docs/
    const rootDocs = [
      'README.md',
      'CONTRIBUTING.md',
      'SECURITY.md',
      'ARCHITECTURE.md',
      'CHANGELOG.md',
      'ROADMAP.md',
    ];

    for (const doc of rootDocs) {
      const sourcePath = path.join(this.rootDir, doc);
      const destPath = path.join(this.rootDir, 'docs', doc.toLowerCase());

      if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
        fs.renameSync(sourcePath, destPath);
        console.log(`✅ Moved ${doc} to docs/`);
      }
    }

    // Move research files
    const researchDir = path.join(this.rootDir, 'research');
    if (fs.existsSync(researchDir)) {
      const researchFiles = fs.readdirSync(researchDir);
      const papersDir = path.join(researchDir, 'papers');

      if (!fs.existsSync(papersDir)) {
        fs.mkdirSync(papersDir, { recursive: true });
      }

      for (const file of researchFiles) {
        const filePath = path.join(researchDir, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile() && file.endsWith('.md')) {
          const destPath = path.join(papersDir, file);
          if (!fs.existsSync(destPath)) {
            fs.renameSync(filePath, destPath);
            console.log(`✅ Moved research file: ${file}`);
          }
        }
      }
    }

    console.log('✅ File organization complete');
  }

  /**
   * Clean up unnecessary files
   */
  private cleanupFiles(): void {
    console.log('\n🧹 Cleaning up unnecessary files...');

    // Files to remove
    const filesToRemove = [
      'FINAL_STATUS.txt',
      'SERVICES_COMPLETE.txt',
      'VERSION',
      'commander',
      '.engines',
      '.nvmrc',
      '.upgrade-complete',
    ];

    for (const file of filesToRemove) {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Removed: ${file}`);
      }
    }

    // Empty directories to remove
    const dirsToRemove = [
      '.archive',
      '.cursor',
      '.idx',
      '.nx',
      '.offline-cache',
      '.qoder',
      'ab_tests',
      'biome',
      'codex',
      'cross-platform-setup',
      'elara-family',
      'git-automation',
      'installers',
      'marketing',
      'media-kit',
      'mining-config',
      'mining-engine',
      'mobile',
      'neural',
      'onboarding-wizard',
      'os-services',
      'pages',
      'reflexes',
      'services-upgrade',
      'shield_service',
      'system-upgrade',
      'systemd',
      'templates',
      'test',
      'vessels',
    ];

    for (const dir of dirsToRemove) {
      const dirPath = path.join(this.rootDir, dir);
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`🗑️  Removed directory: ${dir}`);
      }
    }

    console.log('✅ Cleanup complete');
  }

  /**
   * Create essential files
   */
  private createEssentialFiles(): void {
    console.log('\n📄 Creating essential files...');

    // Create main README
    const mainReadme = `# 🌍 Azora OS

## One Platform. Every Human. Everywhere.

**AI-Powered Education & Economic Empowerment Platform**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Azora-OS-AI/azora-os&project-name=elera)

---

## 📋 Table of Contents

- [About](#about)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## About

**Azora OS** is a comprehensive, AI-powered platform designed to democratize education and economic opportunity worldwide.

## Key Features

### 🎓 World-Class Education
- K-12 Complete Curriculum
- Interactive Simulations
- AI-Powered Learning

### 🤖 AI Guardian (Elara)
- Personal AI Tutor
- Constitutional AI Alignment
- 24/7 Availability

### 💰 Economic Empowerment
- Creative Earning Hub
- NFT Minting System
- Token Economy

## Architecture

See [docs/architecture/](./docs/architecture/) for detailed architecture documentation.

## Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/Azora-OS-AI/azora-os.git

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## Development

See [docs/development/](./docs/development/) for development guidelines.

## Contributing

See [docs/contributing.md](./docs/contributing.md) for contribution guidelines.

## License

See [LICENSE](./LICENSE) for licensing information.

---

**From Africa 🇿🇦 For Humanity 🌍 Unto God's Glory ✨**
`;

    const readmePath = path.join(this.rootDir, 'README.md');
    if (!fs.existsSync(readmePath)) {
      fs.writeFileSync(readmePath, mainReadme);
      console.log('✅ Created main README.md');
    }

    console.log('✅ Essential files created');
  }

  /**
   * Organize the entire repository
   */
  async organizeRepository(): Promise<void> {
    console.log('🚀 AZORA OS REPOSITORY ORGANIZATION');
    console.log('====================================');

    try {
      // Create directory structure
      this.createDirectoryStructure();

      // Organize files
      this.organizeFiles();

      // Cleanup unnecessary files
      this.cleanupFiles();

      // Create essential files
      this.createEssentialFiles();

      console.log('\n🎉 REPOSITORY ORGANIZATION COMPLETE!');
      console.log('=====================================');
      console.log('✅ Enterprise-grade structure created');
      console.log('✅ Files organized appropriately');
      console.log('✅ Unnecessary files removed');
      console.log('✅ Essential files created');

      console.log('\n📁 New Structure:');
      console.log('   ├── app/              # Main application');
      console.log('   ├── docs/             # Documentation');
      console.log('   ├── services/         # Backend services');
      console.log('   ├── research/         # Research materials');
      console.log('   ├── scripts/          # Automation scripts');
      console.log('   ├── tests/            # Test files');
      console.log('   ├── assets/           # Static assets');
      console.log('   └── infrastructure/   # Infrastructure files');
    } catch (error) {
      console.error('❌ Repository organization failed:', error);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const organizer = new RepositoryOrganizer();

  try {
    await organizer.organizeRepository();
  } catch (error) {
    console.error('❌ Repository organization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
// @ts-expect-error: Module check for CommonJS compatibility
if (typeof require !== 'undefined' && require.main === module) {
  main();
}

export { RepositoryOrganizer };
