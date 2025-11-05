#!/usr/bin/env tsx

/**
 * Azora OS Repository Monitor
 * Continuously monitors the repository for changes and updates documentation
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface RepoChange {
  type: 'added' | 'modified' | 'deleted';
  path: string;
  category: 'component' | 'service' | 'documentation' | 'config' | 'script' | 'other';
}

class RepoMonitor {
  private lastCommitHash: string = '';
  private monitoringActive: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      this.lastCommitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      console.log(`📊 Repository Monitor initialized at commit: ${this.lastCommitHash.substring(0, 8)}`);
    } catch (error) {
      console.error('❌ Failed to initialize repository monitor:', error);
    }
  }

  public startMonitoring(intervalMinutes: number = 5) {
    this.monitoringActive = true;
    console.log(`🔄 Starting repository monitoring (checking every ${intervalMinutes} minutes)...`);

    const intervalMs = intervalMinutes * 60 * 1000;

    setInterval(() => {
      if (this.monitoringActive) {
        this.checkForUpdates();
      }
    }, intervalMs);

    // Initial check
    this.checkForUpdates();
  }

  public stopMonitoring() {
    this.monitoringActive = false;
    console.log('⏹️  Repository monitoring stopped');
  }

  private checkForUpdates() {
    try {
      const currentCommitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

      if (currentCommitHash !== this.lastCommitHash) {
        console.log(`📈 Repository updated! ${this.lastCommitHash.substring(0, 8)} → ${currentCommitHash.substring(0, 8)}`);
        this.analyzeChanges();
        this.lastCommitHash = currentCommitHash;
      } else {
        console.log(`✅ Repository up to date (${new Date().toLocaleTimeString()})`);
      }
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
    }
  }

  private analyzeChanges() {
    try {
      // Get the diff from last known commit
      const diffOutput = execSync(`git diff --name-status ${this.lastCommitHash} HEAD`, { encoding: 'utf8' });
      const changes = this.parseDiffOutput(diffOutput);

      if (changes.length > 0) {
        console.log(`🔍 Analyzing ${changes.length} changes...`);
        this.updateDocumentation(changes);
      }
    } catch (error) {
      console.error('❌ Error analyzing changes:', error);
    }
  }

  private parseDiffOutput(diffOutput: string): RepoChange[] {
    const changes: RepoChange[] = [];

    const lines = diffOutput.trim().split('\n');
    for (const line of lines) {
      if (line.length < 2) continue;

      const status = line.substring(0, 1);
      const filePath = line.substring(2);

      let type: RepoChange['type'];
      switch (status) {
        case 'A': type = 'added'; break;
        case 'M': type = 'modified'; break;
        case 'D': type = 'deleted'; break;
        default: continue;
      }

      const category = this.categorizeFile(filePath);

      changes.push({
        type,
        path: filePath,
        category
      });
    }

    return changes;
  }

  private categorizeFile(filePath: string): RepoChange['category'] {
    const ext = path.extname(filePath).toLowerCase();
    const dir = path.dirname(filePath).toLowerCase();

    if (filePath.includes('docs/') || ext === '.md') return 'documentation';
    if (dir.includes('component') || dir.includes('ui') || ext === '.tsx' || ext === '.jsx') return 'component';
    if (dir.includes('service') || dir.includes('api') || filePath.includes('.ts') && !filePath.includes('config')) return 'service';
    if (filePath.includes('config') || ext === '.json' || ext === '.yaml' || ext === '.yml') return 'config';
    if (dir.includes('script') || ext === '.js' || ext === '.sh' || ext === '.bat') return 'script';

    return 'other';
  }

  private updateDocumentation(changes: RepoChange[]) {
    console.log('📝 Updating documentation based on changes...');

    const summary = this.generateChangeSummary(changes);

    // Update CHANGELOG.md
    this.updateChangelog(summary);

    // Update README.md if needed
    this.updateReadmeIfNeeded(changes);

    // Update API docs if services changed
    this.updateApiDocsIfNeeded(changes);

    // Auto-commit documentation updates
    this.commitDocumentationUpdates();
  }

  private generateChangeSummary(changes: RepoChange[]) {
    const summary = {
      added: changes.filter(c => c.type === 'added'),
      modified: changes.filter(c => c.type === 'modified'),
      deleted: changes.filter(c => c.type === 'deleted'),
      byCategory: {} as Record<RepoChange['category'], RepoChange[]>
    };

    // Group by category
    for (const change of changes) {
      if (!summary.byCategory[change.category]) {
        summary.byCategory[change.category] = [];
      }
      summary.byCategory[change.category].push(change);
    }

    return summary;
  }

  private updateChangelog(summary: any) {
    try {
      const changelogPath = 'docs/CHANGELOG.md';
      let content = fs.readFileSync(changelogPath, 'utf8');

      // Find the unreleased section
      const unreleasedIndex = content.indexOf('## [Unreleased]');
      if (unreleasedIndex === -1) return;

      const unreleasedEndIndex = content.indexOf('## [', unreleasedIndex + 1);
      const unreleasedSection = unreleasedEndIndex === -1 ?
        content.substring(unreleasedIndex) :
        content.substring(unreleasedIndex, unreleasedEndIndex);

      // Generate new entries
      let newEntries = '';

      if (summary.added.length > 0) {
        newEntries += '### Added\n';
        for (const change of summary.added) {
          newEntries += `- **${change.category}**: ${change.path}\n`;
        }
      }

      if (summary.modified.length > 0) {
        newEntries += '### Changed\n';
        for (const change of summary.modified) {
          newEntries += `- **${change.category}**: Updated ${change.path}\n`;
        }
      }

      if (summary.deleted.length > 0) {
        newEntries += '### Removed\n';
        for (const change of summary.deleted) {
          newEntries += `- **${change.category}**: Removed ${change.path}\n`;
        }
      }

      // Update the unreleased section
      const date = new Date().toISOString().split('T')[0];
      const newUnreleasedSection = `## [Unreleased]\n\n${newEntries}\n`;

      if (unreleasedEndIndex === -1) {
        content = content.replace(unreleasedSection, newUnreleasedSection);
      } else {
        content = content.replace(unreleasedSection, newUnreleasedSection + content.substring(unreleasedEndIndex));
      }

      fs.writeFileSync(changelogPath, content);
      console.log('✅ Updated CHANGELOG.md');

    } catch (error) {
      console.error('❌ Error updating changelog:', error);
    }
  }

  private updateReadmeIfNeeded(changes: RepoChange[]) {
    // Update README if major components or services were added
    const majorChanges = changes.filter(c =>
      c.type === 'added' &&
      (c.category === 'component' || c.category === 'service')
    );

    if (majorChanges.length > 0) {
      this.updateReadmeFeatures(majorChanges);
    }
  }

  private updateReadmeFeatures(changes: RepoChange[]) {
    try {
      const readmePath = 'README.md';
      let content = fs.readFileSync(readmePath, 'utf8');

      // Find the features section
      const featuresIndex = content.indexOf('## Key Features');
      if (featuresIndex === -1) return;

      // Add new features
      let newFeatures = '';
      for (const change of changes) {
        const featureName = path.basename(change.path, path.extname(change.path))
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        newFeatures += `- **${featureName}**: ${change.category === 'component' ? 'Enhanced UI component' : 'New system service'}\n`;
      }

      // Insert after existing features
      const insertPoint = content.indexOf('\n## ', featuresIndex + 1);
      if (insertPoint !== -1) {
        content = content.substring(0, insertPoint) + newFeatures + content.substring(insertPoint);
        fs.writeFileSync(readmePath, content);
        console.log('✅ Updated README.md with new features');
      }

    } catch (error) {
      console.error('❌ Error updating README:', error);
    }
  }

  private updateApiDocsIfNeeded(changes: RepoChange[]) {
    const serviceChanges = changes.filter(c => c.category === 'service');

    if (serviceChanges.length > 0) {
      this.updateApiDocumentation(serviceChanges);
    }
  }

  private updateApiDocumentation(changes: RepoChange[]) {
    try {
      const apiDocPath = 'docs/API_DOCUMENTATION.md';
      let content = fs.readFileSync(apiDocPath, 'utf8');

      // Find the system overview section
      const overviewIndex = content.indexOf('### **Service Endpoints**');
      if (overviewIndex === -1) return;

      // Add new services to the list
      let newServices = '';
      for (const change of changes) {
        if (change.type === 'added') {
          const serviceName = path.basename(change.path, path.extname(change.path));
          const port = this.guessServicePort(serviceName);
          newServices += `- **${serviceName}** (\`:${port}\`) - ${serviceName.replace(/[-_]/g, ' ')} service\n`;
        }
      }

      if (newServices) {
        const insertPoint = content.indexOf('\n### **Common Headers**', overviewIndex);
        if (insertPoint !== -1) {
          content = content.substring(0, insertPoint) + newServices + content.substring(insertPoint);
          fs.writeFileSync(apiDocPath, content);
          console.log('✅ Updated API documentation with new services');
        }
      }

    } catch (error) {
      console.error('❌ Error updating API docs:', error);
    }
  }

  private guessServicePort(serviceName: string): number {
    const portMap: Record<string, number> = {
      'sapiens': 4200,
      'mint': 4300,
      'oracle': 4030,
      'citadel': 4099,
      'nexus': 4000,
      'covenant': 4400,
      'aegis': 4098,
      'forge': 4500
    };

    for (const [key, port] of Object.entries(portMap)) {
      if (serviceName.includes(key)) return port;
    }

    // Default port assignment
    return 5000 + Math.floor(Math.random() * 1000);
  }

  private commitDocumentationUpdates() {
    try {
      // Check if there are changes to commit
      const status = execSync('git status --porcelain docs/', { encoding: 'utf8' });

      if (status.trim()) {
        console.log('💾 Committing documentation updates...');

        execSync('git add docs/');
        execSync(`git commit -m "docs: auto-update documentation for recent changes

- Updated CHANGELOG.md with latest modifications
- Enhanced README.md with new features
- Updated API documentation for new services
- Auto-generated by repository monitor"`, { stdio: 'inherit' });

        // Push the documentation updates
        execSync('git push origin clean-branch', { stdio: 'inherit' });
        console.log('✅ Documentation updates committed and pushed');
      }
    } catch (error) {
      console.error('❌ Error committing documentation updates:', error);
    }
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new RepoMonitor();

  // Handle command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'start';
  const interval = parseInt(args[1]) || 5;

  switch (command) {
    case 'start':
      monitor.startMonitoring(interval);
      break;
    case 'stop':
      monitor.stopMonitoring();
      break;
    case 'check':
      monitor.checkForUpdates();
      break;
    default:
      console.log('Usage: tsx repo-monitor.ts [start|stop|check] [interval_minutes]');
      console.log('  start - Start monitoring (default interval: 5 minutes)');
      console.log('  stop  - Stop monitoring');
      console.log('  check - Check for updates once');
      process.exit(1);
  }
}

export default RepoMonitor;
