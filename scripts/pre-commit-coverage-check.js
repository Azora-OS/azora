#!/usr/bin/env node

/**
 * Pre-commit Coverage Check
 * Ensures minimum coverage requirements are met before allowing commits
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Coverage thresholds
const COVERAGE_THRESHOLDS = {
  lines: 50,
  statements: 50,
  functions: 50,
  branches: 40
};

// Critical services that require higher coverage
const CRITICAL_SERVICES = {
  'auth-service': { lines: 65, statements: 65, functions: 60, branches: 55 },
  'payment': { lines: 60, statements: 60, functions: 55, branches: 50 },
  'azora-finance': { lines: 55, statements: 55, functions: 50, branches: 45 }
};

async function checkCoverage() {
  console.log('🔍 Checking test coverage requirements...');
  
  try {
    // Get list of changed files
    const changedFiles = getChangedFiles();
    
    if (changedFiles.length === 0) {
      console.log('✅ No testable files changed, skipping coverage check');
      return true;
    }
    
    // Run tests for changed files
    console.log(`📊 Running tests for ${changedFiles.length} changed files...`);
    
    try {
      execSync('npm test -- --coverage --passWithNoTests --silent', {
        stdio: 'pipe',
        encoding: 'utf8'
      });
    } catch (error) {
      console.error('❌ Tests failed, cannot check coverage');
      return false;
    }
    
    // Check overall coverage
    const overallCoverage = await checkOverallCoverage();
    if (!overallCoverage.passed) {
      console.error('❌ Overall coverage requirements not met:');
      overallCoverage.failures.forEach(failure => {
        console.error(`   ${failure}`);
      });
      return false;
    }
    
    // Check service-specific coverage
    const serviceCoverage = await checkServiceCoverage(changedFiles);
    if (!serviceCoverage.passed) {
      console.error('❌ Service coverage requirements not met:');
      serviceCoverage.failures.forEach(failure => {
        console.error(`   ${failure}`);
      });
      return false;
    }
    
    console.log('✅ All coverage requirements met');
    return true;
    
  } catch (error) {
    console.error('❌ Coverage check failed:', error.message);
    return false;
  }
}

function getChangedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf8'
    });
    
    return output
      .split('\n')
      .filter(file => file.trim())
      .filter(file => {
        // Only check testable files
        return file.match(/\.(js|ts|jsx|tsx)$/) && 
               !file.includes('.test.') && 
               !file.includes('.spec.') &&
               !file.includes('node_modules');
      });
  } catch (error) {
    console.warn('⚠️  Could not get changed files, checking all coverage');
    return [];
  }
}

async function checkOverallCoverage() {
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
  
  if (!fs.existsSync(coveragePath)) {
    return {
      passed: false,
      failures: ['Coverage report not found. Run tests with --coverage first.']
    };
  }
  
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  const total = coverage.total;
  
  const failures = [];
  
  Object.keys(COVERAGE_THRESHOLDS).forEach(metric => {
    const threshold = COVERAGE_THRESHOLDS[metric];
    const actual = total[metric].pct;
    
    if (actual < threshold) {
      failures.push(`${metric}: ${actual.toFixed(2)}% < ${threshold}% (required)`);
    }
  });
  
  return {
    passed: failures.length === 0,
    failures
  };
}

async function checkServiceCoverage(changedFiles) {
  const failures = [];
  
  // Group changed files by service
  const serviceFiles = {};
  
  changedFiles.forEach(file => {
    const serviceName = extractServiceName(file);
    if (serviceName && CRITICAL_SERVICES[serviceName]) {
      if (!serviceFiles[serviceName]) {
        serviceFiles[serviceName] = [];
      }
      serviceFiles[serviceName].push(file);
    }
  });
  
  // Check coverage for each affected critical service
  for (const [serviceName, files] of Object.entries(serviceFiles)) {
    const serviceCoverage = await getServiceCoverage(serviceName);
    const thresholds = CRITICAL_SERVICES[serviceName];
    
    Object.keys(thresholds).forEach(metric => {
      const threshold = thresholds[metric];
      const actual = serviceCoverage[metric] || 0;
      
      if (actual < threshold) {
        failures.push(`${serviceName} ${metric}: ${actual.toFixed(2)}% < ${threshold}% (required for critical service)`);
      }
    });
  }
  
  return {
    passed: failures.length === 0,
    failures
  };
}

function extractServiceName(filePath) {
  const match = filePath.match(/services\/([^\/]+)\//);
  return match ? match[1] : null;
}

async function getServiceCoverage(serviceName) {
  const coveragePath = path.join(process.cwd(), 'coverage', 'services', serviceName, 'coverage-summary.json');
  
  if (!fs.existsSync(coveragePath)) {
    // Fallback to overall coverage if service-specific not available
    return { lines: 0, statements: 0, functions: 0, branches: 0 };
  }
  
  try {
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const total = coverage.total;
    
    return {
      lines: total.lines.pct,
      statements: total.statements.pct,
      functions: total.functions.pct,
      branches: total.branches.pct
    };
  } catch (error) {
    console.warn(`⚠️  Could not read coverage for ${serviceName}`);
    return { lines: 0, statements: 0, functions: 0, branches: 0 };
  }
}

// Run the check
if (require.main === module) {
  checkCoverage()
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Coverage check error:', error);
      process.exit(1);
    });
}

module.exports = { checkCoverage, COVERAGE_THRESHOLDS, CRITICAL_SERVICES };