param(
    [switch]$Force
)

# install-win-build-tools.ps1
# Helper script to install Visual Studio Build Tools (C++ workload) on Windows
# Usage: powershell -ExecutionPolicy Bypass -File scripts\install-win-build-tools.ps1

function Test-CommandAvailable {
    param([string]$Name)
    return (Get-Command $Name -ErrorAction SilentlyContinue) -ne $null
}

function Install-With-Winget {
    Write-Host "Using winget to install Visual Studio 2022 Build Tools..."
    $installArgs = @('install', '--id', 'Microsoft.VisualStudio.2022.BuildTools', '-e', '--accept-package-agreements', '--accept-source-agreements')
    if ($Force) { $installArgs += '--silent' }
    & winget @installArgs
    return $LASTEXITCODE
}

function Install-With-Exe {
    Write-Host "Downloading Visual Studio Build Tools installer..."
    $url = 'https://aka.ms/vs/17/release/vs_BuildTools.exe'
    $tmp = Join-Path $env:TEMP 'vs_BuildTools.exe'
    Invoke-WebRequest -Uri $url -OutFile $tmp -UseBasicParsing
    Write-Host "Running Build Tools installer (quiet)..."
    # Add common MSVC components including Spectre mitigation (if present). If missing, installer will ignore unknown components.
    $installArgs = '--quiet --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 --add Microsoft.VisualStudio.Component.VC.SpectreMitigation --includeRecommended'
    if ($Force) { $installArgs += ' --passive' }
    Start-Process -FilePath $tmp -ArgumentList $arguments -Wait
    return $LASTEXITCODE
}

function Install-With-Choco {
    Write-Host "Using choco (Chocolatey) to install Visual Studio 2022 Build Tools..."
    if (-not (Test-CommandAvailable 'choco')) {
        Write-Warning 'choco is not available on this system.'
        return 4
    }
    $installArgs = @('install', 'visualstudio2019buildtools', '-y')
    # TODO: if you need to install workload explicitly, the package parameters vary by choco package maintained
    $rc = & choco @installArgs
    return $LASTEXITCODE
}

Write-Host "Checking for Visual Studio C++ Build Tools (cl.exe)"
$cl = Get-Command cl.exe -ErrorAction SilentlyContinue
if ($cl) {
    Write-Host "cl.exe already present at $($cl.Path) - Build Tools installed."
    exit 0
}

Write-Host "Visual Studio Build Tools (C++) not found."
if (-not $IsWindows) { Write-Error 'This script is intended to run on Windows'; exit 2 }

if (-not $Force) {
    $answer = Read-Host 'Do you want to install Visual Studio Build Tools (C++) now? (Y/N)'
    if ($answer -ne 'Y' -and $answer -ne 'y') {
        Write-Host 'Aborting installation - Visual Studio Build Tools not installed.'
        exit 1
    }
}

if (Test-CommandAvailable 'winget') {
    $rc = Install-With-Winget
    if ($rc -eq 0) { Write-Host 'winget install completed successfully.'; exit 0 }
    Write-Warning 'winget install failed - falling back to Chocolatey or direct exe installer.'
}

if (Test-CommandAvailable 'choco') {
    $rc = Install-With-Choco
    if ($rc -eq 0) { Write-Host 'choco install completed successfully.'; exit 0 }
    Write-Warning 'choco install failed - falling back to direct exe installer.'
}

$rc = Install-With-Exe
if ($rc -eq 0) { Write-Host 'Installer completed successfully.'; exit 0 }

Write-Error 'Build Tools install failed. Please install manually: https://visualstudio.microsoft.com/downloads/'
exit 3
