# Azora OS Automated Repository Monitor
# This script runs continuously to monitor repository changes and update documentation

param(
    [int]$IntervalMinutes = 30,
    [switch]$RunOnce,
    [string]$LogFile = "repo-monitor.log"
)

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

function Test-GitRepository {
    try {
        $null = git status 2>$null
        return $true
    } catch {
        return $false
    }
}

function Update-Documentation {
    Write-Log "Starting documentation update process..."

    try {
        # Pull latest changes
        Write-Log "Pulling latest changes from remote..."
        git pull origin clean-branch 2>&1 | Out-Null

        # Check for changes
        $status = git status --porcelain
        if ($status) {
            Write-Log "Found changes in repository"
            git add .

            # Create commit message based on changes
            $changeCount = ($status | Measure-Object).Count
            $commitMessage = "docs: automated documentation update

- Repository monitoring detected $changeCount changes
- Auto-committed by repository monitor
- $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

            git commit -m $commitMessage 2>&1 | Out-Null
            git push origin clean-branch 2>&1 | Out-Null

            Write-Log "Successfully committed and pushed $changeCount changes"
        } else {
            Write-Log "No changes detected"
        }

        # Try to run documentation updater if available
        if (Test-Path "scripts/update-docs.ts") {
            Write-Log "Running documentation updater..."
            try {
                & tsx scripts/update-docs.ts 2>$null
                Write-Log "Documentation updater completed"
            } catch {
                Write-Log "Documentation updater failed: $($_.Exception.Message)" "WARNING"
            }
        }

    } catch {
        Write-Log "Error during documentation update: $($_.Exception.Message)" "ERROR"
    }
}

function Start-Monitoring {
    Write-Log "Starting Azora OS Repository Monitor"
    Write-Log "Monitoring interval: $IntervalMinutes minutes"
    Write-Log "Log file: $LogFile"

    # Check if we're in a git repository
    if (-not (Test-GitRepository)) {
        Write-Log "Not in a git repository. Exiting." "ERROR"
        exit 1
    }

    # Initial update
    Update-Documentation

    if ($RunOnce) {
        Write-Log "Run-once mode completed"
        return
    }

    # Continuous monitoring
    Write-Log "Entering continuous monitoring mode..."
    Write-Log "Press Ctrl+C to stop monitoring"

    while ($true) {
        Start-Sleep -Seconds ($IntervalMinutes * 60)
        Update-Documentation
    }
}

# Handle script interruption
$handler = {
    Write-Log "Repository monitor stopped by user"
    exit 0
}
$null = Register-ObjectEvent -InputObject ([System.Console]) -EventName CancelKeyPress -Action $handler

# Main execution
try {
    Start-Monitoring
} catch {
    Write-Log "Unexpected error: $($_.Exception.Message)" "ERROR"
    exit 1
}
