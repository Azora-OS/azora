/**
 * AZORA OS - ROOT DOCUMENTATION LICENSE UPDATER
 *
 * Updates root documentation files with correct license headers
 */

import * as fs from 'fs';
import * as path from 'path';

interface DocFile {
  path: string;
  name: string;
  ext: string;
}

class RootDocumentationLicenseUpdater {
  private rootDir: string;
  private docsDir: string;
  private licenseHeader: string;
  private updatedFiles: number = 0;
  private skippedFiles: number = 0;

  constructor() {
    this.rootDir = process.cwd();
    this.docsDir = path.join(process.cwd(), 'docs');
    this.licenseHeader = this.generateLicenseHeader();
  }

  /**
   * Generate standardized license header
   */
  private generateLicenseHeader(): string {
    const date = new Date().toISOString().split('T')[0];
    return `<!--
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.

Document ID: AZORA-ROOT-DOC-${this.generateDocId()}
Version: 1.0
Date: ${date}
Author: Azora OS Team

This document is proprietary intellectual property of Azora ES (Pty) Ltd.
Unauthorized reproduction, distribution, or modification is prohibited.
-->`;
  }

  /**
   * Generate document ID
   */
  private generateDocId(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  /**
   * Get root documentation files
   */
  private getRootDocumentationFiles(): DocFile[] {
    const files: DocFile[] = [];
    const docFiles = [
      'README.md',
      'CONTRIBUTING.md',
      'SECURITY.md',
      'ARCHITECTURE.md',
      'CHANGELOG.md',
      'ROADMAP.md',
      'LICENSE',
    ];

    for (const fileName of docFiles) {
      const filePath = path.join(this.rootDir, fileName);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(fileName).toLowerCase();
        files.push({
          path: filePath,
          name: path.basename(fileName, ext),
          ext: ext,
        });
      }
    }

    return files;
  }

  /**
   * Check if file already has license header
   */
  private hasLicenseHeader(content: string): boolean {
    return (
      content.includes('AZORA PROPRIETARY LICENSE') ||
      content.includes('Copyright © 2025 Azora ES (Pty) Ltd') ||
      content.includes('AZORA OS PROPRIETARY LICENSE')
    );
  }

  /**
   * Update file with license header
   */
  private updateFileWithLicense(file: DocFile): boolean {
    try {
      const content = fs.readFileSync(file.path, 'utf8');

      // Skip if already has license header
      if (this.hasLicenseHeader(content)) {
        console.log(
          `⏭️  Skipping ${file.name}${file.ext} (already has license)`
        );
        this.skippedFiles++;
        return false;
      }

      // Special handling for README.md - add license header after the first line
      if (file.name === 'README' && file.ext === '.md') {
        const lines = content.split('\n');
        // Insert license after the first line (title)
        lines.splice(1, 0, '', this.licenseHeader, '');
        const updatedContent = lines.join('\n');
        fs.writeFileSync(file.path, updatedContent, 'utf8');
      } else {
        // Add license header at the beginning
        const updatedContent = `${this.licenseHeader}\n\n${content}`;
        fs.writeFileSync(file.path, updatedContent, 'utf8');
      }

      console.log(`✅ Updated ${file.name}${file.ext} with license header`);
      this.updatedFiles++;
      return true;
    } catch (error) {
      console.error(`❌ Failed to update ${file.name}${file.ext}:`, error);
      return false;
    }
  }

  /**
   * Update all root documentation files
   */
  async updateAllDocumentation(): Promise<void> {
    console.log('📚 AZORA OS ROOT DOCUMENTATION LICENSE UPDATER');
    console.log('============================================');

    // Get all root documentation files
    const files = this.getRootDocumentationFiles();
    console.log(`📁 Found ${files.length} root documentation files`);

    // Update each file
    for (const file of files) {
      this.updateFileWithLicense(file);
    }

    // Summary
    console.log('\n📊 UPDATE SUMMARY:');
    console.log(`   ✅ Updated: ${this.updatedFiles} files`);
    console.log(`   ⏭️  Skipped: ${this.skippedFiles} files`);
    console.log(`   📁 Total: ${files.length} files`);

    if (this.updatedFiles > 0) {
      console.log(
        '\n🎉 License headers successfully added to root documentation files!'
      );
    } else {
      console.log(
        '\nℹ️  No files needed updating (all already had license headers)'
      );
    }
  }
}

// Main execution
async function main() {
  const updater = new RootDocumentationLicenseUpdater();

  try {
    await updater.updateAllDocumentation();
  } catch (error) {
    console.error('❌ Root documentation license update failed:', error);
    process.exit(1);
  }
}

// Run if called directly
// @ts-expect-error: Module check for CommonJS compatibility
if (typeof require !== 'undefined' && require.main === module) {
  main();
}

export { RootDocumentationLicenseUpdater };
