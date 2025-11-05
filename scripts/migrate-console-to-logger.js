#!/usr/bin/env node

/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.

Migration script to replace console.log statements with logger
*/

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  '.git',
  'lib/logger.ts',
  'scripts/',
];

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function migrateFile(filePath) {
  if (shouldIgnore(filePath)) {
    return { migrated: false, reason: 'ignored' };
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let hasImport = content.includes("import { log }") || content.includes("const { log }");
    const needsImport = /console\.(log|error|warn|info|debug)/.test(content);

    if (!needsImport) {
      return { migrated: false, reason: 'no console statements' };
    }

    // Add import if needed and it's a TypeScript/JavaScript file
    if (!hasImport && needsImport && (filePath.endsWith('.ts') || filePath.endsWith('.js'))) {
      // Try to determine relative path to lib/logger
      const dir = path.dirname(filePath);
      let relativePath = path.relative(dir, path.join(process.cwd(), 'lib', 'logger'));
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }
      
      // Normalize path separators for ES modules
      relativePath = relativePath.replace(/\\/g, '/');
      
      const importStatement = filePath.endsWith('.ts') || filePath.includes('type: module')
        ? `import { log } from '${relativePath}';`
        : `const { log } = require('${relativePath}');`;
      
      // Find insertion point (after license comment if present)
      const licenseMatch = content.match(/(\/\*[\s\S]*?AZORA PROPRIETARY LICENSE[\s\S]*?\*\/\n*)/);
      if (licenseMatch) {
        const insertPos = licenseMatch[0].length;
        content = content.slice(0, insertPos) + '\n' + importStatement + '\n' + content.slice(insertPos);
      } else {
        content = importStatement + '\n' + content;
      }
      modified = true;
      hasImport = true;
    }

    // Replace console statements
    if (hasImport || filePath.includes('server.js')) {
      // Replace console.log with log.info
      if (content.includes('console.log(')) {
        content = content.replace(/console\.log\(`([^`]+)`\)/g, (match, msg) => {
          // Extract variables from template string
          const vars = match.match(/\$\{([^}]+)\}/g);
          if (vars) {
            const obj = vars.map(v => {
              const key = v.slice(2, -1).trim();
              return `${key}: ${key}`;
            }).join(', ');
            return `log.info('${msg.replace(/\$\{[^}]+\}/g, '').trim()}', { ${obj} })`;
          }
          return `log.info('${msg}')`;
        });
        
        content = content.replace(/console\.log\(([^)]+)\)/g, (match, arg) => {
          // Simple replacement - can be improved
          if (arg.includes('`')) {
            return match; // Skip template strings handled above
          }
          return `log.info(${arg})`;
        });
        modified = true;
      }

      // Replace console.error with log.error
      content = content.replace(/console\.error\(/g, 'log.error(');
      modified = true;

      // Replace console.warn with log.warn
      content = content.replace(/console\.warn\(/g, 'log.warn(');
      modified = true;

      // Replace console.info with log.info
      content = content.replace(/console\.info\(/g, 'log.info(');
      modified = true;

      // Replace console.debug with log.debug
      content = content.replace(/console\.debug\(/g, 'log.debug(');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return { migrated: true };
    }

    return { migrated: false, reason: 'no changes needed' };
  } catch (error) {
    return { migrated: false, error: error.message };
  }
}

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !shouldIgnore(filePath)) {
      findFiles(filePath, fileList);
    } else if (
      (file.endsWith('.ts') || file.endsWith('.js')) &&
      !file.endsWith('.test.ts') &&
      !file.endsWith('.test.js') &&
      !file.endsWith('.spec.ts') &&
      !file.endsWith('.spec.js') &&
      !shouldIgnore(filePath)
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
console.log('🔧 Migrating console statements to logger...\n');

const files = findFiles(process.cwd());
const results = { migrated: 0, skipped: 0, errors: 0 };

files.forEach(file => {
  const result = migrateFile(file);
  if (result.migrated) {
    results.migrated++;
    console.log(`✅ ${file}`);
  } else if (result.error) {
    results.errors++;
    console.log(`❌ ${file}: ${result.error}`);
  } else {
    results.skipped++;
  }
});

console.log(`\n📊 Migration Summary:`);
console.log(`  ✅ Migrated: ${results.migrated}`);
console.log(`  ⏭️  Skipped: ${results.skipped}`);
console.log(`  ❌ Errors: ${results.errors}`);

if (results.migrated > 0) {
  console.log('\n⚠️  Please review the changes before committing!');
}

