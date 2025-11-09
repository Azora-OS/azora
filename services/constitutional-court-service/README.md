# ⚖️ Constitutional Court Service

**Supreme Governance Layer for Azora OS**

## Overview

The Constitutional Court Service is the highest authority in the Azora OS ecosystem, responsible for reviewing all actions against the Azora Constitution and enforcing constitutional compliance.

## Features

- **Constitutional Review**: Evaluate actions against constitutional articles
- **Article XVI Enforcement**: No Mock Protocol validation
- **Compliance Checking**: Automated code and action validation
- **Audit Trail**: Complete history of all constitutional reviews

## API Endpoints

### POST `/api/v1/court/review`
Review an action against the constitution.

```json
{
  "action": "increase token supply",
  "context": { "amount": 1000 }
}
```

### POST `/api/v1/court/validate-code`
Validate code against Article XVI (No Mock Protocol).

```json
{
  "code": "const mockData = { test: true }",
  "filePath": "/services/example.ts"
}
```

### GET `/api/v1/court/reviews`
Get all constitutional reviews.

### GET `/health`
Health check endpoint.

## Environment Variables

- `PORT`: Service port (default: 4500)

## Running

```bash
npm install
npm run dev
```

## Integration

The Constitutional Court Service is integrated into:
- Master System Integrator
- Master Orchestrator
- All core services (via dependency chain)

## Constitutional Authority

This service enforces:
- Article II: Token Economics
- Article III: Founder Rights
- Article IV: Student Economics
- Article V: Governance
- Article VI: Infrastructure Independence
- Article XVI: No Mock Protocol

---

**Azora Proprietary License**  
Copyright © 2025 Azora ES (Pty) Ltd.
