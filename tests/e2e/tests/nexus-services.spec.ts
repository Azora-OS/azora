/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { test, expect } from '@playwright/test'

const services = [
  { name: 'wallet', port: 4100 },
  { name: 'blockchain', port: 4101 },
  { name: 'subscription', port: 4129 },
]

test.describe('Azora Nexus Services E2E Tests', () => {
  for (const service of services) {
    test(`should respond to health check for ${service.name} service`, async ({ request }) => {
      const response = await request.get(`http://localhost:${service.port}/health`)
      expect(response.ok()).toBeTruthy()
      const body = await response.json()
      expect(body.status).toBe('healthy')
      expect(body.service).toBe(service.name)
    })

    test(`should have metrics endpoint for ${service.name} service`, async ({ request }) => {
      const response = await request.get(`http://localhost:${service.port}/metrics`)
      expect(response.ok()).toBeTruthy()
      const body = await response.text()
      expect(body).toContain('http_requests_total')
    })

    test(`should have API docs for ${service.name} service`, async ({ request }) => {
      const response = await request.get(`http://localhost:${service.port}/api-docs`)
      expect(response.ok()).toBeTruthy()
    })
  }
})


