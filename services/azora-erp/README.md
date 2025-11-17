# Azora ERP Service

The Azora Enterprise Resource Planning Service provides integrated business management capabilities.

## Features

- Business module management
- Resource allocation
- Business analytics
- Health monitoring

## Endpoints

- `GET /health` - Service health check
- `GET /api/modules` - Get business modules
- `POST /api/allocations` - Allocate resources
- `GET /api/analytics` - Get business analytics

## Environment Variables

- `PORT` - Service port (default: 3022)

## Getting Started

1. Install dependencies: `npm install`
2. Start the service: `npm start`
3. Check health: `npm run health`