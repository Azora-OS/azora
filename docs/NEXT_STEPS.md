# Next Steps - Immediate Actions Required

**Priority:** CRITICAL  
**Blocker:** Database Configuration

---

## 🚨 Immediate Action: Fix Prisma Generation

### Option 1: Local PostgreSQL (Recommended for Development)
```bash
# Install PostgreSQL locally or use Docker
docker run --name azora-postgres -e POSTGRES_PASSWORD=azora123 -e POSTGRES_DB=azora -p 5432:5432 -d postgres:15

# Create .env file with DATABASE_URL
echo "DATABASE_URL=\"postgresql://postgres:azora123@localhost:5432/azora?schema=public\"" > .env

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

### Option 2: Use Existing Database
```bash
# Check .env.example for the expected DATABASE_URL format
cat .env.example | grep DATABASE_URL

# Copy and modify
cp .env.example .env
# Edit .env with your actual database credentials

# Generate client
npx prisma generate
```

### Option 3: Skip Database for Now (Mock Mode)
If you want to continue development without a database:
1. Keep the schema changes
2. Services can continue using in-memory state temporarily
3. Add database persistence later when infrastructure is ready

---

## 📋 Recommended Execution Order

### Phase 1A: Database Setup (1-2 hours)
1. Set up local PostgreSQL (Docker recommended)
2. Configure DATABASE_URL in .env
3. Run `npx prisma generate`
4. Run `npx prisma migrate dev --name add_citadel_and_pov`
5. Verify tables created: `npx prisma studio`

### Phase 1B: CitadelFund Migration (2-3 hours)
1. Update `services/citadel-fund/package.json` dependencies
2. Create `services/citadel-fund/src/db.ts` with Prisma client
3. Replace in-memory state with database queries
4. Test endpoints with real persistence
5. Add integration tests

### Phase 1C: API Gateway Security (1-2 hours)
1. Create `packages/auth-middleware/`
2. Implement JWT verification
3. Update `azora-api-gateway/server.js`
4. Test protected endpoints

### Phase 1D: ProofOfValue Service (3-4 hours)
1. Create service structure
2. Implement value scoring
3. Connect to database
4. Integrate with azora-mint
5. Add tests

---

## 🎯 Quick Win: Database Setup Script

Create `scripts/setup-dev-db.sh`:
```bash
#!/bin/bash
# Quick database setup for development

# Start PostgreSQL in Docker
docker run --name azora-postgres \
  -e POSTGRES_PASSWORD=azora123 \
  -e POSTGRES_DB=azora \
  -p 5432:5432 \
  -d postgres:15

# Wait for PostgreSQL to be ready
sleep 5

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  echo "DATABASE_URL=\"postgresql://postgres:azora123@localhost:5432/azora?schema=public\"" > .env
fi

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

echo "✅ Database setup complete!"
echo "🚀 Run 'npx prisma studio' to view your database"
```

---

## 💡 Alternative Approach: Incremental Migration

If full database setup is too much overhead right now:

1. **Keep Mock Services Running** - Don't break what works
2. **Create Parallel Database Services** - New endpoints that use Prisma
3. **Gradual Migration** - Switch endpoints one at a time
4. **Feature Flags** - Toggle between mock and real database

Example:
```typescript
// services/citadel-fund/src/config.ts
export const USE_DATABASE = process.env.USE_DATABASE === 'true';

// services/citadel-fund/server.js
if (USE_DATABASE) {
  // Use Prisma
  const balance = await prisma.citadelFund.findFirst();
} else {
  // Use in-memory mock
  const balance = citadelState.currentBalance;
}
```

---

## 📞 Decision Point

**Which approach do you prefer?**

A. **Full Database Setup** - Set up PostgreSQL now, migrate everything properly  
B. **Incremental Migration** - Keep mocks, add database gradually with feature flags  
C. **Continue Without DB** - Focus on other tasks, defer database persistence  

Let me know and I'll proceed accordingly!
