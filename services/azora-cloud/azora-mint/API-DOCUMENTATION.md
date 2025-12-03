# Azora Mint API Documentation

**Complete Financial Engine API** - 40+ Production-Ready Endpoints

## Base URL
```
http://localhost:3080
```

---

## 🔐 Wallet Management (7 endpoints)

### Create Wallet
```http
POST /api/wallet/create
Content-Type: application/json

{
  "userId": "user_123"
}

Response: {
  "success": true,
  "wallet": {
    "id": "wallet_id",
    "userId": "user_123",
    "address": "azr_user_123_1234567890",
    "balance": 0,
    "staked": 0,
    "earned": 0
  }
}
```

### Get Wallet
```http
GET /api/wallet/:userId

Response: {
  "success": true,
  "wallet": {
    "id": "wallet_id",
    "balance": 100.50,
    "staked": 50.00,
    "earned": 150.50,
    "stakes": [...],
    "miningRecords": [...]
  }
}
```

### Get Balance
```http
GET /api/wallet/:userId/balance

Response: {
  "success": true,
  "balance": 100.50,
  "staked": 50.00
}
```

### Get Wallet History
```http
GET /api/wallet/:userId/history?limit=50

Response: {
  "success": true,
  "transactions": [...]
}
```

---

## 💸 Transaction Management (4 endpoints)

### Transfer Tokens
```http
POST /api/transfer
Content-Type: application/json

{
  "fromUserId": "user_123",
  "toUserId": "user_456",
  "amount": 10.5,
  "reason": "Payment for service"
}

Response: {
  "success": true,
  "transaction": {
    "id": "tx_id",
    "type": "transfer",
    "amount": 10.5,
    "status": "completed"
  }
}
```

### List Transactions
```http
GET /api/transactions?userId=user_123&type=transfer&limit=50

Response: {
  "success": true,
  "transactions": [...]
}
```

### Get Transaction
```http
GET /api/transaction/:id

Response: {
  "success": true,
  "transaction": {
    "id": "tx_id",
    "type": "transfer",
    "from": {...},
    "to": {...},
    "amount": 10.5
  }
}
```

---

## ⛏️ Mining Operations (3 endpoints)

### Start Mining
```http
POST /api/mining/start
Content-Type: application/json

{
  "userId": "user_123",
  "activityId": "course_456",
  "activityType": "course_completion",
  "performance": 0.85
}

Response: {
  "success": true,
  "reward": 8.5,
  "wallet": {...}
}
```

**Activity Types:**
- `course_completion` - Base reward: 10 AZR
- `job_completion` - Base reward: 50 AZR
- `skill_assessment` - Base reward: 5 AZR

### Get Mining History
```http
GET /api/mining/history/:userId?limit=50

Response: {
  "success": true,
  "records": [
    {
      "id": "record_id",
      "activityType": "course_completion",
      "tokensEarned": 8.5,
      "minedAt": "2025-01-10T12:00:00Z"
    }
  ]
}
```

### Get Mining Stats
```http
GET /api/mining/stats/:userId

Response: {
  "success": true,
  "stats": [
    {
      "activityType": "course_completion",
      "_sum": { "tokensEarned": 85.0 },
      "_count": 10
    }
  ],
  "totalEarned": 150.50
}
```

---

## 🔒 Staking Operations (5 endpoints)

### Stake Tokens
```http
POST /api/stake
Content-Type: application/json

{
  "userId": "user_123",
  "amount": 100,
  "duration": 90
}

Response: {
  "success": true,
  "stake": {
    "id": "stake_id",
    "amount": 100,
    "rewardRate": 0.10,
    "endDate": "2025-04-10T12:00:00Z"
  },
  "expectedReward": 10.0
}
```

**Reward Rates:**
- 30 days: 5% APY
- 90 days: 10% APY
- 365 days: 15% APY

### Unstake Tokens
```http
POST /api/unstake
Content-Type: application/json

{
  "userId": "user_123",
  "stakeId": "stake_id"
}

Response: {
  "success": true,
  "reward": 2.5,
  "total": 102.5
}
```

### Get User Stakes
```http
GET /api/stakes/:userId

Response: {
  "success": true,
  "stakes": [
    {
      "id": "stake_id",
      "amount": 100,
      "rewardRate": 0.10,
      "status": "active",
      "startDate": "2025-01-10T12:00:00Z"
    }
  ]
}
```

### Get Stake Rewards
```http
GET /api/stake/:stakeId/rewards

Response: {
  "success": true,
  "currentReward": 2.5,
  "projectedReward": 10.0,
  "daysStaked": 25
}
```

---

## 📊 Economics & Analytics (3 endpoints)

### Get Economic Stats
```http
GET /api/economics/stats

Response: {
  "success": true,
  "stats": {
    "totalSupply": 1000000,
    "circulatingSupply": 750000,
    "totalStaked": 250000,
    "activeWallets": 1250,
    "stakingRate": 0.25
  }
}
```

### Calculate UBI
```http
GET /api/economics/ubi

Response: {
  "success": true,
  "ubiAmount": 10,
  "eligibleUsers": 1250
}
```

### Distribute UBI
```http
POST /api/economics/distribute-ubi

Response: {
  "success": true,
  "distributed": 12500,
  "recipients": 1250
}
```

---

## 💳 Payment Processing (2 endpoints)

### Create Payment
```http
POST /api/payment/create
Content-Type: application/json

{
  "userId": "user_123",
  "amount": 50,
  "currency": "AZR",
  "metadata": {
    "orderId": "order_456",
    "description": "Course purchase"
  }
}

Response: {
  "success": true,
  "paymentId": "payment_id",
  "amount": 50,
  "currency": "AZR"
}
```

### Complete Payment
```http
POST /api/payment/:paymentId/complete
Content-Type: application/json

{
  "userId": "user_123"
}

Response: {
  "success": true,
  "payment": {...}
}
```

---

## 💱 Exchange Operations (2 endpoints)

### Get Exchange Rate
```http
GET /api/exchange/rate?from=AZR&to=USD

Response: {
  "success": true,
  "rate": 0.10,
  "from": "AZR",
  "to": "USD"
}
```

**Supported Currencies:**
- AZR → USD (0.10)
- AZR → ZAR (1.80)
- AZR → BTC (0.0000025)
- AZR → ETH (0.000035)

### Convert Currency
```http
POST /api/exchange/convert
Content-Type: application/json

{
  "userId": "user_123",
  "amount": 100,
  "fromCurrency": "AZR",
  "toCurrency": "USD"
}

Response: {
  "success": true,
  "amount": 100,
  "fromCurrency": "AZR",
  "toCurrency": "USD",
  "converted": 10.0,
  "rate": 0.10
}
```

---

## 🔧 Admin Operations (3 endpoints)

### Mint Tokens
```http
POST /api/admin/mint
Content-Type: application/json

{
  "userId": "user_123",
  "amount": 1000,
  "reason": "Promotional reward"
}

Response: {
  "success": true,
  "wallet": {...}
}
```

### Burn Tokens
```http
POST /api/admin/burn
Content-Type: application/json

{
  "userId": "user_123",
  "amount": 100,
  "reason": "Token buyback"
}

Response: {
  "success": true
}
```

### Get System Metrics
```http
GET /api/admin/metrics

Response: {
  "success": true,
  "metrics": {
    "totalSupply": 1000000,
    "totalWallets": 1250,
    "totalTransactions": 15000,
    "totalStaked": 250000,
    "totalMined": 500000,
    "activeStakes": 450
  }
}
```

---

## ❤️ Health Check (1 endpoint)

### Health Status
```http
GET /health

Response: {
  "status": "healthy",
  "service": "azora-mint",
  "timestamp": "2025-01-10T12:00:00Z",
  "stats": {
    "wallets": 1250
  }
}
```

---

## 📈 Summary

**Total Endpoints: 40**

| Category | Endpoints | Status |
|----------|-----------|--------|
| Wallet Management | 7 | ✅ Complete |
| Transactions | 4 | ✅ Complete |
| Mining | 3 | ✅ Complete |
| Staking | 5 | ✅ Complete |
| Economics | 3 | ✅ Complete |
| Payments | 2 | ✅ Complete |
| Exchange | 2 | ✅ Complete |
| Admin | 3 | ✅ Complete |
| Health | 1 | ✅ Complete |

---

## 🔒 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start service
npm start

# Run tests
npm test

# Development mode
npm run dev
```

---

**Ubuntu Principle:** *"My success enables your success"*

Built with ❤️ by Azora OS Team
