# Stripe Payment Integration - Design

## Overview

This design document outlines the technical implementation of Stripe payment processing for Azora OS. The system provides secure, PCI-compliant payment handling with real-time webhook processing, comprehensive error handling, and audit trails for all transactions.

## Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Application                        │
│  ├─ Web App (Next.js)                                       │
│  ├─ Mobile Apps (React Native)                              │
│  └─ Admin Dashboard                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│  ├─ Authentication (JWT)                                    │
│  ├─ Rate Limiting                                           │
│  ├─ Request Validation                                      │
│  └─ Error Handling                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Payment Service Layer                       │
│  ├─ Stripe Client (API Communication)                       │
│  ├─ Payment Processor (Business Logic)                      │
│  ├─ Webhook Handler (Event Processing)                      │
│  ├─ Receipt Generator (PDF & Email)                         │
│  └─ Payment Repository (Data Access)                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ├─ PostgreSQL (Payments, Receipts, Audit Logs)             │
│  ├─ Redis (Idempotency Cache, Session Cache)                │
│  └─ File Storage (PDF Receipts)                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  ├─ Stripe API (Payment Processing)                         │
│  ├─ Email Service (Receipt Delivery)                        │
│  └─ Logging Service (Audit Trail)                           │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow Diagram

```
User Initiates Payment
        ↓
Client Creates Payment Intent Request
        ↓
API Gateway Validates Request & Auth
        ↓
Payment Service Generates Idempotency Key
        ↓
Check Redis Cache for Duplicate
        ↓
Create Stripe Payment Intent
        ↓
Store Payment Record in Database
        ↓
Return Client Secret to Frontend
        ↓
Client Confirms Payment with Stripe
        ↓
Stripe Sends Webhook Event
        ↓
Webhook Handler Verifies Signature
        ↓
Update Payment Status in Database
        ↓
Generate Receipt & Send Email
        ↓
Return Success to User
```

## Components and Interfaces

### 1. Stripe Client Service

**File**: `services/payment/stripe-client.ts`

**Responsibilities**:
- Initialize Stripe SDK with API keys
- Create Payment Intents
- Retrieve Payment Methods
- Handle Stripe API errors
- Implement retry logic

**Interface**:
```typescript
interface StripeClientService {
  createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
    idempotencyKey: string
  ): Promise<PaymentIntentResult>
  
  retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult>
  
  createPaymentMethod(
    type: string,
    details: Record<string, any>
  ): Promise<PaymentMethodResult>
  
  retrievePaymentMethod(paymentMethodId: string): Promise<PaymentMethodResult>
  
  createRefund(
    paymentIntentId: string,
    amount?: number
  ): Promise<RefundResult>
  
  handleStripeError(error: StripeError): PaymentError
}
```

### 2. Payment Processor Service

**File**: `services/payment/payment-processor.ts`

**Responsibilities**:
- Orchestrate payment flow
- Validate payment requests
- Generate idempotency keys
- Manage transaction state
- Coordinate with other services

**Interface**:
```typescript
interface PaymentProcessorService {
  processPayment(
    userId: string,
    amount: number,
    currency: string,
    paymentMethodId: string,
    metadata: PaymentMetadata
  ): Promise<PaymentResult>
  
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>
  
  refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<RefundResult>
  
  validatePaymentRequest(request: PaymentRequest): ValidationResult
  
  generateIdempotencyKey(userId: string, amount: number): string
}
```

### 3. Webhook Handler Service

**File**: `services/payment/webhook-handler.ts`

**Responsibilities**:
- Verify webhook signatures
- Process Stripe events
- Update payment status
- Trigger downstream actions
- Log all events

**Interface**:
```typescript
interface WebhookHandlerService {
  verifyWebhookSignature(
    body: string,
    signature: string
  ): VerificationResult
  
  handlePaymentIntentSucceeded(event: StripeEvent): Promise<void>
  
  handlePaymentIntentPaymentFailed(event: StripeEvent): Promise<void>
  
  handleChargeRefunded(event: StripeEvent): Promise<void>
  
  processWebhookEvent(event: StripeEvent): Promise<void>
}
```

### 4. Payment Repository Service

**File**: `services/payment/payment-repository.ts`

**Responsibilities**:
- CRUD operations for payments
- Query payment history
- Store idempotency keys
- Manage payment status updates
- Implement pagination

**Interface**:
```typescript
interface PaymentRepositoryService {
  createPayment(payment: PaymentData): Promise<Payment>
  
  updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment>
  
  getPaymentById(paymentId: string): Promise<Payment>
  
  getPaymentHistory(
    userId: string,
    limit: number,
    offset: number
  ): Promise<PaginatedPayments>
  
  getPaymentByStripeId(stripePaymentIntentId: string): Promise<Payment>
  
  storeIdempotencyKey(key: string, result: PaymentResult): Promise<void>
  
  getIdempotencyResult(key: string): Promise<PaymentResult | null>
}
```

### 5. Receipt Generator Service

**File**: `services/payment/receipt-generator.ts`

**Responsibilities**:
- Generate PDF receipts
- Send receipt emails
- Store receipt records
- Format receipt data

**Interface**:
```typescript
interface ReceiptGeneratorService {
  generateReceipt(payment: Payment): Promise<ReceiptData>
  
  generatePDF(receiptData: ReceiptData): Promise<Buffer>
  
  sendReceiptEmail(
    userEmail: string,
    receiptData: ReceiptData,
    pdfBuffer: Buffer
  ): Promise<void>
  
  storeReceipt(receipt: ReceiptData): Promise<Receipt>
  
  getReceipt(receiptId: string): Promise<Receipt>
}
```

### 6. Payment API Endpoints

**File**: `apps/app/api/payments/process.ts`

**Endpoint**: `POST /api/payments/process`

**Request**:
```typescript
interface PaymentRequest {
  amount: number
  currency: string
  paymentMethodId: string
  courseId?: string
  subscriptionTierId?: string
  metadata?: Record<string, string>
}
```

**Response**:
```typescript
interface PaymentResponse {
  success: boolean
  paymentId: string
  stripePaymentIntentId: string
  status: PaymentStatus
  clientSecret?: string
  error?: PaymentError
}
```

**File**: `apps/app/api/payments/history.ts`

**Endpoint**: `GET /api/payments/history?limit=20&offset=0`

**Response**:
```typescript
interface PaymentHistoryResponse {
  payments: Payment[]
  total: number
  limit: number
  offset: number
}
```

**File**: `apps/app/api/webhooks/stripe.ts`

**Endpoint**: `POST /api/webhooks/stripe`

**Webhook Events Handled**:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

## Data Models

### Payment Model

```typescript
interface Payment {
  id: string                          // UUID
  userId: string                      // Foreign key to users
  stripePaymentIntentId: string       // Stripe Payment Intent ID
  amount: number                      // Amount in cents
  currency: string                    // ISO 4217 code (e.g., 'usd')
  status: PaymentStatus               // pending | succeeded | failed | refunded
  paymentMethodId?: string            // Stripe Payment Method ID
  courseId?: string                   // Foreign key to courses (optional)
  subscriptionTierId?: string         // Foreign key to subscription tiers (optional)
  metadata: Record<string, string>    // Custom metadata
  idempotencyKey: string              // For duplicate prevention
  receiptId?: string                  // Foreign key to receipts
  refundedAmount?: number             // Amount refunded in cents
  refundReason?: string               // Reason for refund
  errorCode?: string                  // Stripe error code if failed
  errorMessage?: string               // Stripe error message if failed
  createdAt: Date
  updatedAt: Date
}

enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}
```

### Receipt Model

```typescript
interface Receipt {
  id: string                          // UUID
  paymentId: string                   // Foreign key to payments
  userId: string                      // Foreign key to users
  invoiceNumber: string               // Unique invoice number
  amount: number                      // Amount in cents
  currency: string                    // ISO 4217 code
  items: ReceiptItem[]                // Line items
  pdfUrl: string                      // URL to stored PDF
  emailSentAt?: Date                  // When receipt was emailed
  createdAt: Date
  updatedAt: Date
}

interface ReceiptItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}
```

### Idempotency Key Model

```typescript
interface IdempotencyKey {
  id: string                          // UUID
  key: string                         // Unique idempotency key
  userId: string                      // Foreign key to users
  paymentResult: PaymentResult        // Cached payment result
  expiresAt: Date                     // Expiration time (24 hours)
  createdAt: Date
}
```

### Prisma Schema Updates

```prisma
enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}

model Payment {
  id                    String          @id @default(cuid())
  userId                String
  user                  User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripePaymentIntentId String          @unique
  amount                Int             // in cents
  currency              String          @default("usd")
  status                PaymentStatus   @default(PENDING)
  paymentMethodId       String?
  courseId              String?
  course                Course?         @relation(fields: [courseId], references: [id])
  subscriptionTierId    String?
  metadata              Json            @default("{}")
  idempotencyKey        String          @unique
  receiptId             String?
  receipt               Receipt?        @relation(fields: [receiptId], references: [id])
  refundedAmount        Int?
  refundReason          String?
  errorCode             String?
  errorMessage          String?
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model Receipt {
  id              String          @id @default(cuid())
  paymentId       String          @unique
  payment         Payment         @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  userId          String
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  invoiceNumber   String          @unique
  amount          Int             // in cents
  currency        String          @default("usd")
  items           Json            // Array of receipt items
  pdfUrl          String
  emailSentAt     DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([userId])
  @@index([createdAt])
}

model IdempotencyKey {
  id              String          @id @default(cuid())
  key             String          @unique
  userId          String
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  paymentResult   Json
  expiresAt       DateTime
  createdAt       DateTime        @default(now())

  @@index([userId])
  @@index([expiresAt])
}
```

## Error Handling

### Payment Processing Errors

| Error Code | Description | Recovery |
|-----------|-------------|----------|
| `card_declined` | Card was declined | Suggest alternative payment method |
| `insufficient_funds` | Insufficient funds | Suggest lower amount or alternative method |
| `expired_card` | Card has expired | Request updated card |
| `incorrect_cvc` | CVC is incorrect | Request correct CVC |
| `processing_error` | Stripe processing error | Retry with exponential backoff |
| `rate_limit` | Rate limit exceeded | Retry after delay |
| `authentication_error` | Authentication failed | Check API keys |

### Webhook Errors

| Error | Handling |
|-------|----------|
| Invalid signature | Log and reject event |
| Event not found | Log and skip |
| Database error | Retry with exponential backoff |
| Duplicate event | Idempotent processing |

### Retry Strategy

```
Attempt 1: Immediate
Attempt 2: After 1 second
Attempt 3: After 2 seconds
Attempt 4: After 4 seconds
Attempt 5: After 8 seconds
Max retries: 5
```

## Testing Strategy

### Unit Tests

- Payment Intent creation
- Idempotency key generation
- Error handling and mapping
- Receipt generation
- Webhook signature verification

### Integration Tests

- End-to-end payment flow
- Webhook event processing
- Database transaction handling
- Email delivery
- Stripe API integration

### E2E Tests

- Complete purchase flow
- Payment history retrieval
- Refund processing
- Error scenarios and recovery

## Security Considerations

### PCI DSS Compliance

- Never store full card details locally
- Use Stripe Payment Methods for card storage
- Implement HTTPS for all endpoints
- Validate all inputs
- Log all payment operations
- Implement rate limiting

### API Security

- JWT authentication on all endpoints
- CORS configuration
- Request validation and sanitization
- Webhook signature verification
- Idempotency key validation
- Rate limiting per user

### Data Security

- Encrypt sensitive data at rest
- Use environment variables for API keys
- Implement audit logging
- Regular security audits
- Implement data retention policies

## Performance Considerations

- Cache payment methods in Redis
- Implement pagination for payment history
- Use database indexes on frequently queried fields
- Batch webhook processing
- Implement connection pooling
- Monitor API response times

## Scalability Considerations

- Horizontal scaling for API endpoints
- Database replication for high availability
- Message queue for async operations
- Load balancing for webhook processing
- Caching layer for frequently accessed data
- Database sharding for large payment volumes

## Monitoring & Observability

### Metrics to Track

- Payment success rate
- Payment processing time
- Webhook processing latency
- Error rates by type
- Refund rate
- Duplicate payment attempts

### Alerts

- Payment success rate < 95%
- Webhook processing latency > 5s
- Error rate > 1%
- Failed webhook deliveries
- Database connection issues
- API rate limit approaching

### Logging

- All payment requests and responses
- All webhook events
- All errors and exceptions
- All refunds
- All receipt generations
- Audit trail for compliance
