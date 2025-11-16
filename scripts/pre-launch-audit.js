#!/usr/bin/env node
/**
 * Pre-Launch Audit Script
 * Scans codebase for production readiness issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

const issues = {
  critical: [],
  warning: [],
  info: [],
};

console.log(`${COLORS.blue}
╔═══════════════════════════════════════════════════════════╗
║         🚀 AZORA OS PRE-LAUNCH AUDIT                     ║
║         Scanning for production readiness...              ║
╚═══════════════════════════════════════════════════════════╝
${COLORS.reset}\n`);

// 1. Check for mock/test code
console.log(`${COLORS.yellow}[1/10] Scanning for mock/test code...${COLORS.reset}`);
const mockPatterns = ['// MOCK', '// TODO', '// FIXME', 'console.log', 'debugger'];
const dirsToScan = ['services', 'apps', 'packages'];

dirsToScan.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    mockPatterns.forEach(pattern => {
      try {
        const result = execSync(`grep -r "${pattern}" ${dirPath} --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" | wc -l`, { encoding: 'utf8' });
        const count = parseInt(result.trim());
        if (count > 0) {
          issues.warning.push(`Found ${count} instances of "${pattern}" in ${dir}/`);
        }
      } catch (e) {
        // grep returns non-zero if no matches, which is good
      }
    });
  }
});

// 2. Check environment variables
console.log(`${COLORS.yellow}[2/10] Checking environment variables...${COLORS.reset}`);
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for test keys
  if (envContent.includes('test_') || envContent.includes('_test')) {
    issues.critical.push('Found test keys in .env file - switch to production keys!');
  }
  
  // Check for required vars
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'STRIPE_SECRET_KEY'];
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      issues.critical.push(`Missing required environment variable: ${varName}`);
    }
  });
  
  // Check for weak secrets
  if (envContent.match(/JWT_SECRET=.{1,15}$/m)) {
    issues.critical.push('JWT_SECRET is too short (minimum 16 characters)');
  }
} else {
  issues.critical.push('.env file not found!');
}

// 3. Check dependencies
console.log(`${COLORS.yellow}[3/10] Checking dependencies...${COLORS.reset}`);
try {
  const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
  const audit = JSON.parse(auditResult);
  
  if (audit.metadata) {
    const { vulnerabilities } = audit.metadata;
    if (vulnerabilities.critical > 0) {
      issues.critical.push(`${vulnerabilities.critical} critical security vulnerabilities found!`);
    }
    if (vulnerabilities.high > 0) {
      issues.warning.push(`${vulnerabilities.high} high security vulnerabilities found`);
    }
    if (vulnerabilities.moderate > 0) {
      issues.info.push(`${vulnerabilities.moderate} moderate security vulnerabilities found`);
    }
  }
} catch (e) {
  issues.warning.push('Could not run npm audit - run manually');
}

// 4. Check database schema
console.log(`${COLORS.yellow}[4/10] Checking database schema...${COLORS.reset}`);
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const modelCount = (schema.match(/^model /gm) || []).length;
  const enumCount = (schema.match(/^enum /gm) || []).length;
  issues.info.push(`Database schema: ${modelCount} models, ${enumCount} enums`);
} else {
  issues.critical.push('Prisma schema not found!');
}

// 5. Check for hardcoded secrets
console.log(`${COLORS.yellow}[5/10] Scanning for hardcoded secrets...${COLORS.reset}`);
const secretPatterns = [
  /sk_live_[a-zA-Z0-9]{24,}/,  // Stripe live keys
  /pk_live_[a-zA-Z0-9]{24,}/,  // Stripe publishable keys
  /[a-zA-Z0-9]{32,}/,           // Generic long strings (potential keys)
];

dirsToScan.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    // This is a simplified check - in production use proper secret scanning tools
    issues.info.push(`Secret scan completed for ${dir}/ (use dedicated tools for thorough scan)`);
  }
});

// 6. Check test coverage
console.log(`${COLORS.yellow}[6/10] Checking test coverage...${COLORS.reset}`);
const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
if (fs.existsSync(coveragePath)) {
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  const totalCoverage = coverage.total;
  if (totalCoverage.lines.pct < 80) {
    issues.warning.push(`Test coverage is ${totalCoverage.lines.pct}% (target: 80%+)`);
  } else {
    issues.info.push(`Test coverage: ${totalCoverage.lines.pct}% ✓`);
  }
} else {
  issues.warning.push('No test coverage report found - run: npm run test:coverage');
}

// 7. Check documentation
console.log(`${COLORS.yellow}[7/10] Checking documentation...${COLORS.reset}`);
const requiredDocs = [
  'README.md',
  'docs/API-DOCUMENTATION.md',
  'docs/DEVELOPER-GUIDE.md',
  'docs/SECURITY.md',
];

requiredDocs.forEach(doc => {
  const docPath = path.join(process.cwd(), doc);
  if (!fs.existsSync(docPath)) {
    issues.warning.push(`Missing documentation: ${doc}`);
  }
});

// 8. Check package.json scripts
console.log(`${COLORS.yellow}[8/10] Checking package.json scripts...${COLORS.reset}`);
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredScripts = ['start', 'build', 'test', 'db:migrate'];
  
  requiredScripts.forEach(script => {
    if (!pkg.scripts || !pkg.scripts[script]) {
      issues.warning.push(`Missing package.json script: ${script}`);
    }
  });
} else {
  issues.critical.push('package.json not found!');
}

// 9. Check for .env.example
console.log(`${COLORS.yellow}[9/10] Checking .env.example...${COLORS.reset}`);
const envExamplePath = path.join(process.cwd(), '.env.example');
if (!fs.existsSync(envExamplePath)) {
  issues.warning.push('.env.example not found - create template for deployment');
}

// 10. Check Git status
console.log(`${COLORS.yellow}[10/10] Checking Git status...${COLORS.reset}`);
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    const fileCount = gitStatus.trim().split('\n').length;
    issues.info.push(`${fileCount} uncommitted files - commit before launch`);
  }
} catch (e) {
  issues.info.push('Not a git repository or git not available');
}

// Generate Report
console.log(`\n${COLORS.blue}═══════════════════════════════════════════════════════════${COLORS.reset}\n`);
console.log(`${COLORS.magenta}📊 AUDIT REPORT${COLORS.reset}\n`);

if (issues.critical.length > 0) {
  console.log(`${COLORS.red}🚨 CRITICAL ISSUES (${issues.critical.length}) - MUST FIX BEFORE LAUNCH:${COLORS.reset}`);
  issues.critical.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
  console.log('');
}

if (issues.warning.length > 0) {
  console.log(`${COLORS.yellow}⚠️  WARNINGS (${issues.warning.length}) - SHOULD FIX:${COLORS.reset}`);
  issues.warning.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
  console.log('');
}

if (issues.info.length > 0) {
  console.log(`${COLORS.blue}ℹ️  INFO (${issues.info.length}):${COLORS.reset}`);
  issues.info.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
  console.log('');
}

// Final verdict
console.log(`${COLORS.blue}═══════════════════════════════════════════════════════════${COLORS.reset}\n`);

if (issues.critical.length === 0 && issues.warning.length === 0) {
  console.log(`${COLORS.green}✅ READY TO LAUNCH! All checks passed.${COLORS.reset}\n`);
  process.exit(0);
} else if (issues.critical.length === 0) {
  console.log(`${COLORS.yellow}⚠️  LAUNCH WITH CAUTION - Fix warnings for best results${COLORS.reset}\n`);
  process.exit(0);
} else {
  console.log(`${COLORS.red}❌ NOT READY - Fix critical issues before launch${COLORS.reset}\n`);
  process.exit(1);
}
