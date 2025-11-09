/**
 * SYSTEM INTEGRATION TESTS
 * Tests complete system integration and health
 */

import { masterSystem } from '../../services/master-system-integrator'

describe('System Integration', () => {
  beforeAll(async () => {
    await masterSystem.initialize()
  })

  afterAll(async () => {
    await masterSystem.shutdown()
  })

  test('system initializes successfully', () => {
    const status = masterSystem.getStatus()
    expect(status.initialized).toBe(true)
    expect(status.servicesOnline).toBeGreaterThan(0)
  })

  test('all services are registered', () => {
    const status = masterSystem.getStatus()
    expect(status.totalServices).toBeGreaterThanOrEqual(13)
  })

  test('health check passes', async () => {
    const healthy = await masterSystem.healthCheck()
    expect(healthy).toBe(true)
  })

  test('system health score is acceptable', () => {
    const status = masterSystem.getStatus()
    expect(status.health).toBeGreaterThanOrEqual(70)
  })

  test('chronicle protocol is accessible', () => {
    const chronicle = masterSystem.getService('chronicle-protocol')
    expect(chronicle).toBeDefined()
    expect(chronicle.url).toBeDefined()
  })

  test('constitutional services are registered', () => {
    const court = masterSystem.getService('constitutional-court')
    const ai = masterSystem.getService('constitutional-ai')
    
    expect(court).toBeDefined()
    expect(ai).toBeDefined()
  })

  test('design infrastructure is integrated', () => {
    const design = masterSystem.getService('design-infrastructure')
    expect(design).toBeDefined()
  })
})
