# AI Agent Service

AI agent orchestration and management service built with Go.

## Overview

The AI Agent Service provides infrastructure for managing and orchestrating AI agents within the Azora OS ecosystem. It handles agent lifecycle, communication, and coordination.

## Technology Stack

- **Language**: Go
- **Build System**: Nx
- **Containerization**: Docker

## Building

```bash
# Using Nx
nx build ai-agent-service

# Or directly with Go
cd services/ai-agent-service
go build -o main .
```

## Running

```bash
./main
```

## Testing

```bash
# Using Nx
nx test ai-agent-service

# Or directly with Go
go test -v ./...
```

## Linting

```bash
# Using Nx
nx lint ai-agent-service

# Or with golangci-lint
golangci-lint run
```

## Docker

```bash
docker build -t ai-agent-service .
docker run -p 8080:8080 ai-agent-service
```

## Health Check

The service includes a healthcheck endpoint at `/health`.

## License

AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

