# Session Service

User session management service built with Go.

## Overview

The Session Service handles user session creation, management, validation, and termination for the Azora OS platform.

## Technology Stack

- **Language**: Go
- **Build System**: Nx
- **Containerization**: Docker

## Building

```bash
# Using Nx
nx build session-service

# Or directly with Go
cd services/session-service
go build -o main .
```

## Running

```bash
./main
```

## Docker

```bash
docker build -t session-service .
docker run -p 8080:8080 session-service
```

## Features

- Session creation and validation
- Token management
- Session expiration handling
- Security and authentication integration

## Integration

Works with:
- **Auth Service**: For authentication
- **User Service**: For user management
- **All Services**: For session validation

## License

AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

