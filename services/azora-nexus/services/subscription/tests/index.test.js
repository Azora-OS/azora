/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const request = require('supertest')
const express = require('express')

// Mock the service for testing
const app = require('../index')

describe('Subscription Service', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body).toHaveProperty('status', 'healthy')
      expect(response.body).toHaveProperty('service', 'subscription')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('uptime')
    })
  })

  describe('GET /api/subscription/pricing', () => {
    it('should return pricing information', async () => {
      const response = await request(app)
        .get('/api/subscription/pricing')
        .expect(200)

      expect(response.body).toHaveProperty('platformTiers')
      expect(Array.isArray(response.body.platformTiers)).toBe(true)
    })
  })

  describe('POST /api/subscription/calculate', () => {
    it('should calculate pricing with valid input', async () => {
      const response = await request(app)
        .post('/api/subscription/calculate')
        .send({
          tier: 'starter',
          services: [],
          applyDiscount: false,
          isStudent: false,
          countryCode: 'ZA',
        })
        .expect(200)

      expect(response.body).toBeDefined()
    })

    it('should return 400 with invalid input', async () => {
      const response = await request(app)
        .post('/api/subscription/calculate')
        .send('invalid')
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 with missing body', async () => {
      const response = await request(app)
        .post('/api/subscription/calculate')
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown/route')
        .expect(404)

      expect(response.body).toHaveProperty('error', 'Not found')
    })
  })
})

