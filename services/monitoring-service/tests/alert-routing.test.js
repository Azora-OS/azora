const AlertManager = require('../alert-manager');

describe('Alert Routing', () => {
  let alertManager;

  beforeEach(() => {
    alertManager = new AlertManager();
  });

  describe('Alert Generation', () => {
    it('should generate warning alerts when threshold exceeded', () => {
      const metrics = {
        cpu: 75,
        memory: 85
      };

      const alerts = alertManager.checkThresholds(metrics);

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(a => a.level === 'warning')).toBe(true);
    });

    it('should generate critical alerts for high values', () => {
      const metrics = {
        cpu: 95,
        error_rate: 15
      };

      const alerts = alertManager.checkThresholds(metrics);

      expect(alerts.some(a => a.level === 'critical')).toBe(true);
    });

    it('should not generate alerts for normal metrics', () => {
      const metrics = {
        cpu: 50,
        memory: 60,
        disk: 70
      };

      const alerts = alertManager.checkThresholds(metrics);

      expect(alerts).toHaveLength(0);
    });

    it('should include metric details in alerts', () => {
      const metrics = {
        cpu: 95
      };

      const alerts = alertManager.checkThresholds(metrics);

      expect(alerts[0]).toHaveProperty('metric', 'cpu');
      expect(alerts[0]).toHaveProperty('value', 95);
      expect(alerts[0]).toHaveProperty('threshold');
      expect(alerts[0]).toHaveProperty('message');
    });
  });

  describe('Alert Thresholds', () => {
    it('should have default thresholds configured', () => {
      expect(alertManager.thresholds).toBeDefined();
      expect(alertManager.thresholds.cpu).toBeDefined();
      expect(alertManager.thresholds.memory).toBeDefined();
      expect(alertManager.thresholds.disk).toBeDefined();
    });

    it('should update threshold values', () => {
      alertManager.updateThreshold('cpu', 'warning', 80);

      expect(alertManager.thresholds.cpu.warning).toBe(80);
    });

    it('should maintain separate warning and critical thresholds', () => {
      expect(alertManager.thresholds.cpu.warning).toBeLessThan(
        alertManager.thresholds.cpu.critical
      );
    });

    it('should handle multiple metric types', () => {
      expect(alertManager.thresholds).toHaveProperty('cpu');
      expect(alertManager.thresholds).toHaveProperty('memory');
      expect(alertManager.thresholds).toHaveProperty('response_time');
      expect(alertManager.thresholds).toHaveProperty('error_rate');
    });
  });

  describe('Alert Events', () => {
    it('should emit alert events', (done) => {
      alertManager.on('alert', (alert) => {
        expect(alert).toBeDefined();
        expect(alert).toHaveProperty('level');
        expect(alert).toHaveProperty('message');
        done();
      });

      const metrics = { cpu: 95 };
      alertManager.checkThresholds(metrics);
    });

    it('should emit multiple alerts for multiple threshold breaches', (done) => {
      const receivedAlerts = [];

      alertManager.on('alert', (alert) => {
        receivedAlerts.push(alert);
        if (receivedAlerts.length === 2) {
          expect(receivedAlerts).toHaveLength(2);
          done();
        }
      });

      const metrics = {
        cpu: 95,
        memory: 96
      };
      alertManager.checkThresholds(metrics);
    });
  });

  describe('SLO Configuration', () => {
    it('should have SLO targets defined', () => {
      expect(alertManager.slos).toBeDefined();
      expect(alertManager.slos.availability).toBeDefined();
      expect(alertManager.slos.response_time).toBeDefined();
      expect(alertManager.slos.error_rate).toBeDefined();
    });

    it('should have reasonable SLO values', () => {
      expect(alertManager.slos.availability).toBeGreaterThan(99);
      expect(alertManager.slos.response_time).toBeGreaterThan(0);
      expect(alertManager.slos.error_rate).toBeGreaterThan(0);
    });
  });

  describe('Alert Prioritization', () => {
    it('should prioritize critical over warning', () => {
      const metrics = {
        cpu: 95,
        memory: 75
      };

      const alerts = alertManager.checkThresholds(metrics);
      const criticalAlert = alerts.find(a => a.level === 'critical');
      const warningAlert = alerts.find(a => a.level === 'warning');

      expect(criticalAlert).toBeDefined();
      expect(warningAlert).toBeDefined();
    });

    it('should generate appropriate alert messages', () => {
      const metrics = { cpu: 95 };

      const alerts = alertManager.checkThresholds(metrics);

      expect(alerts[0].message).toContain('cpu');
      expect(alerts[0].message).toContain('critical');
      expect(alerts[0].message).toContain('95');
    });
  });
});
