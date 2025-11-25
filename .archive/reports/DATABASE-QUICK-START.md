# 🚀 Database Quick Start Guide

**Get Azora OS databases running in 5 minutes!**

---

## Prerequisites

```bash
# 1. PostgreSQL 15+ installed and running
psql --version

# 2. Node.js 20+ installed
node --version

# 3. Git repository cloned
git clone https://github.com/Sizwe780/azora-os.git
cd azora-os
```

---

## Quick Setup (3 Commands)

```bash
# 1. Install dependencies
npm install

# 2. Setup all databases
npm run db:setup

# 3. Seed test data
npm run db:seed
```

**Done!** 🎉

---

## Verify Setup

```bash
# Open Prisma Studio to view data
npm run db:studio

# Access at: http://localhost:5555
```

---

## What Was Created?

### 9 Databases

| Database | Service | Purpose |
|----------|---------|---------|
| `azora_auth` | Auth Service | Users & Authentication |
| `azora_education` | Education | Courses & Learning |
| `azora_mint` | Mint | Wallets & Tokens |
| `azora_forge` | Forge | Jobs & Marketplace |
| `azora_sapiens` | Sapiens | AI Tutoring |
| `azora_nexus` | Nexus | Events & Integration |
| `azora_family` | AI Family | 11 AI Characters |
| `azora_notifications` | Notifications | User Alerts |
| `azora_health` | Health Monitor | System Logs |

### Test Data

- **3 Users:** Student, Educator, Employer
- **2 Courses:** Python & React
- **3 Wallets:** With balances and transactions
- **2 Jobs:** Web dev & data analysis
- **3 AI Family Members:** Elara, Themba, Sankofa
- **1 Tutoring Session:** Sample AI conversation

---

## Common Commands

```bash
# View all data
npm run db:studio

# Reset databases (DEV ONLY!)
npm run db:reset

# Backup databases
npm run db:backup

# Generate Prisma clients
npm run db:generate

# Run migrations
npm run db:migrate
```

---

## Test Credentials

```
Student:
  Email: student@azora.world
  Password: Azora2025!

Educator:
  Email: educator@azora.world
  Password: Azora2025!

Employer:
  Email: employer@azora.world
  Password: Azora2025!
```

---

## Troubleshooting

### PostgreSQL Not Running

```bash
# Windows
# Start PostgreSQL service from Services app

# Linux
sudo systemctl start postgresql

# Mac
brew services start postgresql
```

### Connection Error

```bash
# Check your .env file
cat .env | grep DATABASE_URL

# Should look like:
# DATABASE_URL="postgresql://user:password@localhost:5432/azora_auth"
```

### Schema Out of Sync

```bash
# Regenerate Prisma clients
npm run db:generate

# Push schema changes
cd services/[service-name]
npx prisma db push
```

---

## Next Steps

1. ✅ Databases setup complete
2. 🚀 Start services: `npm run dev`
3. 🌐 Access API: http://localhost:4000
4. 📊 View data: http://localhost:5555

---

## Full Documentation

- [Complete Database Guide](./docs/DATABASE-GUIDE.md)
- [Database Status Report](./docs/DATABASE-STATUS.md)
- [Schema Documentation](./docs/SCHEMAS.md)

---

**Ubuntu Principle:** *"My data strengthens our foundation"* 🌍
