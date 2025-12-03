# AzStudio

AzStudio is a desktop-first IDE and visual platform builder focused on accelerating product development for education platforms, marketplaces, and modern SaaS. It pairs a visual canvas with a developer-grade editor, project intelligence, and AI-powered assistants to help teams design, build, verify, and ship platforms faster.

---

## Quick summary
- Desktop application built with Electron + React + TypeScript.
- Monaco editor for full-featured code editing (IntelliSense, diagnostics).
- Visual canvas (React Flow) for designing systems and APIs.
- Project intelligence: AST-based indexing, symbol search, and framework detection.
- AI orchestration for code generation and refactoring (OpenAI & Anthropic).
- Local-first: operations and sensitive data remain on the user’s machine.

---

## Who is this for?
- Developers and teams building education platforms and intelligent SaaS apps.
- Designers looking for a visual-first tool mapped to working production code.
- Platform engineers who scaffold and verify systems quickly.

---

## Key features
- Monaco editor with syntax highlighting, autocomplete, and diagnostics.
- Visual canvas for architecture and API design.
- AI-assisted code generation and task planning.
- Project indexer and file watcher (fast AST scanning and symbol lookup).
- Version history and change management for local projects.

---

## Getting Started (Development)
Requirements:
- Node.js 20+ (nvm recommended)
- npm or yarn

Steps:
```powershell
cd azstudio
npm ci
npm run dev # dev server + compile
# in another terminal:
npm start
```

Build for production:
```powershell
npm run build
npm run package
```

Run type-check and tests:
```powershell
npx tsc --noEmit
npm run test
```

---

## Architecture Overview
- Electron main process: lifecycle, IPC, background services
- Preload: secure IPC bridge (context isolation applied)
- Renderer: React UI with Monaco, React Flow, and tooling components
- Core services: Indexing, FileWatcher, AI Orchestration, VersionHistory, Design Filter, etc.

---

## Troubleshooting
- If port 3000 is in use, update `webpack.renderer.config.js` devServer.port.
- `fsevents` warnings on Windows are expected — optional native watch tool.
- For TypeScript errors run `npx tsc --noEmit` and follow the output.

---

## Contributing
- Branch naming: `feature/*`, `fix/*`, `chore/*`.
- Run tests and linters before opening a PR.
- Add unit tests for new logic and services.

---

## Roadmap & Maintenance Plan
See `MAINTENANCE_PLAN.md` for a prioritized plan to fix errors, stabilize CI, and add features.

---

## License
MIT
# AzStudio

AzStudio is a desktop Windows application that combines visual platform building with AI-powered development to accelerate the creation of education platforms, marketplaces, and SaaS applications similar to Azora.

## Features

- 🎨 **Hybrid Visual Builder** - Switch seamlessly between visual design and code editing
- 🤖 **AI-Powered Development** - Generate code with intelligent assistance
- ⚡ **Fast Development** - Build platforms 10-100x faster
- 🔒 **Local-First** - All code processing happens on your machine
- 🔄 **Auto-Updates** - Automatic updates with user consent

## Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Package for Windows
npm run package
```

### Project Structure

```
azstudio/
├── src/
│   ├── main/          # Electron main process
│   │   ├── main.ts    # Main entry point
│   │   └── preload.ts # Preload script for IPC
│   ├── renderer/      # React renderer process
│   │   ├── index.tsx  # Renderer entry point
│   │   ├── App.tsx    # Main app component
│   │   └── App.css    # App styles
│   └── types/         # TypeScript type definitions
├── dist/              # Build output
├── release/           # Packaged installers
└── package.json       # Project configuration
```

## Architecture

AzStudio is built with:

- **Electron 28+** - Desktop application framework
- **React 18** - UI framework
- **TypeScript 5** - Type-safe development
- **Webpack 5** - Module bundling

## Security

- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication via preload script
- File system access with security boundaries

## License

MIT
