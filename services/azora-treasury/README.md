# Azora Treasury Service

A financial asset management and reporting service for the Azora ecosystem.

## Features

- **Asset Management**: Track and manage treasury assets including cryptocurrencies and fiat currencies
- **Reserve Management**: Add or remove assets from treasury reserves
- **Financial Reporting**: Generate comprehensive financial reports
- **Transaction Tracking**: Record and monitor all treasury transactions
- **RESTful API**: Well-documented API endpoints for all treasury functions

## API Endpoints

### Health & Info
- `GET /health` - Service health check

### Assets
- `GET /api/assets` - Get all treasury assets
- `GET /api/assets/:assetId` - Get specific asset
- `POST /api/assets` - Add a new treasury asset
- `PUT /api/assets/:assetId` - Update treasury asset

### Reserves
- `POST /api/reserves` - Manage treasury reserves
- `GET /api/reserves` - Get all reserve transactions
- `GET /api/reserves/:transactionId` - Get specific transaction

### Reports
- `GET /api/reports` - Generate a financial report
- `GET /api/reports/:reportId` - Get specific financial report
- `GET /api/reports/history` - Get all financial reports

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the service:
   ```bash
   npm start
   ```

3. For development:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3028
LOG_LEVEL=info
```

## Asset Types

The service supports various types of treasury assets:

1. **Cryptocurrencies**: Digital assets like Bitcoin, Ethereum, etc.
2. **Fiat Currencies**: Traditional currencies like USD, EUR, etc.
3. **Commodities**: Precious metals and other commodities
4. **Equities**: Stocks and other equity instruments

## Reserve Management

The service supports the following reserve management actions:

1. **Add**: Increase the amount of an asset in treasury
2. **Remove**: Decrease the amount of an asset in treasury

## Financial Reports

The service generates comprehensive financial reports including:

1. **Total Assets**: Combined value of all treasury assets
2. **Total Liabilities**: Total financial obligations
3. **Net Worth**: Difference between assets and liabilities
4. **Asset Breakdown**: Detailed breakdown of assets by type

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

PROPRIETARY