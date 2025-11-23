#!/usr/bin/env pwsh
# Deploy all working Next.js apps to Vercel

$workingApps = @(
    "azora-marketplace-ui",
    "azora-enterprise-ui",
    "master-ui",
    "learn-ui",
    "cloud-ui",
    "compliance-ui",
    "dev-ui"
)

$failedApps = @()
$successfulApps = @()

Write-Host "Starting deployment of all working apps..." -ForegroundColor Cyan

foreach ($app in $workingApps) {
    $appPath = "apps\$app"
    
    if (Test-Path $appPath) {
        Write-Host "`nDeploying $app..." -ForegroundColor Yellow
        
        Push-Location $appPath
        
        # Deploy to Vercel
        $output = npx vercel --prod 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $app deployed successfully!" -ForegroundColor Green
            $successfulApps += $app
        } else {
            Write-Host "❌ $app deployment failed" -ForegroundColor Red
            $failedApps += $app
        }
        
        Pop-Location
    } else {
        Write-Host "⚠️  $app directory not found, skipping..." -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Successful: $($successfulApps.Count)" -ForegroundColor Green
$successfulApps | ForEach-Object { Write-Host "  ✅ $_" -ForegroundColor Green }

if ($failedApps.Count -gt 0) {
    Write-Host "`nFailed: $($failedApps.Count)" -ForegroundColor Red
    $failedApps | ForEach-Object { Write-Host "  ❌ $_" -ForegroundColor Red }
}

Write-Host "`nNote: azora-student-portal and azora-pay-ui skipped due to React errors" -ForegroundColor Yellow
