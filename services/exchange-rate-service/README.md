# Exchange Rate Service

A comprehensive exchange rate and currency conversion service for the Azora ecosystem.

## Features

- **Real-time Exchange Rates**: Get current exchange rates for major currencies
- **Currency Conversion**: Convert amounts between different currencies
- **Historical Data**: Access historical exchange rate data
- **Multiple Currency Support**: Support for major world currencies
- **RESTful API**: Well-documented API endpoints for all exchange rate functions

## API Endpoints

### Health & Info
- `GET /health` - Service health check

### Exchange Rates
- `GET /api/rates` - Get current exchange rates
- `GET /api/rates/:currency` - Get rate for specific currency
- `POST /api/rates` - Update exchange rates (admin only)

### Conversion
- `POST /api/convert` - Convert amount between currencies
- `POST /api/convert/batch` - Convert multiple amounts

### Historical Data
- `GET /api/history/:currency` - Get historical rates for a currency
- `GET /api/history/:currency/:days` - Get historical rates for specified number of days

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
PORT=3032
LOG_LEVEL=info
```

## Supported Currencies

The service supports the following currencies:

1. **USD**: US Dollar
2. **EUR**: Euro
3. **GBP**: British Pound
4. **JPY**: Japanese Yen
5. **CAD**: Canadian Dollar
6. **AUD**: Australian Dollar
7. **CHF**: Swiss Franc

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

PROPRIETARY