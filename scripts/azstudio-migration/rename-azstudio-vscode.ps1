Param(
    [switch]$Force
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path (Join-Path $scriptDir "..\..")
Set-StrictMode -Version Latest

$vscodePath = Join-Path $root 'azstudio-vscode'
$destPath = Join-Path $root 'azstudio'

if (-not (Test-Path $vscodePath)) {
    Write-Host "azstudio-vscode path not found: $vscodePath" -ForegroundColor Red
    Exit 1
}

if (Test-Path $destPath -and -not $Force) {
    Write-Host "Destination path already exists: $destPath" -ForegroundColor Red
    Write-Host "Use -Force to overwrite" -ForegroundColor Yellow
    Exit 2
}

if (-not $Force) {
    Write-Host "This will rename 'azstudio-vscode' to 'azstudio'. This may be destructive. Proceed? (Y/N)" -ForegroundColor Yellow
    $answer = Read-Host
    if ($answer -ne 'Y' -and $answer -ne 'y') {
        Write-Host "Cancelled by user" -ForegroundColor Cyan
        Exit 0
    }
}

if (Test-Path $destPath -and $Force) {
    Remove-Item -Path $destPath -Recurse -Force
}

Rename-Item -Path $vscodePath -NewName 'azstudio' -Force
Write-Host "Renamed azstudio-vscode -> azstudio" -ForegroundColor Green
