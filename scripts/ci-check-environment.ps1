<#
CI Environment Check for AzStudio
Validates Node version and Visual Studio Build Tools presence on Windows
#>
param()
Write-Host "CI Environment Check - Fixed Minimal" -ForegroundColor Cyan
try { $v = (& node -v) } catch { Write-Host "[ERROR] Node.js not found" -ForegroundColor Red; exit 2 }
Write-Host "Node: $v" -ForegroundColor Green
try { $npmv = (& npm -v); Write-Host "npm: $npmv" -ForegroundColor Green } catch { Write-Host "npm not found" -ForegroundColor Yellow }
if ($IsWindows) {
    $cl = Get-Command cl.exe -ErrorAction SilentlyContinue
    if (-not $cl) { Write-Host "[WARN] MSVC not found in PATH" -ForegroundColor Yellow; exit 3 } else { Write-Host "MSVC: $($cl.Path)" -ForegroundColor Green }
}
Write-Host "Minimal environment check passed" -ForegroundColor Green
exit 0
<#
Simple CI Environment Check for AzStudio
#>
param()
Write-Host "CI Environment Check - Minimal" -ForegroundColor Cyan

try { $v = (& node -v) } catch { Write-Host "[ERROR] Node.js not found" -ForegroundColor Red; exit 2 }
Write-Host "Node: $v" -ForegroundColor Green

try { $npmv = (& npm -v); Write-Host "npm: $npmv" -ForegroundColor Green } catch { Write-Host "npm not found" -ForegroundColor Yellow }

if ($IsWindows) {
    $cl = Get-Command cl.exe -ErrorAction SilentlyContinue
    if (-not $cl) { Write-Host "[WARN] MSVC not found in PATH" -ForegroundColor Yellow; exit 3 } else { Write-Host "MSVC: $($cl.Path)" -ForegroundColor Green }
}

Write-Host "Minimal environment check passed" -ForegroundColor Green
exit 0
<#
CI Environment Check for AzStudio
Validates Node version and Visual Studio Build Tools presence on Windows
#>
param()

function Write-Info([string]$m) { Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Warn([string]$m) { Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-ErrorAndExit([string]$m) { Write-Host "[ERROR] $m" -ForegroundColor Red; exit 1 }

function Compare-Version($v1, $v2) {
    $a = $v1.TrimStart('v').Split('.') | ForEach-Object {[int]$_}
    $b = $v2.TrimStart('v').Split('.') | ForEach-Object {[int]$_}
    for ($i=0; $i -lt [Math]::Max($a.Length, $b.Length); $i++) {
        $ai = if ($i -lt $a.Length) { $a[$i] } else { 0 }
        $bi = if ($i -lt $b.Length) { $b[$i] } else { 0 }
        if ($ai -gt $bi) { return 1 }
        <#
        CI Environment Check for AzStudio
        Validates Node version and Visual Studio Build Tools presence (Windows).
        Usage: powershell -ExecutionPolicy Bypass -File scripts\ci-check-environment.ps1
        #>

        param()

        function Write-Info([string]$m) { Write-Host "[INFO] $m" -ForegroundColor Cyan }
        function Write-Warn([string]$m) { Write-Host "[WARN] $m" -ForegroundColor Yellow }
        function Write-ErrorAndExit([string]$m) { Write-Host "[ERROR] $m" -ForegroundColor Red; exit 1 }

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

        Write-Info "CI Environment Check"

        $requiredNode = '22.20.0'
        try {
            $nodeVersion = (& node -v)
        } catch {
            Write-ErrorAndExit "Node.js not found in PATH. Install Node >= $requiredNode and ensure node is available in PATH."
        }

        Write-Info ("Found Node version: " + $nodeVersion)
        if ((Compare-Version $nodeVersion $requiredNode) -lt 0) {
            Write-ErrorAndExit ("Node version is older than required (" + $requiredNode + "). Install Node $requiredNode or newer.")
        }

        Write-Info "Node version check passed"

        try {
            $npmv = (& npm -v).Trim(); Write-Info ("npm: " + $npmv)
        } catch {
            Write-Warn "npm not found"
        }

        if ($IsWindows) {
            Write-Info "Checking for Visual Studio Build Tools (MSVC)"
            $cl = Get-Command cl.exe -ErrorAction SilentlyContinue
            if (-not $cl) {
                Write-Warn "'cl.exe' (MSVC compiler) not found in PATH. Visual Studio Build Tools may not be installed."
                Write-Info "If you need to build native modules, install Visual Studio C++ Build Tools or use a CI runner with the build tools preinstalled."
                exit 3
            } else {
                Write-Info ("Found MSVC compiler (cl.exe) at: " + $cl.Path)
            }
        }

        Write-Info "Environment checks passed"
        exit 0

