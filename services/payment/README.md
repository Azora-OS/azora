# Payment Service

Stripe payment processing service for Azora OS. Handles secure payment processing, webhook event handling, payment history tracking, and refund management.

## Features

- **Secure Payment Processing**: PCI DSS compliant payment processing via Stripe
- **Webhook Event Handling**: Real-time payment status updates
- **Idempotency**: Prevents duplicate charges using idempotency keys
- **Payment History**: Complete transaction history with pagination
- **Refund Processing**: Full and partial refund support
- **Payment Methods**: Secure storage and management of payment methods
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Logging**: Detailed logging for debugging and audit trails

## Architecture

### Core Services

1. **StripeClientService** - Stripe API integration
2. **PaymentProcessor** - Payment processing orchestration
3. **PaymentRepository** - Database operations
4. **IdempotencyManager** - Duplicate prevention
5. **PaymentMethodService** - Payment method management
6. **WebhookHandler** - Webhook event processing

## Setup

### 1. Environment Configuration

Add the following to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 2. Database Setup

Run the migration to create payment tables:

```bash
npm run db:migrate
```

### 3. Install Dependencies

```bash
npm install stripe
```

## Usage

### Creating a Payment

```typescript
import { PaymentProcessor, StripeClientService, PaymentRepository } from './services/payment';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripeClient = new StripeClientService(process.env.STRIPE_SECRET_KEY);
const paymentRepository = new PaymentRepository(prisma);
const paymentProcessor = new PaymentProcessor(stripeClient, paymentRepository);

const result = await paymentProcessor.processPayment({
  userId: 'user-123',
  amount: 9999, // in cents
  currency: 'usd',
  paymentMethodId: 'pm_1234567890',
  courseId: 'course-123',
  metadata: {
    courseTitle: 'Advanced TypeScript',
  },
});

if (result.success) {
  console.log('Payment created:', result.paymentId);
  console.log('Client secret:', result.clientSecret);
} else {
  console.error('Payment failed:', result.error?.message);
}
```

### Handling Webhooks

```typescript
import { WebhookHandler } from './services/payment';

const webhookHandler = new WebhookHandler(stripeClient, paymentRepository);

// In your webhook endpoint
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const event = webhookHandler.verifyWebhookSignature(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await webhookHandler.processWebhookEvent(event);
    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
```

### Getting Payment History

```typescript
const history = await paymentRepository.getPaymentHistory(
  'user-123',
  20, // limit
  0   // offset
);

console.log('Total payments:', history.total);
console.log('Payments:', history.payments);
```

### Processing a Refund

```typescript
const refundResult = await paymentProcessor.refundPayment(
  'payment-123',
  5000, // amount in cents (optional, full refund if not specified)
  'Customer requested refund'
);

if (refundResult.success) {
  console.log('Refund processed:', refundResult.paymentId);
} else {
  console.error('Refund failed:', refundResult.error?.message);
}
```

## API Endpoints

### Process Payment

**POST** `/api/payments/process`

Request:
```json
{
  "amount": 9999,
  "currency": "usd",
  "paymentMethodId": "pm_1234567890",
  "courseId": "course-123",
  "metadata": {
    "courseTitle": "Advanced TypeScript"
  }
}
```

Response:
```json
{
  "success": true,
  "paymentId": "pay_123",
  "stripePaymentIntentId": "pi_1234567890",
  "status": "pending",
  "clientSecret": "pi_1234567890_secret_xyz"
}
```

### Get Payment History

**GET** `/api/payments/history?limit=20&offset=0`

Response:
```json
{
  "payments": [...],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

### Get Payment Details

**GET** `/api/payments/:id`

Response:
```json
{
  "id": "pay_123",
  "userId": "user-123",
  "amount": 9999,
  "currency": "usd",
  "status": "succeeded",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Process Refund

**POST** `/api/payments/refund`

Request:
```json
{
  "paymentId": "pay_123",
  "amount": 5000,
  "reason": "Customer requested refund"
}
```

Response:
```json
{
  "success": true,
  "paymentId": "pay_123"
}
```

## Error Handling

The service provides comprehensive error handling with specific error codes:

| Error Code | Description | HTTP Status |
|-----------|-------------|------------|
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `PAYMENT_METHOD_ERROR` | Invalid payment method | 400 |
| `INSUFFICIENT_FUNDS` | Insufficient funds | 402 |
| `CARD_DECLINED` | Card was declined | 402 |
| `STRIPE_ERROR` | Stripe API error | 500 |
| `DB_ERROR` | Database error | 500 |
| `IDEMPOTENCY_ERROR` | Idempotency error | 500 |
| `NOT_FOUND` | Payment not found | 404 |
| `ALREADY_REFUNDED` | Payment already refunded | 400 |
| `INVALID_STATUS` | Invalid payment status | 400 |

## Security

- **PCI DSS Compliance**: Never stores full card details locally
- **Webhook Verification**: All webhooks are verified using Stripe signing secret
- **Idempotency**: Prevents duplicate charges using idempotency keys
- **Rate Limiting**: Implement rate limiting on payment endpoints
- **Encryption**: Sensitive data is encrypted at rest
- **Audit Logging**: All payment operations are logged

## Testing

Run tests:

```bash
npm run test services/payment
```

Run tests with coverage:

```bash
npm run test:coverage services/payment
```

## Monitoring

Monitor these metrics:

- Payment success rate
- Payment processing time
- Webhook processing latency
- Error rates by type
- Refund rate
- Duplicate payment attempts

## Troubleshooting

### Webhook Not Received

1. Verify webhook URL is publicly accessible
2. Check webhook secret in Stripe dashboard
3. Review logs for signature verification errors
4. Test webhook using Stripe CLI

### Payment Intent Creation Fails

1. Verify Stripe API keys are correct
2. Check amount is in cents (not dollars)
3. Verify currency code is valid
4. Check payment method is valid

### Idempotency Key Errors

1. Ensure Redis is running
2. Check database connection
3. Verify key format (64-character hex string)
4. Check key expiration (24 hours)

## References

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [PCI DSS Compliance](https://stripe.com/docs/security/pci-compliance)
