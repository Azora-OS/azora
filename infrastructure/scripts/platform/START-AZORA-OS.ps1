# ╔════════════════════════════════════════════════════════════╗
# ║                                                            ║
# ║  🚀 AZORA OS - COMPLETE SYSTEM LAUNCHER 🚀                ║
# ║                                                            ║
# ║  🎉 LAUNCH SPECIAL: 1 Month FREE + 50% OFF Next 2!        ║
# ║                                                            ║
# ╚════════════════════════════════════════════════════════════╝

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║  🚀 STARTING AZORA OS - LAUNCH READY! 🚀                  ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║  🎉 LAUNCH SPECIAL: 1 Month FREE + 50% OFF Next 2!        ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$serviceProcesses = @()
$startTime = Get-Date

function Start-AzoraService {
    param(
        [string]$ServiceName,
        [string]$ServicePath,
        [string]$Command,
        [int]$Port,
        [string]$Description
    )
    
    Write-Host "Starting $ServiceName..." -ForegroundColor Yellow
    
    if (Test-Path $ServicePath) {
        Push-Location $ServicePath
        
        # Check if node_modules exists, if not, install dependencies
        if (-not (Test-Path "node_modules")) {
            Write-Host "  📦 Installing dependencies for $ServiceName..." -ForegroundColor Gray
            npm install --silent 2>&1 | Out-Null
        }
        
        # Build TypeScript if needed
        if (Test-Path "tsconfig.json" -and Test-Path "src") {
            Write-Host "  🔨 Building TypeScript for $ServiceName..." -ForegroundColor Gray
            npm run build 2>&1 | Out-Null
        }
        
        # Start the service in background
        $logPath = "$env:TEMP\azora-$ServiceName"
        $process = Start-Process -FilePath "node" -ArgumentList $Command -NoNewWindow -PassThru -RedirectStandardOutput "$logPath-out.log" -RedirectStandardError "$logPath-err.log"
        
        if ($process) {
            $script:serviceProcesses += @{
                Name = $ServiceName
                Process = $process
                Port = $Port
                Description = $Description
            }
            Write-Host "  ✅ $ServiceName started (Port: $Port, PID: $($process.Id))" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Failed to start $ServiceName" -ForegroundColor Red
        }
        
        Pop-Location
        Start-Sleep -Milliseconds 1000
    } else {
        Write-Host "  ⚠️  $ServiceName not found at: $ServicePath" -ForegroundColor DarkYellow
    }
}

# Change to azora-os directory
Push-Location $PSScriptRoot

Write-Host ""
Write-Host "🔧 LAUNCHING CORE SERVICES..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Start Azora Mint (Economic Engine)
Start-AzoraService -ServiceName "azora-mint" -ServicePath ".\azora-mint" -Command "dist\index.js" -Port 3000 -Description "Economic Engine & DeFi Protocol"

# Start Azora Covenant (Blockchain)
Start-AzoraService -ServiceName "azora-covenant" -ServicePath ".\azora-covenant" -Command "index.js" -Port 3001 -Description "Blockchain & Smart Contracts"

# Start Azora Forge (Marketplace)
Start-AzoraService -ServiceName "azora-forge" -ServicePath ".\azora-forge" -Command "dist\index.js" -Port 3002 -Description "P2P Marketplace"

# Start Azora Aegis (Security)
Start-AzoraService -ServiceName "azora-aegis" -ServicePath ".\azora-aegis" -Command "citadel.js" -Port 3003 -Description "Security & Citadel"

# Start Azora Oracle (Data Oracle)
Start-AzoraService -ServiceName "azora-oracle" -ServicePath ".\azora-oracle" -Command "index.js" -Port 3004 -Description "Data Oracle Service"

# Start Azora Sapiens (Education)
Start-AzoraService -ServiceName "azora-sapiens" -ServicePath ".\azora-sapiens" -Command "sapiens-service.js" -Port 3005 -Description "Universal Education Platform"

# Start Azora Nexus (AI Hub)
Start-AzoraService -ServiceName "azora-nexus" -ServicePath ".\azora-nexus" -Command "dist\index.js" -Port 3006 -Description "AI Recommendations Hub"

Write-Host ""
Write-Host "🎨 LAUNCHING FRONTEND SERVICES..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check if main frontend needs to be started
if (Test-Path "package.json") {
    Write-Host "Starting Azora Synapse (Main Frontend)..." -ForegroundColor Yellow
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "  📦 Installing frontend dependencies..." -ForegroundColor Gray
        npm install 2>&1 | Out-Null
    }
    
    # Build if needed
    if (-not (Test-Path ".next") -and (Test-Path "tsconfig.json")) {
        Write-Host "  🔨 Building frontend..." -ForegroundColor Gray
        npm run build 2>&1 | Out-Null
    }
    
    Write-Host "  🚀 Starting Next.js frontend..." -ForegroundColor Gray
    $frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru -RedirectStandardOutput "$env:TEMP\azora-frontend-out.log" -RedirectStandardError "$env:TEMP\azora-frontend-err.log"
    
    if ($frontendProcess) {
        $script:serviceProcesses += @{
            Name = "azora-synapse"
            Process = $frontendProcess
            Port = 3000
            Description = "Main Frontend (Next.js)"
        }
        Write-Host "  ✅ Azora Synapse started (Port: 3000, PID: $($frontendProcess.Id))" -ForegroundColor Green
    }
}

Pop-Location

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$elapsedTime = (Get-Date) - $startTime
Write-Host "⏱️  Startup completed in $([math]::Round($elapsedTime.TotalSeconds, 2)) seconds" -ForegroundColor Cyan
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ AZORA OS IS NOW LIVE! ✅                              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 LAUNCH SPECIAL:" -ForegroundColor Yellow
Write-Host "  • 1 Month FREE Trial" -ForegroundColor White
Write-Host "  • 50% OFF Next 2 Months" -ForegroundColor White
Write-Host "  • All Premium Features" -ForegroundColor White
Write-Host "  • 100 AZR Coin Bonus" -ForegroundColor White
Write-Host ""

Write-Host "📊 RUNNING SERVICES:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
foreach ($service in $serviceProcesses) {
    $status = if ($service.Process.HasExited) { "❌ STOPPED" } else { "✅ RUNNING" }
    Write-Host "  $status $($service.Name) - Port $($service.Port) - $($service.Description)" -ForegroundColor $(if ($service.Process.HasExited) { "Red" } else { "Green" })
}
Write-Host ""

Write-Host "🌐 ACCESS POINTS:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  • Main Frontend:     http://localhost:3000" -ForegroundColor White
Write-Host "  • Azora Mint:        http://localhost:3000/api/mint" -ForegroundColor White
Write-Host "  • Azora Covenant:    http://localhost:3001/api" -ForegroundColor White
Write-Host "  • Azora Forge:       http://localhost:3002/api" -ForegroundColor White
Write-Host "  • Azora Aegis:       http://localhost:3003/api" -ForegroundColor White
Write-Host "  • Azora Oracle:      http://localhost:3004/api" -ForegroundColor White
Write-Host "  • Azora Sapiens:     http://localhost:3005/api" -ForegroundColor White
Write-Host "  • Azora Nexus:       http://localhost:3006/api" -ForegroundColor White
Write-Host ""

Write-Host "🎫 SPECIAL PROMO CODES:" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "  • SIZWE2025  - Founder 1 Year FREE (sizwe.ngwenya@azora.world)" -ForegroundColor White
Write-Host "  • LAUNCH50   - 50% off 3 months" -ForegroundColor White
Write-Host "  • EARLYBIRD  - 75% off first month" -ForegroundColor White
Write-Host "  • AFRICA25   - 25% off 6 months (Africa)" -ForegroundColor White
Write-Host ""

Write-Host "📞 CONTACT:" -ForegroundColor Cyan
Write-Host "  • Email: sizwe.ngwenya@azora.world" -ForegroundColor White
Write-Host "  • Phone: +27 73 234 7232" -ForegroundColor White
Write-Host ""

Write-Host "📝 LOGS LOCATION:" -ForegroundColor Cyan
Write-Host "  • $env:TEMP\azora-*.log" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  To stop all services, close this window or press Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Keep script running and monitor services
Write-Host "🔍 Monitoring services... (Press Ctrl+C to stop all services)" -ForegroundColor Cyan
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 30
        
        $stoppedServices = $serviceProcesses | Where-Object { $_.Process.HasExited }
        if ($stoppedServices) {
            foreach ($service in $stoppedServices) {
                Write-Host "⚠️  Warning: $($service.Name) has stopped unexpectedly!" -ForegroundColor Red
                Write-Host "   Check logs at: $env:TEMP\azora-$($service.Name)-err.log" -ForegroundColor Yellow
            }
        }
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Shutting down all Azora services..." -ForegroundColor Yellow
    foreach ($service in $serviceProcesses) {
        if (-not $service.Process.HasExited) {
            Write-Host "  Stopping $($service.Name)..." -ForegroundColor Gray
            Stop-Process -Id $service.Process.Id -Force -ErrorAction SilentlyContinue
        }
    }
    Write-Host "✅ All services stopped. Goodbye!" -ForegroundColor Green
}

