/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

Constitutional Enforcement Engine
Ensures all Azora OS operations comply with the Constitution
*/

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Constitutional Principles
const CONSTITUTION = {
  UBUNTU_PHILOSOPHY: ['Individual Success = f(Collective Success)', 'Collective Intelligence', 'Mutual Prosperity'],
  DIVINE_LAW: ['Truth as Currency', 'Wealth as Impact', 'Creation Only', 'Service Never Enslavement'],
  NO_MOCK_PROTOCOL: ['No mocks', 'No stubs', 'No placeholders', 'No fake data', 'Production-ready only'],
  SOVEREIGNTY: ['User data control', 'Privacy by design', 'Minimal collection', 'Transparent usage'],
  TRUTH: ['Accurate information', 'Verifiable claims', 'Audit trails', 'No deception']
};

interface ComplianceViolation {
  file: string;
  line: number;
  article: string;
  section: string;
  violation: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  remediation: string;
}

class ConstitutionalEnforcementEngine {
  private violations: ComplianceViolation[] = [];
  private scannedFiles = 0;
  private compliantFiles = 0;

  // Scan entire OS for constitutional compliance
  async scanOS(rootPath: string): Promise<void> {
    console.log('🛡️ Constitutional Enforcement Engine - Starting OS Scan\n');
    
    await this.scanDirectory(rootPath);
    
    this.generateReport();
  }

  private async scanDirectory(dirPath: string): Promise<void> {
    const entries = readdirSync(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      
      // Skip node_modules, .git, dist, build
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'build' || entry === '.next') {
        continue;
      }

      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (this.isCodeFile(entry)) {
        await this.scanFile(fullPath);
      }
    }
  }

  private isCodeFile(filename: string): boolean {
    return /\.(ts|tsx|js|jsx|py|rs|go)$/.test(filename);
  }

  private async scanFile(filePath: string): Promise<void> {
    this.scannedFiles++;
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let hasViolations = false;

    // Article VIII, Section 8.3: No Mock Protocol
    lines.forEach((line, index) => {
      if (this.violatesNoMockProtocol(line)) {
        this.violations.push({
          file: filePath,
          line: index + 1,
          article: 'VIII',
          section: '8.3',
          violation: 'No Mock Protocol violation',
          severity: 'CRITICAL',
          remediation: 'Replace mock/stub with production implementation'
        });
        hasViolations = true;
      }
    });

    // Article I, Section 1.2: Truth as Currency
    if (this.violatesTruthPrinciple(content)) {
      this.violations.push({
        file: filePath,
        line: 0,
        article: 'I',
        section: '1.2',
        violation: 'Truth as Currency violation - deceptive code detected',
        severity: 'HIGH',
        remediation: 'Ensure all code is truthful and transparent'
      });
      hasViolations = true;
    }

    // Article V, Section 5.2: Data Protection
    if (this.violatesDataProtection(content)) {
      this.violations.push({
        file: filePath,
        line: 0,
        article: 'V',
        section: '5.2',
        violation: 'Data Protection violation - insufficient privacy controls',
        severity: 'HIGH',
        remediation: 'Implement privacy by design and user data control'
      });
      hasViolations = true;
    }

    if (!hasViolations) {
      this.compliantFiles++;
    }
  }

  private violatesNoMockProtocol(line: string): boolean {
    const mockPatterns = [
      /\bmock\b/i,
      /\bstub\b/i,
      /\bfake\b/i,
      /TODO:/i,
      /FIXME:/i,
      /placeholder/i,
      /\.skip\(/,
      /\.todo\(/,
      /dummy/i
    ];

    return mockPatterns.some(pattern => pattern.test(line));
  }

  private violatesTruthPrinciple(content: string): boolean {
    const deceptivePatterns = [
      /fake.*data/i,
      /misleading/i,
      /deceive/i,
      /manipulate.*user/i
    ];

    return deceptivePatterns.some(pattern => pattern.test(content));
  }

  private violatesDataProtection(content: string): boolean {
    // Check for data collection without consent
    if (content.includes('localStorage.setItem') && !content.includes('consent')) {
      return true;
    }
    
    // Check for unencrypted sensitive data
    if ((content.includes('password') || content.includes('token')) && 
        !content.includes('encrypt') && !content.includes('hash')) {
      return true;
    }

    return false;
  }

  private generateReport(): void {
    console.log('\n📊 CONSTITUTIONAL COMPLIANCE REPORT\n');
    console.log('═'.repeat(60));
    
    const complianceRate = ((this.compliantFiles / this.scannedFiles) * 100).toFixed(2);
    
    console.log(`Files Scanned: ${this.scannedFiles}`);
    console.log(`Compliant Files: ${this.compliantFiles}`);
    console.log(`Files with Violations: ${this.scannedFiles - this.compliantFiles}`);
    console.log(`Compliance Rate: ${complianceRate}%`);
    console.log(`Total Violations: ${this.violations.length}\n`);

    if (this.violations.length === 0) {
      console.log('✅ FULL CONSTITUTIONAL COMPLIANCE ACHIEVED\n');
      console.log('All systems operating within constitutional bounds.');
      return;
    }

    // Group violations by severity
    const critical = this.violations.filter(v => v.severity === 'CRITICAL');
    const high = this.violations.filter(v => v.severity === 'HIGH');
    const medium = this.violations.filter(v => v.severity === 'MEDIUM');
    const low = this.violations.filter(v => v.severity === 'LOW');

    console.log('🚨 VIOLATIONS BY SEVERITY:\n');
    console.log(`CRITICAL: ${critical.length}`);
    console.log(`HIGH: ${high.length}`);
    console.log(`MEDIUM: ${medium.length}`);
    console.log(`LOW: ${low.length}\n`);

    // Show top 10 violations
    console.log('🔍 TOP VIOLATIONS:\n');
    this.violations.slice(0, 10).forEach((v, i) => {
      console.log(`${i + 1}. [${v.severity}] Article ${v.article}, Section ${v.section}`);
      console.log(`   File: ${v.file}:${v.line}`);
      console.log(`   Violation: ${v.violation}`);
      console.log(`   Fix: ${v.remediation}\n`);
    });

    if (this.violations.length > 10) {
      console.log(`... and ${this.violations.length - 10} more violations\n`);
    }

    console.log('═'.repeat(60));
    console.log('\n⚠️  CONSTITUTIONAL COMPLIANCE REQUIRED');
    console.log('All violations must be remediated before production deployment.\n');
  }
}

// Execute scan
const engine = new ConstitutionalEnforcementEngine();
engine.scanOS(process.cwd()).catch(console.error);
