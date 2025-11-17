# AZR Token Service

A deflationary token service with forced demand + burn mechanism for economic sovereignty.

## Features

- **Deflationary Token Model**: Implements a 5% burn on every token sale
- **Token Management**: Balance tracking, transfers, and user management
- **Forced Demand Mechanism**: Automatic buy orders to maintain token value
- **Burn Tracking**: Transparent record of all token burns
- **RESTful API**: Well-documented API endpoints for all token functions
- **Security**: JWT-based authentication and authorization

## API Endpoints

### Health & Info
- `GET /health` - Service health check

### Users
- `POST /users/register` - Register a new user
- `POST /users/login` - Login existing user

### Token Functions
- `GET /balance/:userId` - Get token balance for a user
- `POST /transfer` - Transfer tokens between users
- `POST /sell` - Sell tokens with burn mechanism
- `POST /buy` - Execute a forced buy order
- `GET /burns` - Get burn transaction history (admin only)

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3011
JWT_SECRET=your-super-secret-jwt-key
LOG_LEVEL=info
```

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

## Deflationary Mechanism

The AZR token implements a deflationary model with a 5% burn on every sale:

1. When tokens are sold, 5% are automatically burned
2. This reduces the total supply, making remaining tokens more scarce
3. Forced buy orders help maintain token value
4. All burns are transparently tracked

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
