import { Pact } from '@pact-foundation/pact'
import { like, eachLike } from '@pact-foundation/pact/dsl/matchers'

// Contract testing between services
export class ContractTester {
  private pact: Pact

  constructor(consumer: string, provider: string) {
    this.pact = new Pact({
      consumer,
      provider,
      port: 1234,
      log: './logs/pact.log',
      dir: './pacts',
      logLevel: 'INFO'
    })
  }

  async setupAuthServiceContract() {
    await this.pact.setup()

    // Define expected interactions
    await this.pact.addInteraction({
      state: 'user exists',
      uponReceiving: 'a request for user verification',
      withRequest: {
        method: 'GET',
        path: '/verify',
        headers: {
          'Authorization': like('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
        }
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          id: like('user-123'),
          email: like('test@azora.es'),
          role: like('USER'),
          verified: like(true)
        }
      }
    })

    return this.pact
  }

  async setupPaymentServiceContract() {
    await this.pact.addInteraction({
      state: 'user has sufficient balance',
      uponReceiving: 'a payment request',
      withRequest: {
        method: 'POST',
        path: '/api/payments/create',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': like('Bearer token')
        },
        body: {
          amount: like(100),
          currency: like('AZR'),
          recipientId: like('user-456')
        }
      },
      willRespondWith: {
        status: 201,
        body: {
          id: like('payment-789'),
          status: like('pending'),
          amount: like(100),
          currency: like('AZR')
        }
      }
    })
  }

  async verify() {
    return await this.pact.verify()
  }

  async finalize() {
    return await this.pact.finalize()
  }
}

// Integration test helpers
export class IntegrationTestHelper {
  static async testServiceCommunication(serviceA: string, serviceB: string) {
    // Test that services can communicate properly
    const response = await fetch(`http://localhost:4000/api/${serviceA}/health`)
    expect(response.status).toBe(200)
    
    const health = await response.json()
    expect(health.status).toBe('healthy')
  }

  static async testDatabaseIntegration() {
    // Test database operations work correctly
    const testUser = await prisma.user.create({
      data: {
        email: 'integration-test@azora.es',
        name: 'Integration Test User'
      }
    })

    expect(testUser.id).toBeDefined()
    expect(testUser.email).toBe('integration-test@azora.es')

    await prisma.user.delete({ where: { id: testUser.id } })
  }

  static async testEventBusIntegration() {
    // Test event bus communication between services
    let eventReceived = false
    
    // Subscribe to test event
    const unsubscribe = nervousSystem.on('test.integration', () => {
      eventReceived = true
    })

    // Emit test event
    nervousSystem.emit('test.integration', { test: true })

    // Wait for event processing
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(eventReceived).toBe(true)
    unsubscribe()
  }
}