# Azora OS - Proof-of-Knowledge MVP API & Database Schema

## Overview
This document defines the API and database schema for the core Proof-of-Knowledge MVP loop between Azora Sapiens and Azora Mint.

## MVP Scope
**Goal**: Prove that education can be transformed into paid value creation through one complete end-to-end flow:
1. User enrolls in "Solar Grid Technician" course
2. User completes first module
3. System automatically rewards user with aZAR tokens
4. User sees balance increase

## Database Schema

### Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL, -- Ethereum address
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### knowledge_rewards
```sql
CREATE TABLE knowledge_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  reward_type VARCHAR(50) NOT NULL, -- 'module_completion', 'assessment_pass', 'certification'
  reward_category VARCHAR(50) NOT NULL, -- 'basic', 'intermediate', 'advanced'
  amount DECIMAL(18,8) NOT NULL, -- aZAR amount
  achievement TEXT NOT NULL, -- Description of what was achieved
  transaction_hash VARCHAR(66), -- Blockchain transaction hash
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Index for performance
CREATE INDEX idx_knowledge_rewards_user_id ON knowledge_rewards(user_id);
CREATE INDEX idx_knowledge_rewards_status ON knowledge_rewards(status);
```

#### user_balances
```sql
CREATE TABLE user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  azr_balance DECIMAL(18,8) DEFAULT 0,
  azar_balance DECIMAL(18,8) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Azora Sapiens → Azora Mint Integration

#### POST /api/knowledge-reward
**Purpose**: Process a knowledge reward payment (called by Azora Sapiens)

**Request Body**:
```json
{
  "userId": "uuid",
  "rewardType": "module_completion",
  "rewardCategory": "basic",
  "achievement": "Completed Introduction to Photovoltaic Systems",
  "requestSignature": "signature_from_sapiens_service"
}
```

**Response**:
```json
{
  "success": true,
  "rewardId": "uuid",
  "amount": 150.00,
  "transactionHash": "0x...",
  "userBalance": 150.00
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "User not eligible for reward",
  "code": "ELIGIBILITY_CHECK_FAILED"
}
```

### User-Facing Endpoints

#### GET /api/knowledge-rewards/:userId
**Purpose**: Get user's reward history

**Response**:
```json
{
  "rewards": [
    {
      "id": "uuid",
      "rewardType": "module_completion",
      "amount": 150.00,
      "achievement": "Completed Introduction to Photovoltaic Systems",
      "status": "completed",
      "createdAt": "2025-10-27T10:00:00Z"
    }
  ],
  "totalEarned": 150.00
}
```

#### GET /api/balance/:userId
**Purpose**: Get user's current balance

**Response**:
```json
{
  "azr": 0.00,
  "azar": 150.00,
  "totalValueUSD": 15.00
}
```

## Business Logic

### Reward Amounts
```javascript
const REWARD_AMOUNTS = {
  module_completion: {
    basic: 100,
    intermediate: 150,
    advanced: 200
  },
  assessment_pass: {
    basic: 300,
    intermediate: 400,
    advanced: 500
  },
  certification: {
    basic: 1000,
    intermediate: 1500,
    advanced: 2000
  }
};
```

### Eligibility Checks
1. **User Exists**: Verify user_id exists in users table
2. **Duplicate Prevention**: Check no identical reward in last 24 hours
3. **Service Authentication**: Verify request signature from Azora Sapiens
4. **Fund Availability**: Ensure UBO fund has sufficient balance

### Payment Flow
1. **Validate Request**: Check all eligibility criteria
2. **Calculate Amount**: Based on reward_type and reward_category
3. **Create Reward Record**: Insert into knowledge_rewards (status: 'pending')
4. **Transfer Tokens**: Move aZAR from UBO wallet to user wallet
5. **Update Balance**: Increment user_balances.azar_balance
6. **Record Transaction**: Update knowledge_rewards with transaction_hash and status: 'completed'

## Implementation Priority

### Phase 1: Core MVP (Week 1-2)
- [ ] Database schema creation
- [ ] Basic API endpoints
- [ ] Simple reward calculation
- [ ] Mock token transfer (no real blockchain)

### Phase 2: Production Ready (Week 3-4)
- [ ] Real blockchain integration
- [ ] Comprehensive error handling
- [ ] Rate limiting and security
- [ ] Monitoring and logging

### Phase 3: Enhanced Features (Week 5+)
- [ ] Multi-currency support
- [ ] Advanced analytics
- [ ] Bulk reward processing
- [ ] Integration testing with Azora Sapiens

## Testing Strategy

### Unit Tests
- Reward calculation logic
- Eligibility validation
- Balance updates

### Integration Tests
- Full reward flow end-to-end
- Service authentication
- Database transactions

### Manual Testing
- Complete user journey in UI
- Error scenarios
- Performance under load

This MVP focuses on proving the core hypothesis: **Education can fund itself through token rewards.**