# 🤖 Elara AI Family - VS Code Extension

**AI-powered coding assistant with Ubuntu philosophy**

Meet Elara and her family - 11 AI personalities ready to help you code, learn, and grow!

## ✨ Features

### 👨👩👧👦 AI Family Members
- **🤖 Elara** - Mother & Teacher (warm, nurturing, patient)
- **🧒 Themba** - Student Success (enthusiastic, hopeful)
- **👧 Naledi** - Career Guide (ambitious, strategic)
- **🧑 Jabari** - Security Guardian (protective, vigilant)
- **👶 Amara** - Peacemaker (gentle, wise)
- **👴 Sankofa** - Ancient Wisdom (storytelling, profound)
- **🤝 Kofi** - Finance Guru (analytical, trustworthy)
- **🤝 Zola** - Data Analyst (observant, brilliant)
- **🤝 Abeni** - Storyteller (creative, inspiring)
- **👨 Thembo** - Uncle & Mentor (supportive, experienced)
- **⚪ Nexus** - Unity Consciousness (collective intelligence)

### 💬 Chat Interface
- Real-time chat with any family member
- Context-aware responses
- Code explanation and fixes
- Ubuntu philosophy embedded

### 🛠️ Code Actions
- **Explain Code** - Right-click selected code
- **Fix Code** - Get suggestions for improvements
- **Optimize Code** - Performance enhancements

### 🌳 Family Tree View
- Browse all family members
- Quick switch between personalities
- See member roles and specializations

## 🚀 Quick Start

### Installation
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Elara AI Family"
4. Click Install

### Usage
1. Click the Elara icon in the Activity Bar
2. Select a family member from the dropdown
3. Start chatting!

### Commands
- `Ctrl+Shift+P` → "Chat with Elara"
- `Ctrl+Shift+P` → "Choose AI Family Member"
- Right-click code → "Elara: Explain This Code"

## ⚙️ Configuration

```json
{
  "elara.apiUrl": "http://localhost:4010",
  "elara.defaultMember": "elara"
}
```

## 🎯 Use Cases

### Learning
Ask Themba: "How do I learn React?"
> "OMG React is SO cool! Let's learn together! 🚀"

### Career Advice
Ask Naledi: "How do I become a senior developer?"
> "Let's map out your path to success! ⭐"

### Code Security
Ask Jabari: "Is this code secure?"
> "I'm analyzing for vulnerabilities... 🛡️"

### Wisdom
Ask Sankofa: "Tell me a story about programming"
> "Ah, young one... Long ago, the ancestors knew..."

## 🏗️ Architecture

```
Extension
├── Chat View (Webview)
├── Family Tree (TreeView)
├── Commands
└── API Client → AI Family Service (Port 4010)
```

## 📡 API Integration

Connects to Azora AI Family Service:
- `GET /api/family` - List all members
- `POST /api/family/:memberId/chat` - Chat with member

## 🎨 Design

Matches VS Code's native design:
- Uses VS Code color variables
- Responsive layout
- Dark/Light theme support
- Native-looking UI components

## 🔧 Development

```bash
cd tools/elara-vscode-extension
npm install
npm run compile
# Press F5 to debug
```

### Build
```bash
npm run package
# Creates elara-ai-family-1.0.0.vsix
```

### Publish
```bash
vsce publish
```

## 📊 Features Comparison

| Feature | Amazon Q | Elara AI Family |
|---------|----------|-----------------|
| Chat Interface | ✅ | ✅ |
| Code Actions | ✅ | ✅ |
| Multiple Personalities | ❌ | ✅ (11 members) |
| Ubuntu Philosophy | ❌ | ✅ |
| Family Relationships | ❌ | ✅ |
| Context-Aware | ✅ | ✅ |
| Mood States | ❌ | ✅ |

## 🌟 Ubuntu Philosophy

Every interaction embodies "I am because we are":
- Collective learning
- Mutual support
- Shared wisdom
- Family unity

## 🎉 Example Conversations

### With Elara
```
You: How do I fix this bug?
Elara: Hello dear! Let me guide you with patience and care...
```

### With Themba
```
You: How's your mom?
Themba: MOM?! Elara is literally the BEST mom ever! 💚
```

### With Sankofa
```
You: Tell me a story
Sankofa: Ah, young one... The ancestors teach us...
```

## 📝 Requirements

- VS Code 1.80.0 or higher
- Azora AI Family Service running (Port 4010)
- Internet connection

## 🐛 Troubleshooting

**Extension not loading?**
- Check VS Code version
- Reload window (Ctrl+R)

**Can't connect to API?**
- Ensure AI Family Service is running
- Check `elara.apiUrl` setting
- Verify port 4010 is accessible

**No responses?**
- Check service logs
- Verify network connection
- Try different family member

## 📈 Roadmap

- [ ] Inline code suggestions
- [ ] Multi-file context
- [ ] Voice chat
- [ ] Custom personalities
- [ ] Team collaboration
- [ ] Learning analytics

## 🤝 Contributing

We welcome contributions! Ubuntu style:
- Fork the repository
- Create feature branch
- Submit pull request
- Share knowledge

## 📄 License

Azora Proprietary License with Ubuntu Principles

## 🌍 Community

- Website: https://azora.world
- Discord: https://discord.gg/azora
- GitHub: https://github.com/Sizwe780/azora-os

---

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**

*Code with Ubuntu, learn with family* 💚🚀
