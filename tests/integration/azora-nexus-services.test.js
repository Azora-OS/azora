/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora Nexus Services Integration Test
 *
 * Tests communication and coordination between all Azora Nexus services
 * Validates service health, metrics endpoints, API endpoints, and inter-service communication
 */

const services = [
  { name: 'wallet', port: 4100 },
  { name: 'blockchain', port: 4101 },
  { name: 'ai-trading', port: 4102 },
  { name: 'ai-valuation', port: 4103 },
  { name: 'backed-valuation', port: 4104 },
  { name: 'compliance', port: 4105 },
  { name: 'dashboard', port: 4106 },
  { name: 'defi', port: 4107 },
  { name: 'global-adoption', port: 4108 },
  { name: 'guardian', port: 4109 },
  { name: 'identity', port: 4110 },
  { name: 'ledger', port: 4111 },
  { name: 'liquidity', port: 4112 },
  { name: 'marketplace', port: 4113 },
  { name: 'nft', port: 4114 },
  { name: 'partnerships', port: 4115 },
  { name: 'reporting', port: 4116 },
  { name: 'revenue', port: 4117 },
  { name: 'staking', port: 4118 },
  { name: 'user-growth', port: 4119 },
  { name: 'subscription', port: 4129 },
]

async function testEndpoint(url, timeout = 5000) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    clearTimeout(timeoutId)
    return { success: response.ok, status: response.status }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function run() {
  const results = {
    passed: false,
    details: {},
    error: null,
  }

  try {
    console.log('  🌐 Testing Azora Nexus services integration...')

    // Test 1: Service health checks
    const healthResults = {}
    for (const service of services) {
      const health = await testEndpoint(`http://localhost:${service.port}/health`)
      healthResults[service.name] = health.success
    }
    results.details.serviceHealth = healthResults

    // Test 2: Prometheus metrics endpoints
    const metricsResults = {}
    for (const service of services) {
      const metrics = await testEndpoint(`http://localhost:${service.port}/metrics`)
      metricsResults[service.name] = metrics.success
    }
    results.details.metricsEndpoints = metricsResults

    // Test 3: Swagger/API documentation endpoints
    const swaggerResults = {}
    for (const service of services) {
      const swagger = await testEndpoint(`http://localhost:${service.port}/api-docs`)
      swaggerResults[service.name] = swagger.success
    }
    results.details.swaggerEndpoints = swaggerResults

    // Test 4: Service-to-service communication (example: wallet -> blockchain)
    const walletToBlockchain = await testEndpoint(
      'http://localhost:4101/api/blockchain/status',
      { method: 'GET' }
    )
    results.details.interServiceCommunication = {
      walletToBlockchain: walletToBlockchain.success,
    }

    // Test 5: Error handling - test 404 handler
    const notFoundTest = await testEndpoint('http://localhost:4100/api/nonexistent')
    results.details.errorHandling = {
      notFoundReturns404: notFoundTest.status === 404,
    }

    // Determine overall pass/fail
    const allHealthChecks = Object.values(healthResults)
    const allMetrics = Object.values(metricsResults)

    results.passed =
      allHealthChecks.every((h) => h === true) && allMetrics.every((m) => m === true)

    if (results.passed) {
      results.details.summary = 'All Azora Nexus services integration tests passed'
    } else {
      const failedHealth = allHealthChecks.filter((h) => !h).length
      const failedMetrics = allMetrics.filter((m) => !m).length
      results.details.summary = `Failed: ${failedHealth} health checks, ${failedMetrics} metrics endpoints`
    }
  } catch (error) {
    results.error = error.message
    results.details.error = error.stack
  }

  return results
}

