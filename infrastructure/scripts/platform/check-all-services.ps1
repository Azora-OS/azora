# Azora OS Service Health Check Script
# Checks all services and reports their status

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "AZORA OS - SERVICE HEALTH CHECK" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Define all services
$services = @(
    @{Name="Azora Sapiens"; Port=4200; Path="/health"},
    @{Name="Azora Forge"; Port=12345; Path="/health"},
    @{Name="Azora Covenant"; Port=4099; Path="/health"},
    @{Name="Azora Mint"; Port=4300; Path="/health"},
    @{Name="Azora Aegis"; Port=4000; Path="/health"},
    @{Name="Azora Nexus"; Port=3006; Path="/health"},
    @{Name="Wallet Service"; Port=4100; Path="/health"},
    @{Name="Blockchain Service"; Port=4101; Path="/health"},
    @{Name="AI Trading Service"; Port=4102; Path="/health"},
    @{Name="AI Valuation Service"; Port=4103; Path="/health"},
    @{Name="Backed Valuation Service"; Port=4104; Path="/health"},
    @{Name="Compliance Service"; Port=4105; Path="/health"},
    @{Name="Dashboard Service"; Port=4106; Path="/health"},
    @{Name="DeFi Service"; Port=4107; Path="/health"},
    @{Name="Global Adoption Service"; Port=4108; Path="/health"},
    @{Name="Guardian Service"; Port=4109; Path="/health"},
    @{Name="Identity Service"; Port=4110; Path="/health"},
    @{Name="Ledger Service"; Port=4111; Path="/health"},
    @{Name="Liquidity Service"; Port=4112; Path="/health"},
    @{Name="Marketplace Service"; Port=4113; Path="/health"},
    @{Name="NFT Service"; Port=4114; Path="/health"},
    @{Name="Partnerships Service"; Port=4115; Path="/health"},
    @{Name="Reporting Service"; Port=4116; Path="/health"},
    @{Name="Revenue Service"; Port=4117; Path="/health"},
    @{Name="Staking Service"; Port=4118; Path="/health"},
    @{Name="User Growth Service"; Port=4119; Path="/health"},
    @{Name="Subscription Service"; Port=4129; Path="/health"}
)

$healthyCount = 0
$unhealthyCount = 0
$startingCount = 0

Write-Host "Main Services:" -ForegroundColor Yellow
Write-Host "=============="

foreach ($service in $services[0..5]) {
    $url = "http://localhost:$($service.Port)$($service.Path)"
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name.PadRight(30)) http://localhost:$($service.Port)" -ForegroundColor Green
            $healthyCount++
        }
    } catch {
        $errorMessage = $_.Exception.Message
        if ($errorMessage -match "actively refused") {
            Write-Host "🔴 $($service.Name.PadRight(30)) Not running" -ForegroundColor Red
            $unhealthyCount++
        } else {
            Write-Host "⏳ $($service.Name.PadRight(30)) Starting..." -ForegroundColor Yellow
            $startingCount++
        }
    }
}

Write-Host "`nNexus Microservices:" -ForegroundColor Yellow
Write-Host "===================="

foreach ($service in $services[6..26]) {
    $url = "http://localhost:$($service.Port)$($service.Path)"
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name.PadRight(35)) Port: $($service.Port)" -ForegroundColor Green
            $healthyCount++
        }
    } catch {
        $errorMessage = $_.Exception.Message
        if ($errorMessage -match "actively refused") {
            Write-Host "🔴 $($service.Name.PadRight(35)) Port: $($service.Port) (Not running)" -ForegroundColor Red
            $unhealthyCount++
        } else {
            Write-Host "⏳ $($service.Name.PadRight(35)) Port: $($service.Port) (Starting...)" -ForegroundColor Yellow
            $startingCount++
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Services: $($services.Count)" -ForegroundColor White
Write-Host "✅ Healthy:     $healthyCount" -ForegroundColor Green
Write-Host "⏳ Starting:    $startingCount" -ForegroundColor Yellow
Write-Host "🔴 Down:        $unhealthyCount" -ForegroundColor Red

$percentage = [math]::Round(($healthyCount / $services.Count) * 100, 1)
Write-Host "`nSystem Health:  $percentage%" -ForegroundColor $(if ($percentage -gt 80) {"Green"} elseif ($percentage -gt 50) {"Yellow"} else {"Red"})

if ($healthyCount -eq $services.Count) {
    Write-Host "`n🎉 ALL SYSTEMS OPERATIONAL! 🚀" -ForegroundColor Green
} elseif ($startingCount -gt 0) {
    Write-Host "`n⏳ Services are starting up. Please wait..." -ForegroundColor Yellow
    Write-Host "Run this script again in 30 seconds to check status." -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️  Some services may need attention." -ForegroundColor Yellow
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

