# Migration Guide - Azora Mint API

**Upgrading from placeholder endpoints to production-ready APIs**

---

## 🎯 Overview

This guide helps you migrate from the old placeholder endpoints to the new production-ready API.

**What Changed:**
- ✅ 40 complete endpoints (was ~30 placeholders)
- ✅ Real business logic (was random/placeholder)
- ✅ Full database integration (was partial)
- ✅ Comprehensive error handling (was basic)

---

## 🔄 Endpoint Changes

### Wallet Endpoints

#### ❌ OLD: Basic wallet lookup
```javascript
GET /api/wallet/:userId
// Response: { success: true, data: { balance: 0, currency: 'AZR' } }
```

#### ✅ NEW: Complete wallet with history
```javascript
GET /api/wallet/:userId
// Response: {
//   success: true,
//   wallet: {
//     id: "wallet_id",
//     userId: "user_123",
//     address: "azr_user_123_...",
//     balance: 100.50,
//     staked: 50.00,
//     earned: 150.50,
//     stakes: [...],
//     miningRecords: [...]
//   }
// }
```

**Migration Steps:**
1. Update response parsing to use `wallet` instead of `data`
2. Access new fields: `staked`, `earned`, `address`
3. Use nested `stakes` and `miningRecords` for history

---

### Mining Endpoints

#### ❌ OLD: Random rewards
```javascript
POST /api/mining/start
{
  "userId": "user_123"
}
// Response: { success: true, reward: 7.3 } // Random!
```

#### ✅ NEW: Activity-based rewards
```javascript
POST /api/mining/start
{
  "userId": "user_123",
  "activityId": "course_456",
  "activityType": "course_completion",
  "performance": 0.85
}
// Response: {
//   success: true,
//   reward: 8.5,
//   wallet: { balance: 8.5, earned: 8.5 }
// }
```

**Migration Steps:**
1. Add required fields: `activityId`, `activityType`, `performance`
2. Update reward calculation logic (no longer random)
3. Use returned `wallet` object for updated balance

**Activity Types:**
- `course_completion` - Base: 10 AZR
- `job_completion` - Base: 50 AZR
- `skill_assessment` - Base: 5 AZR

---

### Transfer Endpoints

#### ❌ OLD: Basic send
```javascript
POST /api/wallet/send
{
  "userId": "user_123",
  "amount": 10,
  "address": "azr_456"
}
```

#### ✅ NEW: P2P transfer with validation
```javascript
POST /api/transfer
{
  "fromUserId": "user_123",
  "toUserId": "user_456",
  "amount": 10,
  "reason": "Payment for service"
}
// Response: {
//   success: true,
//   transaction: {
//     id: "tx_id",
//     type: "transfer",
//     amount: 10,
//     status: "completed"
//   }
// }
```

**Migration Steps:**
1. Change endpoint from `/api/wallet/send` to `/api/transfer`
2. Replace `address` with `toUserId`
3. Add `fromUserId` (was implicit)
4. Add optional `reason` field
5. Handle validation errors (insufficient balance)

---

### Transaction History

#### ❌ OLD: Basic list
```javascript
GET /api/transactions?userId=user_123
// Response: { success: true, data: [...] }
```

#### ✅ NEW: Filtered with pagination
```javascript
GET /api/transactions?userId=user_123&type=transfer&limit=50
// Response: {
//   success: true,
//   transactions: [
//     {
//       id: "tx_id",
//       type: "transfer",
//       from: { userId: "user_123", ... },
//       to: { userId: "user_456", ... },
//       amount: 10,
//       createdAt: "2025-01-10T12:00:00Z"
//     }
//   ]
// }
```

**Migration Steps:**
1. Update response parsing to use `transactions` instead of `data`
2. Use new filters: `type`, `limit`
3. Access nested `from` and `to` wallet objects

---

## 🆕 New Endpoints

### Staking System (NEW!)

```javascript
// Stake tokens
POST /api/stake
{
  "userId": "user_123",
  "amount": 100,
  "duration": 90
}

// Get stakes
GET /api/stakes/:userId

// Calculate rewards
GET /api/stake/:stakeId/rewards

// Unstake
POST /api/unstake
{
  "userId": "user_123",
  "stakeId": "stake_id"
}
```

### Economic Stats (NEW!)

```javascript
// Get system stats
GET /api/economics/stats

// Calculate UBI
GET /api/economics/ubi

// Distribute UBI
POST /api/economics/distribute-ubi
```

### Payment Processing (NEW!)

```javascript
// Create payment
POST /api/payment/create
{
  "userId": "user_123",
  "amount": 50,
  "currency": "AZR",
  "metadata": { "orderId": "order_456" }
}

// Complete payment
POST /api/payment/:paymentId/complete
{
  "userId": "user_123"
}
```

### Exchange System (NEW!)

```javascript
// Get exchange rate
GET /api/exchange/rate?from=AZR&to=USD

// Convert currency
POST /api/exchange/convert
{
  "userId": "user_123",
  "amount": 100,
  "fromCurrency": "AZR",
  "toCurrency": "USD"
}
```

### Admin Tools (NEW!)

```javascript
// Mint tokens
POST /api/admin/mint
{
  "userId": "user_123",
  "amount": 1000,
  "reason": "Promotional reward"
}

// Burn tokens
POST /api/admin/burn
{
  "userId": "user_123",
  "amount": 100,
  "reason": "Token buyback"
}

// Get metrics
GET /api/admin/metrics
```

---

## 🔧 Code Migration Examples

### Example 1: Education Service Integration

#### ❌ OLD CODE
```javascript
// When student completes course
async function rewardStudent(studentId) {
  const response = await fetch('http://localhost:3080/api/mining/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: studentId })
  });
  
  const { reward } = await response.json();
  console.log(`Student earned ${reward} AZR`);
}
```

#### ✅ NEW CODE
```javascript
// When student completes course
async function rewardStudent(studentId, courseId, score) {
  const response = await fetch('http://localhost:3080/api/mining/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: studentId,
      activityId: courseId,
      activityType: 'course_completion',
      performance: score / 100
    })
  });
  
  const { reward, wallet } = await response.json();
  console.log(`Student earned ${reward} AZR`);
  console.log(`New balance: ${wallet.balance} AZR`);
  
  // Optionally auto-stake rewards
  if (wallet.balance >= 10) {
    await stakeTokens(studentId, 10, 90);
  }
}

async function stakeTokens(userId, amount, duration) {
  const response = await fetch('http://localhost:3080/api/stake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount, duration })
  });
  
  const { stake, expectedReward } = await response.json();
  console.log(`Staked ${amount} AZR for ${duration} days`);
  console.log(`Expected reward: ${expectedReward} AZR`);
}
```

---

### Example 2: Marketplace Payment

#### ❌ OLD CODE
```javascript
// Pay freelancer for job
async function payFreelancer(clientId, freelancerId, amount) {
  const response = await fetch('http://localhost:3080/api/wallet/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: clientId,
      amount: amount,
      address: `azr_${freelancerId}`
    })
  });
  
  const { txHash } = await response.json();
  return txHash;
}
```

#### ✅ NEW CODE
```javascript
// Pay freelancer for job
async function payFreelancer(clientId, freelancerId, amount, jobId) {
  // Create payment intent
  const paymentResponse = await fetch('http://localhost:3080/api/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: freelancerId,
      amount: amount,
      currency: 'AZR',
      metadata: { jobId, clientId }
    })
  });
  
  const { paymentId } = await paymentResponse.json();
  
  // Transfer tokens
  const transferResponse = await fetch('http://localhost:3080/api/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromUserId: clientId,
      toUserId: freelancerId,
      amount: amount,
      reason: `Payment for job ${jobId}`
    })
  });
  
  if (!transferResponse.ok) {
    const error = await transferResponse.json();
    throw new Error(error.error); // Handle insufficient balance
  }
  
  const { transaction } = await transferResponse.json();
  
  // Complete payment
  await fetch(`http://localhost:3080/api/payment/${paymentId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: freelancerId })
  });
  
  return transaction.id;
}
```

---

### Example 3: Dashboard Stats

#### ❌ OLD CODE
```javascript
// Get basic stats
async function getStats() {
  const response = await fetch('http://localhost:3080/health');
  const { stats } = await response.json();
  
  return {
    wallets: stats.wallets,
    supply: stats.supply
  };
}
```

#### ✅ NEW CODE
```javascript
// Get comprehensive stats
async function getStats() {
  // Get economic stats
  const economicResponse = await fetch('http://localhost:3080/api/economics/stats');
  const { stats: economic } = await economicResponse.json();
  
  // Get admin metrics
  const metricsResponse = await fetch('http://localhost:3080/api/admin/metrics');
  const { metrics } = await metricsResponse.json();
  
  return {
    totalSupply: economic.totalSupply,
    circulatingSupply: economic.circulatingSupply,
    totalStaked: economic.totalStaked,
    stakingRate: economic.stakingRate,
    activeWallets: economic.activeWallets,
    totalTransactions: metrics.totalTransactions,
    totalMined: metrics.totalMined,
    activeStakes: metrics.activeStakes
  };
}

// Get user-specific stats
async function getUserStats(userId) {
  // Get wallet
  const walletResponse = await fetch(`http://localhost:3080/api/wallet/${userId}`);
  const { wallet } = await walletResponse.json();
  
  // Get mining stats
  const miningResponse = await fetch(`http://localhost:3080/api/mining/stats/${userId}`);
  const { stats: mining, totalEarned } = await miningResponse.json();
  
  // Get stakes
  const stakesResponse = await fetch(`http://localhost:3080/api/stakes/${userId}`);
  const { stakes } = await stakesResponse.json();
  
  return {
    balance: wallet.balance,
    staked: wallet.staked,
    earned: wallet.earned,
    totalEarned: totalEarned,
    miningStats: mining,
    activeStakes: stakes.filter(s => s.status === 'active').length
  };
}
```

---

## 🚨 Breaking Changes

### 1. Response Structure
**OLD:** `{ success: true, data: {...} }`  
**NEW:** `{ success: true, wallet/transaction/stake: {...} }`

**Action:** Update all response parsing

---

### 2. Mining Endpoint
**OLD:** `POST /api/mining/start { userId }`  
**NEW:** `POST /api/mining/start { userId, activityId, activityType, performance }`

**Action:** Add required fields to all mining calls

---

### 3. Transfer Endpoint
**OLD:** `POST /api/wallet/send { userId, amount, address }`  
**NEW:** `POST /api/transfer { fromUserId, toUserId, amount, reason }`

**Action:** Update endpoint URL and request body

---

### 4. Transaction History
**OLD:** `GET /api/transactions?userId=...`  
**NEW:** `GET /api/transactions?userId=...&type=...&limit=...`

**Action:** Update query parameters and response parsing

---

## ✅ Migration Checklist

- [ ] Update all endpoint URLs
- [ ] Add new required fields to requests
- [ ] Update response parsing (data → specific keys)
- [ ] Add error handling for validation errors
- [ ] Implement new staking features
- [ ] Integrate payment processing
- [ ] Update dashboard with new metrics
- [ ] Test all integrations
- [ ] Update documentation
- [ ] Deploy changes

---

## 🧪 Testing Migration

```bash
# Test old endpoints (should still work)
curl http://localhost:3080/health

# Test new wallet endpoint
curl http://localhost:3080/api/wallet/test_user

# Test new mining endpoint
curl -X POST http://localhost:3080/api/mining/start \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"test_user",
    "activityId":"course_123",
    "activityType":"course_completion",
    "performance":0.85
  }'

# Test new staking endpoint
curl -X POST http://localhost:3080/api/stake \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"test_user",
    "amount":10,
    "duration":90
  }'
```

---

## 📞 Support

If you encounter issues during migration:

1. **Check Documentation**: [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)
2. **Run Tests**: `npm test`
3. **Check Examples**: [QUICK-START.md](./QUICK-START.md)
4. **Review Changes**: [TRANSFORMATION.md](./TRANSFORMATION.md)

---

## 🎯 Migration Timeline

### Phase 1: Preparation (Day 1)
- [ ] Review this guide
- [ ] Identify all integration points
- [ ] Create test environment

### Phase 2: Update Code (Day 2-3)
- [ ] Update endpoint URLs
- [ ] Add new required fields
- [ ] Update response parsing
- [ ] Add error handling

### Phase 3: Testing (Day 4)
- [ ] Test all integrations
- [ ] Verify error handling
- [ ] Load testing
- [ ] User acceptance testing

### Phase 4: Deployment (Day 5)
- [ ] Deploy to staging
- [ ] Monitor for issues
- [ ] Deploy to production
- [ ] Monitor metrics

---

**Migration complete! You now have 40 production-ready endpoints.** 🚀

*Built with ❤️ following Ubuntu principles*
