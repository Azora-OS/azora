const autocannon = require('autocannon');

class UbuntuLoadTesting {
  constructor() {
    this.ubuntu = 'I test performance because we optimize together';
  }

  async runUbuntuLoadTest(url, options = {}) {
    const defaultOptions = {
      url,
      connections: 100,
      pipelining: 1,
      duration: 30,
      headers: {
        'ubuntu-philosophy': 'Load testing with Ubuntu care'
      }
    };

    const result = await autocannon({
      ...defaultOptions,
      ...options
    });

    return {
      ...result,
      ubuntu: 'Ubuntu load test completed',
      philosophy: 'Performance testing strengthens our foundation'
    };
  }

  async testUbuntuEndpoints() {
    const endpoints = [
      'http://localhost:4000/api/health',
      'http://localhost:4001/api/courses',
      'http://localhost:4002/api/wallet/balance',
      'http://localhost:4003/api/jobs'
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      console.log(`Testing Ubuntu endpoint: ${endpoint}`);
      const result = await this.runUbuntuLoadTest(endpoint, { duration: 10 });
      results.push({
        endpoint,
        throughput: result.throughput,
        latency: result.latency,
        ubuntu: 'Ubuntu endpoint tested'
      });
    }

    return results;
  }
}

module.exports = UbuntuLoadTesting;