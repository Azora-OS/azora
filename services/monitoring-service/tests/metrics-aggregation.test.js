const CustomMetrics = require('../custom-metrics');

describe('Metrics Aggregation', () => {
  let metrics;

  beforeEach(() => {
    metrics = new CustomMetrics();
  });

  describe('Counter Aggregation', () => {
    it('should aggregate counter metrics', () => {
      metrics.incrementCounter('requests_total', { endpoint: '/api/users' });
      metrics.incrementCounter('requests_total', { endpoint: '/api/users' });
      metrics.incrementCounter('requests_total', { endpoint: '/api/courses' });

      const allMetrics = metrics.getMetrics();
      expect(allMetrics.counters).toBeDefined();
    });

    it('should track multiple counters independently', () => {
      metrics.incrementCounter('user_registrations_total', { source: 'web' });
      metrics.incrementCounter('course_enrollments_total', { course_id: '123' });

      const allMetrics = metrics.getMetrics();
      expect(Object.keys(allMetrics.counters).length).toBeGreaterThan(0);
    });

    it('should increment counters correctly', () => {
      metrics.incrementCounter('test_counter', {});
      metrics.incrementCounter('test_counter', {});
      metrics.incrementCounter('test_counter', {});

      const allMetrics = metrics.getMetrics();
      const counterValue = allMetrics.counters['test_counter{}'];
      expect(counterValue).toBe(3);
    });
  });

  describe('Gauge Aggregation', () => {
    it('should set gauge values', () => {
      metrics.setGauge('active_users', 100);
      metrics.setGauge('memory_usage', 75.5);

      const allMetrics = metrics.getMetrics();
      expect(allMetrics.gauges).toBeDefined();
      expect(allMetrics.gauges['active_users{}']).toBe(100);
    });

    it('should update gauge values', () => {
      metrics.setGauge('cpu_usage', 50);
      metrics.setGauge('cpu_usage', 75);

      const allMetrics = metrics.getMetrics();
      expect(allMetrics.gauges['cpu_usage{}']).toBe(75);
    });

    it('should handle gauge labels', () => {
      metrics.setGauge('service_health', 1, { service: 'auth' });
      metrics.setGauge('service_health', 0, { service: 'payment' });

      const allMetrics = metrics.getMetrics();
      expect(allMetrics.gauges['service_health{service="auth"}']).toBe(1);
      expect(allMetrics.gauges['service_health{service="payment"}']).toBe(0);
    });
  });

  describe('Histogram Aggregation', () => {
    it('should record histogram values', () => {
      metrics.recordHistogram('request_duration', 100);
      metrics.recordHistogram('request_duration', 200);
      metrics.recordHistogram('request_duration', 150);

      const allMetrics = metrics.getMetrics();
      expect(allMetrics.histograms['request_duration{}']).toHaveLength(3);
    });

    it('should track histogram with labels', () => {
      metrics.recordHistogram('api_latency', 50, { endpoint: '/api/users' });
      metrics.recordHistogram('api_latency', 75, { endpoint: '/api/users' });

      const allMetrics = metrics.getMetrics();
      const histogram = allMetrics.histograms['api_latency{endpoint="/api/users"}'];
      expect(histogram).toHaveLength(2);
    });

    it('should include timestamps in histogram entries', () => {
      metrics.recordHistogram('test_metric', 100);

      const allMetrics = metrics.getMetrics();
      const histogram = allMetrics.histograms['test_metric{}'];
      expect(histogram[0]).toHaveProperty('timestamp');
      expect(histogram[0]).toHaveProperty('value', 100);
    });
  });

  describe('Business Metrics', () => {
    it('should record user registrations', () => {
      metrics.recordUserRegistration('user123', 'web');
      metrics.recordUserRegistration('user456', 'mobile');

      const allMetrics = metrics.getMetrics();
      expect(allMetrics.counters['user_registrations_total{source="web"}']).toBe(1);
      expect(allMetrics.counters['user_registrations_total{source="mobile"}']).toBe(1);
    });

    it('should record course enrollments', () => {
      metrics.recordCourseEnrollment('course123', 'user456', 99.99);

      const allMetrics = metrics.getMetrics();
      expect(allMetrics.counters['course_enrollments_total{course_id="course123"}']).toBe(1);
    });

    it('should record payment transactions', () => {
      metrics.recordPaymentTransaction(100, 'USD', 'success');
      metrics.recordPaymentTransaction(50, 'USD', 'failed');

      const allMetrics = metrics.getMetrics();
      expect(allMetrics.counters['payment_transactions_total{currency="USD",status="success"}']).toBe(1);
      expect(allMetrics.counters['payment_transactions_total{currency="USD",status="failed"}']).toBe(1);
    });

    it('should record API calls', () => {
      metrics.recordAPICall('/api/users', 'GET', 150, 200);
      metrics.recordAPICall('/api/users', 'POST', 200, 201);

      const allMetrics = metrics.getMetrics();
      expect(allMetrics.counters['api_requests_total{endpoint="/api/users",method="GET",status="200"}']).toBe(1);
    });
  });

  describe('Prometheus Export', () => {
    it('should export metrics in Prometheus format', () => {
      metrics.incrementCounter('test_counter', {});
      metrics.setGauge('test_gauge', 42);

      const prometheusOutput = metrics.exportPrometheus();
      expect(typeof prometheusOutput).toBe('string');
      expect(prometheusOutput).toContain('test_counter');
      expect(prometheusOutput).toContain('test_gauge');
    });

    it('should format counter metrics correctly', () => {
      metrics.incrementCounter('requests_total', { method: 'GET' });

      const prometheusOutput = metrics.exportPrometheus();
      expect(prometheusOutput).toMatch(/requests_total.*1/);
    });

    it('should format gauge metrics correctly', () => {
      metrics.setGauge('memory_usage', 75.5);

      const prometheusOutput = metrics.exportPrometheus();
      expect(prometheusOutput).toMatch(/memory_usage.*75\.5/);
    });
  });

  describe('Metric Keys', () => {
    it('should generate consistent metric keys', () => {
      const key1 = metrics.getMetricKey('test_metric', { a: '1', b: '2' });
      const key2 = metrics.getMetricKey('test_metric', { b: '2', a: '1' });

      expect(key1).toBe(key2);
    });

    it('should include labels in metric keys', () => {
      const key = metrics.getMetricKey('test_metric', { label1: 'value1', label2: 'value2' });

      expect(key).toContain('label1="value1"');
      expect(key).toContain('label2="value2"');
    });
  });
});
