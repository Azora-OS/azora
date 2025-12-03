Param(
    [string]$Root = "$(Resolve-Path ..)"
)

# Safe migration script: copy AzStudio features from `azstudio.old/` into `azstudio/`.
# If `azstudio.old` is not present, will attempt to copy from `azstudio/` to `azstudio/src/vs/workbench/contrib/azstudio` - non-destructive.

Set-StrictMode -Version Latest

$sourceOldRoot = Join-Path $Root 'azstudio.old\src'
$sourceRoot = Join-Path $Root 'azstudio\src'
$destRoot = Join-Path $Root 'azstudio\src\vs\workbench\contrib\azstudio'

if (Test-Path $sourceOldRoot) {
    $sourceRoot = $sourceOldRoot
}

Write-Host "Using source root: $sourceRoot" -ForegroundColor Cyan
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
