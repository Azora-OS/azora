# ⚡ AZORA OS - QUICK START GUIDE

**Get up and running in 5 minutes!**

---

## 🚀 Installation

```bash
# 1. Clone repository (if not already done)
git clone https://github.com/Sizwe780/azora-os.git
cd azora-os

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 4. Validate system
npx tsx scripts/validate-system.ts
```

---

## 🏃 Running the System

### Full System Launch
```bash
npm run supreme:full
```

### Individual Components
```bash
# Services only
npm run supreme:services

# Frontend only
npm run supreme:frontends

# Development mode
npm run dev:all
```

---

## 🏥 Health Checks

### Quick Health Check
```bash
node quick-health-check.js
```

### Detailed System Status
```bash
curl http://localhost:5000/status
```

### Individual Service Health
```bash
# API Gateway
curl http://localhost:4000/health

# Chronicle Protocol
curl http://localhost:4400/health

# Constitutional Court
curl http://localhost:4500/health
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Integration tests
npm test tests/integration/

# System validation
npx tsx scripts/validate-system.ts
```

---

## 📊 Key Endpoints

| Service | Port | Health Check |
|---------|------|--------------|
| API Gateway | 4000 | `/health` |
| Auth Service | 4001 | `/health` |
| Azora Mint | 4002 | `/health` |
| Chronicle Protocol | 4400 | `/health` |
| Constitutional Court | 4500 | `/health` |
| Master Orchestrator | 5000 | `/health` |

---

## 📚 Documentation

- **Master Context:** [MASTER-CONTEXT.md](./MASTER-CONTEXT.md)
- **Constitution:** [tools/codex/constitution/AZORA_CONSTITUTION.md](./tools/codex/constitution/AZORA_CONSTITUTION.md)
- **API Docs:** [docs/api/](./docs/api/)
- **Integration Guide:** [docs/api/SERVICE-INTEGRATION.md](./docs/api/SERVICE-INTEGRATION.md)

---

## 🛠️ Common Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Lint code
npm run lint

# Build all
npm run build:all

# Health check
node quick-health-check.js

# System validation
npx tsx scripts/validate-system.ts

# Integration tests
npm test tests/integration/
```

---

## 🐛 Troubleshooting

### Dependencies won't install
```bash
# Update npm
npm install -g npm@latest

# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Services won't start
```bash
# Check environment variables
cat .env

# Validate system
npx tsx scripts/validate-system.ts

# Check logs
tail -f logs/*.log
```

### Health checks failing
```bash
# Check service status
curl http://localhost:5000/status

# Run health aggregator
node quick-health-check.js

# Check individual services
curl http://localhost:4000/health
```

---

## 🎯 Next Steps

1. **Read the Constitution:** [AZORA_CONSTITUTION.md](./tools/codex/constitution/AZORA_CONSTITUTION.md)
2. **Explore Services:** Check [services/](./services/) directory
3. **Review Architecture:** [MASTER-CONTEXT.md](./MASTER-CONTEXT.md)
4. **Join Community:** Discord, GitHub Discussions

---

## 🌟 Ubuntu Philosophy

**"Ngiyakwazi ngoba sikwazi" - "I can because we are"**

Welcome to the Azora OS family! 🚀

---

**Need Help?**
- 📖 [Full Documentation](./docs/)
- 💬 [GitHub Discussions](https://github.com/Sizwe780/azora-os/discussions)
- 🐛 [Report Issues](https://github.com/Sizwe780/azora-os/issues)
