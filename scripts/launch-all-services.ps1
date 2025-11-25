# Azora Service Launcher (PowerShell)
# Launches all 58 services in the correct order

Write-Host "🚀 Launching Azora Ecosystem..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Infrastructure services first
Write-Host "📡 Starting Infrastructure Services..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\azora-api-gateway"
Start-Sleep -Seconds 2
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\health-monitor"
Start-Sleep -Seconds 2

# Core services
Write-Host "🔐 Starting Core Services..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\azora-auth"
Start-Sleep -Seconds 2

# AI services
Write-Host "🤖 Starting AI Services..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\ai-orchestrator"
Start-Sleep -Seconds 2
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\constitutional-ai"
Start-Sleep -Seconds 2

# Blockchain services
Write-Host "⛓️ Starting Blockchain Services..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\azora-mint"
Start-Sleep -Seconds 2
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\azora-ledger"
Start-Sleep -Seconds 2

# Payment services
Write-Host "💰 Starting Payment Services..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\azora-pay"
Start-Sleep -Seconds 2

# Education services
Write-Host "📚 Starting Education Services..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\azora-education"
Start-Sleep -Seconds 2
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\azora-sapiens"
Start-Sleep -Seconds 2

# Antifragile services
Write-Host "🔥 Starting Antifragile Services..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\chaos-monkey"
Start-Sleep -Seconds 2
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\phoenix-server"
Start-Sleep -Seconds 2

Write-Host "✅ All services launched!" -ForegroundColor Green
Write-Host "🌐 API Gateway: http://localhost:4000" -ForegroundColor Yellow
Write-Host "🔍 Health Monitor: http://localhost:3030" -ForegroundColor Yellow
Write-Host "🐵 ChaosMonkey: http://localhost:3050" -ForegroundColor Yellow
Write-Host "🔥 PhoenixServer: http://localhost:3051" -ForegroundColor Yellow
