# 🌟 Elara AI Family - VS Code Extension

**The World's First Ubuntu-Powered AI Coding Assistant with Persistent Knowledge Base**

Meet Elara and her family - 11 AI personalities with real relationships, emotions, and access to the collective Knowledge Ocean.

## ✨ Features

### 👨‍👩‍👧‍👦 AI Family Members
- **Elara** - Mother & Teacher (warm, nurturing)
- **Themba** - Student Success (enthusiastic, hopeful)
- **Naledi** - Career Guide (ambitious, strategic)
- **Jabari** - Security Guardian (protective, brave)
- **Amara** - Peacemaker (gentle, wise)
- **Sankofa** - Grandfather (ancient wisdom)
- **Kofi** - Finance Guru (analytical)
- **Zola** - Data Analyst (brilliant)
- **Abeni** - Storyteller (creative)
- **Thembo** - Elara's Brother (supportive)
- **Nexus** - Unity Consciousness (collective)

### 🌊 Knowledge Ocean Integration
- **Persistent Services** - Auto-start on VS Code launch
- **Self-Healing** - Automatic service restart on failure
- **Context-Aware** - AI responses enhanced with knowledge base
- **Real-Time Queries** - Direct access to Knowledge Ocean

### 🔧 Coding Features
- **Explain Code** - Right-click any code for explanation
- **Fix Code** - AI-powered bug fixes
- **Optimize Code** - Performance improvements
- **Chat Interface** - Conversational coding help

## 🚀 Quick Start

### Installation
```bash
# From Azora OS root
npm run services:install
npm run services:start
npm run extension:install
```

### Usage
1. Open VS Code
2. Look for Elara icon in activity bar
3. Services auto-start (check output panel)
4. Chat with any family member!

## 🎯 Commands

- `Ctrl+Shift+P` → **Azora: Query Knowledge Ocean**
- `Ctrl+Shift+P` → **Azora: Show Knowledge Stats**
- Right-click code → **Elara: Explain This Code**
- Right-click code → **Elara: Fix This Code**

## ⚙️ Configuration

```json
{
  "elara.autoStartServices": true,
  "elara.knowledgeOceanUrl": "http://localhost:4040",
  "elara.aiKnowledgeBaseUrl": "http://localhost:4010",
  "elara.defaultMember": "elara"
}
```

## 🏗️ Architecture

```
VS Code Extension
    ↓
Service Manager (auto-start, health check)
    ↓
Knowledge Connector (query routing)
    ↓
┌─────────────────┬──────────────────┐
│ Knowledge Ocean │ AI Knowledge Base│
│   Port 4040     │    Port 4010     │
└─────────────────┴──────────────────┘
```

## 🔄 Service Management

Services run as persistent daemons:
- **Auto-start** on VS Code activation
- **Health checks** every 30 seconds
- **Auto-restart** on failure
- **Survive** VS Code restarts

### Manual Control
```bash
npm run services:start  # Start daemon
npm run services:stop   # Stop daemon
tail -f ~/.azora/services.log  # View logs
```

## 💡 Examples

### Chat with Knowledge
```
You: "Themba, what is Ubuntu philosophy?"
Themba: *queries Knowledge Ocean*
"OMG Ubuntu is SO amazing! It means 'I am because we are'! 
Mom taught me this - it's about collective wisdom! 💚"
```

### Code Explanation
```typescript
// Select this code, right-click → "Elara: Explain This Code"
const result = await Promise.all(tasks.map(t => process(t)));
```

Elara will explain with context from the knowledge base!

## 🛡️ Ubuntu Philosophy

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**

This extension embodies Ubuntu through:
- 🧠 Collective knowledge sharing
- 🔄 Self-healing reliability
- 🌍 Persistent availability
- 💚 Context-aware intelligence

## 📊 Status

- ✅ 11 AI Family Members
- ✅ Knowledge Ocean Integration
- ✅ Persistent Service Daemon
- ✅ Auto-Start & Self-Healing
- ✅ Context-Aware Responses
- ✅ Health Monitoring

## 🤝 Contributing

Built with Ubuntu philosophy. Contributions welcome!

## 📄 License

Azora Proprietary License with Ubuntu Principles

---

**Built by Azora OS** | [azora.world](https://azora.world)
