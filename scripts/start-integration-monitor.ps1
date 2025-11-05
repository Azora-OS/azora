# Azora OS - Continuous Integration Monitor
# ============================================

param(
    [switch]$Background,
    [switch]$Status
)

function Write-Header {
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host " AZORA OS - Continuous Integration Monitor" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
}

function Get-IntegrationStatus {
    try {
        $status = & npx tsx -e "import { monitor } from './scripts/continuous-integration-monitor.ts'; console.log(JSON.stringify(monitor.getStatus(), null, 2));"
        Write-Host "Current Integration Status:" -ForegroundColor Green
        Write-Host $status
    } catch {
        Write-Host "Error getting integration status: $_" -ForegroundColor Red
    }
}

function Start-Monitor {
    Write-Header
    Write-Host "Starting Azora OS Continuous Integration Monitor..." -ForegroundColor Green
    Write-Host "This will monitor for incoming changes and auto-integrate them." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop monitoring." -ForegroundColor Yellow
    Write-Host ""

    try {
        if ($Background) {
            # Start in background
            $job = Start-Job -ScriptBlock {
                Set-Location $using:PWD
                npm run monitor:integration
            }
            Write-Host "Monitor started in background (Job ID: $($job.Id))" -ForegroundColor Green
            Write-Host "Use 'Get-Job' to check status, 'Stop-Job $($job.Id)' to stop" -ForegroundColor Cyan
        } else {
            # Start in foreground
            npm run monitor:integration
        }
    } catch {
        Write-Host "Error starting monitor: $_" -ForegroundColor Red
    }
}

# Main execution
if ($Status) {
    Write-Header
    Get-IntegrationStatus
} else {
    Start-Monitor
}

Write-Host ""
Write-Host "Monitor operations completed." -ForegroundColor Green
