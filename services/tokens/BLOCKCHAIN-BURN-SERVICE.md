# Blockchain Burn Service

## Overview

The `BlockchainBurnService` handles token burn execution on the blockchain with robust error handling, transaction signing/verification, and automatic retry logic with exponential backoff.

## Features

### 1. Token Burn Execution
- Execute token burns on blockchain
- Support for multiple burn transaction types (course sales, earnings withdrawals, token redemptions)
- Automatic transaction verification after execution
- Comprehensive validation of burn requests

### 2. Transaction Signing & Verification
- Sign transaction data cryptographically
- Verify transaction signatures
- Ensure transaction integrity

### 3. Retry Logic with Exponential Backoff
- Automatic retry on transient failures
- Configurable retry attempts (default: 3)
- Exponential backoff with configurable delays
- Maximum delay cap to prevent excessive waiting

### 4. Gas Estimation
- Estimate gas costs for burn transactions
- Support for different transaction types

### 5. Transaction Verification
- Verify transaction status on blockchain
- Support for multiple transaction states (PENDING, CONFIRMED, FAILED)
- Retry verification on transient failures

## Architecture

### Interfaces

```typescript
interface IBlockchainProvider {
  executeBurn(request: BlockchainBurnRequest): Promise<BlockchainBurnResult>;
  verifyTransaction(txHash: string): Promise<BlockchainStatus>;
  getGasEstimate(amount: Decimal): Promise<Decimal>;
  signTransaction(data: string): Promise<string>;
}
```

### Retry Configuration

```typescript
interface RetryConfig {
  maxRetries: number;           // Default: 3
  initialDelayMs: number;       // Default: 1000ms
  maxDelayMs: number;           // Default: 30000ms
  backoffMultiplier: number;    // Default: 2
}
```

## Usage

### Basic Usage

```typescript
import { BlockchainBurnService } from './blockchain-burn-service';
import { BurnTransactionType } from './token-burn.types';
import { Decimal } from '@prisma/client/runtime/library';

const service = new BlockchainBurnService();

// Execute a token burn
const result = await service.executeBurn({
  userId: 'user-123',
  burnAmount: new Decimal('100'),
  transactionType: BurnTransactionType.COURSE_SALE,
  reason: 'Course sale burn',
  metadata: {
    courseId: 'course-456',
    salePrice: 1000,
  },
});

if (result.success) {
  console.log('Burn successful:', result.transactionHash);
} else {
  console.error('Burn failed:', result.error);
}
```

### Custom Provider

```typescript
// Implement custom blockchain provider
class CustomBlockchainProvider implements IBlockchainProvider {
  async executeBurn(request: BlockchainBurnRequest): Promise<BlockchainBurnResult> {
    // Custom implementation
  }

  async verifyTransaction(txHash: string): Promise<BlockchainStatus> {
    // Custom implementation
  }

  async getGasEstimate(amount: Decimal): Promise<Decimal> {
    // Custom implementation
  }

  async signTransaction(data: string): Promise<string> {
    // Custom implementation
  }
}

// Use custom provider
const customProvider = new CustomBlockchainProvider();
const service = new BlockchainBurnService(customProvider);
```

### Custom Retry Configuration

```typescript
const service = new BlockchainBurnService(undefined, {
  maxRetries: 5,
  initialDelayMs: 500,
  maxDelayMs: 60000,
  backoffMultiplier: 2.5,
});

// Or update after initialization
service.setRetryConfig({
  maxRetries: 5,
  initialDelayMs: 500,
});
```

### Transaction Signing

```typescript
// Sign transaction data
const signature = await service.signTransaction('transaction-data');

// Verify signature
const isValid = await service.verifyTransactionSignature('transaction-data', signature);
```

### Transaction Verification

```typescript
// Verify transaction status
const status = await service.verifyTransaction('0x1234567890abcdef');

if (status === BlockchainStatus.CONFIRMED) {
  console.log('Transaction confirmed');
} else if (status === BlockchainStatus.PENDING) {
  console.log('Transaction pending');
} else if (status === BlockchainStatus.FAILED) {
  console.log('Transaction failed');
}
```

### Gas Estimation

```typescript
const gasEstimate = await service.getGasEstimate(new Decimal('1000'));
console.log('Estimated gas:', gasEstimate.toString());
```

## Burn Transaction Types

### 1. Course Sale (5% burn)
```typescript
{
  userId: 'user-123',
  burnAmount: new Decimal('100'),
  transactionType: BurnTransactionType.COURSE_SALE,
  reason: 'Course sale burn',
  metadata: {
    courseId: 'course-456',
    salePrice: 1000,
  },
}
```

### 2. Earnings Withdrawal (3% burn)
```typescript
{
  userId: 'user-123',
  burnAmount: new Decimal('100'),
  transactionType: BurnTransactionType.EARNINGS_WITHDRAWAL,
  reason: 'Earnings withdrawal burn',
  metadata: {
    withdrawalAmount: 1000,
  },
}
```

### 3. Token Redemption (2% burn)
```typescript
{
  userId: 'user-123',
  burnAmount: new Decimal('100'),
  transactionType: BurnTransactionType.TOKEN_REDEMPTION,
  reason: 'Token redemption burn',
  metadata: {
    featureId: 'premium-feature',
  },
}
```

## Error Handling

The service handles errors gracefully:

1. **Validation Errors**: Invalid requests are rejected with clear error messages
2. **Transient Failures**: Automatically retried with exponential backoff
3. **Permanent Failures**: Returned as failed results with error details
4. **Provider Errors**: Caught and logged with context

### Error Scenarios

```typescript
// Invalid user ID
const result = await service.executeBurn({
  userId: '',
  burnAmount: new Decimal('100'),
  transactionType: BurnTransactionType.COURSE_SALE,
  reason: 'Burn',
});
// result.success === false
// result.error === 'User ID is required'

// Invalid burn amount
const result = await service.executeBurn({
  userId: 'user-123',
  burnAmount: new Decimal('0'),
  transactionType: BurnTransactionType.COURSE_SALE,
  reason: 'Burn',
});
// result.success === false
// result.error === 'Burn amount must be greater than 0'

// Invalid transaction type
const result = await service.executeBurn({
  userId: 'user-123',
  burnAmount: new Decimal('100'),
  transactionType: 'INVALID_TYPE' as any,
  reason: 'Burn',
});
// result.success === false
// result.error === 'Invalid transaction type: INVALID_TYPE'
```

## Retry Logic

The service implements exponential backoff retry logic:

1. **Initial Attempt**: Execute the operation
2. **Failure**: If transient error, wait `initialDelayMs`
3. **Retry 1**: Wait `initialDelayMs * backoffMultiplier`
4. **Retry 2**: Wait `initialDelayMs * backoffMultiplier^2` (capped at `maxDelayMs`)
5. **Max Retries**: After `maxRetries` attempts, return failure

### Example Timeline (Default Config)
- Attempt 1: Immediate
- Attempt 2: After 1000ms
- Attempt 3: After 2000ms
- Attempt 4: After 4000ms (max 30000ms)

## Testing

The service includes comprehensive tests covering:

- ✅ Successful burn execution
- ✅ Request validation (user ID, amount, type, reason)
- ✅ Different burn transaction types
- ✅ Metadata inclusion
- ✅ Retry logic with transient failures
- ✅ Max retries enforcement
- ✅ Exponential backoff timing
- ✅ Delay capping
- ✅ Transaction verification
- ✅ Transaction signing
- ✅ Signature verification
- ✅ Gas estimation
- ✅ Provider management
- ✅ Error handling
- ✅ Integration scenarios
- ✅ Concurrent operations

### Running Tests

```bash
npm test -- services/tokens/__tests__/blockchain-burn-service.test.ts
```

### Test Results

```
Test Suites: 1 passed, 1 total
Tests:       30 passed, 30 total
```

## Integration with Token Burn System

The `BlockchainBurnService` is part of the larger token burn system:

1. **TokenBurnCalculator**: Calculates burn amounts
2. **BlockchainBurnService**: Executes burns on blockchain
3. **TokenBurnRepository**: Stores burn transaction records
4. **BurnTracker**: Tracks cumulative burns and supply updates

### Complete Flow

```typescript
// 1. Calculate burn amount
const calculator = new TokenBurnCalculator();
const calculation = calculator.calculateBurn(
  1000,
  BurnTransactionType.COURSE_SALE
);

// 2. Execute burn on blockchain
const service = new BlockchainBurnService();
const result = await service.executeBurn({
  userId: 'user-123',
  burnAmount: calculation.burnedAmount,
  transactionType: BurnTransactionType.COURSE_SALE,
  reason: 'Course sale burn',
});

// 3. Store transaction record
const repository = new TokenBurnRepository();
await repository.createBurnTransaction(
  'user-123',
  calculation.originalAmount,
  calculation.burnRate,
  calculation.burnedAmount,
  BurnTransactionType.COURSE_SALE,
  'Course sale burn'
);

// 4. Update transaction with blockchain hash
if (result.success) {
  await repository.updateBurnTransactionHash(
    transactionId,
    result.transactionHash!,
    result.status
  );
}
```

## Performance Considerations

- **Gas Estimation**: Cached to minimize blockchain calls
- **Transaction Verification**: Retried with backoff to handle network delays
- **Concurrent Operations**: Supports multiple concurrent burns
- **Memory**: Minimal memory footprint with streaming support

## Security Considerations

- **Transaction Signing**: Cryptographic signing ensures transaction integrity
- **Signature Verification**: Validates transaction authenticity
- **Input Validation**: All inputs validated before execution
- **Error Logging**: Comprehensive logging for audit trails
- **Retry Safety**: Exponential backoff prevents overwhelming blockchain

## Monitoring & Logging

The service logs all operations:

```
[BlockchainBurnService] Executing blockchain burn
[BlockchainBurnService] Blockchain burn successful
[BlockchainBurnService] Retrying blockchain operation (attempt 2/3)
[BlockchainBurnService] Transaction signed successfully
[BlockchainBurnService] Transaction verification result: CONFIRMED
```

## Future Enhancements

1. **Batch Operations**: Support for batch burn operations
2. **Gas Price Optimization**: Dynamic gas price adjustment
3. **Transaction Pooling**: Pool multiple burns into single transaction
4. **Webhook Notifications**: Real-time burn status updates
5. **Analytics**: Detailed burn analytics and reporting

## References

- [Token Burn Calculator](./token-burn-calculator.ts)
- [Token Burn Repository](./token-burn-repository.ts)
- [Token Burn Types](./token-burn.types.ts)
- [Web3 Client](../azora-mint/src/blockchain/web3-client.ts)
