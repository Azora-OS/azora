# PowerShell script to run Azora QA checklist
# ---------------------------------------------------
# 1. Unit tests for all services
# 2. Integration tests (Finance ↔ Master ↔ Cloud)
# 3. ChaosMonkey simulations (7 failure types) and PhoenixServer recovery validation
# 4. ResilienceAdapter offline‑first validation (bandwidth drop simulation)
# 5. Collect results into qa_report.json

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$ReportPath = Join-Path $RootDir 'qa_report.json'

function Run-Step($Description, $ScriptBlock) {
    Write-Host "[STEP] $Description"
    try {
        & $ScriptBlock
        Write-Host "[PASS] $Description"
        $result = @{ step = $Description; status = 'pass' }
    }
    catch {
        Write-Host "[FAIL] $Description"
        $result = @{ step = $Description; status = 'fail' }
    }
    return $result
}

$results = @()

# 1. Unit tests for each service
Get-ChildItem "$RootDir\services" -Directory | ForEach-Object {
    $serviceName = $_.Name
    $servicePath = $_.FullName
    $env:PORT = 0
    $res = Run-Step "Unit tests for $serviceName" { Set-Location $servicePath; npm test --silent }
    $results += $res
}

# 2. Integration tests (placeholder command)
$res = Run-Step "Integration tests (Finance ↔ Master ↔ Cloud)" { npm run test:integration --silent }
$results += $res

# 3. ChaosMonkey simulations (placeholder)
$res = Run-Step "ChaosMonkey simulation" { npm run chaos:test --silent }
$results += $res

# 4. ResilienceAdapter offline‑first validation (placeholder)
$res = Run-Step "ResilienceAdapter offline‑first test" { npm run offline:test --silent }
$results += $res

# Write JSON report
$results | ConvertTo-Json -Depth 3 | Set-Content -Path $ReportPath -Encoding UTF8
Write-Host "QA pipeline completed. Report saved to $ReportPath"
