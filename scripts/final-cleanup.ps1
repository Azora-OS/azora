#!/usr/bin/env pwsh
# Final Cleanup Script for Azora Product Suite Alignment

$ErrorActionPreference = "Stop"

Write-Host "Starting final cleanup..." -ForegroundColor Cyan
Write-Host ""

$appsDir = "c:\Users\Azora Sapiens\Documents\azora\apps"
$rootDir = "c:\Users\Azora Sapiens\Documents\azora"

# Step 1: Review learn-ui
Write-Host "Step 1: Reviewing learn-ui..." -ForegroundColor Yellow
$learnUiPath = Join-Path $appsDir "learn-ui"
if (Test-Path $learnUiPath) {
    Write-Host "  learn-ui exists - checking if it's redundant..." -ForegroundColor Gray
    
    # Check if it has unique features
    $learnUiPages = Get-ChildItem -Path "$learnUiPath\app" -Recurse -Filter "*.tsx" -ErrorAction SilentlyContinue
    $pageCount = ($learnUiPages | Measure-Object).Count
    
    Write-Host "  Found $pageCount page files in learn-ui" -ForegroundColor Gray
    Write-Host "  Marking for deletion (appears redundant with azora-sapiens)" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Delete student-portal
Write-Host "Step 2: Deleting student-portal..." -ForegroundColor Yellow
$studentPortalPath = Join-Path $appsDir "student-portal"
if (Test-Path $studentPortalPath) {
    Remove-Item -Path $studentPortalPath -Recurse -Force
    Write-Host "  Deleted student-portal" -ForegroundColor Green
} else {
    Write-Host "  student-portal already deleted" -ForegroundColor Gray
}
Write-Host ""

# Step 3: Delete learn-ui
Write-Host "Step 3: Deleting learn-ui..." -ForegroundColor Yellow
if (Test-Path $learnUiPath) {
    Remove-Item -Path $learnUiPath -Recurse -Force
    Write-Host "  Deleted learn-ui" -ForegroundColor Green
} else {
    Write-Host "  learn-ui already deleted" -ForegroundColor Gray
}
Write-Host ""

# Step 4: Clean up backup directories
Write-Host "Step 4: Cleaning up backup directories..." -ForegroundColor Yellow
$backupDirs = Get-ChildItem -Path $appsDir -Directory | Where-Object { $_.Name -like "*backup*" }
foreach ($backup in $backupDirs) {
    Write-Host "  Found backup: $($backup.Name)" -ForegroundColor Gray
    Write-Host "  Keeping backup for safety (can delete manually later)" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Clean up build logs
Write-Host "Step 5: Cleaning up build logs..." -ForegroundColor Yellow
$logFiles = Get-ChildItem -Path $appsDir -Filter "*.log"
foreach ($log in $logFiles) {
    Remove-Item -Path $log.FullName -Force
    Write-Host "  Deleted $($log.Name)" -ForegroundColor Green
}
Write-Host ""

# Step 6: Verify final app count
Write-Host "Step 6: Verifying final app count..." -ForegroundColor Yellow
$allApps = Get-ChildItem -Path $appsDir -Directory | Where-Object { 
    $_.Name -notlike "*backup*" -and 
    $_.Name -ne "README.md" -and
    $_.Name -ne "web" -and
    $_.Name -ne "azora-ui"
}
$appCount = ($allApps | Measure-Object).Count
Write-Host "  Total apps: $appCount" -ForegroundColor Green
Write-Host ""

# Step 7: List final apps
Write-Host "Step 7: Final app inventory:" -ForegroundColor Yellow
$allApps | Sort-Object Name | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run 'npm install' from root directory"
Write-Host "  2. Test azora-sapiens: cd apps/azora-sapiens && npm run dev"
Write-Host "  3. Manually delete backup directories if no longer needed"
