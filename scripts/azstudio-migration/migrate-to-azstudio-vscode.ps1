# Deprecated migration script
# This script `migrate-to-azstudio-vscode.ps1` is deprecated. The repo renamed `azstudio-vscode` to `azstudio`.
# Use `migrate-to-azstudio.ps1` instead. This script remains for compatibility but will call the new script.

Param(
    [string]$Root = "$(Resolve-Path ..)"
)

Write-Host "WARNING: `migrate-to-azstudio-vscode.ps1` is deprecated. Use `migrate-to-azstudio.ps1` instead." -ForegroundColor Yellow
Write-Host "Invoking new migration script..." -ForegroundColor Yellow

PowerShell -ExecutionPolicy Bypass -File (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) 'migrate-to-azstudio.ps1') -Root $Root
Exit $LASTEXITCODE

Set-StrictMode -Version Latest

$sourceRoot = Join-Path $Root 'azstudio\src'
$destRoot = Join-Path $Root 'azstudio-vscode\src\vs\workbench\contrib\azstudio'

Write-Host "Source Root: $sourceRoot" -ForegroundColor Cyan
Write-Host "Destination Root: $destRoot" -ForegroundColor Cyan

function Ensure-Dir([string]$dir) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }
}

Ensure-Dir $destRoot

Write-Host "Copying main services..." -ForegroundColor Green
$servicesSource = Join-Path $sourceRoot 'main\services'
$servicesDest = Join-Path $destRoot 'mainServices'
Ensure-Dir $servicesDest

Get-ChildItem -Path $servicesSource -File -Recurse | ForEach-Object {
    $rel = $_.FullName.Substring($servicesSource.Length).TrimStart('\')
    $dest = Join-Path $servicesDest $rel
    $destDir = Split-Path $dest -Parent
    Ensure-Dir $destDir
    Copy-Item -Path $_.FullName -Destination $dest -Force
    Write-Host "Copied: $rel" -ForegroundColor Gray
}

Write-Host "Copying renderer UI..." -ForegroundColor Green
$rendererSource = Join-Path $sourceRoot 'renderer'
$rendererDest = Join-Path $destRoot 'browser'
Ensure-Dir $rendererDest

Get-ChildItem -Path $rendererSource -File -Recurse | ForEach-Object {
    $rel = $_.FullName.Substring($rendererSource.Length).TrimStart('\')
    $dest = Join-Path $rendererDest $rel
    $destDir = Split-Path $dest -Parent
    Ensure-Dir $destDir
    Copy-Item -Path $_.FullName -Destination $dest -Force
    Write-Host "Copied: $rel" -ForegroundColor Gray
}

Write-Host "Migration complete. Please review the change list and update imports/dependencies as required." -ForegroundColor Yellow
