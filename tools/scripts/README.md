# Azora OS Scripts

This directory contains deployment, cleanup, and utility scripts for the Azora OS ecosystem.

## 📦 Deployment Scripts

- **DEPLOY-ALL-SERVICES.sh** - Deploy all microservices
- **DEPLOY-NOW.sh** - Quick deployment script
- **deploy-universal.sh** - Universal deployment script
- **upgrade-all-services.sh** - Upgrade all services

## 🧹 Cleanup Scripts

- **CLEANUP-ASSETS.sh** - Clean up assets
- **cleanup-repo.sh** - Repository cleanup
- **COMPLETE_PRODUCTION_COMMIT.sh** - Production commit preparation

## 🔄 Integration Scripts

- **push-to-github.sh** - Push changes to GitHub
- **implement-research-findings.ts** - Implement research findings

## 📊 Data Ingestion Scripts

- **ingest-next-100.js** - Ingest next 100 repositories
- **ingest-top-10.ts** - Ingest top 10 repositories

## 📖 Usage

### Deployment
```bash
# Deploy all services
bash tools/scripts/DEPLOY-ALL-SERVICES.sh

# Quick deployment
bash tools/scripts/DEPLOY-NOW.sh

# Universal deployment
bash tools/scripts/deploy-universal.sh
```

### Cleanup
```bash
# Clean repository
bash tools/scripts/cleanup-repo.sh

# Clean assets
bash tools/scripts/CLEANUP-ASSETS.sh
```

### Data Ingestion
```bash
# Ingest repositories
node tools/scripts/ingest-next-100.js
npx tsx tools/scripts/ingest-top-10.ts
```

## ⚠️ Important Notes

- Always backup your work before running cleanup scripts
- Deployment scripts require proper environment configuration
- Review script contents before execution in production

## 🔧 Configuration

Scripts use:
- Environment variables from `.env`
- Configuration from `/config`
- Service-specific settings

## 📚 Documentation

For more information:
- [Deployment Guide](../../docs/DEPLOYMENT.md)
- [Contributing Guide](../../CONTRIBUTING.md)
- [Repository Structure](../../REPOSITORY-STRUCTURE.md)
