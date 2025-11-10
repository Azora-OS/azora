# 🚀 Azora Codespaces & Studyspaces - Launch Guide

## ⚠️ Prerequisites

Both services require Redis. Install Redis first:

```bash
# Option 1: Docker (Recommended)
docker run -d -p 6379:6379 redis:alpine

# Option 2: System Install
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# macOS
brew install redis
brew services start redis
```

## 🎯 Quick Launch (3 Terminals)

### Terminal 1: Codespaces
```bash
cd /workspaces/azora-os/services/azora-codespaces
npm install
npm start
```

### Terminal 2: Studyspaces
```bash
cd /workspaces/azora-os/services/azora-studyspaces
npm install
npm start
```

### Terminal 3: Frontend
```bash
cd /workspaces/azora-os/apps/app
npm run dev
```

## 🐳 Docker Launch (Easiest)

```bash
# Start Redis
docker run -d --name azora-redis -p 6379:6379 redis:alpine

# Start Codespaces
cd /workspaces/azora-os/services/azora-codespaces
docker-compose up -d

# Start Studyspaces
cd /workspaces/azora-os/services/azora-studyspaces
docker-compose up -d
```

## 🌐 Access URLs

- **Codespaces UI**: http://localhost:3000/codespaces
- **Studyspaces UI**: http://localhost:3000/studyspaces
- **Codespaces API**: http://localhost:4200
- **Studyspaces API**: http://localhost:4300

## ✅ Health Checks

```bash
# Codespaces
curl http://localhost:4200/api/health

# Studyspaces
curl http://localhost:4300/api/health
```

## 🔧 Troubleshooting

### Redis Connection Error
**Error**: `ECONNREFUSED 127.0.0.1:6379`

**Solution**: Start Redis
```bash
docker run -d -p 6379:6379 redis:alpine
```

### Port Already in Use
**Error**: `EADDRINUSE`

**Solution**: Kill process or change port
```bash
# Find process
lsof -i :4200
lsof -i :4300

# Kill process
kill -9 <PID>
```

### Dependencies Missing
**Error**: `Cannot find module`

**Solution**: Install dependencies
```bash
cd services/azora-codespaces && npm install
cd services/azora-studyspaces && npm install
```

## 📊 Service Status

Check all services:
```bash
# Codespaces
curl http://localhost:4200/api/health

# Studyspaces  
curl http://localhost:4300/api/health

# Frontend
curl http://localhost:3000
```

## 🎉 Success Indicators

✅ Codespaces running on port 4200  
✅ Studyspaces running on port 4300  
✅ Frontend accessible on port 3000  
✅ Redis connected  
✅ No error logs

**Ready to code and learn!** 🚀
