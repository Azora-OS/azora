#!/usr/bin/env node

/**
 * Local Security Scanning Script
 * 
 * This script runs all security checks locally before pushing to GitHub.
 * It performs:
 * - npm audit for dependency vulnerabilities
 * - ESLint for code quality
 * - TypeScript type checking
 * - Secret detection patterns
 * 
 * Usage: npm run security:scan or node scripts/security-scan.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`${'='.repeat(60)}\n`, 'cyan');
}

function runCommand(command, description) {
  try {
    log(`▶ ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✓ ${description} passed`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${description} failed`, 'red');
    return false;
  }
}

function checkSecrets() {
  section('Secret Detection');
  
  const secretPatterns = [
    { pattern: /password\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Password' },
    { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, name: 'API Key' },
    { pattern: /secret\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Secret' },
    { pattern: /token\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Token' },
    { pattern: /private[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Private Key' },
  ];
  
  const filesToCheck = [
    'src/**/*.ts',
    'services/**/*.ts',
    'packages/**/*.ts',
    'apps/**/*.ts',
  ];
  
  let secretsFound = false;
  
  secretPatterns.forEach(({ pattern, name }) => {
    try {
      const result = execSync(`grep -r "${pattern.source}" --include="*.ts" --include="*.js" --include="*.env" . 2>/dev/null || true`, {
        encoding: 'utf8',
      });
      
      if (result.trim()) {
        log(`⚠ Potential ${name} found:`, 'yellow');
        result.split('\n').slice(0, 3).forEach(line => {
          if (line) log(`  ${line}`, 'yellow');
        });
        secretsFound = true;
      }
    } catch (e) {
      // Ignore grep errors
    }
  });
  
  if (!secretsFound) {
    log('✓ No obvious secrets detected', 'green');
  }
  
  return !secretsFound;
}

function main() {
  log('\n🔒 Security Scanning Started\n', 'cyan');
  
  const results = [];
  
  // npm audit
  section('Dependency Vulnerability Scan');
  results.push({
    name: 'npm audit',
    passed: runCommand('npm audit --audit-level=high', 'npm audit (high/critical)'),
  });
  
  // ESLint
  section('Code Quality Check');
  results.push({
    name: 'ESLint',
    passed: runCommand('npm run lint', 'ESLint'),
  });
  
  // TypeScript
  section('Type Checking');
  results.push({
    name: 'TypeScript',
    passed: runCommand('npm run typecheck', 'TypeScript type checking'),
  });
  
  // Secret detection
  results.push({
    name: 'Secret Detection',
    passed: checkSecrets(),
  });
  
  // Summary
  section('Security Scan Summary');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✓' : '✗';
    const color = result.passed ? 'green' : 'red';
    log(`${status} ${result.name}`, color);
  });
  
  log(`\nPassed: ${passed}/${total}`, passed === total ? 'green' : 'red');
  
  if (passed === total) {
    log('\n✓ All security checks passed!', 'green');
    process.exit(0);
  } else {
    log('\n✗ Some security checks failed. Please fix the issues before pushing.', 'red');
    log('\nRemediation guidance:', 'yellow');
    log('- npm audit: Run "npm audit fix" to fix vulnerabilities', 'yellow');
    log('- ESLint: Run "npm run lint:fix" to fix linting issues', 'yellow');
    log('- TypeScript: Review type errors and fix them', 'yellow');
    log('- Secrets: Remove hardcoded secrets and use environment variables', 'yellow');
    process.exit(1);
  }
}

main();
