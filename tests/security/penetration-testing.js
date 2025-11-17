const axios = require('axios');

class UbuntuPenetrationTesting {
  constructor() {
    this.ubuntu = 'I test security because we protect together';
  }

  async testSQLInjection(baseUrl) {
    const payloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --"
    ];

    const results = [];
    
    for (const payload of payloads) {
      try {
        const response = await axios.get(`${baseUrl}/api/search?q=${encodeURIComponent(payload)}`);
        results.push({
          payload,
          status: response.status,
          vulnerable: response.data.includes('error'),
          ubuntu: 'SQL injection test completed'
        });
      } catch (error) {
        results.push({
          payload,
          status: error.response?.status || 'error',
          vulnerable: false,
          ubuntu: 'SQL injection blocked - Ubuntu security active'
        });
      }
    }

    return results;
  }
}

module.exports = UbuntuPenetrationTesting;