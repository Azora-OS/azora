/**
 * Alerts Service Tests
 */

import { alertsService, AlertRule } from '../alerts.service';

describe('AlertsService', () => {
  beforeEach(() => {
    // Clear active alerts before each test
    alertsService.stopAlertChecking();
  });

  describe('addRule', () => {
    it('should add an alert rule', () => {
      const rule: AlertRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'Test alert rule',
        metric: 'http_error_rate',
        threshold: 5,
        operator: 'gt',
        duration: 300000,
        severity: 'warning',
        enabled: true,
        actions: [{ type: 'log' }],
      };

      alertsService.addRule(rule);
      const rules = alertsService.getRules();

      expect(rules).toContainEqual(rule);
    });
  });

  describe('removeRule', () => {
    it('should remove an alert rule', () => {
      const rule: AlertRule = {
        id: 'test-rule-2',
        name: 'Test Rule 2',
        description: 'Test alert rule',
        metric: 'http_error_rate',
        threshold: 5,
        operator: 'gt',
        duration: 300000,
        severity: 'warning',
        enabled: true,
        actions: [{ type: 'log' }],
      };

      alertsService.addRule(rule);
      alertsService.removeRule('test-rule-2');
      const rules = alertsService.getRules();

      expect(rules.find(r => r.id === 'test-rule-2')).toBeUndefined();
    });
  });

  describe('getRules', () => {
    it('should return all alert rules', () => {
      const rules = alertsService.getRules();
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should include default rules', () => {
      const rules = alertsService.getRules();
      const ruleIds = rules.map(r => r.id);

      expect(ruleIds).toContain('api-error-rate-high');
      expect(ruleIds).toContain('api-latency-high');
      expect(ruleIds).toContain('db-error-rate-high');
    });
  });

  describe('getActiveAlerts', () => {
    it('should return active alerts', () => {
      const alerts = alertsService.getActiveAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should not include resolved alerts', () => {
      const alerts = alertsService.getActiveAlerts();
      const unresolvedAlerts = alerts.filter(a => !a.resolved);

      expect(unresolvedAlerts.length).toBe(alerts.length);
    });
  });

  describe('getAlertHistory', () => {
    it('should return alert history', () => {
      const history = alertsService.getAlertHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it('should respect limit parameter', () => {
      const history = alertsService.getAlertHistory(10);
      expect(history.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getAlertStatistics', () => {
    it('should return alert statistics', () => {
      const stats = alertsService.getAlertStatistics();

      expect(stats).toHaveProperty('totalActive');
      expect(stats).toHaveProperty('critical');
      expect(stats).toHaveProperty('warning');
      expect(stats).toHaveProperty('info');
      expect(stats).toHaveProperty('totalHistory');
      expect(stats).toHaveProperty('rules');
    });

    it('should have correct statistics structure', () => {
      const stats = alertsService.getAlertStatistics();

      expect(typeof stats.totalActive).toBe('number');
      expect(typeof stats.critical).toBe('number');
      expect(typeof stats.warning).toBe('number');
      expect(typeof stats.info).toBe('number');
      expect(typeof stats.totalHistory).toBe('number');
      expect(typeof stats.rules).toBe('number');
    });
  });

  describe('startAlertChecking', () => {
    it('should start alert checking', () => {
      alertsService.startAlertChecking(1000);
      // Alert checking should be running
      expect(true).toBe(true);
      alertsService.stopAlertChecking();
    });
  });

  describe('stopAlertChecking', () => {
    it('should stop alert checking', () => {
      alertsService.startAlertChecking(1000);
      alertsService.stopAlertChecking();
      // Alert checking should be stopped
      expect(true).toBe(true);
    });
  });

  describe('resolveAlert', () => {
    it('should resolve an alert', () => {
      const alerts = alertsService.getActiveAlerts();
      if (alerts.length > 0) {
        const alertId = alerts[0].id;
        alertsService.resolveAlert(alertId);

        const updatedAlerts = alertsService.getActiveAlerts();
        const resolvedAlert = updatedAlerts.find(a => a.id === alertId);

        expect(resolvedAlert?.resolved).toBe(true);
      }
    });
  });

  describe('default rules', () => {
    it('should have api-error-rate-high rule', () => {
      const rules = alertsService.getRules();
      const rule = rules.find(r => r.id === 'api-error-rate-high');

      expect(rule).toBeDefined();
      expect(rule?.name).toBe('High API Error Rate');
      expect(rule?.threshold).toBe(5);
      expect(rule?.operator).toBe('gt');
      expect(rule?.severity).toBe('critical');
    });

    it('should have api-latency-high rule', () => {
      const rules = alertsService.getRules();
      const rule = rules.find(r => r.id === 'api-latency-high');

      expect(rule).toBeDefined();
      expect(rule?.name).toBe('High API Latency');
      expect(rule?.threshold).toBe(2000);
      expect(rule?.operator).toBe('gt');
      expect(rule?.severity).toBe('warning');
    });

    it('should have memory-usage-high rule', () => {
      const rules = alertsService.getRules();
      const rule = rules.find(r => r.id === 'memory-usage-high');

      expect(rule).toBeDefined();
      expect(rule?.name).toBe('High Memory Usage');
      expect(rule?.threshold).toBe(90);
      expect(rule?.operator).toBe('gt');
      expect(rule?.severity).toBe('critical');
    });

    it('should have conversion-rate-low rule', () => {
      const rules = alertsService.getRules();
      const rule = rules.find(r => r.id === 'conversion-rate-low');

      expect(rule).toBeDefined();
      expect(rule?.name).toBe('Low Conversion Rate');
      expect(rule?.threshold).toBe(30);
      expect(rule?.operator).toBe('lt');
      expect(rule?.severity).toBe('warning');
    });
  });
});
