$services = @(
    # Phase 1: Critical Services
    "services/kyc-aml-service",
    "services/tamper-proof-data-service",
    "services/governance-service",

    # Phase 2: Financial Services
    "services/subscription",
    "services/lending-service",
    "services/enterprise",

    # Phase 6: Missing Critical Components
    "services/constitutional-court-service",
    "services/ubuntu-tokenomics",
    "services/constitutional-ai",
    
    # Previously Remediated
    "services/citadel-fund",
    "services/azora-mint",
    "services/azora-pay"
)

$criticalFiles = @(
    "package.json",
    "prisma/schema.prisma",
    ".env.example"
)

$report = @()
$allPassed = $true

Write-Host "`n🔍 STARTING FINAL SYSTEM AUDIT..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

foreach ($service in $services) {
    $serviceName = $service -replace "services/", ""
    Write-Host "`nChecking $serviceName..." -ForegroundColor Yellow
    $servicePath = "c:\Users\Azora Sapiens\Documents\azora\$service"
    
    if (-not (Test-Path $servicePath)) {
        Write-Host "  ❌ Service directory not found!" -ForegroundColor Red
        $report += [PSCustomObject]@{ Service = $serviceName; Status = "MISSING"; Details = "Directory not found" }
        $allPassed = $false
        continue
    }

    $missingFiles = @()
    foreach ($file in $criticalFiles) {
        $filePath = Join-Path $servicePath $file
        if (-not (Test-Path $filePath)) {
            $missingFiles += $file
        }
    }

    # Check for entry point (src/server.ts, src/index.ts, or similar)
    $hasEntryPoint = (Test-Path "$servicePath/src/server.ts") -or 
    (Test-Path "$servicePath/src/index.ts") -or 
    (Test-Path "$servicePath/server.ts") -or
    (Test-Path "$servicePath/server.js") -or
    (Test-Path "$servicePath/index.ts")

    if (-not $hasEntryPoint) {
        $missingFiles += "Entry Point (server.ts/index.ts)"
    }

    if ($missingFiles.Count -eq 0) {
        Write-Host "  ✅ All critical files present" -ForegroundColor Green
        $report += [PSCustomObject]@{ Service = $serviceName; Status = "PASS"; Details = "Ready" }
    }
    else {
        Write-Host "  ❌ Missing files: $($missingFiles -join ', ')" -ForegroundColor Red
        $report += [PSCustomObject]@{ Service = $serviceName; Status = "FAIL"; Details = "Missing: $($missingFiles -join ', ')" }
        $allPassed = $false
    }
}

Write-Host "`n📊 AUDIT SUMMARY" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
$report | Format-Table -AutoSize

if ($allPassed) {
    Write-Host "`n✅ SYSTEM READY FOR DEPLOYMENT" -ForegroundColor Green
    Write-Host "All critical services have been verified." -ForegroundColor Gray
}
else {
    Write-Host "`n❌ SYSTEM AUDIT FAILED" -ForegroundColor Red
    Write-Host "Please fix the missing components listed above." -ForegroundColor Gray
}
