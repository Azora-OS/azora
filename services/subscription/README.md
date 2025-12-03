# Subscription Service

Manages user subscriptions, billing cycles, and feature access control for Azora OS.

## Overview

The subscription service provides:
- Subscription tier management (Free, Pro, Enterprise)
- Billing cycle tracking and renewal management
- Feature access control based on subscription tier
- Integration with Stripe for payment processing
- Subscription statistics and analytics

## Architecture

### Components

1. **SubscriptionService** - Core subscription management
   - Create, update, cancel subscriptions
   - Manage billing cycles and renewals
   - Track subscription statistics

2. **FeatureAccessService** - Feature permission management
   - Check feature access by tier
   - Manage feature limits
   - Cache feature access for performance

3. **API Endpoints** - RESTful subscription management
   - `POST /api/subscriptions/create` - Create subscription
   - `PUT /api/subscriptions/update` - Update tier
   - `DELETE /api/subscriptions/cancel` - Cancel subscription
   - `GET /api/subscriptions/current` - Get current subscription

## Subscription Tiers

### Free Tier
- **Price**: $0/month
- **Features**: Basic course access, global leaderboard, community support
- **Course Limit**: 5 courses
- **Token Rewards**: 50/month

### Pro Tier
- **Price**: $9.99/month
- **Features**: Unlimited courses, course upload, offline access, certificates
- **Course Upload**: 5/month
- **Token Rewards**: 500/month
- **Revenue Share**: 70%

### Enterprise Tier
- **Price**: $99/month (custom pricing available)
- **Features**: Everything + white-label, SSO, API access, dedicated support
- **Course Upload**: Unlimited
- **Token Rewards**: 5000/month
- **Revenue Share**: 75%

## Usage

### Create Subscription

```typescript
import { SubscriptionService } from '@/services/subscription';

const service = new SubscriptionService();
const subscription = await service.createSubscription({
  userId: 'user-123',
  tier: 'PRO',
  stripeCustomerId: 'cus_123',
  stripeSubscriptionId: 'sub_123',
});
```

### Check Feature Access

```typescript
import { FeatureAccessService } from '@/services/subscription';

const featureService = new FeatureAccessService();
const hasAccess = await featureService.checkFeatureAccess('user-123', 'upload_courses');
```

### Get User Tier

```typescript
const tier = await featureService.getUserTier('user-123');
// Returns: 'FREE' | 'PRO' | 'ENTERPRISE'
```

### Get Feature Comparison

```typescript
const comparison = featureService.getFeatureComparison();
// Returns feature matrix for all tiers
```

## API Endpoints

### Create Subscription

```bash
POST /api/subscriptions/create
Content-Type: application/json
Authorization: Bearer <token>

{
  "tier": "PRO",
  "paymentMethodId": "pm_123"
}
```

Response:
```json
{
  "success": true,
  "subscription": {
    "id": "sub_123",
    "userId": "user_123",
    "tier": "PRO",
    "status": "ACTIVE",
    "renewalDate": "2024-12-15T10:00:00Z",
    "createdAt": "2024-11-15T10:00:00Z"
  }
}
```

### Update Subscription

```bash
PUT /api/subscriptions/update
Content-Type: application/json
Authorization: Bearer <token>

{
  "newTier": "ENTERPRISE",
  "prorationBehavior": "create_prorations"
}
```

### Cancel Subscription

```bash
DELETE /api/subscriptions/cancel
Content-Type: application/json
Authorization: Bearer <token>

{
  "reason": "Too expensive"
}
```

### Get Current Subscription

```bash
GET /api/subscriptions/current
Authorization: Bearer <token>
```

Response:
```json
{
  "subscription": {
    "id": "sub_123",
    "userId": "user_123",
    "tier": "PRO",
    "status": "ACTIVE",
    "renewalDate": "2024-12-15T10:00:00Z"
  },
  "features": [
    "view_courses",
    "upload_courses",
    "sell_courses",
    "offline_access",
    "certificates",
    "advanced_progress_tracking",
    "global_leaderboard",
    "friend_leaderboard",
    "token_rewards",
    "priority_support",
    "live_chat"
  ]
}
```

## Database Schema

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  tier SubscriptionTier NOT NULL DEFAULT 'FREE',
  status SubscriptionStatus NOT NULL DEFAULT 'ACTIVE',
  stripeCustomerId TEXT,
  stripeSubscriptionId TEXT,
  currentPeriodStart TIMESTAMP,
  currentPeriodEnd TIMESTAMP,
  renewalDate TIMESTAMP,
  cancelledAt TIMESTAMP,
  cancelReason TEXT,
  metadata JSONB DEFAULT '{}',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Billing History Table

```sql
CREATE TABLE billing_history (
  id TEXT PRIMARY KEY,
  subscriptionId TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status BillingStatus NOT NULL DEFAULT 'PENDING',
  invoiceNumber TEXT UNIQUE NOT NULL,
  stripeInvoiceId TEXT,
  billedAt TIMESTAMP NOT NULL,
  dueAt TIMESTAMP NOT NULL,
  paidAt TIMESTAMP,
  failedAt TIMESTAMP,
  failureReason TEXT,
  metadata JSONB DEFAULT '{}',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## Feature Matrix

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| View Courses | ✓ (5) | ✓ | ✓ |
| Upload Courses | ✗ | ✓ (5/mo) | ✓ |
| Sell Courses | ✗ | ✓ | ✓ |
| Offline Access | ✗ | ✓ | ✓ |
| Certificates | ✗ | ✓ | ✓ |
| Advanced Analytics | ✗ | ✓ | ✓ |
| Leaderboards | Global | Global + Friends | All |
| Token Rewards | 50/mo | 500/mo | 5000/mo |
| Support | Community | Priority (24h) | Dedicated (4h) |
| White-Label | ✗ | ✗ | ✓ |
| SSO Integration | ✗ | ✗ | ✓ |
| API Access | ✗ | ✗ | ✓ |

## Integration with Payment Service

The subscription service integrates with the payment service for:
- Creating Stripe customers
- Managing Stripe subscriptions
- Processing recurring payments
- Handling payment failures and retries

## Caching Strategy

Feature access is cached for 5 minutes to improve performance:
- Cache key: `userId`
- Cache value: `{ tier, timestamp }`
- Automatic invalidation on subscription changes

## Error Handling

The service uses the ErrorHandler from the payment service for consistent error handling:
- Invalid tier selection
- Subscription already exists
- No subscription found
- Stripe API errors
- Database errors

## Monitoring & Metrics

Key metrics to track:
- Total subscriptions by tier
- Monthly recurring revenue (MRR)
- Subscription churn rate
- Upgrade/downgrade rates
- Renewal success rate

## Testing

Run tests with:
```bash
npm test -- services/subscription
```

Test coverage includes:
- Subscription creation and updates
- Feature access control
- Billing cycle management
- Cache invalidation
- Error scenarios

## Future Enhancements

- [ ] Subscription pause/resume functionality
- [ ] Proration calculations for mid-cycle upgrades
- [ ] Dunning management for failed payments
- [ ] Subscription analytics dashboard
- [ ] Custom pricing for enterprise
- [ ] Volume discounts
- [ ] Annual billing with discounts
