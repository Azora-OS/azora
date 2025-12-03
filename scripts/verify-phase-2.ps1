$services = @(
    "services/subscription",
    "services/lending-service",
    "services/enterprise"
)

$criticalFiles = @(
    "prisma/schema.prisma",
    "package.json",
    ".env.example"
)

$allPassed = $true

Write-Host "🔍 Verifying Phase 2 Services..." -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "`nChecking $service..." -ForegroundColor Yellow
    $servicePath = "c:\Users\Azora Sapiens\Documents\azora\$service"
    
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

    # Check repository file (paths vary slightly)
    $repoFile = switch ($service) {
        "services/subscription" { "src/subscription-repository.ts" }
        "services/lending-service" { "src/lending-repository.ts" }
        "services/enterprise" { "src/enterprise-repository.ts" }
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
    Write-Host "`n✅ PHASE 2 VERIFICATION SUCCESSFUL: All critical files present." -ForegroundColor Green
}
else {
    Write-Host "`n❌ PHASE 2 VERIFICATION FAILED: Missing critical files." -ForegroundColor Red
}
