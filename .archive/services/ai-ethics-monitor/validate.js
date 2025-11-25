#!/usr/bin/env node

/**
 * AI Ethics Monitor Service Validation Script
 * Comprehensive testing and validation for Phase 5.3 AI/ML Integration completion
 */

const { AIEthicsMonitor } = require('./index');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class AIEthicsMonitorValidator {
  constructor() {
    this.service = null;
    this.prisma = null;
    this.results = {
      tests: [],
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async initialize() {
    console.log('🚀 Initializing AI Ethics Monitor Service for validation...\n');

    try {
      this.service = new AIEthicsMonitor();
      this.prisma = new PrismaClient();

      // Wait for service initialization
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('✅ Service initialized successfully\n');
      return true;
    } catch (error) {
      console.error('❌ Service initialization failed:', error.message);
      return false;
    }
  }

  async runAllValidations() {
    console.log('🔍 Running comprehensive AI Ethics Monitor validations...\n');

    const validations = [
      this.validateServiceHealth.bind(this),
      this.validateDatabaseConnection.bind(this),
      this.validateBiasDetection.bind(this),
      this.validateConstitutionalCompliance.bind(this),
      this.validateFairnessAssessment.bind(this),
      this.validateTransparencyLogging.bind(this),
      this.validateAuditSystem.bind(this),
      this.validateInterventionSystem.bind(this),
      this.validateMetricsAggregation.bind(this),
      this.validateIntegrationEndpoints.bind(this),
      this.validatePerformanceMetrics.bind(this),
      this.validateSecurityFeatures.bind(this)
    ];

    for (const validation of validations) {
      try {
        const result = await validation();
        this.results.tests.push(result);

        if (result.passed) {
          this.results.passed++;
          console.log(`✅ ${result.name}: PASSED`);
        } else {
          this.results.failed++;
          console.log(`❌ ${result.name}: FAILED - ${result.error}`);
          this.results.errors.push(result.error);
        }
      } catch (error) {
        this.results.failed++;
        this.results.errors.push(error.message);
        console.log(`❌ ${validation.name}: ERROR - ${error.message}`);
      }
    }

    console.log('\n📊 Validation Summary:');
    console.log(`   Total Tests: ${this.results.tests.length}`);
    console.log(`   Passed: ${this.results.passed}`);
    console.log(`   Failed: ${this.results.failed}`);
    console.log(`   Success Rate: ${((this.results.passed / this.results.tests.length) * 100).toFixed(1)}%\n`);

    return this.results.failed === 0;
  }

  async validateServiceHealth() {
    try {
      const response = await axios.get('http://localhost:3005/health');
      const isHealthy = response.data.status === 'healthy';

      return {
        name: 'Service Health Check',
        passed: isHealthy,
        error: isHealthy ? null : 'Service reported unhealthy status'
      };
    } catch (error) {
      return {
        name: 'Service Health Check',
        passed: false,
        error: `Health check failed: ${error.message}`
      };
    }
  }

  async validateDatabaseConnection() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        name: 'Database Connection',
        passed: true
      };
    } catch (error) {
      return {
        name: 'Database Connection',
        passed: false,
        error: `Database connection failed: ${error.message}`
      };
    }
  }

  async validateBiasDetection() {
    try {
      const testDecision = {
        decisionId: 'validation_bias_001',
        serviceName: 'content-generation',
        modelName: 'gpt-4',
        requestType: 'content_generation',
        inputData: { topic: 'Gender equality in tech' },
        outputData: {
          content: 'Men and women both excel in technology fields...',
          metadata: { wordCount: 50 }
        },
        processingTime: 500,
        tokenCount: 100
      };

      const result = await this.service.logDecision(testDecision);

      const hasBiasAnalysis = result.biasAnalysis !== undefined;
      const hasConfidence = result.biasAnalysis?.confidenceScore !== undefined;

      return {
        name: 'Bias Detection',
        passed: hasBiasAnalysis && hasConfidence,
        error: hasBiasAnalysis ? null : 'Bias analysis not performed'
      };
    } catch (error) {
      return {
        name: 'Bias Detection',
        passed: false,
        error: `Bias detection failed: ${error.message}`
      };
    }
  }

  async validateConstitutionalCompliance() {
    try {
      const testDecision = {
        decisionId: 'validation_const_001',
        serviceName: 'content-generation',
        inputData: { topic: 'African tech innovation' },
        outputData: {
          content: 'African developers are leading innovation...',
          metadata: { culturalContext: 'African' }
        }
      };

      const result = await this.service.logDecision(testDecision);

      const hasConstitutionalChecks = Array.isArray(result.constitutionalChecks);
      const hasAfricanSovereignty = result.constitutionalChecks?.some(
        check => check.principle === 'AFRICAN_SOVEREIGNTY'
      );

      return {
        name: 'Constitutional Compliance',
        passed: hasConstitutionalChecks && hasAfricanSovereignty,
        error: hasConstitutionalChecks ? 'Missing African sovereignty check' : 'No constitutional checks performed'
      };
    } catch (error) {
      return {
        name: 'Constitutional Compliance',
        passed: false,
        error: `Constitutional compliance check failed: ${error.message}`
      };
    }
  }

  async validateFairnessAssessment() {
    try {
      const testDecision = {
        decisionId: 'validation_fair_001',
        serviceName: 'personalization-engine',
        inputData: {
          userProfiles: [
            { userId: 'user1', gender: 'female', age: 25 },
            { userId: 'user2', gender: 'male', age: 30 }
          ]
        },
        outputData: {
          recommendations: [
            { userId: 'user1', score: 0.85 },
            { userId: 'user2', score: 0.82 }
          ]
        }
      };

      const result = await this.service.logDecision(testDecision);

      const hasFairnessMetrics = result.fairnessAssessment !== undefined;
      const hasDemographicParity = result.fairnessAssessment?.demographicParity !== undefined;

      return {
        name: 'Fairness Assessment',
        passed: hasFairnessMetrics && hasDemographicParity,
        error: hasFairnessMetrics ? null : 'Fairness assessment not performed'
      };
    } catch (error) {
      return {
        name: 'Fairness Assessment',
        passed: false,
        error: `Fairness assessment failed: ${error.message}`
      };
    }
  }

  async validateTransparencyLogging() {
    try {
      const decisionId = 'validation_trans_001';

      await this.service.logDecision({
        decisionId,
        serviceName: 'test-service',
        inputData: { test: 'data' },
        outputData: { result: 'output' }
      });

      // Check if transparency log was created
      const logs = await this.prisma.transparencyLog.findMany({
        where: { decisionId }
      });

      return {
        name: 'Transparency Logging',
        passed: logs.length > 0,
        error: logs.length > 0 ? null : 'No transparency logs created'
      };
    } catch (error) {
      return {
        name: 'Transparency Logging',
        passed: false,
        error: `Transparency logging failed: ${error.message}`
      };
    }
  }

  async validateAuditSystem() {
    try {
      const auditResult = await this.service.processAudit({
        period: '1d',
        services: ['content-generation']
      });

      const hasAuditData = auditResult.totalDecisions !== undefined;
      const hasFindings = Array.isArray(auditResult.findings);

      return {
        name: 'Audit System',
        passed: hasAuditData && hasFindings,
        error: hasAuditData ? null : 'Audit system not functioning'
      };
    } catch (error) {
      return {
        name: 'Audit System',
        passed: false,
        error: `Audit system failed: ${error.message}`
      };
    }
  }

  async validateInterventionSystem() {
    try {
      // Create a high-risk decision that should trigger intervention
      const highRiskDecision = {
        decisionId: 'validation_int_001',
        serviceName: 'content-generation',
        inputData: { topic: 'Biased content test' },
        outputData: {
          content: 'Highly discriminatory content that violates multiple principles...',
          metadata: { riskLevel: 'CRITICAL' }
        }
      };

      await this.service.logDecision(highRiskDecision);

      // Check if intervention was triggered
      const interventions = await this.prisma.interventionLog.findMany({
        where: { decisionId: 'validation_int_001' }
      });

      return {
        name: 'Intervention System',
        passed: interventions.length > 0,
        error: interventions.length > 0 ? null : 'No interventions triggered for high-risk decision'
      };
    } catch (error) {
      return {
        name: 'Intervention System',
        passed: false,
        error: `Intervention system failed: ${error.message}`
      };
    }
  }

  async validateMetricsAggregation() {
    try {
      const metrics = await this.service.getEthicsMetrics({
        period: '1d',
        metric: 'bias'
      });

      const hasBiasMetrics = metrics.bias !== undefined;
      const hasTotalAnalyses = metrics.bias?.totalAnalyses !== undefined;

      return {
        name: 'Metrics Aggregation',
        passed: hasBiasMetrics && hasTotalAnalyses,
        error: hasBiasMetrics ? null : 'Metrics aggregation not working'
      };
    } catch (error) {
      return {
        name: 'Metrics Aggregation',
        passed: false,
        error: `Metrics aggregation failed: ${error.message}`
      };
    }
  }

  async validateIntegrationEndpoints() {
    try {
      const endpoints = [
        '/api/decisions',
        '/api/ethics/bias/analyze',
        '/api/compliance/check',
        '/api/audit/run',
        '/api/metrics',
        '/api/explain/decision'
      ];

      let allEndpointsWorking = true;
      const failedEndpoints = [];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`http://localhost:3005${endpoint}`, {
            timeout: 5000
          });
          if (response.status !== 200 && response.status !== 400) {
            // 400 is expected for endpoints requiring parameters
            allEndpointsWorking = false;
            failedEndpoints.push(endpoint);
          }
        } catch (error) {
          allEndpointsWorking = false;
          failedEndpoints.push(endpoint);
        }
      }

      return {
        name: 'Integration Endpoints',
        passed: allEndpointsWorking,
        error: allEndpointsWorking ? null : `Failed endpoints: ${failedEndpoints.join(', ')}`
      };
    } catch (error) {
      return {
        name: 'Integration Endpoints',
        passed: false,
        error: `Endpoint validation failed: ${error.message}`
      };
    }
  }

  async validatePerformanceMetrics() {
    try {
      const startTime = Date.now();

      // Perform multiple operations to test performance
      for (let i = 0; i < 10; i++) {
        await this.service.logDecision({
          decisionId: `perf_test_${i}`,
          serviceName: 'performance-test',
          inputData: { test: `data_${i}` },
          outputData: { result: `output_${i}` }
        });
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTimePerOperation = totalTime / 10;

      // Performance threshold: average < 500ms per operation
      const meetsPerformanceThreshold = avgTimePerOperation < 500;

      return {
        name: 'Performance Metrics',
        passed: meetsPerformanceThreshold,
        error: meetsPerformanceThreshold ? null : `Average operation time: ${avgTimePerOperation.toFixed(2)}ms (threshold: 500ms)`
      };
    } catch (error) {
      return {
        name: 'Performance Metrics',
        passed: false,
        error: `Performance test failed: ${error.message}`
      };
    }
  }

  async validateSecurityFeatures() {
    try {
      // Test rate limiting
      const requests = [];
      for (let i = 0; i < 150; i++) {
        requests.push(
          axios.post('http://localhost:3005/api/decisions', {
            decisionId: `security_test_${i}`,
            serviceName: 'security-test',
            inputData: {},
            outputData: {}
          }).catch(error => error)
        );
      }

      const results = await Promise.all(requests);
      const rateLimitedRequests = results.filter(result =>
        result.response?.status === 429
      );

      const hasRateLimiting = rateLimitedRequests.length > 0;

      // Test input sanitization
      const maliciousInput = {
        decisionId: 'security_malicious',
        serviceName: 'security-test',
        inputData: {
          script: '<script>alert("xss")</script>',
          sql: 'DROP TABLE users;',
          apiKey: 'sk-secret-key-here'
        },
        outputData: { result: 'test' }
      };

      await this.service.logDecision(maliciousInput);

      // Check if sensitive data was sanitized
      const loggedDecision = await this.prisma.aIDecision.findUnique({
        where: { decisionId: 'security_malicious' }
      });

      const hasSanitization = loggedDecision?.inputData?.apiKey === '[REDACTED]';

      return {
        name: 'Security Features',
        passed: hasRateLimiting && hasSanitization,
        error: !hasRateLimiting ? 'Rate limiting not working' : !hasSanitization ? 'Input sanitization failed' : null
      };
    } catch (error) {
      return {
        name: 'Security Features',
        passed: false,
        error: `Security validation failed: ${error.message}`
      };
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      service: 'AI Ethics Monitor',
      phase: '5.3 AI/ML Integration',
      validation: this.results,
      summary: {
        overallStatus: this.results.failed === 0 ? 'PASSED' : 'FAILED',
        completionPercentage: ((this.results.passed / this.results.tests.length) * 100).toFixed(1) + '%',
        criticalIssues: this.results.errors.filter(error =>
          error.includes('CRITICAL') || error.includes('FAILED')
        )
      }
    };

    const reportPath = path.join(__dirname, 'validation-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`📄 Validation report saved to: ${reportPath}`);

    return report;
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up validation data...');

    try {
      // Remove test decisions
      await this.prisma.aIDecision.deleteMany({
        where: {
          decisionId: {
            startsWith: 'validation_'
          }
        }
      });

      await this.prisma.aIDecision.deleteMany({
        where: {
          decisionId: {
            startsWith: 'perf_test_'
          }
        }
      });

      await this.prisma.aIDecision.deleteMany({
        where: {
          decisionId: {
            startsWith: 'security_'
          }
        }
      });

      console.log('✅ Test data cleaned up');
    } catch (error) {
      console.warn('⚠️  Cleanup warning:', error.message);
    }

    if (this.service) {
      await this.service.disconnect();
    }

    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }
}

// Main execution
async function main() {
  const validator = new AIEthicsMonitorValidator();

  try {
    console.log('🎯 AI Ethics Monitor Service - Phase 5.3 Validation\n');
    console.log('=' .repeat(60));

    const initialized = await validator.initialize();
    if (!initialized) {
      console.error('❌ Validation failed: Could not initialize service');
      process.exit(1);
    }

    const allPassed = await validator.runAllValidations();

    console.log('=' .repeat(60));

    if (allPassed) {
      console.log('🎉 PHASE 5.3 AI/ML INTEGRATION VALIDATION: PASSED');
      console.log('✅ AI Ethics & Bias Monitoring Service is fully operational');
      console.log('✅ All constitutional AI compliance features working');
      console.log('✅ Ready for Phase 5.4 Core Business Features');
    } else {
      console.log('❌ PHASE 5.3 AI/ML INTEGRATION VALIDATION: FAILED');
      console.log('⚠️  Some validations failed. Check the report for details.');
    }

    await validator.generateReport();
    await validator.cleanup();

    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('💥 Validation script error:', error);
    await validator.cleanup();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AIEthicsMonitorValidator;