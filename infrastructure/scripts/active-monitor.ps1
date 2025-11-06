# ACTIVE Repository Monitor for Azora OS
# Monitors every 2 minutes and commits/pushes changes

$interval = 120  # 2 minutes
$logFile = "active-monitor.log"

function Log-Message {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Write-Host $logEntry
    Add-Content -Path $logFile -Value $logEntry
}

Log-Message "🚀 ACTIVE Repository Monitor Started"
Log-Message "Checking for changes every $interval seconds"
Log-Message "Press Ctrl+C to stop"

$cycle = 0

while ($true) {
    $cycle++
    $time = Get-Date -Format "HH:mm:ss"

    Log-Message "🔍 Cycle $cycle - Checking at $time"

    # Check for changes
    $status = git status --porcelain 2>$null
    $changeCount = if ($status) { ($status | Measure-Object).Count } else { 0 }

    if ($changeCount -gt 0) {
        Log-Message "📝 Found $changeCount changes - processing..."

        # Add and commit
        git add . 2>$null | Out-Null

        $msg = "feat: active monitoring update (cycle $cycle)`n`n- Changes: $changeCount files`n- $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git commit -m $msg 2>$null | Out-Null

        # Push
        git push origin clean-branch 2>$null | Out-Null

        Log-Message "✅ Committed and pushed $changeCount changes"

    } else {
        Log-Message "✅ No changes detected"
    }

    Log-Message "⏰ Sleeping $interval seconds..."
    Start-Sleep -Seconds $interval
}
