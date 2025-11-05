/**
 * AZORA OS - DOCUMENTATION LICENSE UPDATER
 *
 * Updates all documentation files with correct license headers
 */

import * as fs from 'fs';
import * as path from 'path';

interface DocFile {
  path: string;
  name: string;
  ext: string;
}

class DocumentationLicenseUpdater {
  private docsDir: string;
  private licenseHeader: string;
  private updatedFiles: number = 0;
  private skippedFiles: number = 0;

  constructor() {
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

Document ID: AZORA-DOC-${this.generateDocId()}
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
   * Get all documentation files
   */
  private getDocumentationFiles(): DocFile[] {
    const files: DocFile[] = [];
    const skipDirs = [
      'architecture',
      'book',
      'branding',
      'deployment',
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
      'status-reports',
    ];

    const walkDir = (dir: string) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          // Skip certain directories
          if (!skipDirs.includes(item)) {
            walkDir(itemPath);
          }
        } else {
          // Only process markdown and text files
          const ext = path.extname(item).toLowerCase();
          if (ext === '.md' || ext === '.txt' || ext === '.mdx') {
            files.push({
              path: itemPath,
              name: path.basename(item, ext),
              ext: ext,
            });
          }
        }
      }
    };

    walkDir(this.docsDir);
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

      // Add license header
      const updatedContent = `${this.licenseHeader}\n\n${content}`;
      fs.writeFileSync(file.path, updatedContent, 'utf8');

      console.log(`✅ Updated ${file.name}${file.ext} with license header`);
      this.updatedFiles++;
      return true;
    } catch (error) {
      console.error(`❌ Failed to update ${file.name}${file.ext}:`, error);
      return false;
    }
  }

  /**
   * Update all documentation files
   */
  async updateAllDocumentation(): Promise<void> {
    console.log('📚 AZORA OS DOCUMENTATION LICENSE UPDATER');
    console.log('========================================');

    // Get all documentation files
    const files = this.getDocumentationFiles();
    console.log(`📁 Found ${files.length} documentation files`);

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
        '\n🎉 License headers successfully added to documentation files!'
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
  const updater = new DocumentationLicenseUpdater();

  try {
    await updater.updateAllDocumentation();
  } catch (error) {
    console.error('❌ Documentation license update failed:', error);
    process.exit(1);
  }
}

// Run if called directly
// @ts-expect-error: Module check for CommonJS compatibility
if (typeof require !== 'undefined' && require.main === module) {
  main();
}

export { DocumentationLicenseUpdater };
