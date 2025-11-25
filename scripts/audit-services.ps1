# Service Audit Script
# Generates comprehensive service inventory for Azora ecosystem

$servicesPath = "c:\Users\Azora Sapiens\Documents\azora\services"
$services = @()

Get-ChildItem -Path $servicesPath -Directory | ForEach-Object {
    $serviceName = $_.Name
    $servicePath = $_.FullName
    $pkgPath = Join-Path $servicePath "package.json"
    
    $serviceInfo = [PSCustomObject]@{
        Name           = $serviceName
        Path           = $servicePath
        HasPackageJson = Test-Path $pkgPath
        Port           = $null
        Framework      = "Unknown"
        HasHealthCheck = $false
        HasTests       = $false
        HasDockerfile  = Test-Path (Join-Path $servicePath "Dockerfile")
        Dependencies   = @()
    }
    
    if ($serviceInfo.HasPackageJson) {
        try {
            $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
            
            # Extract port from various possible locations
            if ($pkg.config.port) {
                $serviceInfo.Port = $pkg.config.port
            }
            
            # Detect framework
            if ($pkg.dependencies.express) {
                $serviceInfo.Framework = "Express"
            }
            elseif ($pkg.dependencies."@nestjs/core") {
                $serviceInfo.Framework = "NestJS"
            }
            elseif ($pkg.dependencies.fastify) {
                $serviceInfo.Framework = "Fastify"
            }
            elseif ($pkg.dependencies.koa) {
                $serviceInfo.Framework = "Koa"
            }
            
            # Check for health check script
            if ($pkg.scripts.health) {
                $serviceInfo.HasHealthCheck = $true
            }
            
            # Check for tests
            if ($pkg.scripts.test -and $pkg.scripts.test -ne "echo 'No tests yet'") {
                $serviceInfo.HasTests = $true
            }
            
            # Get key dependencies
            if ($pkg.dependencies) {
                $serviceInfo.Dependencies = @($pkg.dependencies.PSObject.Properties.Name)
            }
        }
        catch {
            Write-Warning "Error parsing package.json for $serviceName : $_"
        }
    }
    
    $services += $serviceInfo
}

# Output results
Write-Host "`n=== SERVICE AUDIT SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total Services: $($services.Count)" -ForegroundColor Green
Write-Host "Services with package.json: $($services.Where({$_.HasPackageJson}).Count)" -ForegroundColor Yellow
Write-Host "Services with health checks: $($services.Where({$_.HasHealthCheck}).Count)" -ForegroundColor Yellow
Write-Host "Services with tests: $($services.Where({$_.HasTests}).Count)" -ForegroundColor Yellow
Write-Host "Services with Dockerfile: $($services.Where({$_.HasDockerfile}).Count)" -ForegroundColor Yellow

# Export to JSON
$outputPath = "c:\Users\Azora Sapiens\Documents\azora\services-audit.json"
$services | ConvertTo-Json -Depth 10 | Out-File $outputPath -Encoding UTF8
Write-Host "`nDetailed audit saved to: $outputPath" -ForegroundColor Green

# Display summary table
Write-Host "`n=== SERVICE DETAILS ===" -ForegroundColor Cyan
$services | Format-Table Name, Port, Framework, HasHealthCheck, HasTests, HasDockerfile -AutoSize
