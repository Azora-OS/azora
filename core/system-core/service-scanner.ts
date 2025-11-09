/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { promises as fs } from 'fs';
import path from 'path';
import { ServiceCandidate, ServiceDesignRequirements, ServiceMaturityLevel } from './service-design-requirements';

/**
 * SERVICE SCANNER
 * 
 * Scans all services in the Azora ecosystem and evaluates them
 * against constitutional requirements. Identifies basic services
 * that need advancement and potential security risks.
 */

export interface ServiceScanResult {
  totalServices: number;
  basicServices: string[];
  advancedServices: string[];
  supremeServices: string[];
  infectedServices: string[];
  recommendations: {
    upgrade: string[];
    quarantine: string[];
    reject: string[];
  };
  systemHealth: {
    overallScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    vulnerabilities: string[];
  };
}

export class ServiceScanner {
  private serviceRequirements: ServiceDesignRequirements;
  private servicesPath: string;

  constructor(servicesPath: string = 'c:\\Users\\Azora Sapiens\\Documents\\azora\\services') {
    this.serviceRequirements = new ServiceDesignRequirements();
    this.servicesPath = servicesPath;
  }

  /**
   * Scan all services in the ecosystem
   */
  async scanAllServices(): Promise<ServiceScanResult> {
    console.log('\n🔍 AZORA SERVICE CONSTITUTIONAL SCAN');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Scanning for basic services and security vulnerabilities...\n');

    const result: ServiceScanResult = {
      totalServices: 0,
      basicServices: [],
      advancedServices: [],
      supremeServices: [],
      infectedServices: [],
      recommendations: {
        upgrade: [],
        quarantine: [],
        reject: []
      },
      systemHealth: {
        overallScore: 0,
        riskLevel: 'low',
        vulnerabilities: []
      }
    };

    try {
      // Get all service directories
      const serviceDirs = await this.getServiceDirectories();
      result.totalServices = serviceDirs.length;

      console.log(`Found ${serviceDirs.length} services to evaluate\n`);

      // Evaluate each service
      const evaluations = [];
      for (const serviceDir of serviceDirs) {
        try {
          const candidate = await this.createServiceCandidate(serviceDir);
          const evaluation = await this.serviceRequirements.evaluateService(candidate);
          evaluations.push(evaluation);

          // Categorize service
          this.categorizeService(evaluation, result);

        } catch (error: any) {
          console.error(`❌ Failed to evaluate ${serviceDir}: ${error.message}`);
          result.infectedServices.push(serviceDir);
        }
      }

      // Calculate system health
      result.systemHealth = this.calculateSystemHealth(evaluations);

      // Generate recommendations
      result.recommendations = this.generateRecommendations(evaluations);

      this.logScanResults(result);
      return result;

    } catch (error: any) {
      console.error('❌ Service scan failed:', error.message);
      throw error;
    }
  }

  /**
   * Get all service directories
   */
  private async getServiceDirectories(): Promise<string[]> {
    const dirs: string[] = [];
    
    try {
      const entries = await fs.readdir(this.servicesPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          dirs.push(entry.name);
        }
      }
    } catch (error: any) {
      console.error('Failed to read services directory:', error.message);
    }

    return dirs;
  }

  /**
   * Create service candidate from directory
   */
  private async createServiceCandidate(serviceDir: string): Promise<ServiceCandidate> {
    const servicePath = path.join(this.servicesPath, serviceDir);
    
    // Read service files
    const files = await this.readServiceFiles(servicePath);
    const packageJson = await this.readPackageJson(servicePath);
    
    return {
      name: serviceDir,
      path: servicePath,
      type: this.determineServiceType(files, packageJson),
      codebase: {
        files: files.map(f => f.content).join('\n'),
        dependencies: packageJson?.dependencies ? Object.keys(packageJson.dependencies) : [],
        architecture: this.analyzeArchitecture(files),
        tests: this.analyzeTests(files),
        documentation: this.analyzeDocumentation(files)
      },
      runtime: {
        healthEndpoint: this.findHealthEndpoint(files),
        metrics: this.findMetrics(files),
        logs: this.findLogging(files),
        performance: await this.measurePerformance(servicePath)
      },
      metadata: {
        version: packageJson?.version || '0.0.0',
        maintainer: packageJson?.author || 'unknown',
        lastUpdated: await this.getLastModified(servicePath),
        constitutionalCompliance: this.checkConstitutionalCompliance(files)
      }
    };
  }

  /**
   * Read all service files
   */
  private async readServiceFiles(servicePath: string): Promise<Array<{name: string, content: string}>> {
    const files: Array<{name: string, content: string}> = [];
    
    try {
      const entries = await fs.readdir(servicePath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && this.isCodeFile(entry.name)) {
          try {
            const content = await fs.readFile(path.join(servicePath, entry.name), 'utf-8');
            files.push({ name: entry.name, content });
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    } catch (error) {
      // Service directory might not exist or be accessible
    }

    return files;
  }

  /**
   * Check if file is a code file
   */
  private isCodeFile(filename: string): boolean {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.yml', '.yaml'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }

  /**
   * Read package.json
   */
  private async readPackageJson(servicePath: string): Promise<any> {
    try {
      const packagePath = path.join(servicePath, 'package.json');
      const content = await fs.readFile(packagePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Determine service type
   */
  private determineServiceType(files: Array<{name: string, content: string}>, packageJson: any): ServiceCandidate['type'] {
    if (files.some(f => f.name.includes('docker') || f.name === 'Dockerfile')) {
      return 'microservice';
    }
    if (files.some(f => f.content.includes('express') || f.content.includes('fastify'))) {
      return 'api';
    }
    if (files.some(f => f.content.includes('react') || f.content.includes('vue'))) {
      return 'frontend';
    }
    if (files.some(f => f.name.includes('schema') || f.content.includes('database'))) {
      return 'database';
    }
    return 'infrastructure';
  }

  /**
   * Analyze architecture patterns
   */
  private analyzeArchitecture(files: Array<{name: string, content: string}>): any {
    const allContent = files.map(f => f.content).join('\n');
    
    return {
      hasErrorHandling: allContent.includes('try') && allContent.includes('catch'),
      hasMiddleware: allContent.includes('middleware') || allContent.includes('use('),
      hasRouting: allContent.includes('router') || allContent.includes('app.get'),
      hasValidation: allContent.includes('validate') || allContent.includes('joi') || allContent.includes('yup'),
      hasLogging: allContent.includes('console.log') || allContent.includes('logger'),
      hasHealthCheck: allContent.includes('/health') || allContent.includes('health'),
      hasDockerization: files.some(f => f.name === 'Dockerfile'),
      hasTests: files.some(f => f.name.includes('test') || f.name.includes('spec'))
    };
  }

  /**
   * Analyze test coverage
   */
  private analyzeTests(files: Array<{name: string, content: string}>): any {
    const testFiles = files.filter(f => 
      f.name.includes('test') || f.name.includes('spec') || f.content.includes('describe(')
    );

    return {
      hasTests: testFiles.length > 0,
      testFiles: testFiles.length,
      coverage: testFiles.length > 0 ? 'unknown' : 'none'
    };
  }

  /**
   * Analyze documentation
   */
  private analyzeDocumentation(files: Array<{name: string, content: string}>): any {
    const docFiles = files.filter(f => f.name.toLowerCase().includes('readme'));
    
    return {
      hasReadme: docFiles.length > 0,
      hasApiDocs: files.some(f => f.content.includes('swagger') || f.content.includes('openapi')),
      quality: docFiles.length > 0 ? 'basic' : 'none'
    };
  }

  /**
   * Find health endpoint
   */
  private findHealthEndpoint(files: Array<{name: string, content: string}>): string | undefined {
    for (const file of files) {
      if (file.content.includes('/health')) {
        return '/health';
      }
    }
    return undefined;
  }

  /**
   * Find metrics implementation
   */
  private findMetrics(files: Array<{name: string, content: string}>): any {
    const allContent = files.map(f => f.content).join('\n');
    
    return {
      hasMetrics: allContent.includes('metrics') || allContent.includes('prometheus'),
      type: allContent.includes('prometheus') ? 'prometheus' : 'basic'
    };
  }

  /**
   * Find logging implementation
   */
  private findLogging(files: Array<{name: string, content: string}>): any {
    const allContent = files.map(f => f.content).join('\n');
    
    return {
      hasLogging: allContent.includes('console.log') || allContent.includes('logger'),
      structured: allContent.includes('winston') || allContent.includes('bunyan')
    };
  }

  /**
   * Measure performance (mock implementation)
   */
  private async measurePerformance(servicePath: string): Promise<any> {
    // In real implementation, this would start the service and measure
    return {
      responseTime: Math.random() * 500 + 50, // 50-550ms
      memoryUsage: Math.random() * 100 + 50,  // 50-150MB
      cpuUsage: Math.random() * 50 + 10       // 10-60%
    };
  }

  /**
   * Get last modified date
   */
  private async getLastModified(servicePath: string): Promise<Date> {
    try {
      const stats = await fs.stat(servicePath);
      return stats.mtime;
    } catch (error) {
      return new Date();
    }
  }

  /**
   * Check constitutional compliance
   */
  private checkConstitutionalCompliance(files: Array<{name: string, content: string}>): boolean {
    const allContent = files.map(f => f.content).join('\n');
    
    return allContent.includes('constitutional') || 
           allContent.includes('guardian') || 
           allContent.includes('oracle') ||
           allContent.includes('ubuntu');
  }

  /**
   * Categorize service based on evaluation
   */
  private categorizeService(evaluation: any, result: ServiceScanResult): void {
    switch (evaluation.maturityLevel) {
      case ServiceMaturityLevel.SUPREME:
        result.supremeServices.push(evaluation.serviceId);
        break;
      case ServiceMaturityLevel.ADVANCED:
        result.advancedServices.push(evaluation.serviceId);
        break;
      case ServiceMaturityLevel.INTERMEDIATE:
        // Don't add to basic, but not advanced either
        break;
      case ServiceMaturityLevel.BASIC:
        result.basicServices.push(evaluation.serviceId);
        break;
    }

    if (evaluation.healthStatus === 'infected' || evaluation.healthStatus === 'rejected') {
      result.infectedServices.push(evaluation.serviceId);
    }
  }

  /**
   * Calculate overall system health
   */
  private calculateSystemHealth(evaluations: any[]): ServiceScanResult['systemHealth'] {
    if (evaluations.length === 0) {
      return {
        overallScore: 0,
        riskLevel: 'critical',
        vulnerabilities: ['No services evaluated']
      };
    }

    const avgScore = evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length;
    const infectedCount = evaluations.filter(e => e.healthStatus === 'infected').length;
    const rejectedCount = evaluations.filter(e => e.healthStatus === 'rejected').length;
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const vulnerabilities: string[] = [];

    if (rejectedCount > evaluations.length * 0.3) {
      riskLevel = 'critical';
      vulnerabilities.push(`${rejectedCount} services rejected - major security risk`);
    } else if (infectedCount > evaluations.length * 0.2) {
      riskLevel = 'high';
      vulnerabilities.push(`${infectedCount} services infected - spreading risk`);
    } else if (avgScore < 60) {
      riskLevel = 'medium';
      vulnerabilities.push('Low average service quality');
    }

    // Check for specific vulnerabilities
    const basicCount = evaluations.filter(e => e.maturityLevel === ServiceMaturityLevel.BASIC).length;
    if (basicCount > evaluations.length * 0.4) {
      vulnerabilities.push(`${basicCount} basic services need advancement`);
    }

    return {
      overallScore: avgScore,
      riskLevel,
      vulnerabilities
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(evaluations: any[]): ServiceScanResult['recommendations'] {
    const recommendations = {
      upgrade: [] as string[],
      quarantine: [] as string[],
      reject: [] as string[]
    };

    for (const evaluation of evaluations) {
      switch (evaluation.admissionDecision) {
        case 'rejected':
          recommendations.reject.push(evaluation.serviceId);
          break;
        case 'conditional':
          recommendations.quarantine.push(evaluation.serviceId);
          break;
        case 'approved':
          if (evaluation.maturityLevel === ServiceMaturityLevel.BASIC) {
            recommendations.upgrade.push(evaluation.serviceId);
          }
          break;
      }
    }

    return recommendations;
  }

  /**
   * Log scan results
   */
  private logScanResults(result: ServiceScanResult): void {
    console.log('\n📊 SCAN RESULTS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total Services: ${result.totalServices}`);
    console.log(`Supreme Services: ${result.supremeServices.length}`);
    console.log(`Advanced Services: ${result.advancedServices.length}`);
    console.log(`Basic Services: ${result.basicServices.length}`);
    console.log(`Infected Services: ${result.infectedServices.length}`);
    console.log('');
    console.log(`System Health: ${result.systemHealth.overallScore.toFixed(1)}/100`);
    console.log(`Risk Level: ${result.systemHealth.riskLevel.toUpperCase()}`);
    
    if (result.systemHealth.vulnerabilities.length > 0) {
      console.log('\n⚠️  VULNERABILITIES:');
      result.systemHealth.vulnerabilities.forEach(vuln => {
        console.log(`   • ${vuln}`);
      });
    }

    if (result.basicServices.length > 0) {
      console.log('\n🔧 BASIC SERVICES NEEDING ADVANCEMENT:');
      result.basicServices.forEach(service => {
        console.log(`   • ${service}`);
      });
    }

    if (result.infectedServices.length > 0) {
      console.log('\n🦠 INFECTED SERVICES (QUARANTINE REQUIRED):');
      result.infectedServices.forEach(service => {
        console.log(`   • ${service}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════════');
  }
}

// Export scanner
export const serviceScanner = new ServiceScanner();
export default serviceScanner;