# AzStudio Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd azstudio
npm install
```

### 2. Run Development Mode

```bash
npm run dev
```

This will:
- Start the webpack dev server for the renderer process (port 3000)
- Watch and rebuild the main process on changes
- You'll need to run `npm start` in a separate terminal to launch Electron

### 3. Launch Electron

In a separate terminal:

```bash
npm start
```

## Development Workflow

### Hot Reload

The renderer process (React UI) supports hot reload. Changes will automatically refresh in the Electron window.

The main process requires a restart of Electron when changes are made.

### Building for Production

```bash
# Build both main and renderer
npm run build

# Package for Windows
npm run package

# Package without installer (for testing)
npm run package:dir
```

### Project Structure

```
azstudio/
├── src/
│   ├── main/
│   │   ├── main.ts       # Electron main process
│   │   └── preload.ts    # IPC bridge (secure)
│   ├── renderer/
│   │   ├── index.tsx     # React entry point
│   │   ├── App.tsx       # Main app component
│   │   └── App.css       # Styles
│   └── types/
│       └── electron.d.ts # TypeScript definitions
├── dist/                 # Build output
│   ├── main/            # Compiled main process
│   └── renderer/        # Compiled renderer
└── release/             # Packaged installers
```

## Key Features Implemented

### ✅ Task 1 Complete

- [x] Electron main process with window management
- [x] IPC communication between main and renderer
- [x] TypeScript build pipeline with webpack
- [x] Basic file system access with security boundaries
- [x] Development environment with hot reload

### Security Features

- **Context Isolation**: Enabled for security
- **Node Integration**: Disabled in renderer
- **Preload Script**: Secure IPC bridge
- **CSP**: Content Security Policy configured

### File System Operations

Available via `window.electronAPI.fs`:
- `readFile(path)` - Read file contents
- `writeFile(path, content)` - Write file
- `readDir(path)` - List directory contents
- `exists(path)` - Check if file exists

### Dialog Operations

Available via `window.electronAPI.dialog`:
- `openFolder()` - Open folder picker
- `openFile(filters)` - Open file picker

### Window Operations

Available via `window.electronAPI.window`:
- `minimize()` - Minimize window
- `maximize()` - Maximize/restore window
- `close()` - Close window

### Auto-Updates

Configured with electron-updater:
- Checks for updates on startup
- Checks every hour
- Notifies user when updates available
- Downloads and installs with user consent

## Next Steps

Task 2: Integrate Monaco editor with basic functionality
- Embed Monaco editor in renderer process
- Set up syntax highlighting
- Implement file opening and saving
- Configure IntelliSense and autocomplete

## Troubleshooting

### Port 3000 already in use

Change the port in `webpack.renderer.config.js`:

```javascript
devServer: {
  port: 3001, // Change this
  hot: true,
}
```

### Electron window not opening

Make sure you've built the main process first:

```bash
npm run build:main
npm start
```

### TypeScript errors

Run type checking:

```bash
npm run type-check
```
