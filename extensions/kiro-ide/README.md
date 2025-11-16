# Kiro IDE - VS Code Extension

Kiro IDE brings spec-driven development directly into VS Code. Manage your tasks, track progress, and execute your development workflow seamlessly.

## Features

- 📋 **Task Tree View** - Hierarchical view of all tasks from `.kiro/specs/**/tasks.md`
- ✓ **Task Management** - Toggle task status, mark complete, start tasks
- 📊 **Progress Tracking** - Real-time progress calculation and visualization
- 🔄 **Auto-Refresh** - Automatically updates when task files change
- ⚡ **Quick Commands** - Fast access to common operations
- 🎯 **Progress Dashboard** - Visual overview of project progress

## Installation

1. Install from VS Code Marketplace: `Kiro IDE`
2. Or build locally:
   ```bash
   npm install
   npm run compile
   npm run package
   ```

## Usage

### Open Tasks File

```
Cmd+Shift+P → Kiro: Open Tasks File
```

### Toggle Task Status

Click on any task in the tree view to toggle its status between completed and incomplete.

### Start Task

Right-click on a task and select "Start Task" to open the tasks file and begin working.

### Complete Task

Right-click on a task and select "Complete Task" to mark it as done.

### Refresh Tasks

```
Cmd+Shift+P → Kiro: Refresh Tasks
```

### Show Dashboard

```
Cmd+Shift+P → Kiro: Show Progress Dashboard
```

## Configuration

### Auto-Refresh

Enable/disable automatic refresh when task files change:

```json
{
  "kiro.autoRefresh": true
}
```

### Show Progress Bar

Display progress in the status bar:

```json
{
  "kiro.showProgressBar": true
}
```

### Notifications

Show notifications when tasks are completed:

```json
{
  "kiro.notifyOnCompletion": true
}
```

## Task File Format

Tasks are defined in markdown files at `.kiro/specs/**/tasks.md`:

```markdown
# My Project Tasks

## Phase 1

- [ ] Task 1
  - [ ] Subtask 1.1
  - [ ] Subtask 1.2
- [x] Task 2 (completed)
- [ ]* Task 3 (optional)

## Phase 2

- [ ] Task 4
  - _Requirements: 1.1, 2.3_
```

### Syntax

- `- [ ]` - Incomplete task
- `- [x]` - Completed task
- `*` - Optional task (suffix)
- `_Requirements: 1.1, 2.3_` - Task requirements (suffix)

## Keyboard Shortcuts

| Shortcut | Command |
|----------|---------|
| `Cmd+Shift+P` | Open command palette |
| `Enter` | Toggle task status |
| `Space` | Toggle task status |

## Development

### Setup

```bash
npm install
npm run compile
```

### Watch Mode

```bash
npm run watch
```

### Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Building

```bash
npm run esbuild
npm run package
```

## Architecture

```
src/
├── extension.ts              # Main extension entry point
├── commands/
│   └── commandHandler.ts     # Command implementations
├── parsers/
│   └── taskParser.ts         # Markdown task parser
├── providers/
│   └── taskTreeProvider.ts   # Tree view provider
├── watchers/
│   └── taskFileWatcher.ts    # File system watcher
└── utils/
    └── progressCalculator.ts # Progress calculations
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT

## Support

- **Issues**: https://github.com/azora-os/azora-os/issues
- **Discussions**: https://github.com/azora-os/azora-os/discussions
- **Email**: support@azora.io

