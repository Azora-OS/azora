#!/usr/bin/env pwsh
# Azora OS - Phase 4 & 5: Local Testing & Deployment Script
# Constitutional AI Operating System

Write-Host "🚀 AZORA OS - LOCAL TESTING & DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$SERVICES = @(
    @{Name = "BuildSpaces API"; Path = "services/buildspaces-api"; Port = 3100; HealthCheck = "/health" },
    @{Name = "Education Service"; Path = "services/azora-education"; Port = 4201; HealthCheck = "/health" },
    @{Name = "AI Family Service"; Path = "services/ai-family-service"; Port = 3006; HealthCheck = "/health" },
    @{Name = "Constitutional AI"; Path = "services/constitutional-ai"; Port = 3009; HealthCheck = "/health" }
)

$APPS = @(
    @{Name = "BuildSpaces"; Path = "apps/azora-buildspaces"; Port = 3002; URL = "http://localhost:3002" },
    @{Name = "Student Portal (Sapiens)"; Path = "apps/azora-sapiens"; Port = 3001; URL = "http://localhost:3001" },
    @{Name = "Azora Mint"; Path = "apps/azora-mint"; Port = 3003; URL = "http://localhost:3003" },
    @{Name = "Azora Pay"; Path = "apps/azora-pay"; Port = 3004; URL = "http://localhost:3004" }
)

# Functions
function Test-ServiceHealth {
    param([string]$Url)
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

function Start-AzoraService {
    param(
        [string]$Name,
        [string]$Path,
        [int]$Port,
        [string]$HealthCheck
    )
    
    Write-Host "📦 Starting $Name..." -ForegroundColor Yellow
    
    # Check if already running
    $healthUrl = "http://localhost:$Port$HealthCheck"
    if (Test-ServiceHealth $healthUrl) {
        Write-Host "   ✅ $Name already running on port $Port" -ForegroundColor Green
        return $true
    }
    
    # Navigate to service directory
    Push-Location $Path
    
    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-Host "   📥 Installing dependencies..." -ForegroundColor Gray
        npm install --silent
    }
    
    # Start service in background
    Write-Host "   🚀 Launching $Name on port $Port..." -ForegroundColor Gray
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden -PassThru | Out-Null
    
    # Wait for health check
    $maxAttempts = 30
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        if (Test-ServiceHealth $healthUrl) {
            Write-Host "   ✅ $Name is healthy!" -ForegroundColor Green
            Pop-Location
            return $true
        }
        $attempt++
        Write-Host "   ⏳ Waiting for $Name to be ready... ($attempt/$maxAttempts)" -ForegroundColor Gray
    }
    
    Write-Host "   ❌ $Name failed to start" -ForegroundColor Red
    Pop-Location
    return $false
}

function Start-AzoraApp {
    param(
        [string]$Name,
        [string]$Path,
        [int]$Port
    )
    
    Write-Host "🎨 Starting $Name..." -ForegroundColor Yellow
    
    # Check if already running
    $healthUrl = "http://localhost:$Port"
    if (Test-ServiceHealth $healthUrl) {
        Write-Host "   ✅ $Name already running on port $Port" -ForegroundColor Green
        return $true
    }
    
    # Navigate to app directory
    Push-Location $Path
    
    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-Host "   📥 Installing dependencies..." -ForegroundColor Gray
        npm install --silent
    }
    
    # Start app in background
    Write-Host "   🚀 Launching $Name on port $Port..." -ForegroundColor Gray
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden -PassThru | Out-Null
    
    # Wait for app to be ready
    $maxAttempts = 30
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        if (Test-ServiceHealth $healthUrl) {
            Write-Host "   ✅ $Name is ready!" -ForegroundColor Green
            Pop-Location
            return $true
        }
        $attempt++
        Write-Host "   ⏳ Waiting for $Name to be ready... ($attempt/$maxAttempts)" -ForegroundColor Gray
    }
    
    Write-Host "   ❌ $Name failed to start" -ForegroundColor Red
    Pop-Location
    return $false
}

function Test-ConstitutionalCompliance {
    Write-Host ""
    Write-Host "🛡️ CONSTITUTIONAL COMPLIANCE CHECK" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    
    $compliance = @{
        "No Mock Protocol"   = $false
        "Ubuntu Philosophy"  = $false
        "Privacy Protection" = $false
        "Transparency"       = $false
    }
    
    # Check for mock data (Article VIII Section 8.3)
    Write-Host "📋 Checking No Mock Protocol..." -ForegroundColor Yellow
    $mockFiles = Get-ChildItem -Path "." -Recurse -Include "*mock*", "*stub*", "*fake*" -File | Where-Object { $_.Extension -eq ".ts" -or $_.Extension -eq ".tsx" -or $_.Extension -eq ".js" }
    if ($mockFiles.Count -eq 0) {
        Write-Host "   ✅ No mock files detected" -ForegroundColor Green
        $compliance["No Mock Protocol"] = $true
    }
    else {
        Write-Host "   ❌ Found $($mockFiles.Count) mock files - CONSTITUTIONAL VIOLATION" -ForegroundColor Red
        $mockFiles | ForEach-Object { Write-Host "      - $($_.FullName)" -ForegroundColor Gray }
    }
    
    # Check for Ubuntu Philosophy display
    Write-Host "📋 Checking Ubuntu Philosophy visibility..." -ForegroundColor Yellow
    $ubuntuFiles = Get-ChildItem -Path "apps" -Recurse -Include "*.tsx" -File | Select-String -Pattern "Ubuntu|Ngiyakwazi|I can because we can" -SimpleMatch
    if ($ubuntuFiles.Count -gt 10) {
        Write-Host "   ✅ Ubuntu Philosophy found in $($ubuntuFiles.Count) files" -ForegroundColor Green
        $compliance["Ubuntu Philosophy"] = $true
    }
    else {
        Write-Host "   ⚠️  Ubuntu Philosophy not prominently displayed" -ForegroundColor Yellow
    }
    
    # Calculate overall score
    $score = ($compliance.Values | Where-Object { $_ -eq $true }).Count / $compliance.Count * 100
    
    Write-Host ""
    Write-Host "📊 COMPLIANCE SCORE: $([math]::Round($score, 2))%" -ForegroundColor $(if ($score -ge 95) { "Green" } elseif ($score -ge 70) { "Yellow" } else { "Red" })
    Write-Host "   Target: 95%+" -ForegroundColor Gray
    Write-Host ""
    
    return $score -ge 95
}

# Main Execution
Write-Host "🔧 Phase 4: Local Testing" -ForegroundColor Magenta
Write-Host ""

# Step 1: Start Backend Services
Write-Host "STEP 1: Starting Backend Services" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$servicesHealthy = $true
foreach ($service in $SERVICES) {
    $result = Start-AzoraService -Name $service.Name -Path $service.Path -Port $service.Port -HealthCheck $service.HealthCheck
    if (-not $result) {
        $servicesHealthy = $false
    }
    Write-Host ""
}

if (-not $servicesHealthy) {
    Write-Host "❌ Some services failed to start. Please check logs." -ForegroundColor Red
    exit 1
}

# Step 2: Start Frontend Apps
Write-Host "STEP 2: Starting Frontend Applications" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$appsHealthy = $true
foreach ($app in $APPS) {
    $result = Start-AzoraApp -Name $app.Name -Path $app.Path -Port $app.Port
    if (-not $result) {
        $appsHealthy = $false
    }
    Write-Host ""
}

if (-not $appsHealthy) {
    Write-Host "❌ Some apps failed to start. Please check logs." -ForegroundColor Red
    exit 1
}

# Step 3: Constitutional Compliance Check
$isCompliant = Test-ConstitutionalCompliance

# Step 4: Display Summary
Write-Host ""
Write-Host "✅ AZORA OS IS RUNNING!" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Cyan
foreach ($app in $APPS) {
    Write-Host "   • $($app.Name): $($app.URL)" -ForegroundColor White
}
Write-Host ""
Write-Host "🔧 Backend Services:" -ForegroundColor Cyan
foreach ($service in $SERVICES) {
    Write-Host "   • $($service.Name): http://localhost:$($service.Port)" -ForegroundColor White
}
Write-Host ""

if ($isCompliant) {
    Write-Host "🛡️ Constitutional Compliance: PASSED ✅" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Constitutional Compliance: NEEDS ATTENTION" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test BuildSpaces Code Chamber with real-time collaboration" -ForegroundColor White
Write-Host "   2. Test Student Portal enrollment and course access" -ForegroundColor White
Write-Host "   3. Verify Ubuntu Services integration" -ForegroundColor White
Write-Host "   4. Run constitutional compliance audit" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop all services: Ctrl+C or close terminal windows" -ForegroundColor Gray
Write-Host ""
Write-Host "\"Ngiyakwazi ngoba sikwazi\" - \"I can because we can\"" -ForegroundColor Magenta
