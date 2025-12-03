/**
 * AZORA OS - FINAL ORGANIZATION SCRIPT
 *
 * Finalizes the repository organization by moving service directories
 */

import * as fs from 'fs';
import * as path from 'path';

class FinalOrganization {
  private rootDir: string;

  constructor() {
    this.rootDir = process.cwd();
  }

  /**
   * Move service directories to proper locations
   */
  private organizeServices(): void {
    console.log('📦 Organizing service directories...');

    const serviceMappings: { [key: string]: string } = {
      'azora-aegis': 'aegis',
      'azora-covenant': 'covenant',
      'azora-education': 'education',
      'azora-forge': 'forge',
      'azora-mail': 'mail',
      'azora-mint': 'mint',
      'azora-nexus': 'nexus',
      'azora-oracle': 'oracle',
      'azora-sapiens': 'sapiens',
      'azora-synapse': 'synapse',
      'azora-workspace': 'workspace',
    };

    const servicesDir = path.join(this.rootDir, 'services');

    for (const [source, target] of Object.entries(serviceMappings)) {
      const sourcePath = path.join(servicesDir, source);
      const targetPath = path.join(servicesDir, target);

      if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
        fs.renameSync(sourcePath, targetPath);
        console.log(`✅ Moved ${source} to ${target}`);
      }
    }

    console.log('✅ Service organization complete');
  }

  /**
   * Clean up empty directories
   */
  private cleanupEmptyDirs(): void {
    console.log('\n🧹 Cleaning up empty directories...');

    const servicesDir = path.join(this.rootDir, 'services');
    const emptyDirs = [
      'aegis',
      'covenant',
      'education',
      'forge',
      'mail',
      'mint',
      'nexus',
      'oracle',
      'sapiens',
      'synapse',
      'workspace',
    ];

    for (const dir of emptyDirs) {
      const dirPath = path.join(servicesDir, dir);
      if (fs.existsSync(dirPath)) {
        const items = fs.readdirSync(dirPath);
        if (items.length === 0) {
          fs.rmdirSync(dirPath);
          console.log(`🗑️  Removed empty directory: ${dir}`);
        }
      }
    }

    console.log('✅ Empty directory cleanup complete');
  }

  /**
   * Create main documentation files
   */
  private createMainDocs(): void {
    console.log('\n📄 Creating main documentation files...');

    // Create main README
    const readmeContent = `# 🌍 Azora OS

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
    fs.writeFileSync(readmePath, readmeContent);
    console.log('✅ Created main README.md');

    console.log('✅ Main documentation files created');
  }

  /**
   * Finalize the organization
   */
  async finalizeOrganization(): Promise<void> {
    console.log('🏁 AZORA OS FINAL ORGANIZATION');
    console.log('==============================');

    try {
      // Organize services
      this.organizeServices();

      // Clean up empty directories
      this.cleanupEmptyDirs();

      // Create main documentation
      this.createMainDocs();

      console.log('\n🎉 FINAL ORGANIZATION COMPLETE!');
      console.log('===============================');
      console.log('✅ Service directories organized');
      console.log('✅ Empty directories cleaned up');
      console.log('✅ Main documentation created');

      console.log('\n📁 Final Structure:');
      console.log('   ├── app/              # Main application');
      console.log('   ├── docs/             # Documentation');
      console.log('   ├── services/         # Backend services');
      console.log('   │   ├── aegis/        # Security service');
      console.log('   │   ├── covenant/     # Blockchain service');
      console.log('   │   ├── education/    # Learning platform');
      console.log('   │   ├── forge/        # Marketplace service');
      console.log('   │   ├── mail/         # Communication service');
      console.log('   │   ├── mint/         # Economic system');
      console.log('   │   ├── nexus/        # AI agent service');
      console.log('   │   ├── oracle/       # Data intelligence');
      console.log('   │   ├── sapiens/      # Education system');
      console.log('   │   ├── synapse/      # Neural network');
      console.log('   │   └── workspace/    # Collaboration service');
      console.log('   ├── research/         # Research materials');
      console.log('   ├── scripts/          # Automation scripts');
      console.log('   ├── tests/            # Test files');
      console.log('   ├── assets/           # Static assets');
      console.log('   └── infrastructure/   # Infrastructure files');
    } catch (error) {
      console.error('❌ Final organization failed:', error);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const organizer = new FinalOrganization();

  try {
    await organizer.finalizeOrganization();
  } catch (error) {
    console.error('❌ Final organization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
// @ts-expect-error: Module check for CommonJS compatibility
if (typeof require !== 'undefined' && require.main === module) {
  main();
}

export { FinalOrganization };
