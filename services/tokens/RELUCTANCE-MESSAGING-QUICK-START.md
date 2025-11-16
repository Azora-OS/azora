# Reluctance Messaging - Quick Start Guide

## Overview

The Reluctance Messaging Service calculates effective sell prices after token burns and generates psychological messaging to discourage token sales while educating users about token economics.

## What It Does

1. **Calculates Effective Prices**: Shows users what they'll actually receive after burn
2. **Generates Warnings**: Alerts users to significant losses (>2%)
3. **Provides Education**: Explains token economics and holding benefits
4. **Makes Recommendations**: Suggests alternatives to selling

## Quick Integration

### 1. Use the Reluctance Check Endpoint

Before allowing a user to sell/withdraw/redeem, call this endpoint:

```bash
POST /api/tokens/reluctance-check
Content-Type: application/json
x-user-id: user_123

{
  "amount": 100,
  "transactionType": "EARNINGS_WITHDRAWAL",
  "currentTokenPrice": 0.50
}
```

Response:
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
  "userBalance": "5000"
}
```

### 2. Display the Message in UI

```typescript
// In your React component
const [reluctanceData, setReluctanceData] = useState(null);

const checkReluctance = async (amount: number) => {
  const response = await fetch('/api/tokens/reluctance-check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({
      amount,
      transactionType: 'EARNINGS_WITHDRAWAL',
      currentTokenPrice: 0.50,
    }),
  });
  
  const data = await response.json();
  setReluctanceData(data);
};

// Render the message
{reluctanceData && (
  <div className="reluctance-warning">
    <div dangerouslySetInnerHTML={{ __html: reluctanceData.reluctanceMessage.message }} />
    {reluctanceData.warningMessage && (
      <div className="warning" dangerouslySetInnerHTML={{ __html: reluctanceData.warningMessage }} />
    )}
    <div className="education" dangerouslySetInnerHTML={{ __html: reluctanceData.reluctanceMessage.educationalContent }} />
  </div>
)}
```

### 3. Include in Existing Endpoints

The redeem and withdraw endpoints now support reluctance messaging:

```bash
POST /api/tokens/redeem
{
  "amount": 50,
  "feature": "premium_content",
  "includeReluctanceMessage": true
}
```

Response includes:
```json
{
  "success": true,
  "transaction": { ... },
  "reluctanceMessage": { ... }
}
```

## Burn Rates Reference

| Transaction | Burn Rate | Example |
|---|---|---|
| Course Sale | 5% | Sell 100 tokens → 95 net |
| Earnings Withdrawal | 3% | Withdraw 100 tokens → 97 net |
| Token Redemption | 2% | Redeem 100 tokens → 98 net |

## Service Usage in Code

```typescript
import { ReluctanceMessagingService } from '@/services/tokens/reluctance-messaging';
import { BurnTransactionType } from '@/services/tokens/token-burn.types';

const reluctanceService = new ReluctanceMessagingService();

// Generate message
const message = reluctanceService.generateReluctanceMessage(
  100, // amount
  BurnTransactionType.EARNINGS_WITHDRAWAL,
  5000 // user balance
);

console.log(message.effectiveSellPrice); // Decimal: 97
console.log(message.percentageLoss); // number: 0.03
console.log(message.message); // HTML string
console.log(message.educationalContent); // HTML string

// Generate comprehensive report
const report = reluctanceService.generateComprehensiveReport(
  100,
  BurnTransactionType.EARNINGS_WITHDRAWAL,
  5000,
  0.50 // token price in USD
);

console.log(report.financialImpact);
console.log(report.recommendations);
```

## UI Implementation Examples

### Modal Before Withdrawal

```typescript
<Modal isOpen={showReluctanceModal}>
  <h2>Before You Withdraw</h2>
  
  <div className="burn-impact">
    <p>You're about to withdraw {amount} tokens</p>
    <p>After 3% burn: {effectivePrice} tokens</p>
    <p>You'll lose: {burnImpact} tokens</p>
  </div>
  
  <div className="warning">
    {warningMessage && <Alert type="warning">{warningMessage}</Alert>}
  </div>
  
  <div className="education">
    <Tabs>
      <Tab label="Token Economics">
        {educationalContent.tokenEconomics}
      </Tab>
      <Tab label="Why Hold?">
        {educationalContent.holdingBenefits}
      </Tab>
      <Tab label="Alternatives">
        {educationalContent.alternativeUses}
      </Tab>
    </Tabs>
  </div>
  
  <Button onClick={handleProceed}>Proceed with Withdrawal</Button>
  <Button onClick={handleCancel}>Cancel</Button>
</Modal>
```

### Inline Warning in Form

```typescript
<form onSubmit={handleWithdraw}>
  <input 
    type="number" 
    value={amount}
    onChange={(e) => {
      setAmount(e.target.value);
      checkReluctance(e.target.value);
    }}
  />
  
  {reluctanceData?.warningMessage && (
    <Alert type="warning">
      {reluctanceData.warningMessage}
    </Alert>
  )}
  
  <div className="price-breakdown">
    <p>Original: {amount} tokens</p>
    <p>Burn (3%): {reluctanceData?.reluctanceMessage.burnImpact}</p>
    <p>You receive: {reluctanceData?.reluctanceMessage.effectiveSellPrice}</p>
  </div>
  
  <button type="submit">Withdraw</button>
</form>
```

### Recommendation Cards

```typescript
{comprehensiveReport?.recommendations.map((rec, i) => (
  <Card key={i} className="recommendation">
    <p>{rec}</p>
  </Card>
))}
```

## Testing the Feature

### Manual Testing

1. Call `/api/tokens/reluctance-check` with different amounts
2. Verify burn calculations are correct
3. Check that warnings appear for >2% burns
4. Verify educational content displays properly

### Automated Testing

```bash
npm test -- services/tokens/__tests__/reluctance-messaging.test.ts
```

## Key Metrics to Track

- How many users see reluctance messages
- How many proceed after seeing warnings
- Average burn percentage accepted
- Click-through on educational content
- Conversion rate (users who hold vs. sell)

## Common Issues

### Message Not Showing
- Verify `includeReluctanceMessage: true` is set
- Check user balance is retrieved correctly
- Ensure transaction type is valid

### Incorrect Calculations
- Verify burn rates in TokenBurnCalculator
- Check Decimal precision handling
- Validate transaction type mapping

### Educational Content Not Displaying
- Check HTML sanitization in UI
- Verify content is in response
- Check browser console for errors

## Next Steps

1. Integrate reluctance check into withdrawal flow
2. Add to redemption flow
3. Add to course sale flow
4. Monitor effectiveness metrics
5. A/B test different messaging strategies
6. Collect user feedback

## References

- Full Documentation: `RELUCTANCE-MESSAGING-README.md`
- Token Burn Calculator: `token-burn-calculator.ts`
- Burn Integration: `burn-integration.ts`
- Token Rewards: `token-rewards.ts`
