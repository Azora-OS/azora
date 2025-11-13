# 🔧 Quick Fix Guide - Services Running

## ✅ Issues Fixed

### 1. Port Conflict (EADDRINUSE)
**Problem**: Port 4040 already in use
**Solution**: Auto-kill existing processes before starting

### 2. Missing OpenAI Key
**Problem**: AI Knowledge Base requires OPENAI_API_KEY
**Solution**: Falls back to dummy embeddings for local dev

## 🚀 Start Services (Fixed)

### Option 1: Clean Start
```bash
# Kill any existing processes
lsof -ti:4040 | xargs kill -9 2>/dev/null || true
lsof -ti:4010 | xargs kill -9 2>/dev/null || true

# Start services
npm run services:start
```

### Option 2: Manual Start (Recommended for Testing)
```bash
# Terminal 1: Knowledge Ocean
cd services/knowledge-ocean
npm start

# Terminal 2: AI Knowledge Base (in new terminal)
cd services/ai-knowledge-base
npm run dev
```

### Option 3: VS Code Extension Auto-Start
```bash
# Install and compile extension
cd tools/elara-vscode-extension
npm run compile

# Reload VS Code - services auto-start
# Ctrl+Shift+P → "Developer: Reload Window"
```

## 🧪 Test Services

```bash
# Test Knowledge Ocean
curl http://localhost:4040/health
# Expected: {"status":"healthy","nodes":91}

# Test AI Knowledge Base
curl http://localhost:4010/health
# Expected: {"status":"healthy","service":"ai-knowledge-base","ubuntu":"active"}

# Query Knowledge
curl -X POST http://localhost:4040/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is Ubuntu?"}'
```

## 🔍 Troubleshooting

### Port Still in Use
```bash
# Find process
lsof -i :4040

# Kill it
kill -9 <PID>

# Or kill all node processes (nuclear option)
pkill -9 node
```

### Service Won't Start
```bash
# Check logs
tail -f ~/.azora/services.log

# Check if port is free
nc -zv localhost 4040
nc -zv localhost 4010
```

### OpenAI Key (Optional)
```bash
# If you want real embeddings, add to .env
cd services/ai-knowledge-base
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# Otherwise, dummy embeddings work fine for local dev
```

## ✅ Verification

Services are running correctly when:
- ✅ `curl http://localhost:4040/health` returns JSON
- ✅ `curl http://localhost:4010/health` returns JSON
- ✅ No "EADDRINUSE" errors in logs
- ✅ VS Code shows "🌟 Azora Services Active"

## 🎯 Next Steps

1. **Start services** using Option 2 (manual in terminals)
2. **Test health** endpoints
3. **Install extension**: `npm run extension:install`
4. **Reload VS Code**: Ctrl+Shift+P → "Developer: Reload Window"
5. **Chat with Elara** - click icon in activity bar

---

**Services now auto-cleanup ports and work without OpenAI key! 🎉**
