# System Buy-Order - Quick Start Guide

## Installation & Setup

### 1. Run Database Migration
```bash
npx prisma migrate deploy
```

### 2. Initialize Service
```typescript
import { SystemBuyOrderService } from './system-buy-order';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const buyOrderService = new SystemBuyOrderService(prisma);
```

## Common Tasks

### Track Revenue from Course Sale
```typescript
// After successful course payment
await buyOrderService.trackRevenue('course_sale', 5000, 'ZAR');
```

### Track Revenue from Subscription
```typescript
// After successful subscription payment
await buyOrderService.trackRevenue('subscription', 2000, 'ZAR');
```

### Execute Buy-Order
```typescript
// Get current token price (from market data)
const tokenPrice = 50; // ZAR per token

// Execute buy-order
const result = await buyOrderService.executeBuyOrder(tokenPrice);

if (result.success) {
  console.log(`Purchased ${result.tokensAcquired} tokens`);
  console.log(`Spent ${result.randSpent} ZAR`);
} else {
  console.error(`Failed: ${result.error}`);
}
```

### Check Available Revenue
```typescript
const available = await buyOrderService.calculateAvailableRevenue();
console.log(`Available for buy-order: ${available} ZAR`);
```

### Get Metrics
```typescript
const metrics = await buyOrderService.getMetrics();
console.log(`
  Total Revenue: ${metrics.totalRevenueTracked} ZAR
  Tokens Acquired: ${metrics.totalTokensAcquired}
  Success Rate: ${(metrics.successRate * 100).toFixed(2)}%
`);
```

### Get History
```typescript
const { history, total } = await buyOrderService.getBuyOrderHistory(50, 0);

history.forEach(record => {
  console.log(`${record.executionTime}: ${record.tokensAcquired} tokens for ${record.revenueUsed} ZAR`);
});
```

## Configuration

### Default Configuration
```typescript
{
  revenuePercentage: 0.1,           // 10%
  executionSchedule: 'daily',       // daily, weekly, monthly
  minBuyAmount: 100,                // Minimum 100 ZAR
  maxBuyAmount: 1000000             // Maximum 1M ZAR
}
```

### Update Configuration
```typescript
buyOrderService.updateConfig({
  revenuePercentage: 0.15,          // Change to 15%
  executionSchedule: 'weekly',      // Change to weekly
  minBuyAmount: 500,                // Change minimum
  maxBuyAmount: 500000              // Change maximum
});
```

## Integration Examples

### With Payment Service
```typescript
// In payment-processor.ts
import { buyOrderService } from './services/tokens';

async function processPayment(payment) {
  // Process payment...
  
  // Track revenue for buy-order
  await buyOrderService.trackRevenue('course_sale', payment.amount, 'ZAR');
}
```

### With Scheduler (node-cron)
```typescript
import cron from 'node-cron';
import { buyOrderService } from './services/tokens';

// Execute daily at midnight
cron.schedule('0 0 * * *', async () => {
  const tokenPrice = await getTokenPrice(); // Your price feed
  const result = await buyOrderService.executeBuyOrder(tokenPrice);
  
  if (result.success) {
    console.log(`Daily buy-order: ${result.tokensAcquired} tokens`);
  }
});
```

### With Bull Queue
```typescript
import Queue from 'bull';
import { buyOrderService } from './services/tokens';

const buyOrderQueue = new Queue('buy-order');

buyOrderQueue.process(async (job) => {
  const { tokenPrice } = job.data;
  const result = await buyOrderService.executeBuyOrder(tokenPrice);
  return result;
});

// Schedule job
buyOrderQueue.add(
  { tokenPrice: 50 },
  { repeat: { cron: '0 0 * * *' } } // Daily at midnight
);
```

### With API Endpoint
```typescript
// In api/buy-order/execute.ts
import { buyOrderService } from '@/services/tokens';

export async function POST(req) {
  const { tokenPrice } = await req.json();
  
  const result = await buyOrderService.executeBuyOrder(tokenPrice);
  
  return Response.json(result);
}
```

## Error Handling

### Common Errors

**Insufficient Revenue**
```typescript
const result = await buyOrderService.executeBuyOrder(50);
if (!result.success && result.error.includes('below minimum')) {
  console.log('Not enough revenue accumulated yet');
}
```

**Invalid Price**
```typescript
const result = await buyOrderService.executeBuyOrder(-50);
// Error: Price per token must be greater than 0
```

**Blockchain Failure**
```typescript
const result = await buyOrderService.executeBuyOrder(50);
if (!result.success && result.error.includes('Blockchain')) {
  console.log('Blockchain transaction failed, will retry');
}
```

## Monitoring

### Check Service Health
```typescript
const metrics = await buyOrderService.getMetrics();

if (metrics.successRate < 0.8) {
  console.warn('Buy-order success rate below 80%');
}

if (!metrics.lastExecutionTime) {
  console.warn('No buy-orders executed yet');
}
```

### Get Recent History
```typescript
const { history } = await buyOrderService.getBuyOrderHistory(10, 0);

const recentFailures = history.filter(h => h.status === 'failed');
if (recentFailures.length > 0) {
  console.warn(`${recentFailures.length} recent failures`);
}
```

## Testing

### Run Tests
```bash
npm test -- services/tokens/__tests__/system-buy-order.test.ts
```

### Test Coverage
```bash
npm test -- services/tokens/__tests__/system-buy-order.test.ts --coverage
```

## Troubleshooting

### Buy-Order Not Executing
1. Check available revenue: `calculateAvailableRevenue()`
2. Verify minimum threshold: `getConfig().minBuyAmount`
3. Check blockchain service status
4. Review error in history: `getBuyOrderHistory()`

### Incorrect Metrics
1. Verify revenue tracking: Check `systemBuyOrderRevenue` table
2. Check buy-order history: Check `systemBuyOrderHistory` table
3. Run migration: `npx prisma migrate deploy`

### Blockchain Failures
1. Check blockchain service logs
2. Verify token price accuracy
3. Check gas estimates
4. Review retry configuration

## Performance Tips

1. **Batch Revenue Tracking**: Track multiple revenues before executing buy-order
2. **Cache Token Prices**: Don't fetch price on every execution
3. **Use Pagination**: Limit history queries with pagination
4. **Monitor Metrics**: Check metrics regularly for anomalies
5. **Schedule Off-Peak**: Execute buy-orders during low-traffic times

## Security Tips

1. **Validate Inputs**: Always validate revenue amounts and prices
2. **Use HTTPS**: For API endpoints
3. **Rate Limit**: Limit manual execution endpoints
4. **Audit Logs**: Monitor all buy-order executions
5. **Blockchain Verification**: Always verify blockchain transactions

## API Reference

### Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `trackRevenue()` | source, amount, currency | RevenueTrackingRecord | Track revenue |
| `calculateAvailableRevenue()` | - | Decimal | Calculate 10% of available revenue |
| `executeBuyOrder()` | pricePerToken, randAmount? | SystemBuyOrderResult | Execute buy-order |
| `getBuyOrderHistory()` | limit, offset | { history, total } | Get history |
| `getMetrics()` | - | SystemBuyOrderMetrics | Get metrics |
| `updateConfig()` | config | void | Update configuration |
| `getConfig()` | - | SystemBuyOrderConfig | Get configuration |

## Resources

- [Full Documentation](./SYSTEM-BUY-ORDER-README.md)
- [Integration Examples](./system-buy-order-integration.ts)
- [Type Definitions](./token-burn.types.ts)
- [Tests](./\_\_tests\_\_/system-buy-order.test.ts)

## Support

For issues or questions:
1. Check the [Full Documentation](./SYSTEM-BUY-ORDER-README.md)
2. Review [Integration Examples](./system-buy-order-integration.ts)
3. Check test cases for usage patterns
4. Review error logs and metrics
