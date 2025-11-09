# Simple package installer for Azora OS
# Focus on critical services first

Write-Host "🚀 Installing packages for critical Azora OS services..." -ForegroundColor Cyan

# Critical services that need OAuth functionality
$criticalServices = @(
    "auth-service",
    "api-gateway",
    "student-portal"
)

foreach ($service in $criticalServices) {
    $servicePath = "services\$service"
    if (Test-Path $servicePath) {
        Write-Host "📦 Installing packages for $service..." -ForegroundColor Blue
        try {
            Push-Location $servicePath
            npm install
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Successfully installed packages for $service" -ForegroundColor Green
            } else {
                Write-Host "❌ Failed to install packages for $service" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "❌ Error installing packages for $service`: $($_.Exception.Message)" -ForegroundColor Red
        }
        finally {
            Pop-Location
        }
    } else {
        Write-Host "⚠️  Service $service not found" -ForegroundColor Yellow
    }
}

Write-Host "🎉 Critical service package installation completed!" -ForegroundColor Green