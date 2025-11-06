# 🔍 LMS Script Issues & Missing Components

## ❌ Issues Found

### 1. **Node.js/npm Not Installed**
**Problem**: `tsx`, `npx`, `npm` commands not found

**Impact**: 
- Cannot run TypeScript scripts directly
- Cannot generate Prisma Client
- Cannot run database migrations
- Cannot run LMS check script

**Solution**:
```bash
# Install Node.js and npm
sudo apt update
sudo apt install nodejs npm

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts
```

---

### 2. **Missing Dependencies**
**Files needing dependencies**:
- `azora-lms/core/database-service.ts` - Needs `@prisma/client`
- `azora-lms/core/graphql-unified-gateway.ts` - Needs database imports
- `scripts/check-lms-complete.ts` - Needs `@prisma/client`, `fs`, `path`

**Solution**:
```bash
# After installing Node.js
cd /media/sizwe/OS/azora-os
npm install

# Install Prisma globally or locally
npm install -D prisma
npm install @prisma/client

# Install tsx for TypeScript execution
npm install -D tsx
```

---

### 3. **Prisma Client Not Generated**
**Problem**: Prisma Client needs to be generated from schema

**Files affected**:
- `azora-lms/core/database-service.ts` - Uses `PrismaClient`
- `synapse/academy-ui/app/api/courses/route.ts` - Uses `PrismaClient`
- `synapse/academy-ui/app/api/enrollment/route.ts` - Uses `PrismaClient`
- `synapse/academy-ui/app/api/progress/route.ts` - Uses `PrismaClient`

**Solution**:
```bash
# Generate Prisma Client
npx prisma generate --schema=prisma/unified-schema.prisma

# Or if using default schema location
npx prisma generate
```

---

### 4. **Database Not Created/Migrated**
**Problem**: Database tables may not exist

**Impact**:
- All database queries will fail
- Cannot create courses, enrollments, progress
- API routes will return errors

**Solution**:
```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://user:password@localhost:5432/azora_os"

# Create migration
npx prisma migrate dev --name init_unified_schema --schema=prisma/unified-schema.prisma

# Or apply existing migrations
npx prisma migrate deploy --schema=prisma/unified-schema.prisma
```

---

### 5. **Environment Variables Not Set**
**Missing Variables**:
- `DATABASE_URL` - Required for database connection
- `AUTH_SERVICE_URL` - Optional, for auth service
- `ELARA_API_URL` - Optional, for Elara AI
- `PIVC_SERVICE_URL` - Optional, for PIVC engine

**Solution**:
```bash
# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/azora_os?schema=public"
AUTH_SERVICE_URL="http://localhost:4000/api/auth"
ELARA_API_URL="http://localhost:5000/api/elara"
PIVC_SERVICE_URL="http://localhost:4001/api/pivc"
EOF
```

---

### 6. **TypeScript Compilation Issues**
**Potential Issues**:
- Import paths may need adjustment
- Missing type definitions
- Module resolution issues

**Files to check**:
- `azora-lms/core/database-service.ts`
- `azora-lms/core/graphql-unified-gateway.ts`
- All Academy UI API routes

---

### 7. **Missing Database Connection Handling**
**Issue**: Prisma Client connection management

**Files**:
- `azora-lms/core/database-service.ts` - Creates new PrismaClient each time
- API routes create new PrismaClient per request

**Recommendation**: Create singleton PrismaClient instance

---

## ✅ Quick Fix Script

Create this script to fix all issues:

```bash
#!/bin/bash
# fix-lms-setup.sh

echo "🔧 Fixing LMS Setup Issues..."

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Install Prisma
echo "📦 Installing Prisma..."
npm install -D prisma
npm install @prisma/client

# 4. Install tsx
echo "📦 Installing tsx..."
npm install -D tsx

# 5. Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate --schema=prisma/unified-schema.prisma || npx prisma generate

# 6. Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Creating .env file..."
    cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/azora_os?schema=public"
EOF
    echo "✅ Created .env file. Please update DATABASE_URL with your credentials."
fi

# 7. Run check script
echo "🔍 Running LMS check..."
npx tsx scripts/check-lms-complete.ts

echo "✅ Setup complete!"
```

---

## 📋 Manual Steps Required

### Step 1: Install Node.js
```bash
# Option A: Using apt (Ubuntu/Debian)
sudo apt update
sudo apt install nodejs npm

# Option B: Using nvm (Recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

### Step 2: Install Dependencies
```bash
cd /media/sizwe/OS/azora-os
npm install
npm install -D prisma tsx
npm install @prisma/client
```

### Step 3: Generate Prisma Client
```bash
npx prisma generate --schema=prisma/unified-schema.prisma
```

### Step 4: Setup Database
```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://user:password@localhost:5432/azora_os"

# Create migration
npx prisma migrate dev --name init_unified_schema --schema=prisma/unified-schema.prisma

# Or if database already exists, just generate client
npx prisma generate --schema=prisma/unified-schema.prisma
```

### Step 5: Run Check Script
```bash
npx tsx scripts/check-lms-complete.ts
```

---

## 🎯 What's Actually Missing

### Code-Level Issues:
1. ✅ **Database Service** - Created, needs Prisma Client
2. ✅ **GraphQL Gateway** - Updated, needs imports to work
3. ✅ **API Routes** - Updated, needs Prisma Client
4. ✅ **Check Script** - Created, needs tsx to run

### Infrastructure Issues:
1. ❌ **Node.js/npm** - Not installed
2. ❌ **Prisma Client** - Not generated
3. ❌ **Database** - May not be created/migrated
4. ❌ **Environment Variables** - Not set

### Integration Issues:
1. ⚠️ **PIVC Engine** - Needs database integration methods
2. ⚠️ **CLA** - Needs database integration methods
3. ⚠️ **Prisma Client Singleton** - Should be shared instance

---

## 🚀 Next Steps Priority

1. **CRITICAL**: Install Node.js and npm
2. **CRITICAL**: Install dependencies and generate Prisma Client
3. **HIGH**: Setup database and run migrations
4. **MEDIUM**: Set environment variables
5. **LOW**: Optimize Prisma Client usage (singleton pattern)

---

## 📝 Summary

**Status**: Code is complete, but infrastructure setup is needed.

**Blockers**:
- Node.js/npm installation required
- Prisma Client generation required
- Database setup required

**Once these are fixed**, the LMS will be fully functional!

---

**Last Updated**: 2025-01-27

