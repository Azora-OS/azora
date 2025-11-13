# 🚀 Start Azora OS Locally

## Quick Start (5 Minutes)

### 1. Configure Environment
```bash
cd /home/user/azora-os

# Copy environment template
cp .env.example .env

# Edit .env with your keys (already configured)
```

### 2. Start AI Family Service
```bash
cd services/ai-family-service
npm install
npm start
# Running on http://localhost:4010
```

### 3. Start Other Services (New Terminal)
```bash
# Azora LMS
cd services/azora-lms
npm install
npm start
# Running on http://localhost:4015

# Azora Mint
cd services/azora-mint
npm install
npm start
# Running on http://localhost:4020

# Azora Forge
cd services/azora-forge
npm install
npm start
# Running on http://localhost:4030

# Azora Nexus
cd services/azora-nexus
npm install
npm start
# Running on http://localhost:4016
```

### 4. Start Frontend Apps (New Terminal)
```bash
# Student Portal
cd apps/student-portal
npm install
npm run dev
# Running on http://localhost:3000

# Enterprise UI
cd apps/enterprise-ui
npm install
npm run dev
# Running on http://localhost:3001
```

### 5. Install VS Code Extension
```bash
cd tools/elara-vscode-extension
code --install-extension elara-ai-family-1.0.0.vsix
# Reload VS Code window
```

## 🔑 API Keys (Already Configured)

Your `.env` files are configured with:
- **OpenAI**: `YOUR_OPENAI_API_KEY`
- **DeepSeek**: `YOUR_DEEPSEEK_API_KEY`
- **Google AI**: `YOUR_GOOGLE_AI_API_KEY`
- **Mapbox**: `YOUR_MAPBOX_API_KEY`

## 🎯 Test Everything

### Test AI Family Service
```bash
curl http://localhost:4010/api/health
curl http://localhost:4010/api/family
curl -X POST http://localhost:4010/api/family/elara/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Elara!"}'
```

### Test LMS
```bash
curl http://localhost:4015/api/health
curl http://localhost:4015/api/courses
```

### Test Mint
```bash
curl http://localhost:4020/api/health
curl http://localhost:4020/api/wallet/balance/user123
```

### Test Forge
```bash
curl http://localhost:4030/api/health
curl http://localhost:4030/api/jobs
```

## 🐳 Docker Quick Start (Alternative)

```bash
cd /home/user/azora-os

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all
docker-compose down
```

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| AI Family Service | 4010 | http://localhost:4010 |
| Azora LMS | 4015 | http://localhost:4015 |
| Azora Nexus | 4016 | http://localhost:4016 |
| Azora Mint | 4020 | http://localhost:4020 |
| Azora Forge | 4030 | http://localhost:4030 |
| Student Portal | 3000 | http://localhost:3000 |
| Enterprise UI | 3001 | http://localhost:3001 |

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :4010
# Kill process
kill -9 <PID>
```

### Service Won't Start
```bash
# Check logs
npm start 2>&1 | tee service.log

# Verify dependencies
npm install

# Check Node version
node --version  # Should be 20+
```

### AI Models Not Working
```bash
# Verify API keys in .env
cat services/ai-family-service/.env

# Test OpenAI key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_KEY"
```

## 🎉 You're Ready!

All services running? Test the full stack:

1. **Chat with Elara**: http://localhost:4010/api/family/elara/chat
2. **Browse Courses**: http://localhost:3000
3. **Check Wallet**: http://localhost:4020/api/wallet/balance/user123
4. **Find Jobs**: http://localhost:4030/api/jobs
5. **VS Code Extension**: Open Elara panel in Activity Bar

**"Ngiyakwazi ngoba sikwazi" - Ubuntu activated!** 🚀💚
