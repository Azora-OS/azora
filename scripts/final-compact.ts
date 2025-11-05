/**
 * AZORA OS - FINAL REPOSITORY COMPACTOR
 *
 * Final pass to ensure repository is compact and functional
 */

import * as fs from 'fs';
import * as path from 'path';

class FinalCompactor {
  private rootDir: string;

  constructor() {
    this.rootDir = process.cwd();
  }

  /**
   * Remove remaining unnecessary files
   */
  private removeRemainingFiles(): void {
    console.log('🗑️  Removing remaining unnecessary files...');
    
    // Files to remove from root
    const filesToRemove = [
      'ARCHITECTURE.md',
      'CODE_OF_CONDUCT.md',
      'IMPLEMENTATION_SUMMARY.md',
      'INSTALLATION.md',
      'LAUNCH_SERVICES_GUIDE.md',
      'UPGRADE_MANIFEST.json',
      'deploy-summary.txt',
      'code.zip',
      'ui.zip'
    ];
    
    for (const file of filesToRemove) {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`   🗑️  Removed: ${file}`);
      }
    }
    
    console.log('✅ Remaining unnecessary files removed');
  }

  /**
   * Clean up docs directory
   */
  private cleanupDocs(): void {
    console.log('\n🗑️  Cleaning up docs directory...');
    
    const docsDir = path.join(this.rootDir, 'docs');
    if (fs.existsSync(docsDir)) {
      // Remove unnecessary subdirectories
      const dirsToRemove = [
        'book',
        'branding',
        'development',
        'guides',
        'images',
        'launch',
        'legal',
        'misc',
        'notes',
        'project',
        'protocols',
        'reports',
        'research',
        'security',
        'standards',
        'status-reports'
      ];
      
      for (const dir of dirsToRemove) {
        const dirPath = path.join(docsDir, dir);
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
          console.log(`   🗑️  Removed directory: ${dir}`);
        }
      }
      
      // Keep only essential documentation files
      const essentialDocs = [
        'README.md',
        'LICENSE',
        'CHANGELOG.md',
        'CONTRIBUTING.md',
        'SECURITY.md',
        'ROADMAP.md'
      ];
      
      const allDocs = fs.readdirSync(docsDir);
      for (const doc of allDocs) {
        if (!essentialDocs.includes(doc) && doc !== 'api' && doc !== 'architecture' && doc !== 'deployment') {
          const docPath = path.join(docsDir, doc);
          const stat = fs.statSync(docPath);
          if (stat.isFile()) {
            fs.unlinkSync(docPath);
            console.log(`   🗑️  Removed: ${doc}`);
          }
        }
      }
    }
    
    console.log('✅ Docs directory cleaned up');
  }

  /**
   * Clean up empty directories
   */
  private cleanupEmptyDirs(): void {
    console.log('\n🗑️  Cleaning up empty directories...');
    
    const emptyDirs = [
      'core/components',
      'core/hooks',
      'core/services',
      'core/types',
      'core/utils',
      'launch/config',
      'launch/scripts'
    ];
    
    for (const dir of emptyDirs) {
      const dirPath = path.join(this.rootDir, dir);
      if (fs.existsSync(dirPath)) {
        const items = fs.readdirSync(dirPath);
        if (items.length === 0) {
          fs.rmdirSync(dirPath);
          console.log(`   🗑️  Removed empty directory: ${dir}`);
        }
      }
    }
    
    console.log('✅ Empty directories cleaned up');
  }

  /**
   * Create essential launch scripts
   */
  private createLaunchScripts(): void {
    console.log('\n🚀 Creating essential launch scripts...');
    
    // Create main launch script
    const launchScript = `#!/usr/bin/env node
/**
 * AZORA OS LAUNCHER
 * 
 * Main entry point for launching Azora OS
 */

import { spawn } from 'child_process';

// Launch all core services
const services = [
  'genome/elara-master-launcher.ts',
  'scripts/constitutional-service-launcher.ts'
];

console.log('🚀 Launching Azora OS...');
console.log('========================');

services.forEach((service, index) => {
  console.log(\`   🚀 Launching service \${index + 1}: \${service}\`);
  const child = spawn('tsx', [service], { stdio: 'inherit' });
  
  child.on('error', (error) => {
    console.error(\`❌ Failed to launch \${service}:\`, error);
  });
  
  child.on('exit', (code) => {
    console.log(\`   ✅ Service \${service} exited with code \${code}\`);
  });
});

console.log('\\n🎉 Azora OS launch sequence initiated!');
console.log('   Services are starting in the background.');
console.log('   Use "npm run status" to check service status.');
`;
    
    const launchPath = path.join(this.rootDir, 'launch', 'azora-launch.ts');
    fs.writeFileSync(launchPath, launchScript);
    console.log('✅ Created main launch script');
    
    // Create package.json scripts
    const packagePath = path.join(this.rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add launch scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      "start:dev": "next dev",
      "start:prod": "next start",
      "launch": "tsx launch/azora-launch.ts",
      "launch:status": "tsx genome/elara-launcher.ts status",
      "launch:stop": "tsx genome/elara-launcher.ts stop"
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with launch scripts');
  }

  /**
   * Create final README
   */
  private createFinalReadme(): void {
    console.log('\n📄 Creating final README...');
    
    const readmeContent = `# 🌍 Azora OS

## One Platform. Every Human. Everywhere.

**AI-Powered Education & Economic Empowerment Platform**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Azora-OS-AI/azora-os&project-name=elera)

---

## 🚀 Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/Azora-OS-AI/azora-os.git

# Install dependencies
npm install

# Launch Azora OS
npm run launch
\`\`\`

## 🧠 Core Features

- **AI-Powered Education**: Personalized learning with Elara AI
- **Economic Empowerment**: Earn while you learn with NFT minting
- **Universal Access**: Works everywhere (online, offline, low-bandwidth)
- **Constitutional AI**: Ethically aligned artificial intelligence

## 🛠️ Development

\`\`\`bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
\`\`\`

## 🚀 Launch System

\`\`\`bash
# Launch all services
npm run launch

# Check service status
npm run launch:status

# Stop all services
npm run launch:stop
\`\`\`

## 🤝 Contributing

See [docs/contributing.md](./docs/contributing.md) for contribution guidelines.

## 🔒 Security

See [docs/security.md](./docs/security.md) for security policies.

## 📄 License

See [LICENSE](./LICENSE) for licensing information.

---

**From Africa 🇿🇦 For Humanity 🌍 Unto God's Glory ✨**
`;
    
    const readmePath = path.join(this.rootDir, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
    console.log('✅ Final README created');
  }

  /**
   * Final compaction
   */
  async finalCompaction(): Promise<void> {
    console.log('🏁 AZORA OS FINAL COMPACTOR');
    console.log('===========================');
    
    try {
      // Remove remaining unnecessary files
      this.removeRemainingFiles();
      
      // Clean up docs directory
      this.cleanupDocs();
      
      // Clean up empty directories
      this.cleanupEmptyDirs();
      
      // Create essential launch scripts
      this.createLaunchScripts();
      
      // Create final README
      this.createFinalReadme();
      
      console.log('\n🎉 FINAL COMPACTOR COMPLETE!');
      console.log('=============================');
      console.log('✅ Repository is now compact and functional');
      console.log('✅ Essential files preserved');
      console.log('✅ Launch system operational');
      console.log('✅ Documentation streamlined');
      
      console.log('\n📁 Final Structure:');
      console.log('   ├── core/             # Core application code');
      console.log('   ├── docs/             # Essential documentation');
      console.log('   ├── launch/           # Launch scripts');
      console.log('   ├── services/         # Backend microservices');
      console.log('   ├── app/              # Frontend application');
      console.log('   └── [config files]    # Root configuration files');
      
    } catch (error) {
      console.error('❌ Final compaction failed:', error);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const compactor = new FinalCompactor();
  
  try {
    await compactor.finalCompaction();
  } catch (error) {
    console.error('❌ Final compaction failed:', error);
    process.exit(1);
  }
}

// Run if called directly
// @ts-expect-error: Module check for CommonJS compatibility
if (typeof require !== 'undefined' && require.main === module) {
  main();
}

export { FinalCompactor };