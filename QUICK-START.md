# ⚡ AZORA OS - QUICK START
**Get Running in 5 Minutes**

## 🚀 ONE-COMMAND DEPLOYMENT

```bash
cd Azora-OS && chmod +x deploy.sh && ./deploy.sh
```

That's it. System is live.

## 🎯 What Just Happened

1. ✅ Databases started (PostgreSQL + Redis)
2. ✅ API Gateway running on port 4000
3. ✅ Auth Service on port 3001
4. ✅ Mint Service on port 3002
5. ✅ LMS Service on port 3003
6. ✅ Forge Service on port 3004

## 🌐 Access Points

- **API Gateway**: http://localhost:4000
- **Health Check**: http://localhost:4000/health
- **Auth**: http://localhost:3001
- **Mint**: http://localhost:3002
- **LMS**: http://localhost:3003
- **Forge**: http://localhost:3004

## 🔐 Test Authentication

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@azora.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@azora.com","password":"test123"}'
```

## 💰 Test Payments

```bash
# Create wallet
curl -X POST http://localhost:4000/api/mint/wallet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"userId":"user-id"}'
```

## 📚 Test LMS

```bash
# Get courses
curl http://localhost:4000/api/lms/courses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔨 Test Forge

```bash
# Get jobs
curl http://localhost:4000/api/forge/jobs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🛑 Stop Services

```bash
docker-compose down
```

## 🔄 Restart Services

```bash
docker-compose restart
```

## 📊 View Logs

```bash
docker-compose logs -f
```

## ✅ Africans Eating NOW
