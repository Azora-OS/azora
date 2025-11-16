# Token Rewards Service

Manages AZR token rewards, leaderboards, and redemptions for Azora OS.

## Overview

The token rewards service provides:
- Token earning and balance tracking
- Token transfers between users
- Global, friend, and class leaderboards
- Token redemption for features and content
- Comprehensive token statistics

## Architecture

### Components

1. **TokenRewardsService** - Token management
   - Award tokens for activities
   - Track token balance
   - Redeem tokens
   - Transfer tokens between users
   - Token history tracking

2. **LeaderboardService** - Leaderboard management
   - Global leaderboard
   - Friend leaderboard
   - Class leaderboard
   - User ranking
   - Leaderboard statistics

3. **TokenRedemptionService** - Redemption management
   - Request token redemption
   - Approve/reject redemptions
   - Complete redemptions
   - Redemption history
   - Redemption statistics

## Database Schema

### Token Balances Table
```sql
CREATE TABLE token_balances (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  balance DECIMAL(20,8) NOT NULL DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Token Transactions Table
```sql
CREATE TABLE token_transactions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  balanceId TEXT NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  type TokenTransactionType NOT NULL,
  reason TEXT NOT NULL,
  balance DECIMAL(20,8) NOT NULL,
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Leaderboard Entries Table
```sql
CREATE TABLE leaderboard_entries (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  rank INTEGER NOT NULL,
  score DECIMAL(20,8) NOT NULL,
  leaderboardType LeaderboardType NOT NULL,
  period TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, leaderboardType, period)
);
```

### Token Redemptions Table
```sql
CREATE TABLE token_redemptions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  type TokenRedemptionType NOT NULL,
  status TokenRedemptionStatus DEFAULT 'PENDING',
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT NOW(),
  completedAt TIMESTAMP
);
```

## Usage

### Award Tokens

```typescript
import { TokenRewardsService } from '@/services/tokens';

const tokenService = new TokenRewardsService();
const transaction = await tokenService.awardTokens(
  'user-123',
  100,
  'Course completion',
  { courseId: 'course-456' }
);
```

### Get Token Balance

```typescript
const balance = await tokenService.getTokenBalance('user-123');
console.log(balance.toString()); // "1500.50"
```

### Redeem Tokens

```typescript
const redemption = await tokenService.redeemTokens(
  'user-123',
  50,
  'premium_feature'
);
```

### Transfer Tokens

```typescript
const transfer = await tokenService.transferTokens(
  'user-123',
  'user-456',
  100
);
```

### Get Global Leaderboard

```typescript
import { LeaderboardService } from '@/services/tokens';

const leaderboardService = new LeaderboardService();
const leaderboard = await leaderboardService.getGlobalLeaderboard(100);
```

### Get User Rank

```typescript
const rank = await leaderboardService.getUserRank('user-123');
console.log(rank); // { rank: 5, score: 5000 }
```

### Request Token Redemption

```typescript
import { TokenRedemptionService } from '@/services/tokens';

const redemptionService = new TokenRedemptionService();
const redemption = await redemptionService.requestRedemption({
  userId: 'user-123',
  amount: new Decimal(100),
  type: 'FEATURE_UNLOCK',
  metadata: { feature: 'advanced_analytics' }
});
```

### Approve Redemption

```typescript
const approved = await redemptionService.approveRedemption(redemption.id);
```

## Token Transaction Types

- **EARN**: Tokens earned from activities
- **REDEEM**: Tokens redeemed for features
- **TRANSFER**: Tokens transferred between users
- **BONUS**: Bonus tokens awarded
- **PENALTY**: Tokens deducted as penalty

## Leaderboard Types

- **GLOBAL**: Global leaderboard for all users
- **FRIENDS**: Leaderboard for friends
- **CLASS**: Leaderboard for a specific class

## Redemption Types

- **FEATURE_UNLOCK**: Unlock premium features
- **PREMIUM_CONTENT**: Access premium content
- **MERCHANDISE**: Redeem for merchandise
- **DONATION**: Donate tokens to causes

## Redemption Status

- **PENDING**: Awaiting approval
- **APPROVED**: Approved by admin
- **COMPLETED**: Redemption completed
- **REJECTED**: Redemption rejected

## API Endpoints

### Award Tokens

```bash
POST /api/tokens/award
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user-123",
  "amount": 100,
  "reason": "Course completion"
}
```

### Get Token Balance

```bash
GET /api/tokens/balance
Authorization: Bearer <token>
```

### Redeem Tokens

```bash
POST /api/tokens/redeem
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 50,
  "feature": "premium_feature"
}
```

### Get Global Leaderboard

```bash
GET /api/leaderboard/global?limit=100
Authorization: Bearer <token>
```

### Get Friend Leaderboard

```bash
GET /api/leaderboard/friends?limit=50
Authorization: Bearer <token>
```

### Get Class Leaderboard

```bash
GET /api/leaderboard/class/{classId}?limit=50
Authorization: Bearer <token>
```

### Request Redemption

```bash
POST /api/tokens/redemption/request
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 100,
  "type": "FEATURE_UNLOCK",
  "metadata": { "feature": "advanced_analytics" }
}
```

### Get Redemption Status

```bash
GET /api/tokens/redemption/{redemptionId}
Authorization: Bearer <token>
```

## Token Earning Rules

### Course Completion
- Base: 100 tokens
- Difficulty bonus: +50 (advanced), +25 (intermediate)
- Speed bonus: +50 (completed in <50% of estimated time)

### Streak Bonus
- 7-day streak: +50 tokens
- 30-day streak: +200 tokens
- 100-day streak: +500 tokens

### Community Contribution
- Helpful review: +10 tokens
- Course creation: +500 tokens
- Peer teaching: +100 tokens

## Features

### Token Management
- Real-time balance tracking
- Transaction history
- Token transfers
- Bonus and penalty system

### Leaderboards
- Real-time ranking
- Multiple leaderboard types
- User position tracking
- Leaderboard statistics

### Redemptions
- Feature unlock
- Premium content access
- Merchandise redemption
- Donation support

## Integration Points

1. **Subscription Service**: Determines token earning rates
2. **Course Service**: Awards tokens on completion
3. **User Service**: Manages user accounts
4. **Logging**: All operations logged for monitoring

## Performance Considerations

- Indexes on frequently queried fields (userId, type, createdAt)
- Pagination for large result sets
- Caching for leaderboard data
- Batch operations for bulk updates

## Security Considerations

- Verify user ownership before allowing redemptions
- Validate token amounts
- Rate limit token operations
- Audit all token transactions
- Prevent double-spending

## Testing

Run tests with:
```bash
npm test -- services/tokens
```

Test coverage includes:
- Token earning and balance tracking
- Token transfers
- Leaderboard calculations
- Redemption workflows
- Error scenarios

## Future Enhancements

- [ ] Token marketplace
- [ ] Token staking
- [ ] Token farming
- [ ] Seasonal leaderboards
- [ ] Achievement badges
- [ ] Token burning
- [ ] Governance tokens
- [ ] Token swaps
