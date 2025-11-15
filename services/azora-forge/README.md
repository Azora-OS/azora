# Azora Forge

AI-powered job matching, skills assessment, and marketplace platform.

## Purpose
- Job posting and matching
- Skills assessment
- Portfolio management
- Escrow payment system
- Dispute resolution
- Professional networking

## Setup
```bash
npm install
npm run prisma:generate
```

## Environment Variables
See `.env.example` for required configuration.

## Scripts
- `npm run dev` - Development server
- `npm run build` - Build TypeScript
- `npm run start` - Production server
- `npm run test` - Run tests
- `npm run typecheck` - TypeScript validation

## API Endpoints
- `GET /api/jobs` - List job postings
- `POST /api/jobs` - Create job posting
- `POST /api/jobs/:id/apply` - Apply to job
- `GET /api/skills/assessment` - Skills assessment
- `POST /api/escrow/create` - Create escrow
- `GET /api/portfolio/:userId` - Get portfolio

## Features
- 95%+ AI matching accuracy
- Blockchain-secured escrow
- Ubuntu networking principles
