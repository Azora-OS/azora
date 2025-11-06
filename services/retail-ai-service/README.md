# Retail AI Service

Enterprise-grade AI-powered retail intelligence platform providing advanced analytics, customer behavior insights, and loss prevention for retail businesses across Africa.

## Features

### 🎯 Core Capabilities
- **Customer Analytics**: Advanced behavior tracking and demographic insights
- **Heat Mapping**: Real-time store zone optimization
- **Loss Prevention**: AI-powered security and theft detection
- **Inventory Intelligence**: Predictive stock management
- **Sales Forecasting**: ML-powered revenue predictions
- **Enterprise Dashboard**: Comprehensive multi-location management

### 📊 Analytics Engine
- Real-time customer footfall tracking
- Dwell time analysis and conversion optimization
- Peak hour identification and staffing recommendations
- Customer demographic profiling
- Zone-based heatmap generation

### 💼 Enterprise Features
- Multi-location management
- Subscription tier system (Basic, Professional, Enterprise)
- Integrated billing with Azora Mint
- Real-time alerting system
- Compliance reporting (GDPR, Privacy, Security)

## Architecture

```
retail-ai-service/
├── src/
│   ├── interfaces/         # TypeScript interfaces
│   ├── services/
│   │   ├── analytics-engine.ts
│   │   ├── client-management.ts
│   │   └── billing-integration.ts
│   ├── routes/
│   │   └── enterprise-dashboard.ts
│   └── index.ts
```

## API Endpoints

### Dashboard
- `GET /api/v1/dashboard/:clientId` - Get client dashboard
- `GET /api/v1/dashboard/:clientId/analytics` - Get analytics data
- `GET /api/v1/dashboard/:clientId/alerts` - Get alerts
- `POST /api/v1/dashboard/:clientId/alerts/:alertId/acknowledge` - Acknowledge alert
- `GET /api/v1/dashboard/:clientId/billing` - Get billing information

## Installation

```bash
cd services/retail-ai-service
npm install
npm run build
npm start
```

## Environment Variables

```
RETAIL_AI_PORT=3020
AZORA_MINT_URL=http://localhost:3001
DATABASE_URL=postgresql://...
```

## Integration

### With Azora Mint
Billing and payments are processed through the Azora Mint service for unified financial management.

### With Azora Aegis
Security and compliance features integrate with Azora Aegis for comprehensive protection.

## Subscription Tiers

### Basic ($99/location/month)
- Basic Analytics
- Up to 5 cameras per location
- Daily reports
- 30-day data retention

### Professional ($299/location/month)
- Advanced Analytics
- Up to 20 cameras per location
- Real-time alerts
- API access
- 90-day data retention

### Enterprise ($999/location/month)
- Full AI Suite
- Unlimited cameras
- 24/7 support
- Custom integrations
- Dedicated account manager
- 365-day data retention

## License

AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
