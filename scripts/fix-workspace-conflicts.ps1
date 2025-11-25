#!/usr/bin/env pwsh
# Fix workspace name conflicts by prefixing app names

$ErrorActionPreference = "Stop"

Write-Host "Fixing workspace name conflicts..." -ForegroundColor Cyan
Write-Host ""

$appsDir = "c:\Users\Azora Sapiens\Documents\azora\apps"

# Apps that conflict with services
$conflictingApps = @(
    "azora-classroom",
    "azora-finance",
    "azora-mint",
    "azora-pay",
    "azora-research-center"
)

foreach ($appName in $conflictingApps) {
    $appPath = Join-Path $appsDir $appName
    $packageJsonPath = Join-Path $appPath "package.json"
    
    if (Test-Path $packageJsonPath) {
        Write-Host "Updating $appName..." -ForegroundColor Yellow
        
        $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
        $newName = "$appName-ui"
        $packageJson.name = $newName
        
        $packageJson | ConvertTo-Json -Depth 100 | Set-Content $packageJsonPath
        Write-Host "  Renamed to: $newName" -ForegroundColor Green
    }
}

# Also fix the backup
$backupPath = Join-Path $appsDir "azora-sapiens-backup-20251125-001654"
$backupPackageJson = Join-Path $backupPath "package.json"
if (Test-Path $backupPackageJson) {
    Write-Host "Updating backup..." -ForegroundColor Yellow
    $packageJson = Get-Content $backupPackageJson -Raw | ConvertFrom-Json
    $packageJson.name = "azora-sapiens-backup"
    $packageJson | ConvertTo-Json -Depth 100 | Set-Content $backupPackageJson
    Write-Host "  Renamed backup to: azora-sapiens-backup" -ForegroundColor Green
}

Write-Host ""
Write-Host "Workspace conflicts resolved!" -ForegroundColor Green
Write-Host ""
Write-Host "Updated package names:" -ForegroundColor Cyan
Write-Host "  - azora-classroom-ui (app)" -ForegroundColor Gray
Write-Host "  - azora-finance-ui (app)" -ForegroundColor Gray
Write-Host "  - azora-mint-ui (app)" -ForegroundColor Gray
Write-Host "  - azora-pay-ui (app)" -ForegroundColor Gray
Write-Host "  - azora-research-center-ui (app)" -ForegroundColor Gray
Write-Host ""
Write-Host "Services keep their original names:" -ForegroundColor Cyan
Write-Host "  - azora-classroom (service)" -ForegroundColor Gray
Write-Host "  - azora-finance (service)" -ForegroundColor Gray
Write-Host "  - azora-mint (service)" -ForegroundColor Gray
Write-Host "  - azora-pay (service)" -ForegroundColor Gray
Write-Host "  - azora-research-center (service)" -ForegroundColor Gray
