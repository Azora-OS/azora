# 🚀 Quick Install Guide

## Option 1: Direct Install (Recommended)

```bash
cd tools/elara-vscode-extension
npm install --no-workspaces
npm run compile
npm run package
code --install-extension elara-ai-family-1.0.0.vsix
```

## Option 2: Development Mode

```bash
cd tools/elara-vscode-extension
npm install --no-workspaces
npm run compile
# Open this folder in VS Code and press F5
```

## Option 3: Manual Install

1. Build the extension:
```bash
cd tools/elara-vscode-extension
npm install --no-workspaces
npm run compile
npm run package
```

2. In VS Code:
   - Press `Ctrl+Shift+P`
   - Type "Extensions: Install from VSIX"
   - Select `elara-ai-family-1.0.0.vsix`

## Verify Installation

1. Look for Elara icon in Activity Bar (left sidebar)
2. Click it to open chat
3. Select a family member and start chatting!

## Start AI Family Service

Before using the extension, start the backend:

```bash
cd services/ai-family-service
npm install
npm start
# Service runs on http://localhost:4010
```

## Troubleshooting

**Workspace conflicts?**
```bash
npm install --no-workspaces
```

**TypeScript errors?**
```bash
npm install --save-dev @types/node @types/vscode typescript
```

**Can't connect to API?**
- Ensure AI Family Service is running on port 4010
- Check VS Code settings: `elara.apiUrl`

## Quick Test

1. Open any code file
2. Select some code
3. Right-click → "Elara: Explain This Code"
4. See Elara's response in the chat panel!

---

**"Ngiyakwazi ngoba sikwazi"** 💚
