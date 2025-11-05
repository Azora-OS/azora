# AZORA PROPRIETARY LICENSE
# Launch all services using PowerShell

Write-Host "`n🎯 AZORA NEXUS SERVICES LAUNCHER" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host "Launching all 21 services...`n" -ForegroundColor Yellow

$services = @(
    @{name="wallet"; port=4100},
    @{name="blockchain"; port=4101},
    @{name="ai-trading"; port=4102},
    @{name="ai-valuation"; port=4103},
    @{name="backed-valuation"; port=4104},
    @{name="compliance"; port=4105},
    @{name="dashboard"; port=4106},
    @{name="defi"; port=4107},
    @{name="global-adoption"; port=4108},
    @{name="guardian"; port=4109},
    @{name="identity"; port=4110},
    @{name="ledger"; port=4111},
    @{name="liquidity"; port=4112},
    @{name="marketplace"; port=4113},
    @{name="nft"; port=4114},
    @{name="partnerships"; port=4115},
    @{name="reporting"; port=4116},
    @{name="revenue"; port=4117},
    @{name="staking"; port=4118},
    @{name="user-growth"; port=4119},
    @{name="subscription"; port=4129}
)

foreach ($service in $services) {
    $servicePath = Join-Path $PSScriptRoot $service.name
    $indexFile = Join-Path $servicePath "index.js"

    if (Test-Path $indexFile) {
        Write-Host "🚀 Launching $($service.name) on port $($service.port)..." -ForegroundColor Green
        Start-Process -FilePath "node" -ArgumentList "index.js" -WorkingDirectory $servicePath -WindowStyle Minimized -Environment @{
            PORT = $service.port
            NODE_ENV = "development"
        }
        Start-Sleep -Milliseconds 500
    } else {
        Write-Host "⚠️  Skipping $($service.name) - index.js not found" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Launch commands sent! Services starting..." -ForegroundColor Green
Write-Host "`n💡 Check service health at:" -ForegroundColor Cyan
foreach ($service in $services) {
    Write-Host "   http://localhost:$($service.port)/health" -ForegroundColor Gray
}
Write-Host "`n💡 Access API docs at:" -ForegroundColor Cyan
foreach ($service in $services) {
    Write-Host "   http://localhost:$($service.port)/api-docs" -ForegroundColor Gray
}
Write-Host ""

