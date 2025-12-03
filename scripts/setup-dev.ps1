<#
setup-dev.ps1
Cross-platform developer environment setup for AzStudio repo (Windows-specific version) 

Usage (Developer machine):
  powershell -ExecutionPolicy Bypass -File scripts\setup-dev.ps1 [-InstallBuildTools] [-Bootstrap] [-Compile] [-RunTests]

Flags:
  -InstallBuildTools  - Attempt to install Visual Studio Build Tools (non-interactive if `--Force` provided).
  -Bootstrap           - Run repo bootstrap steps (npm ci + install build deps)
  -Compile             - Run `npm run compile` inside `azstudio` to generate compiled `out`
  -RunTests            - Run dev smoke tests and Node unit tests
  -Force               - Non-interactive install, assume `Yes` for prompts
#>
param(
    [switch]$InstallBuildTools,
    [switch]$Bootstrap,
    [switch]$Compile,
    [switch]$RunTests,
    [switch]$Force
)

function Write-Info([string]$m) { Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Warn([string]$m) { Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-ErrorAndExit([string]$m) { Write-Host "[ERROR] $m" -ForegroundColor Red; exit 1 }

Write-Info "AzStudio: Setup script (Windows)
"

# Node check
$requiredNode = '22.20.0'
try { $nodeVersion = (& node -v).Trim(); Write-Info ("Found Node: $nodeVersion") } catch { Write-ErrorAndExit "Node.js not found. Install Node $requiredNode or a compatible LTS version and ensure node.exe is in PATH." }

# Simple compare function
function Compare-Version($v1, $v2) {
    $a = $v1.TrimStart('v').Split('.') | ForEach-Object {[int]$_}
    $b = $v2.TrimStart('v').Split('.') | ForEach-Object {[int]$_}
    for ($i=0; $i -lt [Math]::Max($a.Length, $b.Length); $i++) {
        $ai = if ($i -lt $a.Length) { $a[$i] } else { 0 }
        $bi = if ($i -lt $b.Length) { $b[$i] } else { 0 }
        if ($ai -gt $bi) { return 1 }
        if ($ai -lt $bi) { return -1 }
    }
    return 0
}

if ((Compare-Version $nodeVersion $requiredNode) -lt 0) {
    Write-Warn "Your Node.js version appears older than recommended ($requiredNode). You may continue but consider upgrading to Node $requiredNode or newer."
}

# Ensure git present
try { $gitv = (& git --version); Write-Info "Found git: $gitv" } catch { Write-Warn "git not found on PATH - recommended to install git for clone and working with the repo." }

# Optional: install Visual Studio Build Tools
if ($InstallBuildTools) {
    Write-Info "InstallBuildTools requested: checking for existing MSVC..."
    $cl = Get-Command cl.exe -ErrorAction SilentlyContinue
    if ($cl) { Write-Info "MSVC found at: $($cl.Path). Skipping installation." } else {
        Write-Info "MSVC not found. Attempting to install Visual Studio Build Tools..."
        $installScript = Join-Path $PSScriptRoot 'install-win-build-tools.ps1'
        if (-not (Test-Path $installScript)) { Write-ErrorAndExit "Helper script not present: $installScript" }
        $installArgs = @()
        if ($Force) { $installArgs += '-Force' }
        & powershell -ExecutionPolicy Bypass -File $installScript @installArgs
        if ($LASTEXITCODE -ne 0) { Write-Warn "install-win-build-tools.ps1 returned exit code $LASTEXITCODE. Please review output and install manually if needed." }
    }
}

# Run environment check (verbose)
Write-Info "Running CI environment checks..."
$p = Join-Path $PSScriptRoot 'ci-check-environment.ps1'
if (Test-Path $p) { & powershell -ExecutionPolicy Bypass -File $p } else { Write-Warn "Environment check not found at $p" }

# Install / bootstrap
if ($Bootstrap) {
    Write-Info "Installing root dependencies (npm ci)"
    # root install
    Set-Location -Path (Resolve-Path ..) # stay in repo root if called from scripts dir
    try {
        & npm ci
    } catch {
        Write-Warn "npm ci failed at root. Attempting ci with --no-audit --no-optional"
        & npm ci --no-audit --no-optional
    }
    # install azstudio packages
    $azstudioDir = Join-Path (Resolve-Path '.') 'azstudio'
    if (Test-Path $azstudioDir) {
        Set-Location $azstudioDir
        Write-Info "Installing azstudio package dependencies"
        try { & npm ci } catch { Write-Warn "Failed to run npm ci in azstudio; please inspect logs and install dependencies manually. You might want to run 'npm ci --ignore-scripts' on Linux if native build errors occur." }
    } else { Write-Warn "azstudio directory not found; skipping azstudio install." }
}

# Compile and run smoke tests
if ($Compile) {
    Write-Info "Compile step: running 'npm run compile' in azstudio"
    try { Set-Location $azstudioDir; & npm run compile } catch { Write-Warn "Compilation failed; check build logs." }
}

if ($RunTests) {
    Write-Info "Running dev smoke and unit tests (local-unit-tests & ai-esbuild-test)"
    try { Set-Location $azstudioDir; & npm run local-unit-tests } catch { Write-Warn "Local unit tests failed; run them locally to get more details." }
    try { Set-Location $azstudioDir; & npm run ai-esbuild-test } catch { Write-Warn "AI esbuild test failed; ensure esbuild is installed and dev-runner built." }
    Write-Info "If you want to run the compiled Node tests use: npm run test-node (after compile)."
}

Write-Info "Setup script completed. Next steps:"
Write-Host "  - In azstudio: npm run compile" -ForegroundColor Green
Write-Host "  - Run tests: npm run local-unit-tests, npm run ai-esbuild-test" -ForegroundColor Green
Write-Host "  - If packaging: npm run gulp vscode-win32-x64-min-ci" -ForegroundColor Green

exit 0
