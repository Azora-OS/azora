# 🚀 Azora VS Code Extension - Upgrade Guide

## What's New in v2.0

### 🌊 Knowledge Ocean Integration
- **Auto-connects** to Knowledge Ocean (port 4040)
- **Auto-connects** to AI Knowledge Base (port 4010)
- **Context-aware** AI responses using knowledge base
- **Real-time** knowledge queries from chat

### 🔄 Persistent Services
- **Auto-start** services on VS Code activation
- **Self-healing** - automatically restarts failed services
- **Daemon mode** - services survive VS Code restarts
- **Health monitoring** every 30 seconds

### 💡 New Features
- Query Knowledge Ocean directly from command palette
- View knowledge statistics
- Enhanced AI responses with knowledge context
- Persistent service management

## Installation

### 1. Install All Services
```bash
cd /home/user/azora-os
npm run services:install
```

### 2. Start Services as Daemon
```bash
npm run services:start
```

### 3. Install VS Code Extension
```bash
npm run extension:install
```

## Usage

### Auto-Start (Default)
Services start automatically when you open VS Code with the extension installed.

### Manual Commands
- **Ctrl+Shift+P** → "Azora: Query Knowledge Ocean"
- **Ctrl+Shift+P** → "Azora: Show Knowledge Stats"
- Chat with any AI family member - they now have knowledge base access!

### Configuration
Open VS Code Settings and search for "Elara":
- `elara.autoStartServices` - Auto-start services (default: true)
- `elara.knowledgeOceanUrl` - Knowledge Ocean URL
- `elara.aiKnowledgeBaseUrl` - AI Knowledge Base URL

## Service Management

### Start Services
```bash
npm run services:start
```

### Stop Services
```bash
npm run services:stop
```

### Check Logs
```bash
tail -f ~/.azora/services.log
```

### Check PIDs
```bash
cat ~/.azora/services.pid
```

## Architecture

```
┌─────────────────────────────────────┐
│     VS Code Extension (Elara)       │
│  ┌──────────────────────────────┐   │
│  │   Service Manager            │   │
│  │   - Auto-start               │   │
│  │   - Health monitoring        │   │
│  │   - Auto-restart             │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │   Knowledge Connector        │   │
│  │   - Query routing            │   │
│  │   - Context enhancement      │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
           │              │
           ▼              ▼
┌──────────────┐  ┌──────────────────┐
│  Knowledge   │  │  AI Knowledge    │
│  Ocean       │  │  Base            │
│  Port 4040   │  │  Port 4010       │
└──────────────┘  └──────────────────┘
```

## Troubleshooting

### Services Won't Start
```bash
# Check if ports are in use
lsof -i :4040
lsof -i :4010

# Kill existing processes
npm run services:stop

# Restart
npm run services:start
```

### Extension Not Connecting
1. Check service status: `npm run services:start`
2. View logs: `tail -f ~/.azora/services.log`
3. Reload VS Code: Ctrl+Shift+P → "Developer: Reload Window"

### Knowledge Base Not Responding
```bash
# Check service health
curl http://localhost:4040/health
curl http://localhost:4010/health

# Restart services
npm run services:stop
npm run services:start
```

## Ubuntu Philosophy

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**

This extension embodies Ubuntu by:
- 🧠 Sharing knowledge collectively
- 🔄 Self-healing for community reliability
- 🌍 Persistent services for continuous availability
- 💚 Context-aware AI that learns from our collective wisdom

---

**Built with Ubuntu Philosophy by Azora OS**
