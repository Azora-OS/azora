# Service Status Checker
Write-Host "`n🔍 AZORA OS SERVICE STATUS CHECK`n" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

# Main Services
Write-Host "`n📦 MAIN SERVICES:" -ForegroundColor Yellow
$mainServices = @(
    @{name="Sapiens"; port=4200},
    @{name="Forge"; port=12345},
    @{name="Covenant"; port=4099},
    @{name="Mint"; port=4300},
    @{name="Aegis"; port=4000},
    @{name="Nexus"; port=3006}
)

$mainRunning = 0
foreach ($svc in $mainServices) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($svc.port)/health" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "  ✅ $($svc.name.padRight(12)) Port $($svc.port) - HEALTHY" -ForegroundColor Green
        $mainRunning++
    } catch {
        Write-Host "  ⏳ $($svc.name.padRight(12)) Port $($svc.port) - Starting..." -ForegroundColor Yellow
    }
}

# Nexus Sub-Services
Write-Host "`n📦 NEXUS SUB-SERVICES:" -ForegroundColor Yellow
$nexusRunning = 0
for ($port = 4100; $port -le 4119; $port++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port/health" -TimeoutSec 1 -ErrorAction Stop
        Write-Host "  ✅ Port $port - HEALTHY" -ForegroundColor Green
        $nexusRunning++
    } catch {
        Write-Host "  ⏳ Port $port - Starting..." -ForegroundColor Yellow
    }
}

# Subscription service (port 4129)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4129/health" -TimeoutSec 1 -ErrorAction Stop
    Write-Host "  ✅ Port 4129 - HEALTHY" -ForegroundColor Green
    $nexusRunning++
} catch {
    Write-Host "  ⏳ Port 4129 - Starting..." -ForegroundColor Yellow
}

# Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 SUMMARY:" -ForegroundColor Cyan
Write-Host "  Main Services:     $mainRunning/6 running" -ForegroundColor $(if ($mainRunning -eq 6) { "Green" } else { "Yellow" })
Write-Host "  Nexus Services:    $nexusRunning/21 running" -ForegroundColor $(if ($nexusRunning -eq 21) { "Green" } else { "Yellow" })
Write-Host "  Total:             $($mainRunning + $nexusRunning)/27 services" -ForegroundColor Cyan
Write-Host ""

# Show Node processes
Write-Host "🔄 ACTIVE NODE PROCESSES:" -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Format-Table Id, StartTime, @{Name="CPU(s)";Expression={$_.CPU}}, @{Name="Memory(MB)";Expression={[math]::Round($_.WS/1MB,2)}} -AutoSize

Write-Host ""

