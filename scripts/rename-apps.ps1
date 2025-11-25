#!/usr/bin/env pwsh
# Azora Product Suite Alignment - App Rename Script
# This script renames apps to match the Product Suite catalog

$ErrorActionPreference = "Stop"

Write-Host "Starting Azora Product Suite Alignment..." -ForegroundColor Cyan
Write-Host ""

# Define rename mappings
$renames = @(
    @{ Old = "azora-marketplace-ui"; New = "azora-jobspaces" },
    @{ Old = "business-incubator"; New = "azora-incubator" },
    @{ Old = "azora-enterprise-ui"; New = "azora-enterprise-suite" },
    @{ Old = "azora-pay-ui"; New = "azora-pay" },
    @{ Old = "finance-ui"; New = "azora-finance" },
    @{ Old = "dev-ui"; New = "azora-dev" },
    @{ Old = "cloud-ui"; New = "azora-cloud" },
    @{ Old = "compliance-ui"; New = "azora-compliance" },
    @{ Old = "investor-portal"; New = "azora-investor-portal" }
)

$appsDir = "c:\Users\Azora Sapiens\Documents\azora\apps"

foreach ($rename in $renames) {
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

Write-Host "Rename phase complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Merge student-portal into azora-sapiens"
Write-Host "  2. Update workspace references"
Write-Host "  3. Run npm install"
