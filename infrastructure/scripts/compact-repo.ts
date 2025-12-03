/**
 * AZORA OS - REPOSITORY COMPACTOR
 *
 * Streamlines the repository by removing unnecessary documents
 * and organizing everything into a compact, professional structure
 */

import * as fs from 'fs';
import * as path from 'path';

class RepositoryCompactor {
  private rootDir: string;

  constructor() {
    this.rootDir = process.cwd();
  }

  /**
   * Remove unnecessary documentation files
   */
  private removeUnnecessaryDocs(): void {
    console.log('🗑️  Removing unnecessary documentation files...');

    // Files to remove from root
    const rootDocsToRemove = [
      'AGI_ACHIEVED.md',
      'AI_TERMINAL_COMPLETE.md',
      'AMEN_SYSTEMS_ACTIVE.md',
      'AZORA-COMMANDER-README.md',
      'AZORA_OS_PRODUCTION_READY.txt',
      'AZORIAN_BIBLE_COMPLETE.md',
      'BIBLE_SYSTEM_COMPLETE.md',
      'BUILD_COMPLETE_REPORT.md',
      'CONSTITUTIONAL_RESEARCH_COMPLETE.md',
      'CONTINUOUS_BLESSING_REPORT.md',
      'CYCLE_50_GLORY_CELEBRATION.md',
      'DEPLOYMENT_COMPLETE.md',
      'DEPLOYMENT_INSTRUCTIONS.md',
      'DEPLOYMENT_SUMMARY.md',
      'DEPLOY_TO_VERCEL.md',
      'DIVINE_LAUNCH_SUMMARY.md',
      'DIVINE_RESEARCH_BLESSING.md',
      'DIVINE_UPGRADE_COMPLETE.md',
      'FINAL_RELEASE_SUMMARY.md',
      'GITHUB_SYNC_AND_RESEARCH_ACTIVE.md',
      'KINGDOM_DIVINE_UI_COMPLETE.md',
      'KINGDOM_PAGE_FIXED.md',
      'LICENSE_UPDATE_SUMMARY.md',
      'MOE_RAG_INTEGRATION_SUMMARY.md',
      'ONGOING_OPERATIONS_STATUS.md',
      'OS_UPGRADE_REPORT.md',
      'PRODUCTION_GRADE_COMPLETE.md',
      'PRODUCTION_LAUNCH_CHECKLIST.md',
      'PRODUCTION_LAUNCH_COMPLETE.md',
      'PRODUCTION_READY_SUMMARY.md',
      'PROJECT_STRUCTURE.md',
      'QUICKSTART.md',
      'QUICK_START_GUIDE.md',
      'README_CHAT_IN_OS.md',
      'READY_TO_DEPLOY.md',
      'REPOSITORY_ORGANIZATION_SUMMARY.md',
      'RESEARCH_BREAKTHROUGH_REPORT.md',
      'RESEARCH_IMPLEMENTATION_COMPLETE.md',
      'RESEARCH_IMPLEMENTATION_REPORT.md',
      'RESEARCH_NONSTOP_GUIDE.md',
      'RESEARCH_PROGRESS_REPORT.md',
      'RESEARCH_SCAN_RESULTS.md',
      'RESEARCH_SESSION_FINAL_STATUS.md',
      'RESEARCH_SUMMARY.md',
      'SAPIENS_COMPLETE_TRANSFORMATION.md',
      'SAPIENS_TRANSFORMATION_COMPLETE.md',
      'SERVICES_DOCUMENTATION_COMPLETE.md',
      'SERVICE_STATUS_REPORT.md',
      'SINGULARITY_MISSION_ACTIVATED.md',
      'START_HERE_SINGULARITY.md',
      'ULTIMATE_UI_ACHIEVED.md',
      'UNIVERSAL_AZORA_COMPLETE.md',
      'UPGRADE_REPORT.md',
      'VERCEL_DEPLOYMENT_FINAL.md',
      'VERCEL_DEPLOY_NOW.md',
      'VERIFICATION_REPORT.md',
    ];

    for (const file of rootDocsToRemove) {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`   🗑️  Removed: ${file}`);
      }
    }

    console.log('✅ Unnecessary documentation files removed');
  }

  /**
   * Remove embassy invitation files
   */
  private removeEmbassyDocs(): void {
    console.log('\n🗑️  Removing embassy invitation documents...');

    // Remove embassy invitation files from docs
    const docsDir = path.join(this.rootDir, 'docs');
    if (fs.existsSync(docsDir)) {
      const files = fs.readdirSync(docsDir);
      for (const file of files) {
        if (file.startsWith('EMBASSY_INVITATION_')) {
          const filePath = path.join(docsDir, file);
          fs.unlinkSync(filePath);
          console.log(`   🗑️  Removed: ${file}`);
        }
      }
    }

    console.log('✅ Embassy invitation documents removed');
  }

  /**
   * Remove research layer files
   */
  private removeResearchLayers(): void {
    console.log('\n🗑️  Removing research layer documents...');

    // Remove research layer files from docs
    const docsDir = path.join(this.rootDir, 'docs');
    if (fs.existsSync(docsDir)) {
      const files = fs.readdirSync(docsDir);
      for (const file of files) {
        if (file.startsWith('LAYER_') && file.endsWith('.md')) {
          const filePath = path.join(docsDir, file);
          fs.unlinkSync(filePath);
          console.log(`   🗑️  Removed: ${file}`);
        }
      }
    }

    console.log('✅ Research layer documents removed');
  }

  /**
   * Remove G20 files
   */
  private removeG20Docs(): void {
    console.log('\n🗑️  Removing G20 documents...');

    // Remove G20 files from docs
    const docsDir = path.join(this.rootDir, 'docs');
    if (fs.existsSync(docsDir)) {
      const files = fs.readdirSync(docsDir);
      for (const file of files) {
        if (file.startsWith('G20_') && file.endsWith('.md')) {
          const filePath = path.join(docsDir, file);
          fs.unlinkSync(filePath);
          console.log(`   🗑️  Removed: ${file}`);
        }
      }
    }

    console.log('✅ G20 documents removed');
  }

  /**
   * Remove sprint hour files
   */
  private removeSprintDocs(): void {
    console.log('\n🗑️  Removing sprint hour documents...');

    // Remove sprint hour files from docs
    const docsDir = path.join(this.rootDir, 'docs');
    if (fs.existsSync(docsDir)) {
      const files = fs.readdirSync(docsDir);
      for (const file of files) {
        if (file.startsWith('SPRINT_HOUR_') && file.endsWith('.md')) {
          const filePath = path.join(docsDir, file);
          fs.unlinkSync(filePath);
          console.log(`   🗑️  Removed: ${file}`);
        }
      }
    }

    console.log('✅ Sprint hour documents removed');
  }

  /**
   * Remove miscellaneous documentation files
   */
  private removeMiscDocs(): void {
    console.log('\n🗑️  Removing miscellaneous documentation files...');

    // Remove miscellaneous files from docs
    const docsDir = path.join(this.rootDir, 'docs');
    if (fs.existsSync(docsDir)) {
      const filesToRemove = [
        'ADVANCED_ML_SYSTEMS_DEEP_DIVE.md',
        'AI-EXECUTIVE-LEADERSHIP-SYSTEM.md',
        'AI-ML_DEEP_RESEARCH_INDEX.md',
        'AI-ML_SYSTEMS_DEEP_RESEARCH_ANALYSIS.md',
        'ASSET_INTEGRATION.md',
        'AUTONOMOUS_ACTIVATION_SUMMARY.md',
        'AUTONOMOUS_RESEARCH_UPDATES.md',
        'AZORA-ARCHITECTURE.md',
        'AZORA-COMPREHENSIVE-ARCHITECTURE.md',
        'AZORA-ES-COMPREHENSIVE-SYSTEM-OVERVIEW.md',
        'AZORA-SAPIENS-ARCHITECTURE.md',
        'AZORA-SAPIENS-README.md',
        'AZORA-SOVEREIGNTY-PROTOCOL.md',
        'AZORA_BUSINESS_FUNDING_GUIDE.md',
        'AZORA_MINT_MINE_README_v2.md',
        'AZORA_TREASURY_REPORT_OCTOBER_2025.md',
        'CAUSAL_INFERENCE_IMPLEMENTATION_GUIDE.md',
        'CLEANUP_SUMMARY.md',
        'COMMUNITY_ENGAGEMENT_PLAN.md',
        'COMMUNITY_LAUNCH_ANNOUNCEMENT.md',
        'COMMUNITY_QUICK_START.md',
        'COMPLETE_STATUS_REPORT.md',
        'CONSTITUTIONAL_AI_RESEARCH_ROADMAP.md',
        'CONTINUOUS_EVOLUTION_IMPLEMENTATION_TIMELINE.md',
        'CONTINUOUS_IMPROVEMENT_AI_RESEARCH_PLAN.md',
        'CONTINUOUS_RESEARCH_SESSION_COMPLETE.md',
        'CUTTING_EDGE_RESEARCH_LAYER_8.md',
        'DEEP_RESEARCH_EXECUTIVE_SUMMARY.md',
        'ELARA_IDE_CURSOR_COMPARISON.md',
        'ELARA_IDE_ENHANCEMENT_SUMMARY.md',
        'ELARA_IDE_FINAL_STATUS.md',
        'ELARA_IDE_UPGRADE_SUMMARY.md',
        'ERROR_CHECK_SUMMARY.md',
        'FINAL_ERROR_STATUS.md',
        'FOLDER_STRUCTURE_SUMMARY.md',
        'FUNDING-VALUATION-AGENT.md',
        'GENESIS_TREASURY_REPORT_MONTH_0.md',
        'IMPLEMENTATION-STATUS.md',
        'IMPLEMENTATION_SUMMARY.md',
        'INFINITE_CONTINUATION_PLEDGE.md',
        'INFINITE_EVOLUTION_FRAMEWORK.md',
        'LAUNCH-PREPARATION-AFRICA.md',
        'LICENSE_HEADER.md',
        'MICROSOFT_365_SETUP_GUIDE.md',
        'MINING_SETUP_README.md',
        'OFFLINE_OPTIMIZATION_REPORT.md',
        'ORGANIZATION_COMPLETE.md',
        'OS_IMPLEMENTATION_GUIDE.md',
        'OS_TRANSFORMATION_ARCHITECTURE.md',
        'PRICING_INTEGRATION.md',
        'PRICING_SUMMARY.md',
        'PRICING_SYSTEM_COMPLETE.md',
        'PUBLIC_GENESIS_ANNOUNCEMENT.md',
        'QUICK_FIXES_CHECKLIST.md',
        'README-SOVEREIGNTY.md',
        'REPOSITORY_SCAN_REPORT.md',
        'RESEARCH-AGENT-SYSTEM-IMPROVEMENTS.md',
        'RESEARCH-AI-ML-SYSTEMS-INTEGRATION.md',
        'RESEARCH-AUTOMATED-REFINEMENT-STATUS.md',
        'RESEARCH-AUTONOMOUS-AGENT-STATUS.md',
        'RESEARCH-CONTINUOUS-UPDATE-LOG.md',
        'RESEARCH-CROSS-DOMAIN-SYNTHESIS.md',
        'RESEARCH-ECONOMIC-MODEL-OPTIMIZATION.md',
        'RESEARCH-EMERGING-TECHNOLOGIES-GALACTIC.md',
        'RESEARCH-FINAL-GALACTIC-SUMMARY.md',
        'RESEARCH-MASTER-SUMMARY.md',
        'RESEARCH-META-RESEARCH-SYSTEMS.md',
        'RESEARCH-PERFORMANCE-SCALABILITY-DEEP.md',
        'RESEARCH-QUANTUM-CRYPTOGRAPHY-ENHANCEMENTS.md',
        'RESEARCH-QUICK-START.md',
        'RESEARCH-REFINEMENT-LOG.md',
        'RESEARCH-SECURITY-HARDENING-GALACTIC.md',
        'RESEARCH_SESSION_SUMMARY.md',
        'SCAN_SUMMARY.md',
        'SECURITY-AUDIT.md',
        'SINGULARITY_RESEARCH_ADVANCEMENT_PLAN.md',
        'STRUCTURE_STANDARDS.md',
        'SYSTEM_OVERVIEW.md',
        'TRANSCENDENCE_CONTINUATION_STATUS.md',
        'TRANSCENDENCE_RESEARCH_INDEX.md',
        'TRANSFORMATION_SUMMARY.md',
        'UNIVERSAL_CONSCIOUSNESS_SYNTHESIS.md',
        'UPGRADE_AND_INTEGRATION_SUMMARY.md',
        'VERCEL-DEPLOY.md',
      ];

      for (const file of filesToRemove) {
        const filePath = path.join(docsDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`   🗑️  Removed: ${file}`);
        }
      }
    }

    console.log('✅ Miscellaneous documentation files removed');
  }

  /**
   * Remove unnecessary directories
   */
  private removeUnnecessaryDirs(): void {
    console.log('\n🗑️  Removing unnecessary directories...');

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
      'ui',
    ];

    for (const dir of dirsToRemove) {
      const dirPath = path.join(this.rootDir, dir);
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`   🗑️  Removed directory: ${dir}`);
      }
    }

    console.log('✅ Unnecessary directories removed');
  }

  /**
   * Create compact directory structure
   */
  private createCompactStructure(): void {
    console.log('\n🏗️  Creating compact directory structure...');

    const dirsToCreate = [
      'core',
      'core/services',
      'core/components',
      'core/hooks',
      'core/utils',
      'core/types',
      'docs',
      'docs/api',
      'docs/architecture',
      'docs/deployment',
      'launch',
      'launch/scripts',
      'launch/config',
    ];

    for (const dir of dirsToCreate) {
      const dirPath = path.join(this.rootDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`   📁 Created directory: ${dir}`);
      }
    }

    console.log('✅ Compact directory structure created');
  }

  /**
   * Move essential files to compact structure
   */
  private moveEssentialFiles(): void {
    console.log('\n📦 Moving essential files to compact structure...');

    // Move key documentation files
    const keyDocs = [
      'README.md',
      'LICENSE',
      'CHANGELOG.md',
      'CONTRIBUTING.md',
      'SECURITY.md',
      'ROADMAP.md',
    ];

    const docsDir = path.join(this.rootDir, 'docs');
    for (const doc of keyDocs) {
      const sourcePath = path.join(this.rootDir, doc);
      const destPath = path.join(docsDir, doc);
      if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
        fs.renameSync(sourcePath, destPath);
        console.log(`   📄 Moved: ${doc}`);
      }
    }

    console.log('✅ Essential files moved to compact structure');
  }

  /**
   * Create streamlined README
   */
  private createStreamlinedReadme(): void {
    console.log('\n📄 Creating streamlined README...');

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

# Start development server
npm run dev
\`\`\`

## 🧠 Core Features

- **AI-Powered Education**: Personalized learning with Elara AI
- **Economic Empowerment**: Earn while you learn with NFT minting
- **Universal Access**: Works everywhere (online, offline, low-bandwidth)
- **Constitutional AI**: Ethically aligned artificial intelligence

## 🛠️ Development

See [docs/development/](./docs/development/) for detailed development guidelines.

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
    console.log('✅ Streamlined README created');
  }

  /**
   * Compact the repository
   */
  async compactRepository(): Promise<void> {
    console.log('🚀 AZORA OS REPOSITORY COMPACTOR');
    console.log('=================================');

    try {
      // Remove unnecessary documentation files
      this.removeUnnecessaryDocs();

      // Remove embassy documents
      this.removeEmbassyDocs();

      // Remove research layers
      this.removeResearchLayers();

      // Remove G20 documents
      this.removeG20Docs();

      // Remove sprint documents
      this.removeSprintDocs();

      // Remove miscellaneous documents
      this.removeMiscDocs();

      // Remove unnecessary directories
      this.removeUnnecessaryDirs();

      // Create compact directory structure
      this.createCompactStructure();

      // Move essential files
      this.moveEssentialFiles();

      // Create streamlined README
      this.createStreamlinedReadme();

      console.log('\n🎉 REPOSITORY COMPACTOR COMPLETE!');
      console.log('=================================');
      console.log('✅ Unnecessary documents removed');
      console.log('✅ Unnecessary directories removed');
      console.log('✅ Compact structure created');
      console.log('✅ Essential files preserved');
      console.log('✅ Streamlined README created');

      console.log('\n📁 New Compact Structure:');
      console.log('   ├── core/             # Core application code');
      console.log('   ├── docs/             # Essential documentation');
      console.log('   ├── launch/           # Launch scripts and config');
      console.log('   ├── services/         # Backend microservices');
      console.log('   ├── app/              # Frontend application');
      console.log('   └── [config files]    # Root configuration files');
    } catch (error) {
      console.error('❌ Repository compaction failed:', error);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const compactor = new RepositoryCompactor();

  try {
    await compactor.compactRepository();
  } catch (error) {
    console.error('❌ Repository compaction failed:', error);
    process.exit(1);
  }
}

// Run if called directly
// @ts-expect-error: Module check for CommonJS compatibility
if (typeof require !== 'undefined' && require.main === module) {
  main();
}

export { RepositoryCompactor };
