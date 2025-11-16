# Leaderboard Updater Service

## Overview

The Leaderboard Updater Service automatically updates user rankings based on token ownership percentage. Rankings are recalculated after every burn event to ensure they always reflect the current distribution of token ownership.

## Quick Start

### Basic Usage

```typescript
import { LeaderboardUpdater } from './leaderboard-updater';

const updater = new LeaderboardUpdater();

// Update all rankings after a burn
const results = await updater.updateLeaderboardRankings();

// Get user's ranking info
const rankingInfo = await updater.getUserRankingInfo('user-123');
console.log(rankingInfo);
// {
//   rank: 5,
//   ownershipPercentage: 2.5,
//   totalSupply: Decimal('1000000'),
//   userTokens: Decimal('25000')
// }

// Get top users
const topUsers = await updater.getTopUsersByOwnership(10);

// Get ranking statistics
const stats = await updater.getRankingStatistics();
console.log(stats);
// {
//   totalUsers: 1000,
//   topOwnershipPercentage: 50,
//   averageOwnershipPercentage: 0.1,
//   medianOwnershipPercentage: 0.05,
//   giniCoefficient: 0.95
// }
```

## Key Methods

### updateLeaderboardRankings()

Recalculates all user rankings based on current token ownership.

**Returns**: `Promise<RankingUpdateResult[]>`

```typescript
const results = await updater.updateLeaderboardRankings();
results.forEach(result => {
  console.log(`User ${result.userId}:`);
  console.log(`  New Rank: ${result.newRank}`);
  console.log(`  Previous Rank: ${result.previousRank}`);
  console.log(`  Ownership: ${result.ownershipPercentage}%`);
  console.log(`  Changed: ${result.changed}`);
});
```

### getUserRankingInfo(userId)

Gets a user's current ranking and ownership information.

**Parameters**:
- `userId` (string): User ID

**Returns**: `Promise<RankingInfo | null>`

```typescript
const info = await updater.getUserRankingInfo('user-123');
if (info) {
  console.log(`Rank: ${info.rank}`);
  console.log(`Ownership: ${info.ownershipPercentage}%`);
}
```

### getTopUsersByOwnership(limit)

Gets top users sorted by ownership percentage.

**Parameters**:
- `limit` (number): Maximum number of users to return (default: 100)

**Returns**: `Promise<TopUser[]>`

```typescript
const topUsers = await updater.getTopUsersByOwnership(10);
topUsers.forEach((user, index) => {
  console.log(`${index + 1}. ${user.userId}: ${user.ownershipPercentage}%`);
});
```

### getRankingStatistics()

Calculates comprehensive ranking statistics.

**Returns**: `Promise<RankingStatistics>`

```typescript
const stats = await updater.getRankingStatistics();
console.log(`Total Users: ${stats.totalUsers}`);
console.log(`Top Ownership: ${stats.topOwnershipPercentage}%`);
console.log(`Average Ownership: ${stats.averageOwnershipPercentage}%`);
console.log(`Gini Coefficient: ${stats.giniCoefficient}`);
```

### getUserRankingPercentile(userId)

Calculates what percentage of users rank below this user.

**Parameters**:
- `userId` (string): User ID

**Returns**: `Promise<number | null>` (0-100)

```typescript
const percentile = await updater.getUserRankingPercentile('user-123');
console.log(`User ranks better than ${percentile}% of users`);
```

### getUserRankingHistory(userId, days)

Retrieves historical ranking changes for a user.

**Parameters**:
- `userId` (string): User ID
- `days` (number): Number of days to look back (default: 30)

**Returns**: `Promise<RankingHistory[]>`

```typescript
const history = await updater.getUserRankingHistory('user-123', 30);
history.forEach(record => {
  console.log(`${record.date}: Rank ${record.rank} (${record.ownershipPercentage}%)`);
});
```

### rebuildAllRankings()

Performs a full leaderboard rebuild (clears and recalculates all rankings).

**Use Cases**:
- After data corrections
- During maintenance
- After major system updates

```typescript
await updater.rebuildAllRankings();
console.log('Leaderboard rebuilt successfully');
```

## Integration with Burn Flow

The leaderboard updater is automatically called after every successful burn:

```typescript
// In BurnIntegrationService
async processSaleBurn(userId, saleAmount, courseId) {
  // ... burn logic ...
  
  // Update leaderboard after successful burn
  try {
    await this.leaderboardUpdater.updateLeaderboardRankings();
  } catch (error) {
    logger.error('Failed to update leaderboard', { error });
    // Don't fail the burn operation
  }
}
```

## Ownership Percentage Calculation

Ownership percentage is calculated as:

```
ownershipPercentage = (userTokens / totalSupply) * 100
```

**Precision**: 4 decimal places

**Examples**:
- User with 500,000 tokens out of 1,000,000 total = 50%
- User with 1 token out of 1,000,000 total = 0.0001%

## Gini Coefficient

The Gini coefficient measures wealth inequality:

- **0**: Perfect equality (all users have same ownership)
- **1**: Perfect inequality (one user owns everything)
- **0.5**: Moderate inequality

Used to monitor token distribution fairness across the platform.

## Data Models

### RankingUpdateResult

```typescript
interface RankingUpdateResult {
  userId: string
  newRank: number
  previousRank?: number
  ownershipPercentage: number
  changed: boolean
}
```

### RankingInfo

```typescript
interface RankingInfo {
  rank: number
  ownershipPercentage: number
  totalSupply: Decimal
  userTokens: Decimal
}
```

### RankingStatistics

```typescript
interface RankingStatistics {
  totalUsers: number
  topOwnershipPercentage: number
  averageOwnershipPercentage: number
  medianOwnershipPercentage: number
  giniCoefficient: number
}
```

## Error Handling

The service handles various error conditions gracefully:

- **Zero total supply**: Returns empty results
- **Missing token balance**: Returns null
- **Missing leaderboard entry**: Returns null
- **Database errors**: Throws with context

```typescript
try {
  const info = await updater.getUserRankingInfo('user-123');
  if (!info) {
    console.log('User not found or has no tokens');
  }
} catch (error) {
  console.error('Failed to get ranking info:', error);
}
```

## Performance

- **Ranking Update**: O(n log n) where n = number of users
- **User Lookup**: O(1) with database indexing
- **Statistics**: O(n) for full leaderboard
- **Percentile**: O(1) with rank lookup

## Testing

Comprehensive test suite included in `__tests__/leaderboard-updater.test.ts`:

- 20+ test cases
- Core functionality tests
- Edge case handling
- Integration tests
- Precision tests

Run tests:
```bash
npm test -- services/tokens/__tests__/leaderboard-updater.test.ts
```

## Requirements

Implements Requirement 1.8 from Phase 2 specifications:

> WHEN token supply decreases, THE system SHALL update leaderboard rankings based on percentage ownership

## Related Services

- **BurnIntegrationService**: Triggers leaderboard updates after burns
- **LeaderboardService**: Provides leaderboard queries
- **TokenBurnCalculator**: Calculates burn amounts
- **BurnTracker**: Tracks burn transactions

## Monitoring

Monitor leaderboard updates through:

- Logs: Check for ranking changes and errors
- Metrics: Track update frequency and duration
- Statistics: Monitor Gini coefficient for distribution health

## Troubleshooting

### Rankings not updating
- Check if burns are being processed
- Verify token supply is being updated
- Check database connectivity

### Incorrect ownership percentages
- Verify token balance data
- Check total supply calculation
- Ensure decimal precision is maintained

### Performance issues
- Check database indexes on leaderboard_entries
- Monitor query performance
- Consider caching for frequently accessed rankings

## Future Enhancements

- Caching for frequently accessed rankings
- Batch ranking updates for efficiency
- Ranking change notifications
- Leaderboard snapshots for historical analysis
- Ranking prediction based on trends
