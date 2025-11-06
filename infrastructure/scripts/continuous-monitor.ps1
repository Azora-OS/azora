# Azora OS Continuous Repository Monitor - HIGH FREQUENCY
# Monitors repository every 2 minutes for rapid change detection

param(
    [int]$IntervalSeconds = 120,  # 2 minutes default
    [switch]$Background,
    [string]$LogFile = "continuous-monitor.log"
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptPath

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage -ForegroundColor $(if ($Level -eq "ERROR") { "Red" } elseif ($Level -eq "WARNING") { "Yellow" } else { "Green" })
    Add-Content -Path (Join-Path $repoRoot $LogFile) -Value $logMessage
}

function Test-GitChanges {
    try {
        Push-Location $repoRoot

        # Check for any changes (staged, unstaged, or untracked)
        $status = git status --porcelain 2>$null
        if ($status) {
            Write-Log "Detected $($status.Count) changes in repository"
            return $true
        }

        # Check if we're behind remote
        git fetch origin clean-branch 2>$null | Out-Null
        $behind = git rev-list HEAD..origin/clean-branch --count 2>$null
        if ($behind -gt 0) {
            Write-Log "Repository is $behind commits behind remote"
            return $true
        }

        return $false
    } catch {
        Write-Log "Error checking git status: $($_.Exception.Message)" "ERROR"
        return $false
    } finally {
        Pop-Location
    }
}

function Commit-And-Push {
    try {
        Push-Location $repoRoot

        Write-Log "Processing repository changes..."

        # Add all changes
        git add . 2>&1 | Out-Null

        # Check if there are changes to commit
        $status = git status --porcelain
        if (-not $status) {
            Write-Log "No changes to commit"
            return
        }

        # Generate commit message based on changes
        $changeCount = ($status | Measure-Object).Count
        $newFiles = ($status | Where-Object { $_.StartsWith("??") }).Count
        $modifiedFiles = ($status | Where-Object { $_.StartsWith(" M") }).Count
        $deletedFiles = ($status | Where-Object { $_.StartsWith(" D") }).Count

        $commitMessage = "feat: continuous repository updates`n`n"
        $commitMessage += "- Total changes: $changeCount files`n"
        if ($newFiles -gt 0) { $commitMessage += "- New files: $newFiles`n" }
        if ($modifiedFiles -gt 0) { $commitMessage += "- Modified: $modifiedFiles`n" }
        if ($deletedFiles -gt 0) { $commitMessage += "- Deleted: $deletedFiles`n" }
        $commitMessage += "- Auto-committed by continuous monitor`n"
        $commitMessage += "- $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

        # Commit changes
        git commit -m $commitMessage 2>&1 | Out-Null
        Write-Log "Committed $changeCount changes"

        # Push to remote
        git push origin clean-branch 2>&1 | Out-Null
        Write-Log "Successfully pushed to GitHub"

        # Try to run documentation updater
        if (Test-Path "scripts/update-docs.ts") {
            Write-Log "Running documentation updater..."
            try {
                Push-Location $repoRoot
                & tsx scripts/update-docs.ts 2>$null
                Write-Log "Documentation updated"
            } catch {
                Write-Log "Documentation update failed: $($_.Exception.Message)" "WARNING"
            } finally {
                Pop-Location
            }
        }

    } catch {
        Write-Log "Error during commit/push: $($_.Exception.Message)" "ERROR"
    } finally {
        Pop-Location
    }
}

function Start-ContinuousMonitoring {
    Write-Log "🚀 Starting HIGH-FREQUENCY repository monitoring"
    Write-Log "Monitoring interval: $IntervalSeconds seconds"
    Write-Log "Repository: $repoRoot"
    Write-Log "Press Ctrl+C to stop monitoring"

    $cycleCount = 0

    while ($true) {
        $cycleCount++
        $timestamp = Get-Date -Format "HH:mm:ss"

        Write-Log "🔍 Cycle $cycleCount - Checking for changes ($timestamp)"

        if (Test-GitChanges) {
            Write-Log "📝 Changes detected! Processing..."
            Commit-And-Push
        } else {
            Write-Log "✅ No changes detected"
        }

        Write-Log "⏰ Waiting $IntervalSeconds seconds until next check..."
        Start-Sleep -Seconds $IntervalSeconds
    }
}

# Handle script interruption gracefully
$handler = {
    Write-Log "Continuous monitor stopped by user"
    exit 0
}
$null = Register-ObjectEvent -InputObject ([System.Console]) -EventName CancelKeyPress -Action $handler

# Main execution
try {
    if ($Background) {
        Write-Log "Starting in background mode"
        Start-ContinuousMonitoring
    } else {
        Start-ContinuousMonitoring
    }
} catch {
    Write-Log "Unexpected error: $($_.Exception.Message)" "ERROR"
    exit 1
}
