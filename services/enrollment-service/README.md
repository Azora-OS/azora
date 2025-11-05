# Enrollment Service

Student enrollment management service built with Go.

## Overview

The Enrollment Service handles student enrollment processes, course registration, and enrollment status management for the Azora OS education platform.

## Technology Stack

- **Language**: Go
- **Build System**: Nx
- **Containerization**: Docker

## Building

```bash
# Using Nx
nx build enrollment-service

# Or directly with Go
cd services/enrollment-service
go build -o main .
```

## Running

```bash
./main
```

## Docker

```bash
docker build -t enrollment-service .
docker run -p 8080:8080 enrollment-service
```

## Features

- Student enrollment processing
- Course registration
- Enrollment status tracking
- Integration with course and user services

## Integration

Works with:
- **Course Service**: For course availability
- **User Service**: For user management
- **Azora Sapiens**: For education platform integration

## License

AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

