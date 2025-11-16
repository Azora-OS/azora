# 2-Hour Launch Sprint - Tasks

## HOUR 1: INFRASTRUCTURE (60 min)

### Task 1.1: Database Migrations (15 min)
```bash
cd services/auth-service && npx prisma migrate deploy && cd ../..
cd services/azora-education && npx prisma migrate deploy && cd ../..
cd services/azora-mint && npx prisma migrate deploy && cd ../..
cd services/azora-forge && npx prisma migrate deploy && cd ../..
cd services/marketplace && npx prisma migrate deploy && cd ../..
cd services/subscription && npx prisma migrate deploy && cd ../..
cd services/tokens && npx prisma migrate deploy && cd ../..
cd services/enterprise && npx prisma migrate deploy && cd ../..
cd services/payment && npx prisma migrate deploy && cd ../..
npm run db:seed
```
**Acceptance:** All migrations complete, no errors

### Task 1.2: Environment Configuration (10 min)
```bash
cp .env.example .env.production
# Edit: DATABASE_URL, STRIPE_SECRET_KEY, OPENAI_API_KEY, JWT_SECRET
```
**Acceptance:** .env.production exists with real keys

### Task 1.3: Security Audit (15 min)
```bash
npm audit
npm audit fix
npm run security:check
```
**Acceptance:** No critical vulnerabilities

### Task 1.4: Run Tests (20 min)
```bash
npm test
npm run test:coverage
```
**Acceptance:** All 263 tests pass, >80% coverage

---

## HOUR 2: DEPLOYMENT (60 min)

### Task 2.1: Production Build (10 min)
```bash
npm run build
```
**Acceptance:** Build succeeds, dist/ folders created

### Task 2.2: Deploy Services (20 min)
```bash
docker-compose -f docker-compose.prod.yml up -d
sleep 30
bash scripts/health-check.sh
```
**Acceptance:** All services healthy

### Task 2.3: Start Monitoring (15 min)
```bash
docker-compose -f docker-compose.observability.yml up -d
# Open http://localhost:3000 (Grafana)
```
**Acceptance:** Grafana showing metrics

### Task 2.4: Smoke Tests (15 min)
```bash
# Test auth
curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@azora.world","password":"Test123!","name":"Test"}'

# Test courses
curl http://localhost:4000/api/courses

# Test payment
curl -X POST http://localhost:4000/api/payments/create -H "Authorization: Bearer TOKEN" -d '{"amount":999}'
```
**Acceptance:** All endpoints respond 200

---

## COMPLETION CHECKLIST
- [ ] All migrations run
- [ ] All tests pass
- [ ] All services healthy
- [ ] Monitoring active
- [ ] Smoke tests pass

**Status:** Ready to execute
