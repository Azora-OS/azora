# Load Testing Runner Script (PowerShell)
# This script runs the load tests and generates reports
# Requirements: 4.2

param(
    [string]$TestType = "concurrent1000",
    [string]$BaseUrl = "http://localhost:5175",
    [string]$ApiBaseUrl = "http://localhost:4000"
)

# Configuration
$OutputDir = "load-test-results"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

Write-Host "========================================" -ForegroundColor Blue
Write-Host "Azora OS Load Testing" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Check if k6 is installed
try {
    $k6Version = k6 version 2>&1
    Write-Host "✓ k6 is installed" -ForegroundColor Green
    Write-Host "k6 version: $k6Version"
} catch {
    Write-Host "Error: k6 is not installed" -ForegroundColor Red
    Write-Host "Please install k6 from https://k6.io/docs/getting-started/installation/"
    exit 1
}
Write-Host ""

# Verify API is running
Write-Host "Checking API connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiBaseUrl/api/health" -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ API is responding" -ForegroundColor Green
    } else {
        Write-Host "Warning: API returned status $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Warning: API at $ApiBaseUrl is not responding" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}
Write-Host ""

# Select test type
switch ($TestType) {
    "concurrent1000" {
        $TestFile = "load-test-1000-concurrent.js"
        $TestName = "1000 Concurrent Users Test"
    }
    "realistic" {
        $TestFile = "load-test-realistic-traffic.js"
        $TestName = "Realistic Traffic Patterns Test"
    }
    default {
        Write-Host "Unknown test type: $TestType" -ForegroundColor Red
        Write-Host "Available options: concurrent1000, realistic"
        exit 1
    }
}

Write-Host "Running: $TestName" -ForegroundColor Blue
Write-Host "Test file: $TestFile"
Write-Host "Base URL: $BaseUrl"
Write-Host "API Base URL: $ApiBaseUrl"
Write-Host ""

# Run the load test
$ResultsFile = "$OutputDir\results_${TestType}_${Timestamp}.json"
$SummaryFile = "$OutputDir\summary_${TestType}_${Timestamp}.txt"

Write-Host "Starting load test..." -ForegroundColor Yellow
Write-Host ""

# Run k6 with environment variables
$env:BASE_URL = $BaseUrl
$env:API_BASE_URL = $ApiBaseUrl

try {
    k6 run `
        --out json=$ResultsFile `
        $TestFile | Tee-Object -FilePath $SummaryFile
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Load Test Completed Successfully" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Results saved to:"
    Write-Host "  - JSON: $ResultsFile"
    Write-Host "  - Summary: $SummaryFile"
    Write-Host ""
    Write-Host "Key Metrics:" -ForegroundColor Blue
    Write-Host "Review the summary file for detailed metrics"
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Load Test Failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
