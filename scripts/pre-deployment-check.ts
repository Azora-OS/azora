// Task 22: Pre-Deployment Validation
import { execSync } from 'child_process';
import * as fs from 'fs';

interface CheckResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: CheckResult[] = [];

// Task 22.1: Verify all tests passing
function checkTests(): CheckResult {
  try {
    execSync('npm test', { stdio: 'pipe' });
    return { name: '22.1 Tests', passed: true, details: 'All tests passing' };
  } catch {
    return { name: '22.1 Tests', passed: false, details: 'Test failures detected' };
  }
}

// Task 22.2: Verify coverage requirements
function checkCoverage(): CheckResult {
  const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
  const overall = coverage.total.lines.pct;
  
  return {
    name: '22.2 Coverage',
    passed: overall >= 50,
    details: `Overall: ${overall}% (target: 50%)`,
  };
}

// Task 22.3: Verify security requirements
function checkSecurity(): CheckResult {
  try {
    const audit = execSync('npm audit --json', { encoding: 'utf8' });
    const data = JSON.parse(audit);
    const critical = data.metadata?.vulnerabilities?.critical || 0;
    
    return {
      name: '22.3 Security',
      passed: critical === 0,
      details: `Critical vulnerabilities: ${critical}`,
    };
  } catch {
    return { name: '22.3 Security', passed: false, details: 'Audit failed' };
  }
}

// Task 22.4: Verify documentation
function checkDocs(): CheckResult {
  const docs = [
    'docs/API-DOCUMENTATION.md',
    'docs/DEPLOYMENT-RUNBOOK.md',
    'docs/OPERATIONS-RUNBOOK.md',
  ];
  
  const missing = docs.filter(d => !fs.existsSync(d));
  
  return {
    name: '22.4 Documentation',
    passed: missing.length === 0,
    details: missing.length ? `Missing: ${missing.join(', ')}` : 'All docs present',
  };
}

// Task 22.5: Verify staging validation
function checkStaging(): CheckResult {
  const stagingResults = fs.existsSync('load-test-results.json');
  
  return {
    name: '22.5 Staging',
    passed: stagingResults,
    details: stagingResults ? 'Staging validated' : 'Run staging validation first',
  };
}

async function runPreDeploymentCheck() {
  console.log('=== Pre-Deployment Validation ===\n');
  
  results.push(checkTests());
  results.push(checkCoverage());
  results.push(checkSecurity());
  results.push(checkDocs());
  results.push(checkStaging());
  
  results.forEach(r => {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} ${r.name}: ${r.details}`);
  });
  
  const allPassed = results.every(r => r.passed);
  console.log(`\n${allPassed ? '✅ Ready for production' : '❌ Blockers detected'}`);
  
  process.exit(allPassed ? 0 : 1);
}

runPreDeploymentCheck();
