# PowerShell script to check Elara IDE setup
Write-Host "=== Elara IDE Setup Check ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in elara-ide directory
$currentDir = Get-Location
if (-not $currentDir.Path.EndsWith("elara-ide")) {
    Write-Host "⚠️  Not in elara-ide directory" -ForegroundColor Yellow
    Write-Host "   Running check from root..." -ForegroundColor Gray
    Push-Location "elara-ide" -ErrorAction SilentlyContinue
}

# Check package.json
if (Test-Path "package.json") {
    Write-Host "✅ package.json exists" -ForegroundColor Green
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    Write-Host "   Name: $($packageJson.name)" -ForegroundColor Gray
    Write-Host "   Version: $($packageJson.version)" -ForegroundColor Gray
    Write-Host "   Next.js: $($packageJson.dependencies.next)" -ForegroundColor Gray
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
}

Write-Host ""

# Check dependencies
Write-Host "=== Dependencies ===" -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules exists" -ForegroundColor Green
    $nodeModulesSize = (Get-ChildItem "node_modules" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "   Size: $([math]::Round($nodeModulesSize, 2)) MB" -ForegroundColor Gray
} else {
    Write-Host "❌ node_modules not found - run 'npm install'" -ForegroundColor Red
}

if (Test-Path "package-lock.json") {
    Write-Host "✅ package-lock.json exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  package-lock.json not found" -ForegroundColor Yellow
}

Write-Host ""

# Check configuration files
Write-Host "=== Configuration Files ===" -ForegroundColor Cyan
$configFiles = @(
    "tsconfig.json",
    "next.config.ts",
    "tailwind.config.ts",
    "postcss.config.mjs",
    ".prettierrc",
    ".eslintrc.json"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

Write-Host ""

# Check source files
Write-Host "=== Source Files ===" -ForegroundColor Cyan
$sourceDirs = @(
    "app",
    "components",
    "core"
)

foreach ($dir in $sourceDirs) {
    if (Test-Path $dir) {
        $fileCount = (Get-ChildItem $dir -Recurse -File -ErrorAction SilentlyContinue).Count
        Write-Host "✅ $dir/ ($fileCount files)" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir/ not found" -ForegroundColor Red
    }
}

Write-Host ""

# Check for integration with main project
Write-Host "=== Integration Check ===" -ForegroundColor Cyan
$coreFile = "core/elara-ide-core.ts"
if (Test-Path $coreFile) {
    $content = Get-Content $coreFile -Raw
    if ($content -match "logger.*genome") {
        Write-Host "✅ Integrated with genome logger" -ForegroundColor Green
    } else {
        Write-Host "⚠️  May need logger integration" -ForegroundColor Yellow
    }

    if ($content -match "elara-family") {
        Write-Host "✅ Integrated with Elara Family" -ForegroundColor Green
    } else {
        Write-Host "⚠️  May need Elara Family integration" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Core file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "  1. Run: npm install"
Write-Host "  2. Run: npm run dev (starts on port 3002)"
Write-Host "  3. Visit: http://localhost:3002"
Write-Host "  4. Check integrations with main project"

if ($currentDir.Path -ne (Get-Location).Path) {
    Pop-Location
}

