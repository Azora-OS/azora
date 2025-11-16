# System Buy-Order Service

## Overview

The System Buy-Order Service implements an automated mechanism for purchasing AZR tokens using Rand-based revenue from course sales and subscriptions. This creates a deflationary pressure on the token supply while reinvesting platform revenue back into the token ecosystem.

## Key Features

### 1. Revenue Tracking
- Tracks revenue from multiple sources:
  - Course sales (5% burn)
  - Subscriptions
  - Other revenue streams
- Stores revenue records in database for audit trail
- Supports multiple currencies (primarily ZAR)

### 2. Automated Buy-Order Execution
- Calculates available revenue for token purchases
- Applies 10% of available revenue to buy-orders
- Enforces minimum and maximum buy amounts
- Executes purchases on blockchain via Web3
- Records all transactions with blockchain hash

### 3. Buy-Order History & Metrics
- Maintains complete history of all buy-orders
- Tracks tokens acquired and Rand spent
- Calculates average price per token
- Provides success rate metrics
- Supports pagination for history queries

### 4. Configuration Management
- Configurable revenue percentage (default: 10%)
- Configurable execution schedule (daily/weekly/monthly)
- Configurable min/max buy amounts
- Runtime configuration updates

## Architecture

```
┌─────────────────────────────────────────┐
│   Payment/Subscription Services         │
│   (Track revenue sources)               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   SystemBuyOrderService                 │
│   ├─ trackRevenue()                     │
│   ├─ calculateAvailableRevenue()        │
│   ├─ executeBuyOrder()                  │
│   ├─ getBuyOrderHistory()               │
│   └─ getMetrics()                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   BlockchainBurnService                 │
│   (Execute token purchases on chain)    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Blockchain (Web3)                     │
│   (Token purchase execution)            │
└─────────────────────────────────────────┘
```

## Database Schema

### SystemBuyOrderRevenue
Tracks all revenue sources for buy-order calculations:
```sql
CREATE TABLE system_buy_order_revenue (
  id TEXT PRIMARY KEY,
  source RevenueSource,           -- course_sale, subscription, other
  amount DECIMAL(20,8),           -- Revenue amount
  currency TEXT DEFAULT 'ZAR',    -- Currency code
  recordedAt TIMESTAMP,           -- When revenue was recorded
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### SystemBuyOrderHistory
Records all buy-order executions:
```sql
CREATE TABLE system_buy_order_history (
  id TEXT PRIMARY KEY,
  revenueUsed DECIMAL(20,8),      -- Rand spent on purchase
  tokensAcquired DECIMAL(20,8),   -- AZR tokens acquired
  pricePerToken DECIMAL(20,8),    -- Price per token at execution
  executionTime TIMESTAMP,        -- When purchase was executed
  blockchainTxHash TEXT UNIQUE,   -- Blockchain transaction hash
  status BuyOrderStatus,          -- pending, completed, failed
  error TEXT,                     -- Error message if failed
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

## Usage Examples

### Initialize Service
```typescript
import { SystemBuyOrderService } from './system-buy-order';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const buyOrderService = new SystemBuyOrderService(prisma);
```

### Track Revenue
```typescript
// Track course sale revenue
await buyOrderService.trackRevenue('course_sale', 5000, 'ZAR');

// Track subscription revenue
await buyOrderService.trackRevenue('subscription', 2000, 'ZAR');
```

### Calculate Available Revenue
```typescript
const availableRevenue = await buyOrderService.calculateAvailableRevenue();
console.log(`Available for buy-order: ${availableRevenue.toString()} ZAR`);
// Output: Available for buy-order: 700 ZAR (if total revenue is 7000 and 10% is allocated)
```

### Execute Buy-Order
```typescript
// Execute buy-order at current token price
const result = await buyOrderService.executeBuyOrder(50); // 50 ZAR per token

if (result.success) {
  console.log(`Purchased ${result.tokensAcquired.toString()} tokens`);
  console.log(`Spent ${result.randSpent.toString()} ZAR`);
  console.log(`Transaction: ${result.transactionHash}`);
} else {
  console.error(`Buy-order failed: ${result.error}`);
}
```

### Get Buy-Order History
```typescript
const { history, total } = await buyOrderService.getBuyOrderHistory(50, 0);

history.forEach(record => {
  console.log(`
    Execution: ${record.executionTime}
    Tokens: ${record.tokensAcquired.toString()}
    Rand Spent: ${record.revenueUsed.toString()}
    Status: ${record.status}
  `);
});
```

### Get Metrics
```typescript
const metrics = await buyOrderService.getMetrics();

console.log(`
  Total Revenue Tracked: ${metrics.totalRevenueTracked.toString()} ZAR
  Total Tokens Acquired: ${metrics.totalTokensAcquired.toString()}
  Total Rand Spent: ${metrics.totalRandSpent.toString()} ZAR
  Average Price: ${metrics.averagePricePerToken.toString()} ZAR/token
  Executions: ${metrics.executionCount}
  Success Rate: ${(metrics.successRate * 100).toFixed(2)}%
  Last Execution: ${metrics.lastExecutionTime}
`);
```

### Update Configuration
```typescript
// Change to weekly execution with different thresholds
buyOrderService.updateConfig({
  revenuePercentage: 0.15,        // 15% instead of 10%
  executionSchedule: 'weekly',    // Weekly instead of daily
  minBuyAmount: new Decimal(500), // Minimum 500 ZAR
  maxBuyAmount: new Decimal(50000), // Maximum 50k ZAR
});
```

## Integration Points

### 1. Payment Service Integration
When processing course purchases or subscription payments:
```typescript
// After successful payment
await buyOrderService.trackRevenue('course_sale', paymentAmount, 'ZAR');
```

### 2. Scheduler Integration
For automated daily/weekly/monthly execution:
```typescript
// In your scheduler (e.g., Bull, node-cron)
const schedule = require('node-cron');

schedule.scheduleJob('0 0 * * *', async () => {
  // Get current token price from market
  const currentPrice = await getTokenPrice();
  
  // Execute buy-order
  const result = await buyOrderService.executeBuyOrder(currentPrice);
  
  if (result.success) {
    logger.info('Automated buy-order executed', {
      tokensAcquired: result.tokensAcquired.toString(),
      randSpent: result.randSpent.toString(),
    });
  }
});
```

### 3. Leaderboard Integration
After buy-order execution, update leaderboard rankings:
```typescript
const result = await buyOrderService.executeBuyOrder(currentPrice);

if (result.success) {
  // Update leaderboard with new token supply
  await leaderboardService.updateRankings();
}
```

## Economic Impact

### Deflationary Mechanism
1. **Revenue Allocation**: 10% of platform revenue is allocated to token purchases
2. **Token Acquisition**: System purchases tokens at market price
3. **Supply Reduction**: Purchased tokens are held by system, reducing circulating supply
4. **Price Pressure**: Reduced supply creates upward price pressure
5. **User Benefit**: Token holders benefit from appreciation

### Example Scenario
- Platform generates 100,000 ZAR in monthly revenue
- 10,000 ZAR (10%) allocated to buy-orders
- Current token price: 50 ZAR per token
- Tokens acquired: 200 AZR
- Circulating supply reduced by 200 tokens
- Token holders' ownership percentage increases

## Error Handling

### Revenue Tracking Errors
- Negative or zero amounts rejected
- Database errors logged and propagated
- Transaction rollback on failure

### Buy-Order Execution Errors
- Insufficient revenue: Returns error without executing
- Below minimum threshold: Returns error with explanation
- Blockchain failure: Recorded in history with error message
- Retry logic: Automatic exponential backoff for blockchain operations

## Testing

Run the test suite:
```bash
npm test -- services/tokens/__tests__/system-buy-order.test.ts
```

Test coverage includes:
- Revenue tracking (valid/invalid amounts)
- Available revenue calculation
- Buy-order execution (success/failure scenarios)
- Minimum/maximum amount enforcement
- History retrieval and pagination
- Metrics calculation
- Configuration management

## Performance Considerations

### Database Optimization
- Indexed queries on source, status, executionTime
- Aggregation queries optimized with proper indexes
- Pagination support for large history datasets

### Blockchain Optimization
- Batch revenue tracking before execution
- Caching of token prices
- Retry logic with exponential backoff
- Transaction verification

### Scalability
- Horizontal scaling via multiple scheduler instances
- Database connection pooling
- Async/await for non-blocking operations
- Efficient decimal arithmetic with Prisma Decimal type

## Security Considerations

### Access Control
- Service should only be called from authorized payment/subscription services
- Blockchain transactions signed and verified
- Audit logging of all operations

### Data Integrity
- Unique constraint on blockchain transaction hash
- Idempotent operations for retry safety
- Transaction status tracking for reconciliation

### Fraud Prevention
- Revenue amount validation
- Price per token validation
- Blockchain transaction verification
- Audit trail for all operations

## Future Enhancements

1. **Dynamic Pricing**: Adjust buy-order amounts based on market conditions
2. **Multi-Currency Support**: Support purchases in multiple currencies
3. **Advanced Scheduling**: Cron-based scheduling with timezone support
4. **Analytics Dashboard**: Real-time metrics and visualization
5. **Governance**: DAO voting on buy-order parameters
6. **Liquidity Pools**: Integration with DEX for better pricing
7. **Staking Rewards**: Distribute purchased tokens as staking rewards

## Troubleshooting

### Buy-Order Not Executing
1. Check available revenue: `calculateAvailableRevenue()`
2. Verify minimum threshold: `getConfig().minBuyAmount`
3. Check blockchain service status
4. Review error logs in history

### Incorrect Metrics
1. Verify revenue tracking records
2. Check buy-order history status
3. Ensure database indexes are created
4. Run migration: `prisma migrate deploy`

### Blockchain Transaction Failures
1. Check blockchain service logs
2. Verify token price accuracy
3. Check gas estimates
4. Review retry configuration

## References

- [Token Burn System](./TOKEN-BURN-README.md)
- [Blockchain Burn Service](./BLOCKCHAIN-BURN-SERVICE.md)
- [Token Rewards Service](./README.md)
- [Prisma Documentation](https://www.prisma.io/docs/)
