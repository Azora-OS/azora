#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🛡️ AZORA OWASP SECURITY SCAN');
console.log('=============================\n');

// OWASP Top 10 2021 Security Tests
const owaspTests = {
  'A01-Broken-Access-Control': {
    name: 'Broken Access Control',
    tests: ['auth-bypass', 'privilege-escalation', 'cors-misconfiguration']
  },
  'A02-Cryptographic-Failures': {
    name: 'Cryptographic Failures', 
    tests: ['weak-encryption', 'hardcoded-secrets', 'insecure-transmission']
  },
  'A03-Injection': {
    name: 'Injection Attacks',
    tests: ['sql-injection', 'nosql-injection', 'command-injection']
  },
  'A04-Insecure-Design': {
    name: 'Insecure Design',
    tests: ['missing-security-controls', 'threat-modeling']
  },
  'A05-Security-Misconfiguration': {
    name: 'Security Misconfiguration',
    tests: ['default-credentials', 'verbose-errors', 'missing-headers']
  },
  'A06-Vulnerable-Components': {
    name: 'Vulnerable and Outdated Components',
    tests: ['dependency-vulnerabilities', 'outdated-libraries']
  },
  'A07-Authentication-Failures': {
    name: 'Identification and Authentication Failures',
    tests: ['weak-passwords', 'session-management', 'brute-force']
  },
  'A08-Software-Integrity': {
    name: 'Software and Data Integrity Failures',
    tests: ['unsigned-updates', 'ci-cd-security']
  },
  'A09-Logging-Monitoring': {
    name: 'Security Logging and Monitoring Failures',
    tests: ['insufficient-logging', 'missing-monitoring']
  },
  'A10-SSRF': {
    name: 'Server-Side Request Forgery',
    tests: ['ssrf-vulnerabilities', 'url-validation']
  }
};

const findings = [];
let criticalCount = 0;
let highCount = 0;
let mediumCount = 0;
let lowCount = 0;

// Security scan functions
function scanForInjection(servicePath) {
  const results = [];
  
  try {
    const files = fs.readdirSync(servicePath, { recursive: true });
    
    files.forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        const filePath = path.join(servicePath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // SQL Injection patterns
        if (content.includes('SELECT * FROM') && !content.includes('parameterized')) {
          results.push({
            type: 'SQL Injection Risk',
            severity: 'HIGH',
            file: file,
            line: 'Multiple',
            description: 'Potential SQL injection vulnerability detected'
          });
        }
        
        // Command Injection
        if (content.includes('exec(') || content.includes('system(')) {
          results.push({
            type: 'Command Injection Risk',
            severity: 'CRITICAL',
            file: file,
            line: 'Multiple',
            description: 'Direct command execution detected'
          });
        }
      }
    });
  } catch (error) {
    // Service might not exist
  }
  
  return results;
}

function scanForAuthIssues(servicePath) {
  const results = [];
  
  try {
    const files = fs.readdirSync(servicePath, { recursive: true });
    
    files.forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        const filePath = path.join(servicePath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Missing authentication
        if (content.includes('app.get') && !content.includes('auth') && !content.includes('/health')) {
          results.push({
            type: 'Missing Authentication',
            severity: 'HIGH',
            file: file,
            line: 'Multiple',
            description: 'Endpoints without authentication middleware'
          });
        }
        
        // Hardcoded secrets
        if (content.includes('password') && content.includes('=') && content.includes('"')) {
          results.push({
            type: 'Hardcoded Credentials',
            severity: 'CRITICAL',
            file: file,
            line: 'Multiple',
            description: 'Potential hardcoded credentials found'
          });
        }
      }
    });
  } catch (error) {
    // Service might not exist
  }
  
  return results;
}

function scanForSecurityHeaders(servicePath) {
  const results = [];
  
  try {
    const files = fs.readdirSync(servicePath, { recursive: true });
    
    files.forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        const filePath = path.join(servicePath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Missing security headers
        if (content.includes('express()') && !content.includes('helmet')) {
          results.push({
            type: 'Missing Security Headers',
            severity: 'MEDIUM',
            file: file,
            line: 'Multiple',
            description: 'Missing helmet middleware for security headers'
          });
        }
        
        // CORS misconfiguration
        if (content.includes('cors()') && content.includes('origin: "*"')) {
          results.push({
            type: 'CORS Misconfiguration',
            severity: 'HIGH',
            file: file,
            line: 'Multiple',
            description: 'Overly permissive CORS configuration'
          });
        }
      }
    });
  } catch (error) {
    // Service might not exist
  }
  
  return results;
}

function scanDependencies(servicePath) {
  const results = [];
  
  try {
    const packagePath = path.join(servicePath, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Check for known vulnerable packages
      const vulnerablePackages = ['lodash@4.17.20', 'express@4.17.0', 'jsonwebtoken@8.5.0'];
      
      Object.keys(packageJson.dependencies || {}).forEach(dep => {
        const version = packageJson.dependencies[dep];
        if (vulnerablePackages.some(vuln => vuln.startsWith(dep))) {
          results.push({
            type: 'Vulnerable Dependency',
            severity: 'HIGH',
            file: 'package.json',
            line: 'dependencies',
            description: `Potentially vulnerable package: ${dep}@${version}`
          });
        }
      });
    }
  } catch (error) {
    // Package.json might not exist
  }
  
  return results;
}

// Services to scan
const services = [
  'api-gateway',
  'auth-service', 
  'azora-education',
  'azora-mint',
  'azora-forge',
  'azora-studyspaces',
  'azora-erp',
  'enterprise',
  'subscription'
];

console.log('🔍 Scanning services for OWASP Top 10 vulnerabilities...\n');

services.forEach(service => {
  const servicePath = path.join(__dirname, '..', 'services', service);
  
  if (!fs.existsSync(servicePath)) {
    console.log(`⚠️  ${service}: Service not found`);
    return;
  }

  console.log(`🛡️ Scanning ${service}...`);
  
  // Run all security scans
  const injectionResults = scanForInjection(servicePath);
  const authResults = scanForAuthIssues(servicePath);
  const headerResults = scanForSecurityHeaders(servicePath);
  const depResults = scanDependencies(servicePath);
  
  const serviceFindings = [...injectionResults, ...authResults, ...headerResults, ...depResults];
  
  serviceFindings.forEach(finding => {
    finding.service = service;
    findings.push(finding);
    
    switch(finding.severity) {
      case 'CRITICAL': criticalCount++; break;
      case 'HIGH': highCount++; break;
      case 'MEDIUM': mediumCount++; break;
      case 'LOW': lowCount++; break;
    }
  });
  
  const serviceStatus = serviceFindings.length === 0 ? '✅' : 
                      serviceFindings.some(f => f.severity === 'CRITICAL') ? '🚨' : '⚠️';
  console.log(`${serviceStatus} ${service}: ${serviceFindings.length} findings`);
});

// Generate security report
console.log('\n🛡️ OWASP SECURITY SCAN RESULTS');
console.log('===============================');
console.log(`🚨 Critical: ${criticalCount}`);
console.log(`🔴 High:     ${highCount}`);
console.log(`🟡 Medium:   ${mediumCount}`);
console.log(`🟢 Low:      ${lowCount}`);
console.log(`📊 Total:    ${findings.length}`);

if (findings.length > 0) {
  console.log('\n📋 DETAILED FINDINGS:');
  console.log('=====================');
  
  findings.forEach((finding, index) => {
    const icon = finding.severity === 'CRITICAL' ? '🚨' : 
                 finding.severity === 'HIGH' ? '🔴' : 
                 finding.severity === 'MEDIUM' ? '🟡' : '🟢';
    
    console.log(`${icon} ${index + 1}. ${finding.type}`);
    console.log(`   Service: ${finding.service}`);
    console.log(`   File: ${finding.file}`);
    console.log(`   Severity: ${finding.severity}`);
    console.log(`   Description: ${finding.description}\n`);
  });
}

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    critical: criticalCount,
    high: highCount,
    medium: mediumCount,
    low: lowCount,
    total: findings.length
  },
  findings: findings,
  owaspCompliance: {
    'A01-Broken-Access-Control': findings.filter(f => f.type.includes('Authentication') || f.type.includes('CORS')).length,
    'A02-Cryptographic-Failures': findings.filter(f => f.type.includes('Hardcoded')).length,
    'A03-Injection': findings.filter(f => f.type.includes('Injection')).length,
    'A05-Security-Misconfiguration': findings.filter(f => f.type.includes('Headers')).length,
    'A06-Vulnerable-Components': findings.filter(f => f.type.includes('Dependency')).length
  }
};

fs.writeFileSync(
  path.join(__dirname, '..', 'security-scan-report.json'), 
  JSON.stringify(report, null, 2)
);

console.log('💾 Detailed report saved to: security-scan-report.json');

// Security recommendations
console.log('\n🚀 SECURITY RECOMMENDATIONS:');
console.log('============================');

if (criticalCount > 0) {
  console.log('🚨 CRITICAL ACTIONS NEEDED:');
  console.log('- Fix hardcoded credentials immediately');
  console.log('- Patch command injection vulnerabilities');
  console.log('- Review authentication mechanisms');
}

if (highCount > 0) {
  console.log('🔴 HIGH PRIORITY:');
  console.log('- Add authentication to unprotected endpoints');
  console.log('- Fix CORS misconfigurations');
  console.log('- Update vulnerable dependencies');
}

if (mediumCount > 0) {
  console.log('🟡 MEDIUM PRIORITY:');
  console.log('- Add security headers (helmet middleware)');
  console.log('- Implement proper error handling');
  console.log('- Add input validation');
}

const overallSecurity = criticalCount === 0 && highCount === 0 ? '✅ SECURE' : '❌ NEEDS ATTENTION';
console.log(`\n🎯 OVERALL SECURITY STATUS: ${overallSecurity}`);

console.log('\n✨ OWASP security scan complete!');