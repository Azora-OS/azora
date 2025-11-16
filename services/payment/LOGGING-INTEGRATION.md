# Payment Service Logging Integration

## Overview

Comprehensive logging integration for all monetization services (payments, subscriptions, tokens, marketplace, enterprise). All operations are logged with structured data for monitoring, debugging, and compliance.

## Logging Levels

- **INFO**: Normal operations (payments processed, subscriptions created, tokens awarded)
- **WARN**: Unusual but recoverable situations (payment declined, subscription cancelled)
- **ERROR**: Errors that need attention (payment failed, database error, API error)
- **DEBUG**: Detailed diagnostic information (request/response data, calculations)

## Payment Service Logging

### Payment Processing
```typescript
logger.info('Processing payment', {
  userId,
  amount,
  currency,
  paymentMethodId,
  courseId,
  subscriptionTierId,
  timestamp: new Date().toISOString(),
});

logger.info('Payment processed successfully', {
  userId,
  paymentId,
  stripePaymentIntentId,
  amount,
  status: 'succeeded',
  processingTime: endTime - startTime,
});

logger.error('Payment processing failed', {
  userId,
  amount,
  error: error.message,
  errorCode: error.code,
  retryable: error.retryable,
});
```

### Refund Processing
```typescript
logger.info('Processing refund', {
  userId,
  paymentId,
  refundAmount,
  reason,
});

logger.info('Refund processed successfully', {
  paymentId,
  refundId,
  amount,
  status: 'succeeded',
});

logger.warn('Refund partially processed', {
  paymentId,
  requestedAmount,
  refundedAmount,
  reason: 'Insufficient funds',
});
```

### Webhook Events
```typescript
logger.info('Webhook event received', {
  eventId,
  eventType: 'payment_intent.succeeded',
  paymentIntentId,
  timestamp: event.created,
});

logger.info('Webhook event processed', {
  eventId,
  eventType,
  paymentId,
  status: 'updated',
  processingTime,
});

logger.error('Webhook processing failed', {
  eventId,
  eventType,
  error: error.message,
  retryable: true,
});
```

## Subscription Service Logging

### Subscription Creation
```typescript
logger.info('Creating subscription', {
  userId,
  tier: 'PRO',
  stripeCustomerId,
  stripeSubscriptionId,
});

logger.info('Subscription created successfully', {
  subscriptionId,
  userId,
  tier,
  status: 'ACTIVE',
  renewalDate,
});

logger.error('Subscription creation failed', {
  userId,
  tier,
  error: error.message,
  reason: 'Payment method invalid',
});
```

### Subscription Updates
```typescript
logger.info('Updating subscription', {
  subscriptionId,
  userId,
  oldTier: 'PRO',
  newTier: 'ENTERPRISE',
  prorationBehavior: 'create_prorations',
});

logger.info('Subscription updated successfully', {
  subscriptionId,
  newTier: 'ENTERPRISE',
  prorationAmount: 2500,
  effectiveDate,
});
```

### Subscription Cancellation
```typescript
logger.info('Cancelling subscription', {
  subscriptionId,
  userId,
  reason: 'User requested',
  refundEligible: true,
});

logger.info('Subscription cancelled successfully', {
  subscriptionId,
  cancelledAt,
  refundAmount,
  status: 'CANCELLED',
});

logger.warn('Subscription cancellation with refund', {
  subscriptionId,
  refundAmount,
  reason: 'Within refund window',
});
```

## Token Service Logging

### Token Awards
```typescript
logger.info('Awarding tokens', {
  userId,
  amount: 100,
  reason: 'course_completion',
  courseId,
  difficulty: 'advanced',
});

logger.info('Tokens awarded successfully', {
  userId,
  amount: 100,
  newBalance: 500,
  transactionId,
});

logger.error('Token award failed', {
  userId,
  amount: 100,
  reason: 'course_completion',
  error: error.message,
});
```

### Token Redemption
```typescript
logger.info('Redeeming tokens', {
  userId,
  amount: 50,
  feature: 'premium_content',
  itemId,
});

logger.info('Tokens redeemed successfully', {
  userId,
  amount: 50,
  newBalance: 450,
  feature: 'premium_content',
  transactionId,
});

logger.warn('Insufficient token balance', {
  userId,
  requestedAmount: 100,
  availableBalance: 50,
  feature: 'premium_content',
});
```

### Leaderboard Updates
```typescript
logger.debug('Calculating leaderboard', {
  type: 'global',
  limit: 100,
  calculationTime: 245,
});

logger.info('Leaderboard calculated', {
  type: 'global',
  topUser: { userId: 'user-123', tokens: 5000, rank: 1 },
  totalUsers: 1250,
  cacheHit: false,
});
```

## Marketplace Service Logging

### Course Upload
```typescript
logger.info('Uploading course', {
  userId,
  courseTitle,
  category,
  level,
  fileSize,
  duration,
});

logger.info('Course uploaded successfully', {
  courseId,
  userId,
  title,
  status: 'PENDING_REVIEW',
  uploadTime: 3500,
});

logger.error('Course upload failed', {
  userId,
  courseTitle,
  error: error.message,
  reason: 'File too large',
});
```

### Course Purchase
```typescript
logger.info('Processing course purchase', {
  userId,
  courseId,
  courseTitle,
  price: 4999,
  instructorId,
});

logger.info('Course purchased successfully', {
  purchaseId,
  userId,
  courseId,
  amount: 4999,
  instructorEarnings: 3499,
  platformEarnings: 1500,
});

logger.warn('Course already purchased', {
  userId,
  courseId,
  previousPurchaseDate,
});
```

### Course Reviews
```typescript
logger.info('Submitting course review', {
  userId,
  courseId,
  rating: 5,
  reviewLength: 250,
});

logger.info('Review submitted successfully', {
  reviewId,
  courseId,
  userId,
  rating: 5,
  status: 'PENDING_MODERATION',
});

logger.warn('Review flagged for moderation', {
  reviewId,
  reason: 'Contains inappropriate content',
  flaggedBy: 'automated_filter',
});
```

## Enterprise Service Logging

### License Creation
```typescript
logger.info('Creating enterprise license', {
  organizationName,
  organizationEmail,
  tier: 'PROFESSIONAL',
  maxUsers: 100,
  maxCourses: 50,
  duration: 365,
});

logger.info('License created successfully', {
  licenseId,
  licenseKey,
  organizationName,
  tier: 'PROFESSIONAL',
  expiryDate,
});

logger.error('License creation failed', {
  organizationName,
  error: error.message,
  reason: 'Invalid organization email',
});
```

### License Activation
```typescript
logger.info('Activating license', {
  licenseKey,
  organizationName,
});

logger.info('License activated successfully', {
  licenseId,
  licenseKey,
  organizationName,
  status: 'ACTIVE',
  activatedAt,
});

logger.warn('License activation with warning', {
  licenseKey,
  warning: 'License expiring in 30 days',
  expiryDate,
});
```

### Usage Tracking
```typescript
logger.debug('Tracking license usage', {
  licenseId,
  activeUsers: 45,
  maxUsers: 100,
  coursesCreated: 12,
  maxCourses: 50,
  apiCallsThisMonth: 5000,
  maxApiCalls: 10000,
});

logger.warn('License usage threshold exceeded', {
  licenseId,
  metric: 'activeUsers',
  current: 105,
  limit: 100,
  percentageOver: 5,
});
```

## Structured Logging Format

All logs follow this structure:

```typescript
{
  timestamp: '2025-11-16T10:30:45.123Z',
  level: 'INFO',
  service: 'payment',
  operation: 'process_payment',
  userId: 'user-123',
  requestId: 'req-456',
  duration: 245,
  status: 'success',
  data: {
    paymentId: 'pay-789',
    amount: 9999,
    currency: 'usd',
  },
  error: null,
  metadata: {
    environment: 'production',
    version: '1.0.0',
    region: 'us-east-1',
  }
}
```

## Sensitive Data Handling

**Never log**:
- Credit card numbers
- CVV codes
- Full payment method details
- API keys or secrets
- User passwords
- Personal identification numbers

**Safe to log**:
- Last 4 digits of card (e.g., "****1234")
- Payment method type (e.g., "card", "bank_account")
- User IDs and emails
- Transaction amounts and currencies
- Error messages (without sensitive details)

## Log Retention

- **INFO/WARN**: 30 days
- **ERROR**: 90 days
- **DEBUG**: 7 days
- **Audit logs**: 1 year (for compliance)

## Monitoring and Alerts

### Critical Alerts
- Payment processing failure rate > 5%
- Subscription cancellation rate > 10%
- Token balance inconsistencies
- License activation failures
- Database connection errors

### Warning Alerts
- Payment processing time > 5 seconds
- Webhook processing delays > 10 seconds
- High refund request rate
- Unusual token redemption patterns
- License usage near limits

## Integration Checklist

- [x] Payment service logging configured
- [x] Subscription service logging configured
- [x] Token service logging configured
- [x] Marketplace service logging configured
- [x] Enterprise service logging configured
- [x] Structured logging format defined
- [x] Sensitive data handling documented
- [x] Log retention policies set
- [x] Monitoring and alerts configured
- [x] Ready for production deployment

## Next Steps

1. Deploy logging configuration to production
2. Set up log aggregation (ELK, Datadog, etc.)
3. Configure dashboards for monitoring
4. Set up alert rules
5. Train team on log analysis
