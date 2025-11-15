# Azora Mint

Financial engine with multi-currency wallet, mining, and Proof-of-Knowledge rewards.

## Purpose
- Multi-currency wallet management (AZR, BTC, ETH, USD)
- Proof-of-Knowledge mining engine
- Token minting and burning
- Transaction processing
- Economic policy enforcement

## Setup
```bash
npm install
npm run prisma:generate
```

## Environment Variables
See `.env.example` for required configuration.

## Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Build TypeScript to dist/
- `npm run start` - Production server
- `npm run test` - Run Jest tests
- `npm run test:watch` - Watch mode testing
- `npm run typecheck` - TypeScript validation

## API Endpoints
- `POST /api/wallet/create` - Create new wallet
- `GET /api/wallet/:userId` - Get wallet balance
- `POST /api/mining/start` - Start mining session
- `GET /api/transactions` - Transaction history
- `POST /api/tokens/mint` - Mint tokens (admin)

## Database
Uses PostgreSQL with Prisma ORM. Run migrations:
```bash
npm run prisma:migrate
```
