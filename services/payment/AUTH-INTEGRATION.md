# Payment Service Auth Integration Guide

## Overview

This guide documents how the payment service integrates with Azora OS's existing JWT authentication system. All monetization endpoints (payments, subscriptions, tokens, marketplace, enterprise) use a standardized auth approach.

## Authentication Methods

The payment service supports three authentication methods:

### 1. x-user-id Header (Internal Services)
Used for internal service-to-service communication:
```bash
curl -X POST http://localhost:3000/api/payments/process \
  -H "x-user-id: user-123" \
  -H "Content-Type: application/json" \
  -d '{"amount": 9999, "currency": "usd", "paymentMethodId": "pm_123"}'
```

### 2. Authorization Bearer Token (External Clients)
Used for external API clients:
```bash
curl -X POST http://localhost:3000/api/payments/process \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 9999, "currency": "usd", "paymentMethodId": "pm_123"}'
```

### 3. JWT in Cookies (Web Clients)
Used for browser-based clients:
```javascript
// Automatically sent with credentials
fetch('http://localhost:3000/api/payments/process', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 9999,
    currency: 'usd',
    paymentMethodId: 'pm_123'
  })
});
```

## Implementation Pattern

All monetization endpoints follow this pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyResourceOwnership } from '@/services/shared/middleware/monetization-auth';
import { logger } from '@/services/shared/logging';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate request
    const context = requireAuth(request);
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = context.userId;

    // 2. Parse and validate request body
    const body = await request.json();
    // ... validation logic

    // 3. Log authenticated action
    logger.info('Processing payment', { userId, amount: body.amount });

    // 4. Execute business logic
    // ... service calls

    // 5. Return response
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    logger.error('Error processing payment', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Role-Based Access Control

For admin-only endpoints, use role checking:

```typescript
import { requireAuth, requireRole } from '@/services/shared/middleware/monetization-auth';

export async function POST(request: NextRequest) {
  const context = requireAuth(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  if (!requireRole(context, ['admin', 'support'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ... admin-only logic
}
```

## Resource Ownership Verification

For user-specific resources, verify ownership:

```typescript
import { requireAuth, verifyResourceOwnership } from '@/services/shared/middleware/monetization-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const context = requireAuth(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get payment and verify user owns it
  const payment = await paymentRepository.getPaymentById(params.id);
  if (!payment || !verifyResourceOwnership(context, payment.userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ... return payment details
}
```

## Endpoints with Auth Integration

### Payment Endpoints
- ✅ `POST /api/payments/process` - Requires auth
- ✅ `POST /api/payments/refund` - Requires auth + resource ownership
- ✅ `GET /api/payments/history` - Requires auth
- ✅ `GET /api/payments/[id]` - Requires auth + resource ownership

### Subscription Endpoints
- ✅ `POST /api/subscriptions/create` - Requires auth
- ✅ `POST /api/subscriptions/update` - Requires auth + resource ownership
- ✅ `POST /api/subscriptions/cancel` - Requires auth + resource ownership
- ✅ `GET /api/subscriptions/current` - Requires auth

### Token Endpoints
- ✅ `GET /api/tokens/balance` - Requires auth
- ✅ `POST /api/tokens/award` - Requires auth + admin role
- ✅ `POST /api/tokens/redeem` - Requires auth

### Marketplace Endpoints
- ✅ `POST /api/courses/upload` - Requires auth
- ✅ `GET /api/courses/list` - Optional auth
- ✅ `POST /api/courses/purchase` - Requires auth
- ✅ `GET/POST /api/courses/[courseId]/reviews` - Requires auth for POST

### Enterprise Endpoints
- ✅ `POST /api/enterprise/licenses/create` - Requires auth + admin role
- ✅ `POST /api/enterprise/licenses/activate` - Requires auth

## Logging and Audit Trail

All authenticated actions are logged with user context:

```typescript
logger.info('Payment processed', {
  userId: context.userId,
  paymentId: result.paymentId,
  amount: body.amount,
  timestamp: new Date().toISOString(),
});
```

This enables:
- User activity tracking
- Fraud detection
- Compliance audits
- Performance monitoring

## Error Handling

Standard error responses:

```typescript
// 401 Unauthorized - No valid auth provided
{ error: 'Unauthorized', status: 401 }

// 403 Forbidden - Auth valid but insufficient permissions
{ error: 'Forbidden', status: 403 }

// 400 Bad Request - Invalid request data
{ error: 'Invalid request', details: [...], status: 400 }

// 500 Internal Server Error - Unexpected error
{ error: 'Internal server error', status: 500 }
```

## Testing

When testing authenticated endpoints:

```bash
# With x-user-id header
curl -X POST http://localhost:3000/api/payments/process \
  -H "x-user-id: test-user-123" \
  -H "Content-Type: application/json" \
  -d '{"amount": 9999, "currency": "usd", "paymentMethodId": "pm_test"}'

# Without auth (should fail)
curl -X POST http://localhost:3000/api/payments/process \
  -H "Content-Type: application/json" \
  -d '{"amount": 9999, "currency": "usd", "paymentMethodId": "pm_test"}'
# Response: 401 Unauthorized
```

## Integration Checklist

- [x] Auth middleware created
- [x] Payment endpoints secured
- [x] Subscription endpoints secured
- [x] Token endpoints secured
- [x] Marketplace endpoints secured
- [x] Enterprise endpoints secured
- [x] Role-based access control implemented
- [x] Resource ownership verification implemented
- [x] Logging and audit trail configured
- [x] Error handling standardized

## Next Steps

1. Deploy auth middleware to production
2. Update API documentation with auth requirements
3. Configure monitoring for auth failures
4. Set up alerts for suspicious auth patterns
5. Conduct security audit of all endpoints
