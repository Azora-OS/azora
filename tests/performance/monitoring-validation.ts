// Task 21.2: Validate monitoring and alerting
import axios from 'axios';

interface MonitoringCheck {
  name: string;
  url: string;
  expected: any;
}

const checks: MonitoringCheck[] = [
  { name: 'Prometheus', url: '/api/v1/query?query=up', expected: { status: 'success' } },
  { name: 'Grafana', url: '/api/health', expected: { database: 'ok' } },
  { name: 'Metrics Collection', url: '/api/v1/query?query=http_requests_total', expected: { status: 'success' } },
];

export async function validateMonitoring(baseUrl: string) {
  const results = [];
  
  for (const check of checks) {
    try {
      const res = await axios.get(`${baseUrl}${check.url}`);
      const passed = res.status === 200;
      results.push({ ...check, passed, status: res.status });
    } catch (error) {
      results.push({ ...check, passed: false, error: error.message });
    }
  }
  
  return results;
}

export async function testAlertDelivery(alertmanagerUrl: string) {
  const testAlert = {
    labels: { alertname: 'TestAlert', severity: 'warning' },
    annotations: { summary: 'Test alert for validation' },
  };
  
  const res = await axios.post(`${alertmanagerUrl}/api/v1/alerts`, [testAlert]);
  return res.status === 200;
}
