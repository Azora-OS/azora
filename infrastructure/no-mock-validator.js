/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * No Mock Protocol Validator
 * Scans entire codebase to ensure ZERO mocks, stubs, or placeholders
 * 
 * This validator runs in CI/CD to enforce production code quality.
 * It will fail the build if any violations are found.
 */

// Defensive error handling wrapper
function safeRequire(moduleName) {
  try {
    return require(moduleName);
  } catch (error) {
    console.error(`❌ Failed to load module '${moduleName}':`, error.message);
    console.error(`\nPlease ensure dependencies are installed:`);
    console.error(`  cd infrastructure && npm install\n`);
    process.exit(1);
  }
}

const fs = safeRequire('fs').promises;
const path = require('path');
const { glob } = safeRequire('glob');

const MOCK_PATTERNS = [
  /\bmock\(/gi,
  /\.mock\b/gi,
  /jest\.mock/gi,
  /sinon\.stub/gi,
  /TODO:/gi,
  /FIXME:/gi,
  /PLACEHOLDER/gi,
  /STUB/gi,
  /fake\w+/gi,
  /dummy\w+/gi,
  /\.skip\(/gi,
  /\.only\(/gi,
  /import.*from.*['"].*mock/gi,
];

const ALLOWED_MOCK_PATTERNS = [
  /mockImplementation.*actual implementation/i, // Documented exceptions
];

class NoMockValidator {
  constructor() {
    this.violations = [];
    this.scannedFiles = 0;
    this.startTime = Date.now();
  }

  async validate() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  🛡️  NO MOCK PROTOCOL VALIDATOR                       ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');

    try {
      const files = await glob('**/*.{js,ts,jsx,tsx}', {
        ignore: [
          'node_modules/**',
          'dist/**',
          'build/**',
          '.next/**',
          'coverage/**',
          '**/no-mock-validator.js', // Ignore self
        ],
      });

      console.log(`📁 Found ${files.length} files to scan\n`);

      for (const file of files) {
        await this.scanFile(file);
      }

      this.printReport();

      if (this.violations.length > 0) {
        console.error('\n❌ NO MOCK PROTOCOL VIOLATED');
        console.error(`\n${this.violations.length} violation(s) must be fixed before deployment.\n`);
        process.exit(1);
      } else {
        console.log('\n✅ NO MOCK PROTOCOL COMPLIANT');
        console.log(`\n🎉 All ${this.scannedFiles} files passed validation!\n`);
        process.exit(0);
      }
    } catch (error) {
      console.error('\n❌ Validator encountered an error:');
      console.error(error);
      process.exit(1);
    }
  }

  async scanFile(filePath) {
    try {
      this.scannedFiles++;
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        for (const pattern of MOCK_PATTERNS) {
          if (pattern.test(line)) {
            // Check if it's an allowed exception
            const isAllowed = ALLOWED_MOCK_PATTERNS.some(allowed =>
              allowed.test(line)
            );

            if (!isAllowed) {
              this.violations.push({
                file: filePath,
                line: index + 1,
                code: line.trim(),
                pattern: pattern.toString(),
              });
            }
          }
        }
      });
    } catch (error) {
      console.warn(`⚠️  Could not scan ${filePath}: ${error.message}`);
    }
  }

  printReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  📜 VALIDATION REPORT                                 ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📁 Files Scanned: ${this.scannedFiles}`);
    console.log(`⚠️  Violations Found: ${this.violations.length}`);
    console.log('');

    if (this.violations.length > 0) {
      console.log('🚨 VIOLATIONS:');
      console.log('═══════════════════════════════════════════════════════');

      // Group violations by type
      const byPattern = {};
      this.violations.forEach(v => {
        const key = v.pattern;
        if (!byPattern[key]) byPattern[key] = [];
        byPattern[key].push(v);
      });

      Object.entries(byPattern).forEach(([pattern, violations]) => {
        console.log(`\n📌 Pattern: ${pattern}`);
        console.log(`   Count: ${violations.length} violation(s)\n`);

        violations.slice(0, 5).forEach((v, i) => {
          console.log(`   ${i + 1}. ${v.file}:${v.line}`);
          console.log(`      ${v.code.substring(0, 80)}${v.code.length > 80 ? '...' : ''}`);
        });

        if (violations.length > 5) {
          console.log(`\n   ... and ${violations.length - 5} more`);
        }
      });
    }
  }
}

// Run if called directly
if (require.main === module) {
  const validator = new NoMockValidator();
  validator.validate().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = NoMockValidator;
