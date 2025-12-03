# Azora OS Repository Monitor PowerShell Launcher
# This script starts the repository monitoring system

param(
    [int]$IntervalMinutes = 5,
    [switch]$CheckOnly,
    [switch]$Stop
)

Write-Host "Azora OS Repository Monitor" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Check if tsx is installed
try {
    $tsxVersion = & tsx --version 2>$null
    Write-Host "✅ tsx is available (version: $tsxVersion)" -ForegroundColor Green
} catch {
    Write-Host "Installing tsx globally..." -ForegroundColor Yellow
    npm install -g tsx
}

# Determine the action
$action = "start"
if ($CheckOnly) { $action = "check" }
if ($Stop) { $action = "stop" }

if ($CheckOnly) {
    Write-Host "🔍 Running one-time repository check..." -ForegroundColor Blue
} elseif ($Stop) {
    Write-Host "⏹️  Stopping repository monitor..." -ForegroundColor Yellow
} else {
    Write-Host "🔄 Starting continuous repository monitoring (checking every $IntervalMinutes minutes)..." -ForegroundColor Blue
    Write-Host "Press Ctrl+C to stop monitoring." -ForegroundColor Yellow
    Write-Host ""
}

# Run the monitor
try {
    & tsx "scripts/repo-monitor.ts" $action $IntervalMinutes
} catch {
    Write-Host "❌ Error running repository monitor: $_" -ForegroundColor Red
    exit 1
}
