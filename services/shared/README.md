# Shared Services

This directory contains shared service utilities and common code used across multiple services.

## Purpose

Services in this directory provide:
- Common utilities
- Shared business logic
- Reusable service implementations
- Cross-service integrations

## Usage

Import shared services in your service code:

```typescript
import { sharedUtility } from '../shared/utility';
```

## Structure

```
shared/
├── README.md
└── [shared service files]
```

