param()

# install-azstudio-build-deps.ps1
# Installs build-only dependencies required by the AzStudio build (e.g., @vscode/vsce in build/)

function Run-NpmCi($path) {
    Write-Host "Running npm ci in $path..."
    Push-Location $path
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    # On Windows, prefer npm.cmd (ship with Node installer) to ensure we can start it properly.
    if (Test-Path "$env:ProgramFiles\nodejs\npm.cmd") { $psi.FileName = "$env:ProgramFiles\nodejs\npm.cmd" }
    elseif (Test-Path "$env:ProgramFiles(x86)\nodejs\npm.cmd") { $psi.FileName = "$env:ProgramFiles(x86)\nodejs\npm.cmd" }
    else { $psi.FileName = 'npm.cmd' }
    $psi.Arguments = 'ci'
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false
    $proc = [System.Diagnostics.Process]::Start($psi)
    $stdout = $proc.StandardOutput.ReadToEnd()
    $stderr = $proc.StandardError.ReadToEnd()
    $proc.WaitForExit()
    $code = $proc.ExitCode
    Write-Host $stdout
    if ($stderr) { Write-Error $stderr }
    Pop-Location
    return $code
}

Write-Host "Installing AzStudio build dependencies..."

# Resolve paths relative to the script directory. This script is meant to be run from the repo root but will work from anywhere.
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir ".."))
$azstudioBuild = Join-Path $repoRoot "azstudio\build"

if (-not (Test-Path $azstudioBuild)) {
    Write-Error "Could not find azstudio/build at $azstudioBuild. Are you running this from the repository root?"
    exit 1
}

$rc = Run-NpmCi $azstudioBuild
if ($rc -ne 0) { Write-Error "npm ci in build/ failed with exit code $rc"; exit $rc }

if (Test-Path "dev-runner") {
    $rc = Run-NpmCi "dev-runner"
    if ($rc -ne 0) { Write-Warning "npm ci in dev-runner failed with exit code $rc" }
}

Write-Host "Completed installing build dependencies."
exit 0
