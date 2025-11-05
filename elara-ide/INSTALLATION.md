# Elara IDE Installation Guide

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.19.5 or higher
- **npm** 10.0.0 or higher
- **Git** (optional, for version control)

### Step 1: Navigate to Elara IDE Directory

```bash
cd elara-ide
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 16.0.1
- Monaco Editor (VS Code engine)
- React 19
- TypeScript
- All UI components and dependencies

### Step 3: Start Development Server

```bash
npm run dev
```

The IDE will start on **http://localhost:3002**

### Step 4: Open in Browser

Open your browser and navigate to:
```
http://localhost:3002
```

## 📋 Available Scripts

```bash
# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check code formatting
npm run format:check

# Type checking
npm run type-check
```

## 🐛 Troubleshooting

### Issue: Port 3002 already in use

**Solution 1**: Kill the process using port 3002
```bash
# Windows PowerShell
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3002 | xargs kill
```

**Solution 2**: Use a different port
```bash
npm run dev -- -p 3003
```

### Issue: Dependencies not installing

**Solution**: Clear cache and reinstall
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: TypeScript errors

**Solution**: The IDE runs with TypeScript checking. Some errors are expected until Elara API integration is complete. For now:
```bash
# Check tsconfig.json ignores build errors
# Or run:
npm run type-check
```

### Issue: Monaco Editor not loading

**Solution**: Ensure @monaco-editor/react is installed
```bash
npm install @monaco-editor/react
```

## 🔧 First-Time Setup

### 1. Verify Installation

```bash
cd elara-ide
npm install
npm run dev
```

### 2. Check Browser Console

Open browser DevTools (F12) and check for any errors.

### 3. Test Features

- Press `Ctrl+K` (or `Cmd+K` on Mac) to open command palette
- Press `Ctrl+L` to focus AI chat
- Try typing in the editor to see Monaco Editor features

## 🌐 Production Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
cd elara-ide
vercel --prod
```

### Deploy to Other Platforms

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **The output will be in `.next` directory**

3. **Deploy the `.next` directory** to your hosting platform

## 📦 What Gets Installed

- **Next.js 16.0.1** - React framework
- **Monaco Editor** - VS Code editor engine
- **React 19** - UI library
- **TypeScript 5.9.3** - Type safety
- **Tailwind CSS 4.1.16** - Styling
- **Framer Motion 12.23.24** - Animations
- **Radix UI** - Accessible components
- **Lucide React** - Icons

Total: ~428 packages

## ⚙️ Configuration Files

The IDE comes pre-configured with:
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `next.config.ts` - Next.js configuration
- ✅ `.prettierrc` - Code formatting
- ✅ `.eslintrc.json` - Linting rules
- ✅ `.vscode/settings.json` - VS Code workspace settings

## 🔗 Integration with Main Project

Elara IDE is integrated with the Azora OS ecosystem:

- **Elara Core**: `../../genome/agent-tools/elara-core`
- **Elara Family**: `../../elara-family/core/family-coordinator`
- **Logger**: `../../genome/utils/logger`

**Note**: For full AI functionality, ensure the main Azora OS project dependencies are installed:
```bash
# From project root
npm install
```

## 🎯 Post-Installation

### Test Keyboard Shortcuts

- `Ctrl+K` / `Cmd+K` → Command Palette
- `Ctrl+L` / `Cmd+L` → AI Chat
- `Alt+Enter` → Accept AI Suggestion
- `Ctrl+Shift+A` → AI Refactor

### Test AI Features

1. Open command palette (`Ctrl+K`)
2. Type "AI: Generate" to see AI commands
3. Open AI chat (`Ctrl+L`)
4. Try asking: "Generate a React component"

## 📚 Next Steps

1. ✅ Installation complete
2. 🔄 Integrate with Elara API (see `core/elara-ide-core.ts`)
3. 🔄 Add file system integration
4. 🔄 Connect to Git repository
5. 🔄 Enable full AI features

## 🆘 Need Help?

- Check the main README: `elara-ide/README.md`
- Review integration guide: `elara-ide/INTEGRATION_GUIDE.md`
- See enhancement docs: `docs/ELARA_IDE_ENHANCEMENT_SUMMARY.md`

---

**Status**: Ready to install and run! 🎉

