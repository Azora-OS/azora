Param(
    [switch]$Force
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path (Join-Path $scriptDir "..\..")
Set-StrictMode -Version Latest
$azstudioPath = Join-Path $root 'azstudio'
$archivePath = Join-Path $root 'azstudio.old'

if (-not (Test-Path $azstudioPath)) {
    Write-Host "azstudio path not found: $azstudioPath" -ForegroundColor Red
    Exit 1
}

if (Test-Path $archivePath -and -not $Force) {
    Write-Host "Archive path already exists: $archivePath" -ForegroundColor Red
    Write-Host "Use -Force to overwrite" -ForegroundColor Yellow
    Exit 2
}

if (-not $Force) {
    Write-Host "This will rename 'azstudio' to 'azstudio.old'. This is destructive. Proceed? (Y/N)" -ForegroundColor Yellow
    $answer = Read-Host
    if ($answer -ne 'Y' -and $answer -ne 'y') {
        Write-Host "Cancelled by user" -ForegroundColor Cyan
        Exit 0
    }
}

if (Test-Path $archivePath -and $Force) {
    Remove-Item -Path $archivePath -Recurse -Force
}

Rename-Item -Path $azstudioPath -NewName 'azstudio.old' -Force
Write-Host "Renamed azstudio -> azstudio.old" -ForegroundColor Green
