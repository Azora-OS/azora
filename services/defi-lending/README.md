# DeFi Lending Service

A decentralized finance lending and borrowing service for the Azora ecosystem.

## Features

- **Lending Pools**: Create and manage lending pools for various assets
- **Lending Positions**: Enable users to lend assets and earn interest
- **Borrowing Positions**: Allow users to borrow assets with collateral
- **Interest Rate Management**: Dynamic interest rates based on pool utilization
- **RESTful API**: Well-documented API endpoints for all DeFi lending functions

## API Endpoints

### Health & Info
- `GET /health` - Service health check

### Pools
- `GET /api/pools` - Get all lending pools
- `GET /api/pools/:poolId` - Get specific pool
- `POST /api/pools` - Create a new lending pool

### Lending
- `GET /api/lend` - Get all lending positions
- `GET /api/lend/:positionId` - Get specific lending position
- `POST /api/lend` - Create a new lending position
- `PUT /api/lend/:positionId` - Update lending position

### Borrowing
- `GET /api/borrow` - Get all borrowing positions
- `GET /api/borrow/:positionId` - Get specific borrowing position
- `POST /api/borrow` - Create a new borrowing position
- `PUT /api/borrow/:positionId` - Update borrowing position

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
PORT=3031
LOG_LEVEL=info
```

## Asset Types

The service supports various types of digital assets:

1. **ETH**: Ethereum
2. **BTC**: Bitcoin
3. **USDC**: USD Coin
4. **DAI**: Dai Stablecoin

## Position Status Types

The service supports the following position status types:

1. **Active**: Position is currently active
2. **Closed**: Position has been closed
3. **Liquidated**: Position has been liquidated due to insufficient collateral

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

PROPRIETARY