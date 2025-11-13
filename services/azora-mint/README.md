# Azora Mint - Proof-of-Knowledge Token System

Complete implementation of AZR token with Proof-of-Knowledge mining and economic policy.

## Features

### Proof-of-Knowledge Mining
- Challenge generation based on subject
- Answer verification
- Score-based rewards
- Student level bonuses

### Economic Policy
- Max supply: 21M AZR
- Block rewards with halving
- Inflation rate adjustment
- UBI calculation
- Staking rewards (8% APY)

### Token Operations
- Wallet creation
- Token minting
- Transfers
- Staking/unstaking
- Balance tracking

## API Endpoints

### Wallet
- `POST /api/wallet/create` - Create wallet
- `GET /api/wallet/:address` - Get wallet
- `GET /api/wallet/:address/balance` - Get balance

### Mining
- `POST /api/mining/challenge` - Generate challenge
- `POST /api/mining/submit` - Submit proof and mine

### Tokens
- `POST /api/transfer` - Transfer tokens
- `POST /api/stake` - Stake tokens
- `POST /api/unstake` - Unstake tokens
- `POST /api/staking/reward` - Claim staking reward

### Economics
- `GET /api/economics/stats` - Economic statistics
- `GET /api/economics/ubi` - UBI calculation
- `POST /api/economics/adjust` - Adjust inflation

## Usage

```bash
npm install
npm start
```

## Example

```javascript
// Create wallet
POST /api/wallet/create
{ "userId": "student-123" }

// Get mining challenge
POST /api/mining/challenge
{ "studentId": "student-123", "subject": "javascript" }

// Submit proof and mine
POST /api/mining/submit
{
  "challenge": {...},
  "answers": ["function that accesses outer scope", "promise handling syntax"],
  "address": "wallet-address",
  "studentLevel": 2
}

// Check balance
GET /api/wallet/wallet-address/balance
```

## Economic Model

- **Max Supply**: 21,000,000 AZR
- **Block Reward**: 50 AZR (halves every 210k blocks)
- **Inflation**: 2% (adjustable)
- **UBI**: 1% of supply distributed
- **Staking APY**: 8%

**"Ngiyakwazi ngoba sikwazi"** - Learn to earn! 🚀
