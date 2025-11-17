# Governance Service

The Governance Service manages decentralized decision-making and community proposals.

## Features

- Proposal management
- Voting system
- Decision tracking
- Health monitoring

## Endpoints

- `GET /health` - Service health check
- `GET /api/proposals` - Get governance proposals
- `POST /api/proposals` - Submit new proposal
- `POST /api/vote` - Cast vote on proposal

## Environment Variables

- `PORT` - Service port (default: 3024)

## Getting Started

1. Install dependencies: `npm install`
2. Start the service: `npm start`
3. Check health: `npm run health`