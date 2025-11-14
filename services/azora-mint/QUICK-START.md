# Azora Mint - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies
```bash
cd services/azora-mint
npm install
```

### 2. Setup Database
```bash
# Create .env file
echo "DATABASE_URL=postgresql://user:password@localhost:5432/azora_mint" > .env

# Run migrations
npx prisma migrate dev
```

### 3. Start Service
```bash
npm start
# Service running on http://localhost:3080
```

### 4. Test It Works
```bash
# Health check
curl http://localhost:3080/health

# Create a wallet
curl -X POST http://localhost:3080/api/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"test_user"}'

# Mine some tokens
curl -X POST http://localhost:3080/api/mining/start \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"test_user",
    "activityId":"course_123",
    "activityType":"course_completion",
    "performance":0.9
  }'

# Check balance
curl http://localhost:3080/api/wallet/test_user/balance
```

---

## 📚 Common Use Cases

### Use Case 1: Student Earns Tokens
```javascript
// 1. Create wallet when student signs up
POST /api/wallet/create
{ "userId": "student_123" }

// 2. Student completes course
POST /api/mining/start
{
  "userId": "student_123",
  "activityId": "python_101",
  "activityType": "course_completion",
  "performance": 0.85
}
// Returns: { reward: 8.5 AZR }

// 3. Check earnings
GET /api/wallet/student_123/balance
// Returns: { balance: 8.5, staked: 0 }
```

### Use Case 2: Staking for Rewards
```javascript
// 1. Stake tokens for 90 days
POST /api/stake
{
  "userId": "student_123",
  "amount": 8.5,
  "duration": 90
}
// Returns: { expectedReward: 0.85 AZR (10% APY) }

// 2. Check rewards after 30 days
GET /api/stake/{stakeId}/rewards
// Returns: { currentReward: 0.28, daysStaked: 30 }

// 3. Unstake after 90 days
POST /api/unstake
{
  "userId": "student_123",
  "stakeId": "{stakeId}"
}
// Returns: { reward: 0.85, total: 9.35 }
```

### Use Case 3: P2P Transfer
```javascript
// Student pays tutor
POST /api/transfer
{
  "fromUserId": "student_123",
  "toUserId": "tutor_456",
  "amount": 5,
  "reason": "Tutoring session"
}
// Returns: { success: true, transaction: {...} }
```

---

## 🧪 Run Tests
```bash
npm test

# Expected output:
# PASS  __tests__/api.test.js
#   Wallet Endpoints
#     ✓ creates wallet (50ms)
#     ✓ retrieves wallet (25ms)
#     ✓ gets balance (20ms)
#   Mining Endpoints
#     ✓ mines tokens (45ms)
#     ✓ gets mining history (30ms)
#   ...
# Tests: 15 passed, 15 total
```

---

## 📊 Monitor System
```bash
# Get economic stats
curl http://localhost:3080/api/economics/stats

# Get admin metrics
curl http://localhost:3080/api/admin/metrics

# Check health
curl http://localhost:3080/health
```

---

## 🔧 Development Mode
```bash
# Auto-reload on changes
npm run dev

# Watch tests
npm run test:watch
```

---

## 📖 Full Documentation
- **API Reference**: See `API-DOCUMENTATION.md`
- **Implementation Details**: See `IMPLEMENTATION-SUMMARY.md`
- **Database Schema**: See `prisma/schema.prisma`

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
cat .env

# Reset database
npx prisma migrate reset
```

### Port Already in Use
```bash
# Change port in index.js
const PORT = process.env.PORT || 3081;

# Or kill existing process
lsof -ti:3080 | xargs kill
```

### Tests Failing
```bash
# Ensure database is clean
npx prisma migrate reset --force

# Run tests with verbose output
npm test -- --verbose
```

---

## 🎯 Integration Examples

### With Azora Education
```javascript
// When student completes lesson
const response = await fetch('http://localhost:3080/api/mining/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: student.id,
    activityId: lesson.id,
    activityType: 'course_completion',
    performance: lesson.score / 100
  })
});

const { reward } = await response.json();
console.log(`Student earned ${reward} AZR!`);
```

### With Azora Forge
```javascript
// When job is completed
const payment = await fetch('http://localhost:3080/api/payment/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: freelancer.id,
    amount: job.payment,
    metadata: { jobId: job.id }
  })
});

// Complete payment
await fetch(`http://localhost:3080/api/payment/${payment.paymentId}/complete`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: freelancer.id })
});
```

---

## 🌟 You're Ready!

**40 production endpoints at your fingertips**

Start building the Ubuntu economy! 🚀

*"My success enables your success"*
