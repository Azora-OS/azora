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
