# Token Burn System

## Overview

The Token Burn System implements a deflationary mechanism for the Azora token ecosystem. Tokens are burned (permanently removed from circulation) during specific transactions to reduce supply and increase scarcity.

## Architecture

### Components

1. **TokenBurnCalculator** - Calculates burn amounts based on transaction types
2. **BlockchainBurnService** - Executes burns on the blockchain
3. **TokenBurnRepository** - Manages database operations for burn records
4. **Data Models** - Prisma models for burn transactions and proof of knowledge

### Burn Transaction Types

- **COURSE_SALE** (5% burn rate) - Tokens burned when courses are sold
- **EARNINGS_WITHDRAWAL** (3% burn rate) - Tokens burned when instructors withdraw earnings
- **TOKEN_REDEMPTION** (2% burn rate) - Tokens burned when users redeem tokens for features

## Database Schema

### TokenSupply Model
Tracks total, circulating, and burned token supply.

```typescript
model TokenSupply {
  id                String   @id @default(cuid())
  totalSupply       Decimal  @db.Decimal(20, 8)
  circulatingSupply Decimal  @db.Decimal(20, 8)
  burnedSupply      Decimal  @default(0) @db.Decimal(20, 8)
  lastUpdated       DateTime @default(now())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### BurnTransaction Model
Records each token burn event.

```typescript
model BurnTransaction {
  id                String   @id @default(cuid())
  userId            String
  amount            Decimal  @db.Decimal(20, 8)
  burnRate          Float
  burnedAmount      Decimal  @db.Decimal(20, 8)
  transactionType   BurnTransactionType
  reason            String
  blockchainTxHash  String?
  blockchainStatus  BlockchainStatus @default(PENDING)
  metadata          Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### ProofOfKnowledge Model
Tracks course completion certificates and knowledge verification.

```typescript
model ProofOfKnowledge {
  id                String   @id @default(cuid())
  userId            String
  courseId          String
  completionDate    DateTime
  certificateId     String   @unique
  verificationHash  String   @unique
  expiryDate        DateTime?
  metadata          Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

## Usage

### Calculate Burn Amount

```typescript
import { TokenBurnCalculator } from './token-burn-calculator';
import { BurnTransactionType } from './token-burn.types';

const calculator = new TokenBurnCalculator();

const calculation = calculator.calculateBurn(1000, BurnTransactionType.COURSE_SALE);
// Returns:
// {
//   originalAmount: Decimal(1000),
//   burnRate: 0.05,
//   burnedAmount: Decimal(50),
//   netAmount: Decimal(950)
// }
```

### Execute Blockchain Burn

```typescript
import { BlockchainBurnService } from './blockchain-burn-service';
import { BurnTransactionType } from './token-burn.types';

const burnService = new BlockchainBurnService();

const result = await burnService.executeBurn({
  userId: 'user-123',
  burnAmount: new Decimal(50),
  transactionType: BurnTransactionType.COURSE_SALE,
  reason: 'Course sale burn',
});
```

### Create Burn Transaction Record

```typescript
import { TokenBurnRepository } from './token-burn-repository';
import { BurnTransactionType } from './token-burn.types';

const repository = new TokenBurnRepository();

const transaction = await repository.createBurnTransaction(
  'user-123',
  new Decimal(1000),
  0.05,
  new Decimal(50),
  BurnTransactionType.COURSE_SALE,
  'Course sale burn'
);
```

### Get Burn Statistics

```typescript
const stats = await repository.getBurnStatistics();
// Returns:
// {
//   totalBurned: Decimal(5000),
//   burnsByType: {
//     courseSale: Decimal(2500),
//     earningsWithdrawal: Decimal(1500),
//     tokenRedemption: Decimal(1000)
//   },
//   averageBurnPerTransaction: Decimal(50),
//   transactionCount: 100,
//   successRate: 0.95
// }
```

### Create Proof of Knowledge

```typescript
const pok = await repository.createProofOfKnowledge(
  'user-123',
  'course-456',
  new Date(),
  'cert-789',
  'hash-abc123',
  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry
);
```

## Burn Rate Configuration

Default burn rates can be customized:

```typescript
const customRates = {
  courseSale: 0.10,           // 10%
  earningsWithdrawal: 0.05,   // 5%
  tokenRedemption: 0.03,      // 3%
};

const calculator = new TokenBurnCalculator(customRates);
```

## Validation

Burn transactions are validated before execution:

```typescript
const validation = calculator.validateBurnTransaction(
  1000,
  BurnTransactionType.COURSE_SALE,
  5000 // user balance
);

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  console.warn('Warnings:', validation.warnings);
}
```

## Blockchain Integration

The `BlockchainBurnService` uses a provider pattern for blockchain operations:

```typescript
interface IBlockchainProvider {
  executeBurn(request: BlockchainBurnRequest): Promise<BlockchainBurnResult>;
  verifyTransaction(txHash: string): Promise<BlockchainStatus>;
  getGasEstimate(amount: Decimal): Promise<Decimal>;
}
```

A mock provider is included for development. Replace with actual blockchain provider for production.

## Error Handling

All services include comprehensive error handling and logging:

```typescript
try {
  const result = await burnService.executeBurn(request);
} catch (error) {
  logger.error('Burn execution failed', { error, request });
  // Handle error appropriately
}
```

## Testing

See `services/tokens/__tests__/` for unit tests covering:
- Burn calculations
- Transaction creation and retrieval
- Proof of knowledge management
- Statistics aggregation
- Validation logic

## Performance Considerations

- Burn transactions are indexed by userId, transactionType, blockchainStatus, and createdAt
- Proof of knowledge records are indexed by userId, courseId, and completionDate
- Use pagination for large result sets
- Consider caching frequently accessed statistics

## Future Enhancements

- System buy-order execution using burned token revenue
- Leaderboard ranking updates based on token ownership
- Psychological reluctance messaging for sellers
- Advanced burn analytics and reporting
