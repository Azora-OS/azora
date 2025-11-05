# LLM Wrapper Service

Large Language Model wrapper service built with Go.

## Overview

The LLM Wrapper Service provides a unified interface for interacting with various large language models, handling API calls, response processing, and model management.

## Technology Stack

- **Language**: Go
- **Build System**: Nx
- **Containerization**: Docker

## Building

```bash
# Using Nx
nx build llm-wrapper-service

# Or directly with Go
cd services/llm-wrapper-service
go build -o main .
```

## Running

```bash
./main
```

## Testing

```bash
# Using Nx
nx test llm-wrapper-service

# Or directly with Go
go test -v ./...
```

## Docker

```bash
docker build -t llm-wrapper-service .
docker run -p 8080:8080 llm-wrapper-service
```

## Health Check

The service includes a healthcheck endpoint at `/health`.

## Features

- Multiple LLM provider support
- Request routing and management
- Response caching
- Rate limiting
- Error handling

## Integration

Used by:
- Elara AI services
- Azora Sapiens (education AI)
- Various AI-powered features

## License

AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

