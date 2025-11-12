# 💰 Payment Service

**Version**: 1.0.0  
**Port**: 4003  
**Status**: ✅ Production Ready

## Overview

Payment service managing wallets, transactions, token earning, and payment processing for Azora OS financial system.

## Features

- ✅ Multi-currency wallet management
- ✅ Learn-to-earn token system
- ✅ Transaction history
- ✅ Payment processing
- ✅ Refund system
- ✅ Balance calculations
- ✅ Rate limiting (100 req/15min)

## API Endpoints

### Protected Endpoints (All Require JWT)
- `GET /api/wallet` - Get wallet balance
- `GET /api/transactions` - Get transaction history
- `POST /api/earn` - Earn tokens (learning rewards)
- `POST /api/payments` - Process payment
- `POST /api/refunds` - Request refund
- `GET /health` - Health check

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host:5432/azora
JWT_SECRET=your-secret-min-32-characters
PORT=4003
NODE_ENV=production
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Testing

```bash
npm test
```

**Test Coverage**: 68.49% (10/10 tests passing)

## Dependencies

- express - Web framework
- @prisma/client - Database ORM
- jsonwebtoken - JWT verification
- helmet - Security headers
- express-rate-limit - Rate limiting

## Database Schema

### Wallet
- id, userId, balance
- currency (AZR, USD, BTC, ETH)

### Transaction
- id, userId, amount, type
- status, description
- createdAt

### Payment
- id, userId, amount, currency
- type, status, metadata

## Token System

### Earning Tokens
- Complete lessons: 10-50 AZR
- Finish courses: 100-500 AZR
- Achieve milestones: 50-200 AZR
- Daily limits apply

### Payment Types
- COURSE_PURCHASE
- SUBSCRIPTION
- TOKEN_PURCHASE
- WITHDRAWAL

## Business Logic

- Wallets created automatically on user registration
- Transactions recorded for all balance changes
- Refunds processed within 24 hours
- Token earning limits: 1000 AZR per day

## Deployment

See `/production/DEPLOYMENT-GUIDE.md` for deployment instructions.

## License

Proprietary - Azora ES (Pty) Ltd
