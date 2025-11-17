# KYC/AML Service

The KYC/AML Service is a security service for Azora OS that handles Know Your Customer and Anti-Money Laundering compliance.

## Features

- Identity verification
- AML transaction screening
- Sanctions list checking
- Risk assessment and scoring

## API Endpoints

- `GET /health` - Service health check
- `POST /api/kyc/verify` - Perform KYC verification
- `POST /api/aml/screen` - Screen transactions for AML compliance
- `POST /api/compliance/sanctions-check` - Check against sanctions lists

## Environment Variables

- `PORT` - Service port (default: 3015)