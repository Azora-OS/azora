# Token Burn Tracking & Supply Management

This document describes the burn tracking and supply management system for the AZR token.

## Overview

The burn tracking system provides comprehensive logging, tracking, and management of all token burn transactions across the Azora platform. It integrates with the blockchain to confirm burns and maintains accurate supply metrics.

## Components

### 1. BurnTracker Service (`burn-tracker.ts`)

The core service for tracking and managing burn transactions.

**Key Methods:**

- `logBurnTransaction()` - Log a new burn transaction
- `confirmBurnTransaction()` - Confirm burn with blockchain hash
- `getTotalBurnedSupply()` - Get cumulative burned supply
- `getUserCumulativeBurn()` - Get total burn for a user
- `updateSupplyAfterBurn()` - Update token supply metrics
- `getBurnHistory()` - Retrieve burn history with filters
- `getBurnStatistics()` - Get burn statistics
- `getBurnStatisticsByType()` - Get stats by transaction type
- `getHistoricalBurnData()` - Get historical burn data for date range
- `getPendingBurnTransactions()` - Get unconfirmed burns
- `getFailedBurnTransactions()` - Get failed burns
- `calculateOwnershipPercentage()` - Calculate user ownership %
- `getSupplyTrendData()` - Get supply trend over time

### 2. BurnIntegrationService (`burn-integration.ts`)

Integrates burn mechanism into payment and transaction flows.

**Key Methods:**

- `processSaleBurn()` - Process burn on course sale (5%)
- `processWithdrawalBurn()` - Process burn on earnings withdrawal (3%)
- `processRedemptionBurn()` - Process burn on token redemption (2%)
- `getBurnImpact()` - Calculate burn impact for transaction
- `getUserBurnImpact()` - Get user's total burn impact
- `validateBurnTransaction()` - Validate burn before execution

### 3. TokenBurnRepository (`token-burn-repository.ts`)

Database operations for burn transactions and supply data.

**Key Methods:**

- `createBurnTransaction()` - Create burn transaction record
- `updateBurnTransactionHash()` - Update with blockchain hash
- `getBurnTransaction()` - Get transaction by ID
- `getBurnHistory()` - Query burn history
- `getBurnStatistics()` - Calculate statistics
- `createProofOfKnowledge()` - Create proof of knowledge record
- `getProofOfKnowledgeByCertificate()` - Get proof by certificate
- `getUserProofOfKnowledge()` - Get user's proofs
- `updateTokenSupply()` - Update supply metrics
- `getTokenSupply()` - Get current supply

### 4. TokenBurnCalculator (`token-burn-calculator.ts`)

Calculates burn amounts for different transaction types.

**Burn Rates:**
- Course Sale: 5%
- Earnings Withdrawal: 3%
- Token Redemption: 2%

**Key Methods:**

- `calculateBurn()` - Calculate burn for transaction
- `calculateBulkBurns()` - Calculate multiple burns
- `calculateTotalBurn()` - Sum burns from multiple transactions
- `validateBurnTransaction()` - Validate burn transaction
- `calculateEffectivePrice()` - Get price after burn
- `calculatePercentageLoss()` - Get loss percentage
- `calculateReverseBurn()` - Calculate original from net amount

### 5. BlockchainBurnService (`blockchain-burn-service.ts`)

Executes token burns on blockchain with retry logic.

**Key Methods:**

- `executeBurn()` - Execute burn with retry logic
- `verifyTransaction()` - Verify transaction status
- `signTransaction()` - Sign transaction data
- `verifyTransactionSignature()` - Verify signature
- `getGasEstimate()` - Get gas estimate

## Data Models

### BurnTransaction

```typescript
{
  id: string
  userId: string
  amount: Decimal              // Original transaction amount
  burnRate: number             // 0.05, 0.03, or 0.02
  burnedAmount: Decimal        // Amount burned
  transactionType: BurnTransactionType
  reason: string
  blockchainTxHash?: string
  blockchainStatus: BlockchainStatus
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}
```

### TokenSupply

```typescript
{
  id: string
  totalSupply: Decimal         // Total AZR tokens
  circulatingSupply: Decimal   // Total - Burned
  burnedSupply: Decimal        // Cumulative burned
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}
```

### ProofOfKnowledge

```typescript
{
  id: string
  userId: string
  courseId: string
  completionDate: Date
  certificateId: string
  verificationHash: string
  expiryDate?: Date
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}
```

## Usage Examples

### Processing a Course Sale Burn

```typescript
import { BurnIntegrationService } from './burn-integration';
import { Decimal } from '@prisma/client/runtime/library';

const result = await BurnIntegrationService.processSaleBurn(
  'user-123',
  new Decimal('100'),  // Sale amount in ZAR
  'course-456'
);

// Result:
// {
//   success: true,
//   burnTransactionId: 'tx-789',
//   burnedAmount: Decimal('5'),      // 5% of 100
//   netAmount: Decimal('95'),
//   blockchainResult: { ... }
// }
```

### Getting User Burn Statistics

```typescript
const stats = await BurnTracker.getBurnStatisticsByType(
  BurnTransactionType.COURSE_SALE
);

// Result:
// {
//   totalBurned: Decimal('50000'),
//   transactionCount: 1000,
//   averageBurn: Decimal('50')
// }
```

### Calculating Ownership Percentage

```typescript
const ownership = await BurnTracker.calculateOwnershipPercentage(
  new Decimal('100000'),  // User's tokens
  new Decimal('1000000')  // Total supply
);

// Result: 10 (10%)
```

### Getting Supply Trend Data

```typescript
const trend = await BurnTracker.getSupplyTrendData(30);

// Result:
// {
//   dates: ['2024-01-01', '2024-01-02', ...],
//   totalSupply: [1000000, 1000000, ...],
//   circulatingSupply: [950000, 949995, ...],
//   burnedSupply: [50000, 50005, ...]
// }
```

### Validating a Burn Transaction

```typescript
const validation = await BurnIntegrationService.validateBurnTransaction(
  'user-123',
  new Decimal('100'),
  BurnTransactionType.COURSE_SALE,
  new Decimal('500')  // User's balance
);

// Result:
// {
//   isValid: true,
//   errors: [],
//   warnings: []
// }
```

## Integration Points

### 1. Course Purchase Flow

When a user purchases a course:

```
1. Process payment
2. Calculate burn (5% of sale price)
3. Log burn transaction
4. Execute blockchain burn
5. Update token supply
6. Update leaderboard rankings
```

### 2. Earnings Withdrawal Flow

When an instructor withdraws earnings:

```
1. Verify withdrawal amount
2. Calculate burn (3% of withdrawal)
3. Log burn transaction
4. Execute blockchain burn
5. Update token supply
6. Process withdrawal to bank
```

### 3. Token Redemption Flow

When a user redeems tokens:

```
1. Verify proof of knowledge
2. Calculate burn (2% of redemption)
3. Log burn transaction
4. Execute blockchain burn
5. Update token supply
6. Grant feature access
```

## Blockchain Integration

The system uses Web3 to execute burns on the blockchain:

1. **Transaction Signing**: Signs burn transactions with user's private key
2. **Retry Logic**: Implements exponential backoff for failed transactions
3. **Verification**: Verifies transaction status on blockchain
4. **Gas Estimation**: Estimates gas costs for burns

## Supply Management

### Supply Calculation

```
Circulating Supply = Total Supply - Burned Supply
```

### Supply Updates

Supply is updated after each confirmed burn:

1. Get current supply
2. Add burned amount to cumulative burns
3. Recalculate circulating supply
4. Update database
5. Trigger leaderboard recalculation

### Supply Trends

Historical supply data is tracked for:

- Daily burn amounts
- Cumulative burns over time
- Supply trend analysis
- Ownership percentage changes

## Monitoring & Metrics

### Key Metrics

- **Total Burned**: Cumulative AZR tokens burned
- **Burn Rate**: Percentage of transactions burned
- **Success Rate**: Percentage of successful burns
- **Average Burn**: Average burn per transaction
- **Pending Burns**: Unconfirmed burns awaiting blockchain
- **Failed Burns**: Burns that failed on blockchain

### Querying Metrics

```typescript
// Get overall statistics
const stats = await BurnTracker.getBurnStatistics();

// Get statistics by type
const saleStats = await BurnTracker.getBurnStatisticsByType(
  BurnTransactionType.COURSE_SALE
);

// Get historical data
const history = await BurnTracker.getHistoricalBurnData(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);
```

## Error Handling

### Common Errors

1. **Insufficient Balance**: User doesn't have enough tokens
2. **Blockchain Failure**: Transaction failed on blockchain
3. **Invalid Amount**: Amount is zero or negative
4. **Invalid Transaction Type**: Unknown transaction type

### Retry Logic

Failed blockchain transactions are retried with exponential backoff:

- Initial delay: 1 second
- Max delay: 30 seconds
- Max retries: 3
- Backoff multiplier: 2x

## Testing

### Unit Tests

```bash
npm test -- services/tokens/__tests__/burn-tracker.test.ts
npm test -- services/tokens/__tests__/burn-integration.test.ts
```

### Integration Tests

```bash
npm test -- tests/integration/token-burn.test.ts
```

## Performance Considerations

- **Caching**: Burn statistics are cached to reduce database queries
- **Batch Processing**: Multiple burns can be processed in batches
- **Indexing**: Database indexes on userId, transactionType, blockchainStatus
- **Pagination**: Burn history supports pagination for large datasets

## Security Considerations

- **Blockchain Verification**: All burns verified on blockchain
- **Audit Logging**: All burn transactions logged for audit
- **Rate Limiting**: Burn operations rate-limited per user
- **Validation**: All inputs validated before processing

## Future Enhancements

1. **Burn Acceleration**: Increase burn rates during high inflation
2. **Burn Reduction**: Decrease burn rates during deflation
3. **Burn Pools**: Accumulate burns for periodic large burns
4. **Burn Rewards**: Reward users for high burn participation
5. **Burn Analytics**: Advanced analytics dashboard for burn metrics

## References

- [Token Burn Calculator](./token-burn-calculator.ts)
- [Blockchain Burn Service](./blockchain-burn-service.ts)
- [Token Burn Repository](./token-burn-repository.ts)
- [Token Burn Types](./token-burn.types.ts)
