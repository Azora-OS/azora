# Course Service

Course management service built with Go.

## Overview

The Course Service handles course creation, management, and delivery within the Azora OS education platform. It manages course content, structure, and student progress.

## Technology Stack

- **Language**: Go
- **Build System**: Nx
- **Containerization**: Docker

## Building

```bash
# Using Nx
nx build course-service

# Or directly with Go
cd services/course-service
go build -o main .
```

## Running

```bash
./main
```

## Docker

```bash
docker build -t course-service .
docker run -p 8080:8080 course-service
```

## Features

- Course creation and management
- Content delivery
- Progress tracking
- Integration with enrollment service

## License

AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

