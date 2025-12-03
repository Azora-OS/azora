# Cost Optimizer System

## Overview

The Cost Optimizer System provides comprehensive cost management for the AI Routing System. It enables:

- **Cost Calculation**: Calculate costs per tier based on token usage
- **Tier Selection**: Intelligently select optimal tiers based on budget, complexity, and priorities
- **Cost Tracking**: Track spending per user and per tier
- **Alert Management**: Monitor spending thresholds and trigger alerts

## Architecture

### Components

#### 1. Cost Optimizer (`cost-optimizer.ts`)

Manages cost calculation and tracking for all routing tiers.

**Key Features:**
- Calculates cost based on input/output tokens
- Tracks spending per user and per tier
- Provides cost metrics and statistics
- Supports cost configuration per tier

**Tier Costs:**
- **Local LLM**: $0 (no API cost)
- **RAP System**: $0.001 base + $0.0001 per input token + $0.0003 per output token
- **External LLM**: $0.002 base + $0.0003 per input token + $0.0006 per output token

**Usage:**
```typescript
const costOptimizer = new CostOptimizer(prisma);

// Calculate cost for a query
const cost = await costOptimizer.calculateCost(
  RoutingTier.RAP_SYSTEM,
  100,  // input tokens
  200   // output tokens
);

// Track spending
await costOptimizer.trackSpending('user-123', RoutingTier.RAP_SYSTEM, cost);

// Get spending metrics
const metrics = await costOptimizer.getSpendingMetrics();
const userSpending = await costOptimizer.getUserSpending('user-123');
```

#### 2. Tier Selector (`tier-selector.ts`)

Implements intelligent tier selection based on multiple criteria.

**Selection Criteria:**
- Query complexity (SIMPLE, MODERATE, COMPLEX)
- User budget constraints
- Priority (cost, speed, quality)
- Estimated token counts

**Usage:**
```typescript
const tierSelector = new TierSelector(costOptimizer);

// Select optimal tier
const selection = await tierSelector.selectTier({
  complexity: QueryComplexity.MODERATE,
  userBudget: 1.0,
  prioritizeCost: true,
  estimatedInputTokens: 100,
  estimatedOutputTokens: 200
});

console.log(`Selected tier: ${selection.selectedTier}`);
console.log(`Estimated cost: $${selection.estimatedCost}`);
console.log(`Reason: ${selection.reason}`);

// Get cost-benefit analysis
const analysis = await tierSelector.getCostBenefitAnalysis(100, 200);

// Get recommendation
const recommendation = await tierSelector.getRecommendation({
  complexity: QueryComplexity.COMPLEX,
  prioritizeQuality: true
});
```

#### 3. Cost Alert Manager (`cost-alerts.ts`)

Monitors spending and triggers alerts based on thresholds.

**Alert Types:**
- **Warning**: User has used 75% of monthly budget
- **Critical**: User has used 90% of monthly budget
- **Daily Limit**: Daily spending limit exceeded
- **Hourly Limit**: Hourly spending limit exceeded

**Notification Channels:**
- Email
- SMS
- Webhook
- In-app

**Usage:**
```typescript
const alertManager = new CostAlertManager(prisma);

// Set alert threshold
await alertManager.setAlertThreshold({
  userId: 'user-123',
  monthlyBudget: 100,
  warningThreshold: 0.75,
  criticalThreshold: 0.90,
  dailyLimit: 10,
  hourlyLimit: 1
});

// Set notification config
await alertManager.setNotificationConfig({
  userId: 'user-123',
  channels: ['email', 'webhook'],
  emailAddress: '[email]',
  webhookUrl: 'https://example.com/alerts',
  enableWarnings: true,
  enableCritical: true,
  enableDailyLimit: true,
  enableHourlyLimit: true
});

// Check spending thresholds
const alerts = await alertManager.checkSpendingThresholds(
  'user-123',
  75,    // current spending
  100    // monthly budget
);

// Track hourly spending
await alertManager.trackHourlySpending('user-123', 0.50);

// Check hourly limit
const hourlyAlert = await alertManager.checkHourlyLimit('user-123', 0.95);

// Get alert history
const history = await alertManager.getAlertHistory('user-123');

// Get unacknowledged alerts
const unacknowledged = await alertManager.getUnacknowledgedAlerts('user-123');

// Acknowledge alert
await alertManager.acknowledgeAlert('alert-id');
```

## Integration with AI Routing

### Step 1: Initialize Cost Optimizer

```typescript
import { CostOptimizer, TierSelector, CostAlertManager } from './cost-optimizer-index';

const costOptimizer = new CostOptimizer(prisma);
const tierSelector = new TierSelector(costOptimizer);
const alertManager = new CostAlertManager(prisma);
```

### Step 2: Use in Routing Decision

```typescript
// In HierarchicalRouter.route()
const selection = await tierSelector.selectTier({
  complexity: classification.classifiedAs,
  userBudget: userBudget,
  estimatedInputTokens: query.query.length / 4, // rough estimate
  estimatedOutputTokens: 200 // default estimate
});

const selectedTier = selection.selectedTier;
```

### Step 3: Track Costs

```typescript
// After getting response
const cost = await costOptimizer.calculateCost(
  selectedTier,
  response.inputTokens,
  response.outputTokens
);

await costOptimizer.trackSpending(userId, selectedTier, cost);

// Check alerts
const alerts = await alertManager.checkSpendingThresholds(
  userId,
  userTotalSpending,
  userMonthlyBudget
);
```

## Cost Calculation Examples

### Example 1: Simple Query (Local LLM)
```
Input: 50 tokens
Output: 100 tokens
Cost: $0 (no API cost)
```

### Example 2: Moderate Query (RAP System)
```
Input: 100 tokens
Output: 200 tokens
Cost = $0.001 + (100 * $0.0001) + (200 * $0.0003)
     = $0.001 + $0.01 + $0.06
     = $0.071
```

### Example 3: Complex Query (External LLM)
```
Input: 200 tokens
Output: 500 tokens
Cost = $0.002 + (200 * $0.0003) + (500 * $0.0006)
     = $0.002 + $0.06 + $0.30
     = $0.362
```

## Tier Selection Logic

### By Complexity
- **SIMPLE**: Local LLM (fastest, cheapest)
- **MODERATE**: RAP System (balanced)
- **COMPLEX**: External LLM (highest quality)

### By Priority
- **prioritizeCost**: Select cheapest tier within budget
- **prioritizeSpeed**: Select fastest tier
- **prioritizeQuality**: Select highest quality tier

### By Budget
- If selected tier exceeds budget, fallback to cheaper tier
- If no tier fits budget, use Local LLM

## Alert Thresholds

### Monthly Budget Alerts
- **Warning**: 75% of budget used
- **Critical**: 90% of budget used

### Daily/Hourly Limits
- Configurable per user
- Prevents runaway costs
- Can be combined with monthly budget

## Database Schema

### Required Tables

```sql
-- Cost tracking
CREATE TABLE user_spending (
  userId VARCHAR PRIMARY KEY,
  totalSpent DECIMAL,
  spentByTier JSON,
  queriesByTier JSON,
  lastUpdated TIMESTAMP
);

-- Alert configuration
CREATE TABLE cost_alert_threshold (
  userId VARCHAR PRIMARY KEY,
  monthlyBudget DECIMAL,
  warningThreshold DECIMAL,
  criticalThreshold DECIMAL,
  dailyLimit DECIMAL,
  hourlyLimit DECIMAL
);

-- Notification configuration
CREATE TABLE notification_config (
  userId VARCHAR PRIMARY KEY,
  channels JSON,
  emailAddress VARCHAR,
  phoneNumber VARCHAR,
  webhookUrl VARCHAR,
  enableWarnings BOOLEAN,
  enableCritical BOOLEAN,
  enableDailyLimit BOOLEAN,
  enableHourlyLimit BOOLEAN
);

-- Alert history
CREATE TABLE cost_alert (
  id VARCHAR PRIMARY KEY,
  userId VARCHAR,
  alertType VARCHAR,
  severity VARCHAR,
  message TEXT,
  currentSpending DECIMAL,
  threshold DECIMAL,
  percentageUsed DECIMAL,
  timestamp TIMESTAMP,
  acknowledged BOOLEAN,
  acknowledgedAt TIMESTAMP
);
```

## Best Practices

1. **Set Realistic Budgets**: Consider typical usage patterns
2. **Monitor Alerts**: Regularly check unacknowledged alerts
3. **Update Tier Costs**: Keep costs synchronized with actual API pricing
4. **Use Tier Profiles**: Update profiles based on actual performance metrics
5. **Test Thresholds**: Validate alert thresholds before production

## Performance Considerations

- Cost calculations are O(1) operations
- Tier selection uses in-memory profiles for fast decisions
- Spending tracking is batched to database every 50 queries
- Alert checks are performed on-demand

## Future Enhancements

1. **Machine Learning**: Predict optimal tier based on query patterns
2. **Dynamic Pricing**: Adjust costs based on demand
3. **Bulk Discounts**: Volume-based pricing tiers
4. **Cost Forecasting**: Predict monthly spending
5. **Optimization Recommendations**: Suggest tier changes to reduce costs
