# AZORA OS - WORKSPACE CONFLICT RESOLUTION SCRIPT (PowerShell)
# Fixes npm workspace naming conflicts

param(
    [switch]$Force
)

Write-Host "AZORA OS Workspace Conflict Resolution" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to check for conflicts
function Test-WorkspaceConflicts {
    Write-Host "Checking for workspace conflicts..." -ForegroundColor Blue
    $output = & npm ls --depth=0 2>&1
    if ($output -match "has conflicts") {
        Write-Host "Workspace conflicts found" -ForegroundColor Red
        return $true
    } else {
        Write-Host "No workspace conflicts found" -ForegroundColor Green
        return $false
    }
}

# Function to identify conflicts
function Get-WorkspaceConflicts {
    Write-Host "Identifying conflicting packages..." -ForegroundColor Blue
    $output = & npm ls --depth=0 2>&1
    $conflicts = $output | Select-String "has conflicts"

    foreach ($conflict in $conflicts) {
        $packageName = $conflict.Line -replace ".*package '([^']*)'.*", '$1'
        Write-Host "Conflicting package: $packageName" -ForegroundColor Yellow

        # Find conflicting paths
        $paths = $output | Select-String "C:\\" | Where-Object { $_ -match $packageName }
        Write-Host "Paths:" -ForegroundColor Gray
        $paths | ForEach-Object { Write-Host "  $($_.Line.Trim())" -ForegroundColor White }
        Write-Host ""
    }
}

# Function to fix conflicts
function Repair-WorkspaceConflicts {
    Write-Host "Fixing workspace conflicts..." -ForegroundColor Blue

    # Fix 'my-v0-project' conflicts
    $files = @(
        "Azora-OS/apps/azora-ui/package.json",
        "Azora-OS/apps/ingestion-ui/package.json",
        "Azora-OS/packages/ui/package.json"
    )

    foreach ($file in $files) {
        if (Test-Path $file) {
            $content = Get-Content $file -Raw
            if ($content -match '"name": "my-v0-project"') {
                $newName = switch ($file) {
                    "Azora-OS/apps/azora-ui/package.json" { "azora-ui-main" }
                    "Azora-OS/apps/ingestion-ui/package.json" { "azora-ingestion-ui" }
                    "Azora-OS/packages/ui/package.json" { "azora-ui-package" }
                }
                $content = $content -replace '"name": "my-v0-project"', "`"name`": `"$newName`""
                Set-Content $file $content -Encoding UTF8
                Write-Host "Renamed $(Split-Path $file -Leaf) package to $newName" -ForegroundColor Green
            }
        }
    }

    # Fix 'azora-ui-portal' conflicts
    $uiApps = @("cloud-ui", "compliance-ui", "dev-ui", "enterprise-ui", "learn-ui", "marketplace-ui", "pay-ui")

    foreach ($app in $uiApps) {
        $file = "Azora-OS/apps/$app/package.json"
        if (Test-Path $file) {
            $content = Get-Content $file -Raw
            if ($content -match '"name": "azora-ui-portal"') {
                $newName = "azora-$app"
                $content = $content -replace '"name": "azora-ui-portal"', "`"name`": `"$newName`""
                Set-Content $file $content -Encoding UTF8
                Write-Host "Renamed $app package to $newName" -ForegroundColor Green
            }
        }
    }

    Write-Host "Conflicts fixed" -ForegroundColor Green
}

# Function to clean npm cache
function Clear-NpmCache {
    Write-Host "Cleaning npm cache..." -ForegroundColor Blue
    & npm cache clean --force
    Write-Host "Cache cleaned" -ForegroundColor Green
}

# Main execution
if ($Force -or (Test-WorkspaceConflicts)) {
    Write-Host ""
    Write-Host "Step 1: Identifying conflicts..." -ForegroundColor Yellow
    Get-WorkspaceConflicts

    Write-Host ""
    Write-Host "Step 2: Fixing conflicts..." -ForegroundColor Yellow
    Repair-WorkspaceConflicts

    Write-Host ""
    Write-Host "Step 3: Cleaning cache..." -ForegroundColor Yellow
    Clear-NpmCache

    Write-Host ""
    Write-Host "Step 4: Verifying fixes..." -ForegroundColor Yellow
    if (-not (Test-WorkspaceConflicts)) {
        Write-Host ""
        Write-Host "SUCCESS: Workspace conflicts resolved!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Run: npm install" -ForegroundColor White
        Write-Host "2. Test parallel installer: .\tools\scripts\DEPLOY-ALL-SERVICES.ps1" -ForegroundColor White
        Write-Host "3. Begin database integration phase" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "WARNING: Some conflicts may remain" -ForegroundColor Yellow
        Write-Host "Manual review may be required" -ForegroundColor Yellow
    }
} else {
    Write-Host "No conflicts found - workspace is clean" -ForegroundColor Green
}