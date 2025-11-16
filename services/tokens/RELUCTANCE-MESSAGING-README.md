# Psychological Reluctance-to-Sell Messaging Service

## Overview

The Reluctance Messaging Service implements psychological and economic messaging to discourage token sales while educating users about token economics. It calculates the effective sell price after burn and generates contextual messages that highlight the cost of selling.

## Key Features

### 1. Effective Price Calculation
- Calculates net proceeds after burn for any transaction
- Supports all three burn types: course sales (5%), withdrawals (3%), redemptions (2%)
- Provides reverse calculations (given net amount, calculate original)

### 2. Burn Impact Analysis
- Calculates burned tokens and percentage loss
- Tracks ownership percentage impact
- Generates financial impact reports with USD equivalents

### 3. Contextual Messaging
- Transaction-type-specific messages
- Ownership loss warnings
- Significance-based warnings (only for >2% losses)

### 4. Educational Content
- Token economics explanation
- Burn mechanism details
- Holding benefits and appreciation potential
- Alternative uses for tokens

### 5. Comprehensive Reporting
- Financial impact analysis
- Personalized recommendations
- Multi-factor decision support

## API Endpoints

### POST /api/tokens/reluctance-check

Pre-transaction reluctance check endpoint. Call this before allowing a user to proceed with a sale/withdrawal/redemption.

**Request:**
```json
{
  "amount": 100,
  "transactionType": "EARNINGS_WITHDRAWAL",
  "currentTokenPrice": 0.50
}
```

**Response:**
```json
{
  "success": true,
  "reluctanceMessage": {
    "effectiveSellPrice": "97",
    "burnImpact": "3",
    "percentageLoss": 0.03,
    "message": "<p>You're about to withdraw your earnings...</p>",
    "educationalContent": "<h3>Understanding AZR Token Economics</h3>..."
  },
  "warningMessage": null,
  "userBalance": "5000",
  "comprehensiveReport": {
    "warningMessage": null,
    "financialImpact": {
      "burnedTokens": "3",
      "netTokens": "97",
      "burnedUSD": "1.50",
      "netUSD": "48.50",
      "percentageLoss": 0.03
    },
    "recommendations": [
      "Your tokens are appreciating. Consider holding for 30+ days for better returns",
      "Explore staking options to earn additional tokens without selling",
      "Review the token economics guide to understand long-term appreciation potential"
    ]
  }
}
```

### POST /api/tokens/redeem (Enhanced)

The redeem endpoint now supports reluctance messaging:

**Request:**
```json
{
  "amount": 50,
  "feature": "premium_content",
  "includeReluctanceMessage": true
}
```

**Response includes:**
```json
{
  "reluctanceMessage": {
    "effectiveSellPrice": "49",
    "burnImpact": "1",
    "percentageLoss": 0.02,
    "message": "...",
    "educationalContent": "..."
  }
}
```

### POST /api/tokens/withdraw (Enhanced)

The withdraw endpoint now supports reluctance messaging:

**Request:**
```json
{
  "amount": 200,
  "bankAccountId": "acc_123",
  "includeReluctanceMessage": true
}
```

**Response includes:**
```json
{
  "reluctanceMessage": {
    "effectiveSellPrice": "194",
    "burnImpact": "6",
    "percentageLoss": 0.03,
    "message": "...",
    "educationalContent": "..."
  }
}
```

## Service Usage

### Basic Usage

```typescript
import { ReluctanceMessagingService } from '@/services/tokens/reluctance-messaging';
import { BurnTransactionType } from '@/services/tokens/token-burn.types';

const reluctanceService = new ReluctanceMessagingService();

// Generate reluctance message
const message = reluctanceService.generateReluctanceMessage(
  100, // amount
  BurnTransactionType.EARNINGS_WITHDRAWAL,
  5000 // user balance
);

console.log(message.effectiveSellPrice); // Decimal: 97
console.log(message.burnImpact); // Decimal: 3
console.log(message.percentageLoss); // number: 0.03
console.log(message.message); // HTML string with messaging
console.log(message.educationalContent); // HTML string with education
```

### Generate Warning Messages

```typescript
// Only generates warning for significant losses (>2%)
const warning = reluctanceService.generateWarningMessage(
  100,
  BurnTransactionType.EARNINGS_WITHDRAWAL
);

if (warning) {
  console.log(warning); // "⚠️ Significant Loss Warning: ..."
}
```

### Comprehensive Reporting

```typescript
const report = reluctanceService.generateComprehensiveReport(
  100, // amount
  BurnTransactionType.EARNINGS_WITHDRAWAL,
  5000, // user balance
  0.50 // current token price in USD
);

console.log(report.reluctanceMessage);
console.log(report.warningMessage);
console.log(report.financialImpact);
console.log(report.recommendations);
```

### Calculate Effective Prices

```typescript
// Forward calculation: original -> net
const netPrice = reluctanceService.calculateEffectiveSellPrice(
  100,
  BurnTransactionType.EARNINGS_WITHDRAWAL
);
// Result: 97

// Reverse calculation: net -> original
const originalPrice = reluctanceService.calculateOriginalPriceFromNet(
  97,
  BurnTransactionType.EARNINGS_WITHDRAWAL
);
// Result: 100
```

## Burn Rates

The service uses the following burn rates:

| Transaction Type | Burn Rate | Use Case |
|---|---|---|
| Course Sale | 5% | Selling course content |
| Earnings Withdrawal | 3% | Withdrawing to bank account |
| Token Redemption | 2% | Redeeming for features |

## Educational Content

The service provides four types of educational content:

### 1. Token Economics
Explains how AZR tokens appreciate through deflation and scarcity.

### 2. Burn Mechanism
Details how burns work and why they're important for token value.

### 3. Holding Benefits
Highlights advantages of holding tokens:
- Ownership stake increases
- Leaderboard ranking improves
- Governance voting rights
- Appreciation potential

### 4. Alternative Uses
Suggests alternatives to selling:
- Redeem for premium features
- Stake for rewards
- Donate to causes
- Hold for growth

## Messaging Strategy

### Message Selection

Messages are selected based on:
1. **Transaction Type**: Different messaging for sales, withdrawals, redemptions
2. **Loss Percentage**: Higher losses get stronger messaging
3. **Ownership Impact**: Shows how ownership percentage changes

### Warning Triggers

Warnings are generated when:
- Loss percentage > 2%
- Burn amount is significant relative to balance
- User is about to lose substantial ownership percentage

### Recommendation Generation

Recommendations are personalized based on:
- Transaction type
- Loss percentage
- User's token balance
- Historical patterns

## Integration Points

### UI Integration

1. **Pre-Transaction Modal**: Show reluctance message before confirming
2. **Inline Warnings**: Display warnings during transaction form
3. **Educational Tooltips**: Provide context on hover
4. **Recommendation Cards**: Suggest alternatives

### Backend Integration

1. **Endpoint Enhancement**: Add `includeReluctanceMessage` flag to existing endpoints
2. **Middleware**: Automatically calculate reluctance for all transactions
3. **Logging**: Track reluctance message effectiveness
4. **Analytics**: Monitor user response to messaging

## Metrics & Analytics

Track the following metrics:

```typescript
{
  reluctanceMessageShown: number;
  usersProceedingAfterWarning: number;
  averageBurnPercentageAccepted: number;
  recommendationClickthrough: number;
  educationalContentEngagement: number;
}
```

## Configuration

### Custom Burn Rates

```typescript
const customCalculator = new TokenBurnCalculator({
  courseSale: 0.05,
  earningsWithdrawal: 0.03,
  tokenRedemption: 0.02,
});

const reluctanceService = new ReluctanceMessagingService(customCalculator);
```

### Custom Educational Content

Extend the service to add custom content:

```typescript
const content = reluctanceService.getEducationalContent();
// Modify and use in UI
```

## Testing

### Unit Tests

```bash
npm test -- services/tokens/__tests__/reluctance-messaging.test.ts
```

### Integration Tests

```bash
npm test -- tests/integration/reluctance-messaging.test.ts
```

### E2E Tests

```bash
npx playwright test tests/e2e/reluctance-messaging.spec.ts
```

## Performance Considerations

- Message generation: <50ms
- Calculation overhead: <10ms
- Educational content: Pre-loaded (no runtime cost)
- Caching: Messages can be cached for 5 minutes

## Security Considerations

- All calculations use Decimal for precision
- No sensitive data in messages
- HTML content is sanitized before display
- User balance is verified server-side

## Future Enhancements

1. **A/B Testing**: Test different messaging strategies
2. **Machine Learning**: Personalize messages based on user behavior
3. **Dynamic Pricing**: Adjust messaging based on market conditions
4. **Gamification**: Add achievement badges for holding
5. **Social Proof**: Show community holding statistics
6. **Predictive Analytics**: Estimate future token value

## Troubleshooting

### Message Not Showing

1. Verify `includeReluctanceMessage` flag is set to `true`
2. Check user balance is being retrieved correctly
3. Ensure transaction type is valid

### Incorrect Burn Calculation

1. Verify burn rates in TokenBurnCalculator
2. Check Decimal precision handling
3. Validate transaction type mapping

### Educational Content Not Displaying

1. Check HTML sanitization in UI
2. Verify content is being returned in response
3. Check browser console for rendering errors

## References

- Token Burn Calculator: `services/tokens/token-burn-calculator.ts`
- Token Burn Types: `services/tokens/token-burn.types.ts`
- Burn Integration: `services/tokens/burn-integration.ts`
- Token Rewards: `services/tokens/token-rewards.ts`
