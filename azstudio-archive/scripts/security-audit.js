#!/usr/bin/env node
/**
 * Security Audit Script for AzStudio
 * Runs automated security checks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 AzStudio Security Audit\n');

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

// 1. Check for npm vulnerabilities
console.log('1️⃣  Checking npm dependencies...');
try {
  execSync('npm audit --json > audit-report.json', { stdio: 'pipe' });
  const audit = JSON.parse(fs.readFileSync('audit-report.json', 'utf8'));
  
  if (audit.metadata.vulnerabilities.total === 0) {
    results.passed.push('No npm vulnerabilities found');
  } else {
    results.failed.push(`Found ${audit.metadata.vulnerabilities.total} npm vulnerabilities`);
  }
  fs.unlinkSync('audit-report.json');
} catch (error) {
  results.warnings.push('npm audit check failed');
}

// 2. Check for hardcoded secrets
console.log('2️⃣  Scanning for hardcoded secrets...');
const secretPatterns = [
  /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
  /password\s*=\s*['"][^'"]+['"]/gi,
  /secret\s*=\s*['"][^'"]+['"]/gi,
  /token\s*=\s*['"][^'"]+['"]/gi,
  /sk-[a-zA-Z0-9]{32,}/g, // OpenAI keys
];

let secretsFound = 0;
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(file)) {
        scanDirectory(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          secretsFound++;
          results.warnings.push(`Potential secret in ${filePath}`);
        }
      }
    }
  }
}

scanDirectory(path.join(__dirname, '..', 'src'));

if (secretsFound === 0) {
  results.passed.push('No hardcoded secrets detected');
} else {
  results.failed.push(`Found ${secretsFound} potential hardcoded secrets`);
}

// 3. Check TypeScript strict mode
console.log('3️⃣  Checking TypeScript configuration...');
const tsconfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tsconfig.json'), 'utf8'));

if (tsconfig.compilerOptions.strict === true) {
  results.passed.push('TypeScript strict mode enabled');
} else {
  results.failed.push('TypeScript strict mode not enabled');
}

// 4. Check for HTTP URLs in package.json
console.log('4️⃣  Checking for insecure URLs...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const packageStr = JSON.stringify(packageJson);

if (packageStr.includes('http://') && !packageStr.includes('localhost')) {
  results.warnings.push('Found HTTP URLs in package.json');
} else {
  results.passed.push('No insecure HTTP URLs found');
}

// 5. Check for security-related packages
console.log('5️⃣  Checking security packages...');
const securityPackages = ['helmet', 'cors', 'express-rate-limit'];
const installedSecurityPackages = securityPackages.filter(pkg => 
  packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg]
);

if (installedSecurityPackages.length > 0) {
  results.passed.push(`Security packages installed: ${installedSecurityPackages.join(', ')}`);
} else {
  results.warnings.push('Consider installing security packages');
}

// Print results
console.log('\n📊 Audit Results:\n');

console.log('✅ Passed:');
results.passed.forEach(item => console.log(`  - ${item}`));

if (results.warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  results.warnings.forEach(item => console.log(`  - ${item}`));
}

if (results.failed.length > 0) {
  console.log('\n❌ Failed:');
  results.failed.forEach(item => console.log(`  - ${item}`));
  console.log('\n🚨 Security audit failed! Please address the issues above.');
  process.exit(1);
} else {
  console.log('\n✨ Security audit passed!');
  process.exit(0);
}
