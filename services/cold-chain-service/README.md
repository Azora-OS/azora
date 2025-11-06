# Cold Chain Service

Enterprise-grade cold chain monitoring and compliance system for temperature-sensitive logistics across pharmaceuticals, food, and healthcare industries in Africa.

## Features

- **Real-time Monitoring**: Continuous temperature and humidity tracking
- **GPS Tracking**: Full supply chain visibility from warehouse to delivery
- **Automated Alerts**: Instant notifications for temperature excursions
- **Compliance Reporting**: WHO, FDA, and regional compliance standards
- **Fleet Management**: Vehicle and warehouse monitoring
- **Predictive Analytics**: ML-powered risk prediction

## API Endpoints

- `POST /api/v1/shipments/:id/monitor` - Start shipment monitoring
- `GET /api/v1/shipments/:id/status` - Get monitoring status
- `GET /api/v1/compliance/reports` - Generate compliance reports
- `GET /api/v1/analytics` - Get analytics and insights

## Installation

```bash
cd services/cold-chain-service
npm install
npm run build
npm start
```

## License

AZORA PROPRIETARY LICENSE  
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
