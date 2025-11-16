# Payment Service - Quick Start Guide

Get up and running with the Stripe Payment Integration in 5 minutes.

---

## 🚀 Installation

### 1. Install Dependencies
```bash
npm install stripe pdfkit
```

### 2. Set Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLIC_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

### 3. Run Database Migration
```bash
npm run db:migrate
```

---

## 💳 Process a Payment

```typescript
import { PaymentProcessor, StripeClientService, PaymentRepository } from '@azora/payment';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripeClient = new StripeClientService(process.env.STRIPE_SECRET_KEY);
const paymentRepository = new PaymentRepository(prisma);
const paymentProcessor = new PaymentProcessor(stripeClient, paymentRepository);

// Process payment
const result = await paymentProcessor.processPayment({
  userId: 'user-123',
  amount: 9999, // in cents ($99.99)
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

---

## 📧 Generate & Send Receipt

```typescript
import { ReceiptGenerator, PDFGenerator, ReceiptEmailService, ReceiptRepository } from '@azora/payment';

const receiptGenerator = new ReceiptGenerator();
const pdfGenerator = new PDFGenerator();
const receiptRepository = new ReceiptRepository(prisma);
const emailService = new ReceiptEmailService(emailProvider);

// Generate receipt data
const receipt = await receiptGenerator.generateReceipt(payment, 'Course Title');

// Generate PDF
const pdfBuffer = await pdfGenerator.generatePDF(receipt);

// Store receipt
const stored = await receiptRepository.storeReceipt(receipt);

// Send email
await emailService.sendReceiptEmail(userEmail, receipt, pdfBuffer);
```

---

## 🔄 Handle Webhooks

```typescript
import { WebhookHandler } from '@azora/payment';

const webhookHandler = new WebhookHandler(stripeClient, paymentRepository);

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

---

## 📋 Get Payment History

```typescript
const history = await paymentRepository.getPaymentHistory(
  'user-123',
  20, // limit
  0   // offset
);

console.log('Total payments:', history.total);
console.log('Payments:', history.payments);
```

---

## 💰 Process Refund

```typescript
const refundResult = await paymentProcessor.refundPayment(
  'payment-123',
  5000, // amount in cents (optional)
  'Customer requested refund'
);

if (refundResult.success) {
  console.log('Refund processed:', refundResult.paymentId);
} else {
  console.error('Refund failed:', refundResult.error?.message);
}
```

---

## 🛡️ Error Handling

```typescript
import { PaymentError } from '@azora/payment';

try {
  const result = await paymentProcessor.processPayment(request);
  if (!result.success) {
    const error = result.error as PaymentError;
    console.error(`Error (${error.code}): ${error.message}`);
  }
} catch (error) {
  if (error instanceof PaymentError) {
    console.error(`Payment Error: ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## 🔑 Common Error Codes

| Code | Description | Action |
|------|-------------|--------|
| `VALIDATION_ERROR` | Invalid request | Check input data |
| `CARD_DECLINED` | Card declined | Try another card |
| `INSUFFICIENT_FUNDS` | Not enough funds | Check balance |
| `STRIPE_ERROR` | Stripe API error | Retry later |
| `DB_ERROR` | Database error | Check connection |
| `IDEMPOTENCY_ERROR` | Idempotency error | Retry with new key |

---

## 📚 API Endpoints

### Process Payment
```
POST /api/payments/process
Content-Type: application/json

{
  "amount": 9999,
  "currency": "usd",
  "paymentMethodId": "pm_1234567890",
  "courseId": "course-123"
}
```

### Get Payment History
```
GET /api/payments/history?limit=20&offset=0
Authorization: Bearer <token>
```

### Get Payment Details
```
GET /api/payments/:id
Authorization: Bearer <token>
```

### Process Refund
```
POST /api/payments/refund
Content-Type: application/json
Authorization: Bearer <token>

{
  "paymentId": "pay-123",
  "amount": 5000,
  "reason": "Customer requested"
}
```

---

## 🧪 Testing

### Run Tests
```bash
npm run test services/payment
```

### Run Tests with Coverage
```bash
npm run test:coverage services/payment
```

### Run Specific Test
```bash
npm run test services/payment -- --testNamePattern="processPayment"
```

---

## 📖 Documentation

- [Full README](./README.md)
- [Design Document](../specs/stripe-payment-integration/design.md)
- [Requirements](../specs/stripe-payment-integration/requirements.md)
- [API Documentation](../../docs/API-DOCUMENTATION.md)

---

## 🆘 Troubleshooting

### Payment Intent Creation Fails
1. Verify Stripe API keys are correct
2. Check amount is in cents (not dollars)
3. Verify currency code is valid
4. Check payment method is valid

### Webhook Not Received
1. Verify webhook URL is publicly accessible
2. Check webhook secret in Stripe dashboard
3. Review logs for signature verification errors
4. Test webhook using Stripe CLI

### Email Not Sent
1. Verify email service is configured
2. Check user email is valid
3. Review logs for email errors
4. Check email provider status

---

## 🔗 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

**Last Updated**: November 15, 2025  
**Version**: 1.0.0  
**Status**: Production-Ready
