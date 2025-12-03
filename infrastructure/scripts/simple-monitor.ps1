# Simple Azora OS Repository Monitor - ACTIVE MONITORING
# Monitors every 2 minutes and commits/pushes changes immediately

$intervalSeconds = 120
$logFile = "simple-monitor.log"
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $repoRoot

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

Write-Log "🚀 Starting SIMPLE ACTIVE Repository Monitor"
Write-Log "Monitoring interval: $intervalSeconds seconds"
Write-Log "Repository: $repoRoot"
Write-Log "Press Ctrl+C to stop monitoring"
Write-Log "=========================================="

$cycleCount = 0

# Handle Ctrl+C gracefully
$cancelEvent = {
    Write-Log "Simple monitor stopped by user"
    exit 0
}
$null = Register-ObjectEvent -InputObject ([System.Console]) -EventName CancelKeyPress -Action $cancelEvent

while ($true) {
    $cycleCount++
    $timestamp = Get-Date -Format "HH:mm:ss"

    Write-Log "🔍 Cycle $cycleCount - Checking for changes ($timestamp)"

    Push-Location $repoRoot

    try {
        # Check for changes
        $status = git status --porcelain 2>$null
        $hasChanges = $status -and $status.Length -gt 0

        if ($hasChanges) {
            $changeCount = ($status | Measure-Object).Count
            Write-Log "📝 Found $changeCount changes! Processing..."

            # Add all changes
            git add . 2>&1 | Out-Null

            # Create commit message
            $commitMessage = @"
feat: active repository updates (cycle $cycleCount)

- Total changes: $changeCount files
- Auto-committed by simple monitor
- $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@

            # Commit
            git commit -m $commitMessage 2>&1 | Out-Null
            Write-Log "✅ Committed $changeCount changes"

            # Push
            git push origin clean-branch 2>&1 | Out-Null
            Write-Log "✅ Pushed to GitHub"

        } else {
            Write-Log "✅ No changes detected"
        }

    } catch {
        Write-Log "❌ Error: $($_.Exception.Message)" "ERROR"
    }

    Pop-Location

    Write-Log "⏰ Waiting $intervalSeconds seconds..."
    Start-Sleep -Seconds $intervalSeconds
}

Write-Log "Simple monitor session ended"
