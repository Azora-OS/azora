# Compliance Dashboard Service

Enterprise-grade compliance monitoring and reporting dashboard API.

## Overview

The Compliance Dashboard Service provides real-time compliance status monitoring, metrics, and alerts across multiple compliance frameworks including GDPR, HIPAA, SOX, CCPA, PIPEDA, and LGPD.

## Features

- **Multi-Framework Support**: Monitor compliance across multiple frameworks
- **Real-time Metrics**: Compliance scores and risk distribution
- **Alert Management**: Active alerts with acknowledgment system
- **Regional Compliance**: Track compliance by region
- **Audit Logging**: Complete audit trail of compliance activities

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

## Configuration

Set environment variables:
- `PORT` - Service port (default: 4000)

## API Endpoints

### Dashboard
- `GET /api/compliance/dashboard` - Get complete compliance dashboard data

### Alerts
- `POST /api/compliance/alerts/:alertId/acknowledge` - Acknowledge an alert

### Health
- `GET /api/health` - Service health check

## Supported Compliance Frameworks

- **GDPR** - General Data Protection Regulation (EU)
- **HIPAA** - Health Insurance Portability and Accountability Act (US)
- **SOX** - Sarbanes-Oxley Act (US)
- **CCPA** - California Consumer Privacy Act (US)
- **PIPEDA** - Personal Information Protection and Electronic Documents Act (Canada)
- **LGPD** - Lei Geral de Proteção de Dados (Brazil)

## Metrics

The service provides:
- Overall compliance score
- Regional compliance breakdown
- Risk distribution (low, medium, high, critical)
- Top issues identification

## Docker

```bash
docker build -t compliance-dashboard .
docker run -p 4000:4000 compliance-dashboard
```

## License

AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

