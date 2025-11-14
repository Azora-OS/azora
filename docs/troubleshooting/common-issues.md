# 🔧 Common Issues & Solutions

**Ubuntu Principle:** *"My solution strengthens our foundation"*

---

## 🚨 Quick Troubleshooting

### Issue: Services Won't Start

**Symptoms:**
```
Error: Cannot find module 'express'
Error: Port 4000 already in use
```

**Solutions:**

1. **Install dependencies:**
```bash
npm install
cd services/api-gateway && npm install
```

2. **Kill process on port:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

3. **Use different port:**
```bash
PORT=5000 npm start
```

---

### Issue: Database Connection Failed

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: password authentication failed
```

**Solutions:**

1. **Check PostgreSQL is running:**
```bash
# Windows
sc query postgresql-x64-15

# Linux
sudo systemctl status postgresql

# Mac
brew services list
```

2. **Verify connection string:**
```bash
# Check .env file
cat .env | grep DATABASE_URL

# Should be:
DATABASE_URL="postgresql://user:password@localhost:5432/azora_auth"
```

3. **Reset database:**
```bash
npm run db:setup
npm run db:seed
```

---

### Issue: Authentication Fails

**Symptoms:**
```
401 Unauthorized
Error: Invalid token
Error: Token expired
```

**Solutions:**

1. **Check token format:**
```bash
# Token should be in header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. **Login again:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@azora.world","password":"Azora2025!"}'
```

3. **Check JWT_SECRET:**
```bash
# Verify .env has JWT_SECRET
echo $JWT_SECRET
```

---

### Issue: Prisma Client Not Generated

**Symptoms:**
```
Error: Cannot find module '@prisma/client'
Error: PrismaClient is not a constructor
```

**Solutions:**

1. **Generate Prisma Client:**
```bash
cd services/azora-education
npx prisma generate
```

2. **Regenerate all clients:**
```bash
npm run db:generate
```

3. **Check schema file exists:**
```bash
ls services/azora-education/prisma/schema.prisma
```

---

### Issue: API Returns 404

**Symptoms:**
```
404 Not Found
Error: Cannot GET /api/courses
```

**Solutions:**

1. **Check service is running:**
```bash
curl http://localhost:4000/api/health
```

2. **Verify route exists:**
```bash
# Check service logs
npm run dev
```

3. **Check API Gateway routing:**
```bash
# Verify gateway config
cat services/api-gateway/src/routes.ts
```

---

### Issue: CORS Errors

**Symptoms:**
```
Access to fetch blocked by CORS policy
No 'Access-Control-Allow-Origin' header
```

**Solutions:**

1. **Enable CORS in API Gateway:**
```typescript
// services/api-gateway/src/index.ts
import cors from 'cors';
app.use(cors());
```

2. **Configure allowed origins:**
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'https://azora.world'],
  credentials: true
}));
```

---

### Issue: Seed Data Fails

**Symptoms:**
```
Error: Unique constraint failed
Error: Foreign key constraint failed
```

**Solutions:**

1. **Reset database:**
```bash
cd services/azora-education
npx prisma migrate reset
```

2. **Run seed again:**
```bash
npm run db:seed
```

3. **Check for existing data:**
```bash
npm run db:studio
# Delete conflicting records
```

---

### Issue: Docker Build Fails

**Symptoms:**
```
Error: Cannot find Dockerfile
Error: Build context too large
```

**Solutions:**

1. **Check Dockerfile exists:**
```bash
ls Dockerfile
ls docker-compose.yml
```

2. **Add .dockerignore:**
```
node_modules
.git
.env
*.log
```

3. **Build with no cache:**
```bash
docker-compose build --no-cache
```

---

### Issue: Environment Variables Not Loading

**Symptoms:**
```
Error: DATABASE_URL is not defined
Error: JWT_SECRET is required
```

**Solutions:**

1. **Copy .env.example:**
```bash
cp .env.example .env
```

2. **Load environment:**
```bash
# Add to package.json
"dev": "dotenv -e .env node src/index.js"
```

3. **Check .env file:**
```bash
cat .env
# Verify all required variables exist
```

---

### Issue: High Memory Usage

**Symptoms:**
```
JavaScript heap out of memory
Process killed
```

**Solutions:**

1. **Increase Node memory:**
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm start
```

2. **Check for memory leaks:**
```bash
node --inspect src/index.js
# Use Chrome DevTools
```

3. **Optimize queries:**
```typescript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: { id: true, email: true }
});
```

---

### Issue: Tests Failing

**Symptoms:**
```
Test suite failed to run
Timeout exceeded
```

**Solutions:**

1. **Run tests with verbose:**
```bash
npm test -- --verbose
```

2. **Increase timeout:**
```typescript
// In test file
jest.setTimeout(30000);
```

3. **Check test database:**
```bash
export DATABASE_URL="postgresql://localhost:5432/azora_test"
npm test
```

---

## 🆘 Getting Help

### 1. Check Logs

```bash
# Service logs
npm run dev

# Docker logs
docker-compose logs -f

# System logs
tail -f /var/log/azora/*.log
```

### 2. Enable Debug Mode

```bash
export DEBUG=azora:*
npm run dev
```

### 3. Run Health Checks

```bash
curl http://localhost:4000/api/health
npm run db:studio
```

### 4. Community Support

- **Discord:** https://discord.gg/azora
- **GitHub Issues:** https://github.com/Sizwe780/azora-os/issues
- **Documentation:** https://azora.world/docs

---

## 📚 Additional Resources

- [Database Guide](../DATABASE-GUIDE.md)
- [API Documentation](../api/openapi.yaml)
- [Deployment Guide](./deployment-guide.md)
- [Security Guide](../SECURITY.md)

---

**Ubuntu:** *"Ngiyakwazi ngoba sikwazi" - "I can because we can"* 🌍
