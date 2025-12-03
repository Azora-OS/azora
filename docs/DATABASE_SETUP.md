# Database Setup Guide

**Status:** Docker Compose encountered issues  
**Next Step:** Manual database setup required

---

## Option 1: Docker Desktop (Recommended)

### Prerequisites
1. Ensure Docker Desktop is running
2. Open PowerShell as Administrator

### Setup Commands
```powershell
# Pull PostgreSQL image
docker pull postgres:15-alpine

# Create and start PostgreSQL container
docker run --name azora-postgres `
  -e POSTGRES_USER=azora `
  -e POSTGRES_PASSWORD=azora_dev_2025 `
  -e POSTGRES_DB=azora `
  -p 5432:5432 `
  -d postgres:15-alpine

# Create and start Redis container
docker run --name azora-redis `
  -p 6379:6379 `
  -d redis:7-alpine

# Verify containers are running
docker ps
```

### Create .env File
```powershell
# Navigate to project root
cd "C:\Users\Azora Sapiens\Documents\azora"

# Create .env file
@"
DATABASE_URL="postgresql://azora:azora_dev_2025@localhost:5432/azora?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="azora_dev_secret_change_in_production"
NODE_ENV="development"
"@ | Out-File -FilePath ".env" -Encoding UTF8
```

### Run Prisma Setup
```powershell
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Open Prisma Studio to verify
npx prisma studio
```

---

## Option 2: Local PostgreSQL Installation

### Download and Install
1. Download PostgreSQL 15 from: https://www.postgresql.org/download/windows/
2. During installation:
   - Set password: `azora_dev_2025`
   - Port: `5432`
   - Database: `azora`

### Create Database
```sql
-- Open pgAdmin or psql
CREATE DATABASE azora;
CREATE USER azora WITH PASSWORD 'azora_dev_2025';
GRANT ALL PRIVILEGES ON DATABASE azora TO azora;
```

### Create .env File
Same as Docker option above.

### Run Prisma Setup
Same as Docker option above.

---

## Option 3: Cloud Database (Supabase - Free Tier)

### Setup
1. Go to https://supabase.com
2. Create new project
3. Copy connection string

### Create .env File
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
```

### Run Prisma Setup
```powershell
npx prisma generate
npx prisma migrate dev --name init
```

---

## Verification Steps

After setup, verify everything works:

```powershell
# 1. Check Prisma Client generated
ls node_modules\.prisma\client

# 2. Test database connection
npx prisma db push

# 3. Open Prisma Studio
npx prisma studio
# Should open http://localhost:5555

# 4. Check tables exist
# In Prisma Studio, you should see:
# - User
# - Course
# - Enrollment
# - CitadelFund
# - CitadelTransaction
# - Scholarship
# - Grant
# - ProofOfValue
# ... and many more
```

---

## Troubleshooting

### "Docker is not running"
- Open Docker Desktop
- Wait for it to fully start (whale icon in system tray)
- Try commands again

### "Port 5432 already in use"
```powershell
# Find what's using the port
netstat -ano | findstr :5432

# Stop existing PostgreSQL service
Stop-Service postgresql-x64-15
```

### "Prisma generate fails"
```powershell
# Clear Prisma cache
rm -r node_modules\.prisma
rm -r node_modules\@prisma

# Reinstall
npm install @prisma/client prisma --save-dev

# Try again
npx prisma generate
```

### "Migration fails"
```powershell
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or create migration manually
npx prisma migrate dev --name init --create-only
# Edit the migration file if needed
npx prisma migrate dev
```

---

## What's Next?

Once database is set up successfully:

1. ✅ Prisma Client generated
2. ✅ Database tables created
3. ✅ Can open Prisma Studio

**Then proceed to:**
- Update CitadelFund service to use database
- Update ProofOfValue service
- Add authentication middleware
- Test with real data

---

## Quick Health Check

Run this to verify everything:

```powershell
# Check Docker containers
docker ps

# Check database connection
npx prisma db pull

# View database
npx prisma studio
```

If all three work, you're ready to proceed! 🎉
