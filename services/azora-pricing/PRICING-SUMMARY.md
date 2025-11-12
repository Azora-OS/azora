# Azora Pricing Summary

## Income-Based Pricing Model

### South Africa (ZA) - Special African Pricing
**Student Plans (in ZAR):**
- **No Income**: R50/month (~$2.50 USD)
- **Low Income**: R95/month (~$5 USD)  
- **Standard**: R150/month (~$8 USD)

**Professional**: R380/month
**Enterprise**: R1,140/month

---

### Other African Countries (Tier 3)
**Student Plans:**
- **No Income**: FREE (R0)
- **Low Income**: ~R30/month (~$1.50 USD)
- **Standard**: ~R60/month (~$3 USD)

**Professional**: ~R190/month
**Enterprise**: ~R570/month

---

### Tier 1 Countries (US, UK, EU, etc.)
**Student Plans (in USD):**
- **No Income**: $10/month
- **Low Income**: $25/month
- **Standard**: $49/month

**Professional**: $99/month
**Enterprise**: $299/month

---

### Tier 2 Countries (BR, MX, IN, etc.)
**Student Plans:**
- **No Income**: ~$5/month (local currency)
- **Low Income**: ~$10/month (local currency)
- **Standard**: ~$19/month (local currency)

**Professional**: ~$49/month
**Enterprise**: ~$149/month

---

### Tier 4 Countries (Lowest Income)
**Student Plans:**
- **No Income**: FREE forever
- **Low Income**: FREE forever
- **Standard**: FREE forever

**Professional**: ~$9/month
**Enterprise**: ~$29/month

---

## Key Features

✅ **Income-Based Selection**: Students choose their income level
✅ **Income Verification**: Required for discounted pricing
✅ **Dynamic Currency**: Auto-converts to local currency
✅ **Learn-to-Earn**: Earn back tuition through learning activities
✅ **Yearly Discount**: 2 months free on annual plans

## Verification Methods

### No Income Tier
- Student ID card
- Unemployment letter
- Self-declaration (auto-approved)

### Low Income Tier
- Recent payslip
- Bank statement (last 3 months)
- Tax return
- Self-declaration (auto-approved)

### Standard Tier
- No verification required

**Note**: Self-declarations are auto-approved for accessibility. Document uploads reviewed within 24-48 hours.

## Implementation

```typescript
// Get pricing with income level
const pricing = await getPricingForUser('NO_INCOME');
// Returns pricing in user's local currency

// Available income levels:
// - 'NO_INCOME': Unemployed/student
// - 'LOW_INCOME': Part-time/limited income
// - 'STANDARD': Regular income
```

## Verification Process

1. **Select Income Level**: Choose during signup
2. **Submit Verification**: Upload document OR write self-declaration (50+ characters)
3. **Auto-Approval**: Self-declarations approved instantly
4. **Document Review**: Uploaded documents reviewed within 24-48 hours
5. **Valid for 1 Year**: Re-verify annually

## Philosophy

Education should be accessible to everyone, regardless of income. Our income-based pricing ensures:
- No one is excluded due to financial constraints
- Pricing is fair relative to local purchasing power
- Simple verification process with self-declaration option
- Students can upgrade as their situation improves
- Learn-to-Earn can offset or eliminate costs entirely
