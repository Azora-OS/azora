# Azora OS Launchers

This directory contains all launcher and orchestrator scripts for the Azora OS ecosystem.

## 🚀 Available Launchers

### Main Orchestrators
- **azora-os-orchestrator.ts** - Main OS orchestrator
- **azora-supreme-organism.ts** - Supreme organism launcher
- **elara-azora-integration.ts** - Elara-Azora integration launcher

### Service Launchers
- **launch-all-services.ts** - Launch all microservices
- **launch-azora-complete.ts** - Complete system launch
- **launch-services.cjs** - Service launcher (CommonJS)
- **simple-launcher.js** - Simple launcher utility
- **world-class-launch.js** - World-class system launcher

### Management Tools
- **elara-launcher-cli.ts** - Elara CLI launcher
- **elara-organism-manager.ts** - Organism management tool
- **organism-git-monitor.js** - Git monitoring for organisms
- **system-monitor.cjs** - System monitoring tool

### Data Ingestion
- **start-azora-systems.ts** - Start Azora systems
- **start-github-ingestion.ts** - GitHub data ingestion
- **start-ingestion.ts** - General data ingestion

### Advanced
- **ethical-consciousness.ts** - Ethical consciousness module
- **graphql-server.ts** - GraphQL server launcher
- **transcend-system.js** - System transcendence module

## 📖 Usage

Most launchers can be run with:
```bash
npx tsx tools/launchers/<launcher-name>.ts
```

For CommonJS launchers:
```bash
node tools/launchers/<launcher-name>.cjs
```

For JavaScript launchers:
```bash
node tools/launchers/<launcher-name>.js
```

## 🔧 Configuration

Launchers use configuration from:
- `/config` directory
- Environment variables from `.env`
- Service-specific configs in `/services`

## 📚 Documentation

For detailed documentation on each launcher, see:
- [Main Documentation](../../docs/README.md)
- [Architecture Guide](../../docs/AZORA-ARCHITECTURE.md)
- [Deployment Guide](../../docs/DEPLOYMENT.md)
