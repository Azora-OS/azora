# App Audit Script
# Generates comprehensive app inventory for Azora ecosystem

$appsPath = "c:\Users\Azora Sapiens\Documents\azora\apps"
$apps = @()

Get-ChildItem -Path $appsPath -Directory | ForEach-Object {
    $appName = $_.Name
    $appPath = $_.FullName
    $pkgPath = Join-Path $appPath "package.json"
    
    $appInfo = [PSCustomObject]@{
        Name            = $appName
        Path            = $appPath
        HasPackageJson  = Test-Path $pkgPath
        Framework       = "Unknown"
        Version         = $null
        HasRouting      = $false
        HasDesignSystem = $false
        HasTests        = $false
        Type            = "Unknown"
        Dependencies    = @()
    }
    
    if ($appInfo.HasPackageJson) {
        try {
            $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
            
            # Detect framework and type
            if ($pkg.dependencies.next) {
                $appInfo.Framework = "Next.js"
                $appInfo.Version = $pkg.dependencies.next
                $appInfo.Type = "Web"
            }
            elseif ($pkg.dependencies.react -and $pkg.dependencies."react-dom") {
                if ($pkg.dependencies.vite) {
                    $appInfo.Framework = "React + Vite"
                    $appInfo.Type = "Web"
                }
                else {
                    $appInfo.Framework = "React"
                    $appInfo.Type = "Web"
                }
            }
            elseif ($pkg.dependencies.electron) {
                $appInfo.Framework = "Electron"
                $appInfo.Type = "Desktop"
            }
            elseif ($pkg.dependencies."react-native") {
                $appInfo.Framework = "React Native"
                $appInfo.Type = "Mobile"
            }
            
            # Check for Azora Design System
            if ($pkg.dependencies."@azora/shared-design" -or $pkg.dependencies."@azora/master-ui" -or $pkg.dependencies."@azora/design-system") {
                $appInfo.HasDesignSystem = $true
            }
            
            # Check for routing
            $hasAppDir = Test-Path (Join-Path $appPath "app")
            $hasPagesDir = Test-Path (Join-Path $appPath "pages")
            $hasSrcDir = Test-Path (Join-Path $appPath "src")
            
            if ($hasAppDir -or $hasPagesDir -or $hasSrcDir) {
                $appInfo.HasRouting = $true
            }
            
            # Check for tests
            if ($pkg.scripts.test -and $pkg.scripts.test -ne "echo 'No tests yet'") {
                $appInfo.HasTests = $true
            }
            
            # Get key dependencies
            if ($pkg.dependencies) {
                $appInfo.Dependencies = @($pkg.dependencies.PSObject.Properties.Name)
            }
        }
        catch {
            Write-Warning "Error parsing package.json for $appName : $_"
        }
    }
    
    $apps += $appInfo
}

# Output results
Write-Host "`n=== APP AUDIT SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total Apps: $($apps.Count)" -ForegroundColor Green
Write-Host "Web Apps (Next.js): $($apps.Where({$_.Framework -like 'Next.js*'}).Count)" -ForegroundColor Yellow
Write-Host "Web Apps (React): $($apps.Where({$_.Framework -like 'React*' -and $_.Framework -notlike 'React Native'}).Count)" -ForegroundColor Yellow
Write-Host "Desktop Apps (Electron): $($apps.Where({$_.Framework -eq 'Electron'}).Count)" -ForegroundColor Yellow
Write-Host "Mobile Apps (React Native): $($apps.Where({$_.Framework -eq 'React Native'}).Count)" -ForegroundColor Yellow
Write-Host "Apps with Design System: $($apps.Where({$_.HasDesignSystem}).Count)" -ForegroundColor Yellow
Write-Host "Apps with Tests: $($apps.Where({$_.HasTests}).Count)" -ForegroundColor Yellow

# Export to JSON
$outputPath = "c:\Users\Azora Sapiens\Documents\azora\apps-audit.json"
$apps | ConvertTo-Json -Depth 10 | Out-File $outputPath -Encoding UTF8
Write-Host "`nDetailed audit saved to: $outputPath" -ForegroundColor Green

# Display summary table
Write-Host "`n=== APP DETAILS ===" -ForegroundColor Cyan
$apps | Format-Table Name, Framework, Type, HasDesignSystem, HasRouting, HasTests -AutoSize
