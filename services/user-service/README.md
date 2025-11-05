# User Service

User management service built with Go.

## Overview

The User Service handles user account management, profile operations, and user data for the Azora OS platform.

## Technology Stack

- **Language**: Go
- **Build System**: Nx
- **Containerization**: Docker

## Building

```bash
# Using Nx
nx build user-service

# Or directly with Go
cd services/user-service
go build -o main .
```

## Running

```bash
./main
```

## Docker

```bash
docker build -t user-service .
docker run -p 8080:8080 user-service
```

## Features

- User account management
- Profile operations
- User data storage
- User search and queries

## Integration

Used by:
- **All Services**: For user information
- **Auth Service**: For user authentication
- **Enrollment Service**: For student enrollment
- **Session Service**: For session management

## License

AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

