# 🚀 GET STARTED WITH AZORA OS

## Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Docker** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/azora-os/azora-os.git
cd azora-os/Azora-OS
```

---

## 2️⃣ One-Command Deploy

```bash
chmod +x deploy-now.sh && ./deploy-now.sh
```

**That's it!** System will be live in 5 minutes.

---

## 3️⃣ Access Your System

### Services
- **API Gateway**: http://localhost:4000
- **Auth Service**: http://localhost:3001
- **Health Monitor**: http://localhost:9090

### Databases
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## 4️⃣ Test Authentication

### Register User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@azora.com",
    "password": "test123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@azora.com",
    "password": "test123"
  }'
```

**Save the token** from the response!

---

## 5️⃣ Check System Health

```bash
curl http://localhost:9090/health
```

You should see all services as "healthy" ✅

---

## 6️⃣ Next Steps

### For Developers
- Read [API Documentation](./docs/API_DOCUMENTATION.md)
- Explore [Architecture](./docs/AZORA-ARCHITECTURE.md)
- Check [Contributing Guide](./CONTRIBUTING.md)

### For Users
- Access Student Portal: http://localhost:3000
- Explore Marketplace: http://localhost:3000/marketplace
- Check Wallet: http://localhost:3000/wallet

### For Admins
- View Metrics: http://localhost:9090/metrics
- Check Logs: `docker-compose logs -f`
- Monitor Services: http://localhost:9090/health

---

## 🛑 Stop Services

```bash
docker-compose -f docker-compose.production.yml down
```

---

## 🔄 Restart Services

```bash
docker-compose -f docker-compose.production.yml restart
```

---

## 🧹 Clean Reset

```bash
# Stop and remove everything
docker-compose -f docker-compose.production.yml down -v

# Redeploy
./deploy-now.sh
```

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :4000

# Kill process
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart database
docker-compose restart postgres
```

### Service Not Responding
```bash
# Check service logs
docker-compose logs auth-service

# Restart specific service
docker-compose restart auth-service
```

---

## 📞 Get Help

- **Discord**: [Join Community](https://discord.gg/azora)
- **GitHub Issues**: [Report Bug](https://github.com/azora-os/azora-os/issues)
- **Documentation**: [Read Docs](./docs/)

---

**Ready to build the future?** 🚀
