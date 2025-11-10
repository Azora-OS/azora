#!/usr/bin/env node
/**
 * AZORA OS - Secret Scanner
 * 
 * Scans codebase for hard-coded secrets and security violations
 * Part of Layer 1: Security Foundation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns to detect secrets (refined to avoid false positives)
const SECRET_PATTERNS = [
  // Hard-coded secrets with actual values (not just variable names)
  /secret\s*=\s*["']([^"']{8,})["']/gi,
  /SECRET\s*=\s*["']([^"']{8,})["']/gi,
  /password\s*=\s*["']([^"']{4,})["']/gi,
  /PASSWORD\s*=\s*["']([^"']{4,})["']/gi,
  /api[_-]?key\s*=\s*["']([^"']{8,})["']/gi,
  /API[_-]?KEY\s*=\s*["']([^"']{8,})["']/gi,
  /jwt[_-]?secret\s*=\s*["']([^"']{8,})["']/gi,
  /JWT[_-]?SECRET\s*=\s*["']([^"']{8,})["']/gi,
  // Common placeholder patterns that should be replaced (in code, not comments)
  /your-secret-key/gi,
  /change-in-production/gi,
  /CHANGE_THIS/gi,
  // Byte arrays with hard-coded values
  /\[\]byte\(["']([^"']{8,})["']\)/gi,
  // Demo credentials in production code
  /username\s*===?\s*["']demo["']/gi,
  /password\s*===?\s*["']demo["']/gi,
];


async function scanForSecrets() {
  console.log('\n🔍 Scanning for hard-coded secrets...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const violations = [];
  
  // Find all code files using find command
  const findCommand = `find . -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.go" \\) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" -not -path "*/build/*" -not -path "*/.turbo/*" -not -name "*.md"`;
  
  let files = [];
  try {
    const output = execSync(findCommand, { cwd: process.cwd(), encoding: 'utf8' });
    files = output.split('\n').filter(f => f.trim());
  } catch (error) {
    console.error('Error finding files:', error.message);
    return false;
  }

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of SECRET_PATTERNS) {
        const matches = [...content.matchAll(pattern)];
        
        for (const match of matches) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const line = content.split('\n')[lineNumber - 1].trim();
          
          // Skip if it's in a comment, documentation, or CSS/HTML attributes
          if (line.startsWith('//') || 
              line.startsWith('*') || 
              line.startsWith('#') ||
              line.includes('placeholder=') ||
              line.includes('placeholder:') ||
              line.includes('data-placeholder') ||
              line.includes('aria-placeholder') ||
              line.includes('placeholder-text') ||
              line.includes('/*') ||
              line.includes('*/')) {
            continue;
          }
          
          violations.push({
            file,
            line: lineNumber,
            pattern: pattern.source,
            match: match[0],
            context: line,
          });
        }
      }
    } catch (error) {
      // Skip files that can't be read
      continue;
    }
  }

  // Report findings
  if (violations.length === 0) {
    console.log('✅ No hard-coded secrets found!\n');
    return true;
  }

  console.log(`❌ Found ${violations.length} potential secret violations:\n`);
  
  // Group by file
  const byFile = {};
  for (const violation of violations) {
    if (!byFile[violation.file]) {
      byFile[violation.file] = [];
    }
    byFile[violation.file].push(violation);
  }

  for (const [file, fileViolations] of Object.entries(byFile)) {
    console.log(`📄 ${file}:`);
    for (const violation of fileViolations) {
      console.log(`   Line ${violation.line}: ${violation.context}`);
      console.log(`   ⚠️  Pattern: ${violation.pattern}\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('💡 Fix: Replace hard-coded values with environment variables\n');
  
  return false;
}

// Run scan
if (import.meta.url === `file://${process.argv[1]}`) {
  scanForSecrets().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { scanForSecrets };
