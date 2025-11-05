# PowerShell script to check IDE setup and missing components
# Run this to see what's missing in your development environment

Write-Host "=== IDE Setup Check ===" -ForegroundColor Cyan
Write-Host ""

# Check VS Code installation
$vscodePath = Get-Command code -ErrorAction SilentlyContinue
if ($vscodePath) {
    Write-Host "✅ VS Code is installed" -ForegroundColor Green
    $vscodeVersion = code --version | Select-Object -First 1
    Write-Host "   Version: $vscodeVersion" -ForegroundColor Gray
} else {
    Write-Host "❌ VS Code is not installed or not in PATH" -ForegroundColor Red
    Write-Host "   Install from: https://code.visualstudio.com/" -ForegroundColor Yellow
}

Write-Host ""

# Check for recommended extensions
Write-Host "=== Recommended VS Code Extensions ===" -ForegroundColor Cyan
$recommendedExtensions = @(
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "christian-kohler.npm-intellisense",
    "eg2.vscode-npm-script",
    "pflannery.vscode-versionlens",
    "editorconfig.editorconfig"
)

$installedExtensions = @()
if ($vscodePath) {
    try {
        $installedExtensions = code --list-extensions 2>$null
    } catch {
        Write-Host "   Could not list extensions" -ForegroundColor Yellow
    }
}

foreach ($ext in $recommendedExtensions) {
    if ($installedExtensions -contains $ext) {
        Write-Host "✅ $ext" -ForegroundColor Green
    } else {
        Write-Host "❌ $ext" -ForegroundColor Red
    }
}

Write-Host ""

# Check Node.js and npm
Write-Host "=== Node.js Environment ===" -ForegroundColor Cyan
$nodeVersion = node --version 2>$null
$npmVersion = npm --version 2>$null

if ($nodeVersion) {
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
}

if ($npmVersion) {
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
}

Write-Host ""

# Check project dependencies
Write-Host "=== Project Dependencies ===" -ForegroundColor Cyan
if (Test-Path "package.json") {
    if (Test-Path "node_modules") {
        Write-Host "✅ node_modules exists" -ForegroundColor Green
    } else {
        Write-Host "❌ node_modules not found - run 'npm install'" -ForegroundColor Red
    }

    if (Test-Path "package-lock.json") {
        Write-Host "✅ package-lock.json exists" -ForegroundColor Green
    } else {
        Write-Host "⚠️  package-lock.json not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
}

Write-Host ""

# Check configuration files
Write-Host "=== Configuration Files ===" -ForegroundColor Cyan
$configFiles = @(
    ".vscode/settings.json",
    ".vscode/extensions.json",
    ".vscode/launch.json",
    ".vscode/tasks.json",
    ".editorconfig",
    ".prettierrc",
    ".eslintrc.json",
    "tsconfig.json"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Review the checks above and install any missing components."
Write-Host ""
Write-Host "Quick fixes:" -ForegroundColor Yellow
Write-Host "  1. Install VS Code extensions: Open VS Code > Extensions (Ctrl+Shift+X)"
Write-Host "  2. Install dependencies: npm install"
Write-Host "  3. Setup Husky: npm run prepare"

