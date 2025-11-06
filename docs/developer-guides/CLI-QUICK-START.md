# Azora CLI - Quick Start Guide

The Azora CLI is your command center for managing the entire Azora OS ecosystem.

## Installation

```bash
npm install -g @azora/cli
# or
npx @azora/cli <command>
```

## Common Commands

### Development
```bash
azora dev                    # Start development server
azora service create <name>  # Create new service
azora test <service>         # Run tests
```

### Database
```bash
azora db:migrate    # Run migrations
azora db:seed       # Seed database
azora db:studio     # Open Prisma Studio
```

### Deployment
```bash
azora deploy <app>  # Deploy to production
azora health        # Check service health
azora logs <service> # View logs
```

For full documentation, see [CLI.md](./CLI.md)
