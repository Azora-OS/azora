$services = @(
    "kyc-aml-service",
    "tamper-proof-data-service",
    "governance-service"
)

$criticalFiles = @(
    "prisma/schema.prisma",
    "src/server.ts",
    "package.json",
    ".env.example"
)

$allPassed = $true

Write-Host "🔍 Verifying Phase 1 Services..." -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "`nChecking $service..." -ForegroundColor Yellow
    $servicePath = "c:\Users\Azora Sapiens\Documents\azora\services\$service"
    
    # Check critical files
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

    # Check repository file (name varies)
    $repoFile = switch ($service) {
        "kyc-aml-service" { "src/kyc-repository.ts" }
        "tamper-proof-data-service" { "src/tamper-proof-repository.ts" }
        "governance-service" { "src/governance-repository.ts" }
    }
    
    $repoPath = Join-Path $servicePath $repoFile
    if (Test-Path $repoPath) {
        Write-Host "  ✅ Found repository layer: $repoFile" -ForegroundColor Green
    }
    else {
        Write-Host "  ❌ Missing repository layer: $repoFile" -ForegroundColor Red
        $allPassed = $false
    }
}

if ($allPassed) {
    Write-Host "`n✅ PHASE 1 VERIFICATION SUCCESSFUL: All critical files present." -ForegroundColor Green
}
else {
    Write-Host "`n❌ PHASE 1 VERIFICATION FAILED: Missing critical files." -ForegroundColor Red
}
