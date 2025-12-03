#!/usr/bin/env pwsh
# Rename mobile apps to match Product Suite catalog

$ErrorActionPreference = "Stop"

Write-Host "Renaming mobile apps..." -ForegroundColor Cyan
Write-Host ""

$appsDir = "c:\Users\Azora Sapiens\Documents\azora\apps"

# Define mobile app renames
$mobileRenames = @(
    @{ Old = "student-portal-mobile"; New = "azora-sapiens-mobile" },
    @{ Old = "enterprise-mobile"; New = "azora-enterprise-suite-mobile" }
)

foreach ($rename in $mobileRenames) {
    $oldPath = Join-Path $appsDir $rename.Old
    $newPath = Join-Path $appsDir $rename.New
    
    if (Test-Path $oldPath) {
        Write-Host "Renaming: $($rename.Old) to $($rename.New)" -ForegroundColor Yellow
        
        # Rename directory
        Rename-Item -Path $oldPath -NewName $rename.New -Force
        
        # Update package.json name
        $packageJsonPath = Join-Path $newPath "package.json"
        if (Test-Path $packageJsonPath) {
            $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
            $packageJson.name = $rename.New
            $packageJson | ConvertTo-Json -Depth 100 | Set-Content $packageJsonPath
            Write-Host "  Updated package.json" -ForegroundColor Green
        }
        
        Write-Host ""
    } else {
        Write-Host "Skipping: $($rename.Old) (not found)" -ForegroundColor Gray
    }
}

Write-Host "Mobile app renames complete!" -ForegroundColor Green
