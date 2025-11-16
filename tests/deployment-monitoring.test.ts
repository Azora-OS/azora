/**
 * Deployment Monitoring Tests
 * 
 * Tests for deployment monitoring functionality:
 * - Error rate monitoring
 * - Latency monitoring
 * - Resource monitoring
 * - Alert triggering
 */

import axios from 'axios';

const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://localhost:9090';
const ALERTMANAGER_URL = process.env.ALERTMANAGER_URL || 'http://localhost:9093';

describe('Deployment Monitoring', () => {
  describe('Error Rate Monitoring', () => {
    test('should detect high error rate', async () => {
      const query = `(sum(rate(http_requests_total{status=~"5.."}[5m])) by (job) / sum(rate(http_requests_total[5m])) by (job))`;
      
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
        params: { query }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('success');
    });

    test('should have error rate alert rule', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      expect(deploymentGroup).toBeDefined();
      
      const errorRateAlerts = deploymentGroup.rules.filter(
        (r: any) => r.alert && r.alert.includes('ErrorRate')
      );
      
      expect(errorRateAlerts.length).toBeGreaterThan(0);
    });

    test('should have critical error rate threshold', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const criticalAlert = deploymentGroup.rules.find(
        (r: any) => r.alert === 'DeploymentCriticalErrorRate'
      );
      
      expect(criticalAlert).toBeDefined();
      expect(criticalAlert.labels.severity).toBe('critical');
      expect(criticalAlert.labels.action).toBe('rollback');
    });
  });

  describe('Latency Monitoring', () => {
    test('should detect high latency', async () => {
      const query = `histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (job, le))`;
      
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
        params: { query }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('success');
    });

    test('should have latency alert rules', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const latencyAlerts = deploymentGroup.rules.filter(
        (r: any) => r.alert && r.alert.includes('Latency')
      );
      
      expect(latencyAlerts.length).toBeGreaterThan(0);
    });

    test('should have critical latency threshold', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const criticalAlert = deploymentGroup.rules.find(
        (r: any) => r.alert === 'DeploymentCriticalLatency'
      );
      
      expect(criticalAlert).toBeDefined();
      expect(criticalAlert.labels.severity).toBe('critical');
      expect(criticalAlert.labels.action).toBe('rollback');
    });
  });

  describe('Database Monitoring', () => {
    test('should detect slow database queries', async () => {
      const query = `histogram_quantile(0.95, sum(rate(db_query_duration_ms_bucket[5m])) by (le))`;
      
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
        params: { query }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('success');
    });

    test('should have database query alert rules', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const dbAlerts = deploymentGroup.rules.filter(
        (r: any) => r.alert && r.alert.includes('Queries')
      );
      
      expect(dbAlerts.length).toBeGreaterThan(0);
    });

    test('should have database connection pool alert', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const poolAlert = deploymentGroup.rules.find(
        (r: any) => r.alert === 'DeploymentDatabaseConnectionPoolExhausted'
      );
      
      expect(poolAlert).toBeDefined();
      expect(poolAlert.labels.severity).toBe('critical');
    });
  });

  describe('Resource Monitoring', () => {
    test('should detect high memory usage', async () => {
      const query = `(container_memory_usage_bytes / container_spec_memory_limit_bytes)`;
      
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
        params: { query }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('success');
    });

    test('should detect high CPU usage', async () => {
      const query = `(rate(container_cpu_usage_seconds_total[5m]) / container_spec_cpu_quota)`;
      
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
        params: { query }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('success');
    });

    test('should have memory usage alert rules', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const memoryAlerts = deploymentGroup.rules.filter(
        (r: any) => r.alert && r.alert.includes('Memory')
      );
      
      expect(memoryAlerts.length).toBeGreaterThan(0);
    });

    test('should have CPU usage alert rules', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const cpuAlerts = deploymentGroup.rules.filter(
        (r: any) => r.alert && r.alert.includes('CPU')
      );
      
      expect(cpuAlerts.length).toBeGreaterThan(0);
    });
  });

  describe('Deployment Health Monitoring', () => {
    test('should have pod restart rate alert', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const restartAlert = deploymentGroup.rules.find(
        (r: any) => r.alert === 'DeploymentHighPodRestartRate'
      );
      
      expect(restartAlert).toBeDefined();
      expect(restartAlert.labels.severity).toBe('warning');
    });

    test('should have pod crash loop alert', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const crashAlert = deploymentGroup.rules.find(
        (r: any) => r.alert === 'DeploymentPodCrashLoop'
      );
      
      expect(crashAlert).toBeDefined();
      expect(crashAlert.labels.severity).toBe('critical');
    });

    test('should have deployment replicas mismatch alert', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const replicasAlert = deploymentGroup.rules.find(
        (r: any) => r.alert === 'DeploymentReplicasMismatch'
      );
      
      expect(replicasAlert).toBeDefined();
      expect(replicasAlert.labels.severity).toBe('warning');
    });

    test('should have rollout stuck alert', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const rolloutAlert = deploymentGroup.rules.find(
        (r: any) => r.alert === 'DeploymentRolloutStuck'
      );
      
      expect(rolloutAlert).toBeDefined();
      expect(rolloutAlert.labels.severity).toBe('critical');
    });
  });

  describe('Traffic Monitoring', () => {
    test('should detect traffic drop', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const trafficAlert = deploymentGroup.rules.find(
        (r: any) => r.alert === 'DeploymentTrafficDrop'
      );
      
      expect(trafficAlert).toBeDefined();
      expect(trafficAlert.labels.severity).toBe('warning');
    });

    test('should detect traffic spike', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const trafficAlert = deploymentGroup.rules.find(
        (r: any) => r.alert === 'DeploymentTrafficSpike'
      );
      
      expect(trafficAlert).toBeDefined();
      expect(trafficAlert.labels.severity).toBe('warning');
    });
  });

  describe('Alertmanager Configuration', () => {
    test('should have alertmanager running', async () => {
      const response = await axios.get(`${ALERTMANAGER_URL}/api/v1/status`);
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('success');
    });

    test('should have deployment alert routes configured', async () => {
      const response = await axios.get(`${ALERTMANAGER_URL}/api/v1/status`);
      
      const config = response.data.data.config;
      expect(config).toBeDefined();
      expect(config.route).toBeDefined();
    });

    test('should have receivers configured', async () => {
      const response = await axios.get(`${ALERTMANAGER_URL}/api/v1/status`);
      
      const config = response.data.data.config;
      expect(config.receivers).toBeDefined();
      expect(config.receivers.length).toBeGreaterThan(0);
    });
  });

  describe('Alert Severity Levels', () => {
    test('should have critical alerts with rollback action', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const criticalAlerts = deploymentGroup.rules.filter(
        (r: any) => r.labels.severity === 'critical' && r.labels.action === 'rollback'
      );
      
      expect(criticalAlerts.length).toBeGreaterThan(0);
    });

    test('should have warning alerts for investigation', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      const warningAlerts = deploymentGroup.rules.filter(
        (r: any) => r.labels.severity === 'warning'
      );
      
      expect(warningAlerts.length).toBeGreaterThan(0);
    });
  });

  describe('Alert Annotations', () => {
    test('should have descriptive alert summaries', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      deploymentGroup.rules.forEach((rule: any) => {
        if (rule.alert) {
          expect(rule.annotations.summary).toBeDefined();
          expect(rule.annotations.summary.length).toBeGreaterThan(0);
        }
      });
    });

    test('should have detailed alert descriptions', async () => {
      const response = await axios.get(`${PROMETHEUS_URL}/api/v1/rules`);
      
      const deploymentGroup = response.data.data.groups.find(
        (g: any) => g.name === 'deployment_monitoring'
      );
      
      deploymentGroup.rules.forEach((rule: any) => {
        if (rule.alert) {
          expect(rule.annotations.description).toBeDefined();
          expect(rule.annotations.description.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
