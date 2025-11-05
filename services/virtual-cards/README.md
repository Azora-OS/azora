# Virtual Cards Service

Virtual card management and processing service.

## Overview

The Virtual Cards Service provides virtual card creation, management, and transaction processing capabilities for Azora OS users.

## Features

- Virtual card creation
- Card management (activation, deactivation)
- Transaction processing
- Card security and validation

## Structure

```
virtual-cards/
├── index.ts        # Service entry point
└── server.ts        # Server implementation
```

## Development

```bash
# Install dependencies from root
npm install

# Run service
tsx server.ts
```

## API Endpoints

The service provides endpoints for:
- Card creation
- Card management
- Transaction processing
- Card validation

## Integration

Integrates with:
- **Azora Mint**: For payment processing
- **Banking Services**: For card operations
- **User Service**: For user validation

## Configuration

Set environment variables:
- `PORT` - Service port
- Database connection settings
- Payment gateway credentials

## License

AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

