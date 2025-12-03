# Azora Pay

Payment processing service with Stripe integration, transaction management, and webhook handling.

## Purpose
- Payment processing
- Stripe integration
- Transaction management
- Refund handling
- Payment history
- Webhook processing

## Features
- Create and confirm payment intents
- Process refunds
- Manage payment methods
- Handle Stripe webhooks
- Track transaction history
- Payment analytics

## Setup
```bash
npm install
npm run prisma:generate
```

## Environment Variables
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://...
```

## Scripts
- `npm run dev` - Development server
- `npm run build` - Build TypeScript
- `npm run start` - Production server
- `npm run test` - Run tests
- `npm run typecheck` - TypeScript validation

## API Endpoints
- `POST /api/payments/intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/refund` - Process refund
- `GET /api/payments/history` - Get payment history
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Database
PostgreSQL with Prisma ORM for transaction data.

## Testing

### Test Status
- **Status**: ✅ Passing
- **Test Suites**: 4 passing / 4 total
- **Last Updated**: 2025-11-25

### Test Coverage
- **Overall**: 76%
- **Lines**: 76%
- **Functions**: 79%
- **Branches**: 72%
- **Statements**: 76%

### Test Categories

#### Unit Tests
- **Location**: `tests/unit/`
- **Coverage**: 82%
- **Status**: ✅ Passing
- **Key Test Files**:
  - `payment-service.test.ts` - Payment processing logic
  - `stripe-client.test.ts` - Stripe API client
  - `webhook-handler.test.ts` - Webhook processing

#### Integration Tests
- **Location**: `tests/integration/`
- **Coverage**: 72%
- **Status**: ✅ Passing
- **Key Test Files**:
  - `stripe-integration.test.ts` - Stripe API integration
  - `transaction.test.ts` - Transaction workflows
  - `webhook.test.ts` - Webhook handling
  - `payment-comprehensive.test.ts` - End-to-end payment flows

### Test Scenarios Covered
- ✅ Payment intent creation
- ✅ Payment confirmation
- ✅ Customer creation
- ✅ Payment method management
- ✅ Transaction creation and tracking
- ✅ Transaction status updates
- ✅ Transaction history retrieval
- ✅ Webhook signature verification
- ✅ Payment success webhook handling
- ✅ Payment failure webhook handling
- ✅ Refund processing
- ✅ Subscription payments
- ✅ Recurring payments
- ✅ Payment disputes

### Running Tests

#### Run All Tests
```bash
npm test
```

#### Run Specific Test Suite
```bash
npm test -- tests/stripe-integration.test.ts
```

#### Run Tests in Watch Mode
```bash
npm test -- --watch
```

#### Run Tests with Coverage
```bash
npm test -- --coverage
```

#### Run Integration Tests Only
```bash
npm test -- tests/integration
```

### Testing Guidelines

#### Using Test Factories
```typescript
import { 
  createTestUser, 
  createTestWallet,
  createTestTransaction 
} from '@/tests/factories';

const user = await createTestUser();
const wallet = await createTestWallet(user.id);
const transaction = await createTestTransaction(wallet.id, 100.00);
```

#### Using Stripe Mocks
```typescript
import { mockStripe } from '@/tests/mocks';

beforeEach(() => {
  mockStripe.reset();
});

it('should create payment intent', async () => {
  mockStripe.mockPaymentIntentCreation({
    id: 'pi_test_123',
    amount: 10000,
    currency: 'usd',
    status: 'requires_payment_method'
  });
  
  const intent = await paymentService.createIntent({
    amount: 100.00,
    currency: 'usd',
    userId: 'user-123'
  });
  
  expect(intent.id).toBe('pi_test_123');
  expect(mockStripe.verifyPaymentIntentCreated()).toBe(true);
});
```

#### Testing Webhook Handling
```typescript
it('should handle payment success webhook', async () => {
  const webhookPayload = {
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_123',
        amount: 10000,
        status: 'succeeded'
      }
    }
  };
  
  mockStripe.mockWebhookEvent(webhookPayload);
  
  const result = await webhookHandler.handle(webhookPayload);
  
  expect(result.processed).toBe(true);
  
  // Verify transaction was updated
  const transaction = await prisma.transaction.findFirst({
    where: { stripePaymentIntentId: 'pi_test_123' }
  });
  expect(transaction.status).toBe('COMPLETED');
});
```

#### Testing Refund Processing
```typescript
it('should process refund', async () => {
  const transaction = await createTestTransaction(wallet.id, 100.00, {
    status: 'COMPLETED',
    stripePaymentIntentId: 'pi_test_123'
  });
  
  mockStripe.mockRefundCreation({
    id: 're_test_123',
    amount: 10000,
    status: 'succeeded'
  });
  
  const refund = await paymentService.refund(transaction.id);
  
  expect(refund.status).toBe('REFUNDED');
  expect(mockStripe.verifyRefundCreated()).toBe(true);
});
```

### Known Issues
- None currently

### Test Dependencies
- Jest 29.x
- Stripe mock from `@/tests/mocks`
- Prisma test utilities
- Test factories from `@/tests/factories`
- Database utilities from `@/tests/utils/database`

### Troubleshooting

#### Tests Failing Locally
1. Ensure test database is running: `npm run db:test:start`
2. Run migrations: `npm run prisma:migrate:test`
3. Clear test cache: `npm test -- --clearCache`

#### Stripe Mock Issues
1. Reset mocks in beforeEach: `mockStripe.reset()`
2. Verify mock responses are configured
3. Check webhook signature verification is mocked

#### Webhook Tests Failing
1. Ensure webhook secret is set in test environment
2. Verify webhook payload structure matches Stripe format
3. Check webhook signature verification logic

#### Transaction Tests Failing
1. Verify test database has proper schema
2. Check transaction status transitions
3. Ensure proper cleanup between tests

### Contributing Tests
See [Testing Standards](../../docs/testing/TESTING-STANDARDS.md) for detailed guidelines on writing tests.

## Security
- Webhook signature verification
- Secure API key management
- PCI compliance considerations
- Transaction encryption

## Monitoring
- Payment success/failure rates
- Refund rates
- Webhook processing times
- Transaction volumes
