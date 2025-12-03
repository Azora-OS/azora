$services = @(
    "services/constitutional-court-service",
    "services/ubuntu-tokenomics",
    "services/constitutional-ai"
)

$criticalFiles = @(
    "prisma/schema.prisma",
    "package.json"
)

$allPassed = $true

Write-Host "🔍 Verifying Phase 6 Services..." -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "`nChecking $service..." -ForegroundColor Yellow
    $servicePath = "c:\Users\Azora Sapiens\Documents\azora\$service"
    
    foreach ($file in $criticalFiles) {
        $filePath = Join-Path $servicePath $file
        if (Test-Path $filePath) {
            Write-Host "  ✅ Found $file" -ForegroundColor Green
        }
        else {
            Write-Host "  ❌ Missing $file" -ForegroundColor Red
            $allPassed = $false
        }
    }
}

if ($allPassed) {
    Write-Host "`n✅ PHASE 6 VERIFICATION SUCCESSFUL: All critical files present." -ForegroundColor Green
}
else {
    Write-Host "`n❌ PHASE 6 VERIFICATION FAILED: Missing critical files." -ForegroundColor Red
}
