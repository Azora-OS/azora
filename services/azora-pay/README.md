# Azora Pay

Secure payment processing with Stripe integration and multi-currency support.

## Purpose
- Payment processing
- Stripe integration
- Subscription management
- Invoice generation
- Payment history
- Refund processing

## Setup
```bash
npm install
npm run prisma:generate
```

## Environment Variables
See `.env.example` for required configuration.

## Scripts
- `npm run dev` - Development server
- `npm run start` - Production server
- `npm run test` - Run tests

## API Endpoints
- `POST /api/payments/create` - Create payment
- `POST /api/subscriptions/create` - Create subscription
- `GET /api/invoices/:id` - Get invoice
- `POST /api/refunds` - Process refund
- `GET /api/history/:userId` - Payment history

## Payment Methods
- Credit/Debit cards (Stripe)
- AZR tokens
- Bank transfers
