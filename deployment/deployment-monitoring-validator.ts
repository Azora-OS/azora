#!/usr/bin/env node

/**
 * Deployment Monitoring Validator
 * 
 * Validates that deployment monitoring is properly configured:
 * - Prometheus rules are loaded
 * - Alertmanager is configured
 * - Grafana dashboards are available
 * - Metrics are being collected
 */

import axios from 'axios';

interface ValidationResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://localhost:9090';
const ALERTMANAGER_URL = process.env.ALERTMANAGER_URL || 'http://localhost:9093';
const GRAFANA_URL = process.env.GRAFANA_URL || 'http://localhost:3000';

const results: ValidationResult[] = [];

/**
 * Validate Prometheus is accessible
 */
async function validatePrometheus(): Promise<void> {
  try {
    const response = await axios.get(`${PROMETHEUS_URL}/-/healthy`);
    if (response.status === 200) {
      results.push({
        name: 'Prometheus Accessibility',
        status: 'pass',
        message: 'Prometheus is accessible and healthy'
      });
    }
  } catch (error) {
    results.push({
      name: 'Prometheus Accessibility',
      status: 'fail',
      message: `Prometheus is not accessible at ${PROMETHEUS_URL}`,
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Validate deployment monitoring rules are loaded
 */
async function validateDeploymentRules(): Promise<void> {
  try {
    const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
    const rules = response.data.data.groups || [];
    
    const deploymentGroup = rules.find((g: any) => g.name === 'deployment_monitoring');
    
    if (deploymentGroup) {
      const ruleCount = deploymentGroup.rules.length;
      results.push({
        name: 'Deployment Monitoring Rules',
        status: 'pass',
        message: `Deployment monitoring rules loaded (${ruleCount} rules)`,
        details: `Rules: ${deploymentGroup.rules.map((r: any) => r.alert).join(', ')}`
      });
    } else {
      results.push({
        name: 'Deployment Monitoring Rules',
        status: 'fail',
        message: 'Deployment monitoring rules not found in Prometheus'
      });
    }
  } catch (error) {
    results.push({
      name: 'Deployment Monitoring Rules',
      status: 'fail',
      message: 'Failed to fetch Prometheus rules',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Validate error rate metrics are available
 */
async function validateErrorRateMetrics(): Promise<void> {
  try {
    const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
      params: {
        query: 'http_requests_total'
      }
    });
    
    if (response.data.data.result && response.data.data.result.length > 0) {
      results.push({
        name: 'Error Rate Metrics',
        status: 'pass',
        message: 'Error rate metrics are being collected',
        details: `Found ${response.data.data.result.length} metric series`
      });
    } else {
      results.push({
        name: 'Error Rate Metrics',
        status: 'warning',
        message: 'Error rate metrics not yet available (may be normal on startup)'
      });
    }
  } catch (error) {
    results.push({
      name: 'Error Rate Metrics',
      status: 'fail',
      message: 'Failed to query error rate metrics',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Validate latency metrics are available
 */
async function validateLatencyMetrics(): Promise<void> {
  try {
    const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
      params: {
        query: 'http_request_duration_ms_bucket'
      }
    });
    
    if (response.data.data.result && response.data.data.result.length > 0) {
      results.push({
        name: 'Latency Metrics',
        status: 'pass',
        message: 'Latency metrics are being collected',
        details: `Found ${response.data.data.result.length} metric series`
      });
    } else {
      results.push({
        name: 'Latency Metrics',
        status: 'warning',
        message: 'Latency metrics not yet available (may be normal on startup)'
      });
    }
  } catch (error) {
    results.push({
      name: 'Latency Metrics',
      status: 'fail',
      message: 'Failed to query latency metrics',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Validate database metrics are available
 */
async function validateDatabaseMetrics(): Promise<void> {
  try {
    const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
      params: {
        query: 'db_query_duration_ms_bucket'
      }
    });
    
    if (response.data.data.result && response.data.data.result.length > 0) {
      results.push({
        name: 'Database Metrics',
        status: 'pass',
        message: 'Database metrics are being collected',
        details: `Found ${response.data.data.result.length} metric series`
      });
    } else {
      results.push({
        name: 'Database Metrics',
        status: 'warning',
        message: 'Database metrics not yet available (may be normal on startup)'
      });
    }
  } catch (error) {
    results.push({
      name: 'Database Metrics',
      status: 'fail',
      message: 'Failed to query database metrics',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Validate resource metrics are available
 */
async function validateResourceMetrics(): Promise<void> {
  try {
    const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
      params: {
        query: 'container_memory_usage_bytes'
      }
    });
    
    if (response.data.data.result && response.data.data.result.length > 0) {
      results.push({
        name: 'Resource Metrics',
        status: 'pass',
        message: 'Resource metrics are being collected',
        details: `Found ${response.data.data.result.length} metric series`
      });
    } else {
      results.push({
        name: 'Resource Metrics',
        status: 'warning',
        message: 'Resource metrics not yet available (may be normal on startup)'
      });
    }
  } catch (error) {
    results.push({
      name: 'Resource Metrics',
      status: 'fail',
      message: 'Failed to query resource metrics',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Validate Alertmanager is accessible
 */
async function validateAlertmanager(): Promise<void> {
  try {
    const response = await axios.get(`${ALERTMANAGER_URL}/api/v1/status`);
    if (response.status === 200) {
      results.push({
        name: 'Alertmanager Accessibility',
        status: 'pass',
        message: 'Alertmanager is accessible and healthy'
      });
    }
  } catch (error) {
    results.push({
      name: 'Alertmanager Accessibility',
      status: 'fail',
      message: `Alertmanager is not accessible at ${ALERTMANAGER_URL}`,
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Validate Alertmanager receivers are configured
 */
async function validateAlertmanagerReceivers(): Promise<void> {
  try {
    const response = await axios.get(`${ALERTMANAGER_URL}/api/v1/status`);
    const config = response.data.data.config;
    
    if (config && config.receivers && config.receivers.length > 0) {
      results.push({
        name: 'Alertmanager Receivers',
        status: 'pass',
        message: `Alertmanager receivers configured (${config.receivers.length} receivers)`,
        details: `Receivers: ${config.receivers.map((r: any) => r.name).join(', ')}`
      });
    } else {
      results.push({
        name: 'Alertmanager Receivers',
        status: 'warning',
        message: 'No receivers configured in Alertmanager'
      });
    }
  } catch (error) {
    results.push({
      name: 'Alertmanager Receivers',
      status: 'fail',
      message: 'Failed to fetch Alertmanager configuration',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Validate Grafana is accessible
 */
async function validateGrafana(): Promise<void> {
  try {
    const response = await axios.get(`${GRAFANA_URL}/api/health`);
    if (response.status === 200) {
      results.push({
        name: 'Grafana Accessibility',
        status: 'pass',
        message: 'Grafana is accessible and healthy'
      });
    }
  } catch (error) {
    results.push({
      name: 'Grafana Accessibility',
      status: 'fail',
      message: `Grafana is not accessible at ${GRAFANA_URL}`,
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Validate Grafana dashboards are available
 */
async function validateGrafanaDashboards(): Promise<void> {
  try {
    const response = await axios.get(`${GRAFANA_URL}/api/search`, {
      params: {
        query: 'deployment'
      }
    });
    
    const dashboards = response.data || [];
    const deploymentDashboard = dashboards.find((d: any) => 
      d.title && d.title.toLowerCase().includes('deployment')
    );
    
    if (deploymentDashboard) {
      results.push({
        name: 'Grafana Dashboards',
        status: 'pass',
        message: 'Deployment monitoring dashboard is available',
        details: `Dashboard: ${deploymentDashboard.title}`
      });
    } else {
      results.push({
        name: 'Grafana Dashboards',
        status: 'warning',
        message: 'Deployment monitoring dashboard not found (may need to be imported)'
      });
    }
  } catch (error) {
    results.push({
      name: 'Grafana Dashboards',
      status: 'fail',
      message: 'Failed to fetch Grafana dashboards',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Print validation results
 */
function printResults(): void {
  console.log('\n' + '='.repeat(80));
  console.log('DEPLOYMENT MONITORING VALIDATION REPORT');
  console.log('='.repeat(80) + '\n');
  
  let passCount = 0;
  let failCount = 0;
  let warningCount = 0;
  
  results.forEach(result => {
    const icon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⚠';
    const color = result.status === 'pass' ? '\x1b[32m' : result.status === 'fail' ? '\x1b[31m' : '\x1b[33m';
    const reset = '\x1b[0m';
    
    console.log(`${color}${icon}${reset} ${result.name}`);
    console.log(`  ${result.message}`);
    if (result.details) {
      console.log(`  Details: ${result.details}`);
    }
    console.log();
    
    if (result.status === 'pass') passCount++;
    else if (result.status === 'fail') failCount++;
    else warningCount++;
  });
  
  console.log('='.repeat(80));
  console.log(`Summary: ${passCount} passed, ${warningCount} warnings, ${failCount} failed`);
  console.log('='.repeat(80) + '\n');
  
  if (failCount > 0) {
    process.exit(1);
  }
}

/**
 * Main validation function
 */
async function main(): Promise<void> {
  console.log('Starting deployment monitoring validation...\n');
  
  await validatePrometheus();
  await validateDeploymentRules();
  await validateErrorRateMetrics();
  await validateLatencyMetrics();
  await validateDatabaseMetrics();
  await validateResourceMetrics();
  await validateAlertmanager();
  await validateAlertmanagerReceivers();
  await validateGrafana();
  await validateGrafanaDashboards();
  
  printResults();
}

main().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});
