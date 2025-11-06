# Azora OS Repository Monitoring System

This directory contains automated tools for monitoring repository changes and maintaining documentation.

## 🚀 Quick Start

### Option 1: One-Time Documentation Update
```bash
# Run documentation updater manually
tsx scripts/update-docs.ts
```

### Option 2: Continuous Monitoring (Recommended)
```bash
# Start the repository monitor (checks every 5 minutes)
tsx scripts/repo-monitor.ts start

# Or run once to check current status
tsx scripts/repo-monitor.ts check
```

### Option 3: Automated Windows Monitoring
```batch
# Set up Windows Task Scheduler for automatic monitoring
scripts/setup-windows-scheduler.bat

# Run manually with PowerShell
powershell -ExecutionPolicy Bypass -File scripts/automated-repo-monitor.ps1
```

## 📊 What the Monitor Does

### Repository Scanning
- **Change Detection**: Monitors git commits and file modifications
- **Codebase Analysis**: Scans for new components, services, and APIs
- **Documentation Updates**: Automatically updates relevant documentation files

### Documentation Maintenance
- **CHANGELOG.md**: Auto-generates entries for new features and changes
- **README.md**: Updates with new features and current statistics
- **API_DOCUMENTATION.md**: Adds new services and endpoints
- **SYSTEM_OVERVIEW.md**: Creates comprehensive system status reports

### Automated Commits
- **Smart Commits**: Creates meaningful commit messages based on changes
- **Documentation Updates**: Commits documentation changes automatically
- **Push Integration**: Pushes changes to the remote repository

## 🛠️ Available Scripts

### `repo-monitor.ts`
Main repository monitoring system with real-time change detection.

**Usage:**
```bash
tsx scripts/repo-monitor.ts [command] [interval]

Commands:
  start     - Start continuous monitoring (default)
  stop      - Stop monitoring
  check     - Check for updates once

Options:
  interval  - Monitoring interval in minutes (default: 5)
```

### `update-docs.ts`
Manual documentation updater that scans the codebase and updates all docs.

**Usage:**
```bash
tsx scripts/update-docs.ts
```

### `automated-repo-monitor.ps1` (PowerShell)
Windows-specific automated monitoring script.

**Usage:**
```powershell
.\scripts\automated-repo-monitor.ps1 -IntervalMinutes 30
.\scripts\automated-repo-monitor.ps1 -RunOnce  # Run once and exit
```

### `start-repo-monitor.bat`
Windows batch file launcher for the repository monitor.

### `setup-windows-scheduler.bat`
Sets up Windows Task Scheduler for automatic monitoring every 30 minutes.

## 📈 Monitoring Features

### Change Detection
- **File Modifications**: Detects added, modified, and deleted files
- **Category Classification**: Automatically categorizes changes (components, services, docs, etc.)
- **Impact Analysis**: Determines which documentation needs updating

### Documentation Updates
- **Statistics Tracking**: Maintains current codebase metrics (files, lines, components)
- **Feature Discovery**: Automatically discovers new features and services
- **Version Updates**: Updates version numbers and release information

### Integration
- **Git Workflow**: Seamlessly integrates with existing git workflow
- **Conflict Resolution**: Handles merge conflicts and concurrent changes
- **Error Recovery**: Continues monitoring even after temporary failures

## 🔧 Configuration

### Monitoring Intervals
- **Default**: 5 minutes for active development
- **Recommended**: 30 minutes for production monitoring
- **Minimum**: 1 minute (not recommended for performance)

### Log Files
- **Location**: `repo-monitor.log` in the repository root
- **Format**: Timestamped log entries with severity levels
- **Rotation**: Automatic log rotation (not yet implemented)

### Customization
The monitoring system can be customized by modifying the TypeScript source files:

- `scripts/repo-monitor.ts`: Core monitoring logic
- `scripts/update-docs.ts`: Documentation update logic
- `scripts/automated-repo-monitor.ps1`: Windows automation wrapper

## 🚨 Troubleshooting

### Common Issues

**"tsx command not found"**
```bash
npm install -g tsx
```

**"Permission denied" on Windows**
```batch
# Run PowerShell as administrator
powershell -ExecutionPolicy Bypass -File scripts/setup-windows-scheduler.bat
```

**"Repository not found" errors**
- Ensure you're in the correct directory
- Check git remote configuration: `git remote -v`
- Verify network connectivity

**Monitoring not detecting changes**
- Check that files are properly committed
- Verify the monitoring interval is appropriate
- Check the log file for error messages

### Stopping the Monitor

**From Command Line:**
```bash
tsx scripts/repo-monitor.ts stop
```

**Windows Task Scheduler:**
```batch
schtasks /delete /tn "Azora OS Repository Monitor" /f
```

**PowerShell Script:**
```powershell
# The script will stop when you press Ctrl+C
```

## 📋 System Requirements

- **Node.js**: 18+ with TypeScript support
- **tsx**: For running TypeScript files directly
- **Git**: For repository operations
- **Windows**: PowerShell 5.1+ (for Windows automation)
- **Permissions**: Write access to repository and documentation files

## 🤝 Contributing

The monitoring system itself can be improved! To contribute:

1. Test your changes with `tsx scripts/repo-monitor.ts check`
2. Ensure logging works correctly
3. Update this documentation
4. Submit a pull request

## 📞 Support

For issues with the monitoring system:
1. Check the log file: `repo-monitor.log`
2. Run diagnostic: `tsx scripts/repo-monitor.ts check`
3. Review recent commits: `git log --oneline -10`
4. Create an issue with the error logs

---

**Azora OS Repository Monitor — Keeping documentation synchronized with code changes**

*Automated documentation maintenance for the planetary economic intelligence platform*
