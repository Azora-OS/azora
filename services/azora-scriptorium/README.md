# Azora Scriptorium

Document and content management service for Azora OS.

## Overview

Azora Scriptorium manages content, documents, partnerships, and promotional materials for the Azora OS platform. It handles global adoption tracking, user growth metrics, and marketing campaign management.

## Features

- **Content Management**: Document and content storage
- **Partnership Management**: Partnership tracking and management
- **Global Adoption**: Track adoption metrics and growth
- **User Growth**: Monitor user acquisition and growth patterns
- **Promotions**: Promotional campaign management
- **Database Migrations**: SQL-based schema migrations

## Installation

```bash
npm install
```

## Development

```bash
node index.js
```

## Database Setup

Run migrations:
```bash
# Initial schema
cat migrations/001_initial_schema.sql | sqlite3 scriptorium.db
```

Seed database:
```bash
node scripts/seed-database.js
# or
node seed.js
```

## Services

### Promotions Service
Located in `services/promotions/`:
- Email templates and launch materials
- Promotion campaign management

## Launch Scripts

- `LAUNCH_READY.sh` - Launch preparation script
- `services/promotions/START_AZORA_OS.sh` - Service startup script

## API

The service provides endpoints for:
- Content management
- Partnership operations
- Global adoption metrics
- User growth analytics
- Promotional campaigns

## License

AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

