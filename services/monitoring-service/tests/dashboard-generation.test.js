const DashboardGenerator = require('../dashboard-generator');
const CustomMetrics = require('../custom-metrics');
const AlertManager = require('../alert-manager');

describe('Dashboard Generation', () => {
  let dashboardGenerator;
  let metrics;
  let alertManager;

  beforeEach(() => {
    metrics = new CustomMetrics();
    alertManager = new AlertManager();
    dashboardGenerator = new DashboardGenerator(metrics, alertManager);
  });

  describe('System Health Dashboard', () => {
    it('should generate system health dashboard', () => {
      const dashboard = dashboardGenerator.generateSystemHealthDashboard();

      expect(dashboard).toBeDefined();
      expect(dashboard.title).toContain('System Health');
      expect(dashboard.panels).toBeDefined();
      expect(Array.isArray(dashboard.panels)).toBe(true);
    });

    it('should include service status panel', () => {
      const dashboard = dashboardGenerator.generateSystemHealthDashboard();
      const servicePanel = dashboard.panels.find(p => p.title === 'Service Status');

      expect(servicePanel).toBeDefined();
      expect(servicePanel.type).toBe('stat');
    });

    it('should include CPU usage panel', () => {
      const dashboard = dashboardGenerator.generateSystemHealthDashboard();
      const cpuPanel = dashboard.panels.find(p => p.title === 'CPU Usage');

      expect(cpuPanel).toBeDefined();
      expect(cpuPanel.type).toBe('graph');
    });

    it('should include memory usage panel', () => {
      const dashboard = dashboardGenerator.generateSystemHealthDashboard();
      const memoryPanel = dashboard.panels.find(p => p.title === 'Memory Usage');

      expect(memoryPanel).toBeDefined();
    });

    it('should include active alerts panel', () => {
      const dashboard = dashboardGenerator.generateSystemHealthDashboard();
      const alertsPanel = dashboard.panels.find(p => p.title === 'Active Alerts');

      expect(alertsPanel).toBeDefined();
      expect(alertsPanel.type).toBe('table');
    });
  });

  describe('Business Metrics Dashboard', () => {
    it('should generate business metrics dashboard', () => {
      const dashboard = dashboardGenerator.generateBusinessDashboard();

      expect(dashboard).toBeDefined();
      expect(dashboard.title).toContain('Business Metrics');
      expect(dashboard.panels.length).toBeGreaterThan(0);
    });

    it('should include user registrations panel', () => {
      const dashboard = dashboardGenerator.generateBusinessDashboard();
      const panel = dashboard.panels.find(p => p.title === 'User Registrations');

      expect(panel).toBeDefined();
      expect(panel.type).toBe('stat');
    });

    it('should include course enrollments panel', () => {
      const dashboard = dashboardGenerator.generateBusinessDashboard();
      const panel = dashboard.panels.find(p => p.title === 'Course Enrollments');

      expect(panel).toBeDefined();
      expect(panel.type).toBe('graph');
    });

    it('should include revenue panel', () => {
      const dashboard = dashboardGenerator.generateBusinessDashboard();
      const panel = dashboard.panels.find(p => p.title === 'Revenue');

      expect(panel).toBeDefined();
      expect(panel.unit).toBe('currency');
    });

    it('should include payment success rate panel', () => {
      const dashboard = dashboardGenerator.generateBusinessDashboard();
      const panel = dashboard.panels.find(p => p.title === 'Payment Success Rate');

      expect(panel).toBeDefined();
      expect(panel.type).toBe('gauge');
    });
  });

  describe('Performance Dashboard', () => {
    it('should generate performance dashboard', () => {
      const dashboard = dashboardGenerator.generatePerformanceDashboard();

      expect(dashboard).toBeDefined();
      expect(dashboard.title).toContain('Performance');
    });

    it('should include API response time panel', () => {
      const dashboard = dashboardGenerator.generatePerformanceDashboard();
      const panel = dashboard.panels.find(p => p.title === 'API Response Time');

      expect(panel).toBeDefined();
      expect(panel.unit).toBe('ms');
    });

    it('should include request rate panel', () => {
      const dashboard = dashboardGenerator.generatePerformanceDashboard();
      const panel = dashboard.panels.find(p => p.title === 'Request Rate');

      expect(panel).toBeDefined();
    });

    it('should include error rate panel', () => {
      const dashboard = dashboardGenerator.generatePerformanceDashboard();
      const panel = dashboard.panels.find(p => p.title === 'Error Rate');

      expect(panel).toBeDefined();
      expect(panel.unit).toBe('percent');
    });
  });

  describe('Security Dashboard', () => {
    it('should generate security dashboard', () => {
      const dashboard = dashboardGenerator.generateSecurityDashboard();

      expect(dashboard).toBeDefined();
      expect(dashboard.title).toContain('Security');
    });

    it('should include failed login attempts panel', () => {
      const dashboard = dashboardGenerator.generateSecurityDashboard();
      const panel = dashboard.panels.find(p => p.title === 'Failed Login Attempts');

      expect(panel).toBeDefined();
    });

    it('should include suspicious activity panel', () => {
      const dashboard = dashboardGenerator.generateSecurityDashboard();
      const panel = dashboard.panels.find(p => p.title === 'Suspicious Activity');

      expect(panel).toBeDefined();
      expect(panel.type).toBe('table');
    });

    it('should include SSL certificate expiry panel', () => {
      const dashboard = dashboardGenerator.generateSecurityDashboard();
      const panel = dashboard.panels.find(p => p.title === 'SSL Certificate Expiry');

      expect(panel).toBeDefined();
      expect(panel.thresholds).toBeDefined();
    });
  });

  describe('All Dashboards', () => {
    it('should generate all dashboard types', () => {
      const dashboards = dashboardGenerator.generateAllDashboards();

      expect(dashboards).toBeDefined();
      expect(dashboards.system_health).toBeDefined();
      expect(dashboards.business_metrics).toBeDefined();
      expect(dashboards.performance).toBeDefined();
      expect(dashboards.security).toBeDefined();
    });

    it('should return object with correct keys', () => {
      const dashboards = dashboardGenerator.generateAllDashboards();

      expect(Object.keys(dashboards)).toContain('system_health');
      expect(Object.keys(dashboards)).toContain('business_metrics');
      expect(Object.keys(dashboards)).toContain('performance');
      expect(Object.keys(dashboards)).toContain('security');
    });
  });

  describe('Grafana Export', () => {
    it('should export dashboard in Grafana format', () => {
      const dashboard = dashboardGenerator.generateSystemHealthDashboard();
      const grafanaExport = dashboardGenerator.exportGrafanaDashboard(dashboard);

      expect(grafanaExport).toBeDefined();
      expect(grafanaExport.dashboard).toBeDefined();
      expect(grafanaExport.overwrite).toBe(true);
    });

    it('should include dashboard metadata', () => {
      const dashboard = dashboardGenerator.generateSystemHealthDashboard();
      const grafanaExport = dashboardGenerator.exportGrafanaDashboard(dashboard);

      expect(grafanaExport.dashboard.title).toBe(dashboard.title);
      expect(grafanaExport.dashboard.tags).toContain('azora');
      expect(grafanaExport.dashboard.tags).toContain('monitoring');
    });

    it('should convert panels to Grafana format', () => {
      const dashboard = dashboardGenerator.generateSystemHealthDashboard();
      const grafanaExport = dashboardGenerator.exportGrafanaDashboard(dashboard);

      expect(grafanaExport.dashboard.panels).toBeDefined();
      expect(Array.isArray(grafanaExport.dashboard.panels)).toBe(true);
      expect(grafanaExport.dashboard.panels.length).toBe(dashboard.panels.length);
    });

    it('should include panel grid positions', () => {
      const dashboard = dashboardGenerator.generateSystemHealthDashboard();
      const grafanaExport = dashboardGenerator.exportGrafanaDashboard(dashboard);

      const panel = grafanaExport.dashboard.panels[0];
      expect(panel.gridPos).toBeDefined();
      expect(panel.gridPos.h).toBeDefined();
      expect(panel.gridPos.w).toBeDefined();
      expect(panel.gridPos.x).toBeDefined();
      expect(panel.gridPos.y).toBeDefined();
    });

    it('should include time range configuration', () => {
      const dashboard = dashboardGenerator.generateSystemHealthDashboard();
      const grafanaExport = dashboardGenerator.exportGrafanaDashboard(dashboard);

      expect(grafanaExport.dashboard.time).toBeDefined();
      expect(grafanaExport.dashboard.time.from).toBe('now-1h');
      expect(grafanaExport.dashboard.time.to).toBe('now');
    });

    it('should include refresh interval', () => {
      const dashboard = dashboardGenerator.generateSystemHealthDashboard();
      const grafanaExport = dashboardGenerator.exportGrafanaDashboard(dashboard);

      expect(grafanaExport.dashboard.refresh).toBe('30s');
    });
  });

  describe('Panel Configuration', () => {
    it('should configure panel targets correctly', () => {
      const dashboard = dashboardGenerator.generateSystemHealthDashboard();
      const grafanaExport = dashboardGenerator.exportGrafanaDashboard(dashboard);

      const panel = grafanaExport.dashboard.panels[0];
      expect(panel.targets).toBeDefined();
      expect(Array.isArray(panel.targets)).toBe(true);
    });

    it('should include field configuration', () => {
      const dashboard = dashboardGenerator.generateSystemHealthDashboard();
      const grafanaExport = dashboardGenerator.exportGrafanaDashboard(dashboard);

      const panel = grafanaExport.dashboard.panels[0];
      expect(panel.fieldConfig).toBeDefined();
      expect(panel.fieldConfig.defaults).toBeDefined();
    });
  });
});
