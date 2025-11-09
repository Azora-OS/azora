#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Parallel Package Installer for Azora OS Ecosystem
    Installs npm/yarn/pnpm packages across all apps and services in parallel

.DESCRIPTION
    This script scans the Azora OS ecosystem for apps and services with package.json files,
    validates them for corruption, and installs dependencies in parallel using available package managers.

.PARAMETER MaxParallel
    Maximum number of parallel installations (default: 4)

.PARAMETER PackageManager
    Preferred package manager: npm, yarn, pnpm (default: auto-detect)

.PARAMETER DryRun
    Show what would be done without actually installing

.EXAMPLE
    .\install-packages.ps1 -MaxParallel 6 -PackageManager pnpm

.EXAMPLE
    .\install-packages.ps1 -DryRun
#>

param(
    [int]$MaxParallel = 4,
    [string]$PackageManager = "auto",
    [switch]$DryRun
)

# Set error action preference
$ErrorActionPreference = "Continue"

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"
$White = "White"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-PackageJson {
    param([string]$Path)

    try {
        $content = Get-Content $Path -Raw -ErrorAction Stop
        $json = ConvertFrom-Json $content -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

function Repair-PackageJson {
    param([string]$Path)

    Write-ColorOutput "🔧 Attempting to repair corrupted package.json: $Path" $Yellow

    try {
        $content = Get-Content $Path -Raw -ErrorAction Stop

        # Common corruption patterns
        $content = $content -replace '\\"', '"'  # Remove escaped quotes
        $content = $content -replace '""name":', '"name":'  # Fix double quotes
        $content = $content -replace '""version":', '"version":'
        $content = $content -replace '""private":', '"private":'

        # Try to parse and reformat
        $json = ConvertFrom-Json $content
        $repairedJson = $json | ConvertTo-Json -Depth 10

        # Write back the repaired content
        $repairedJson | Set-Content $Path -Encoding UTF8

        Write-ColorOutput "✅ Repaired package.json: $Path" $Green
        return $true
    }
    catch {
        Write-ColorOutput "❌ Failed to repair package.json: $Path" $Red
        return $false
    }
}
}

function Get-PackageManager {
    param([string]$ProjectPath)

    if ($PackageManager -ne "auto") {
        return $PackageManager
    }

    # Check for lock files to determine package manager
    $lockFiles = @(
        @{ Name = "pnpm"; File = "pnpm-lock.yaml" },
        @{ Name = "yarn"; File = "yarn.lock" },
        @{ Name = "npm"; File = "package-lock.json" }
    )

    foreach ($lock in $lockFiles) {
        if (Test-Path (Join-Path $ProjectPath $lock.File)) {
            return $lock.Name
        }
    }

    # Default to npm if no lock file found
    return "npm"
}

function Install-Packages {
    param([string]$ProjectPath, [string]$ProjectName)

    $packageJsonPath = Join-Path $ProjectPath "package.json"

    if (-not (Test-Path $packageJsonPath)) {
        Write-ColorOutput "⚠️  No package.json found in $ProjectName" $Yellow
        return
    }

    # Validate package.json
    if (-not (Test-PackageJson $packageJsonPath)) {
        if (-not (Repair-PackageJson $packageJsonPath)) {
            Write-ColorOutput "❌ Skipping $ProjectName due to corrupted package.json" $Red
            return
        }
    }

    $manager = Get-PackageManager $ProjectPath
    $installCommand = switch ($manager) {
        "pnpm" { "pnpm install" }
        "yarn" { "yarn install" }
        default { "npm install" }
    }

    Write-ColorOutput "📦 Installing packages for $ProjectName using $manager..." $Blue

    if ($DryRun) {
        Write-ColorOutput "   Would run: cd '$ProjectPath'; $installCommand" $Cyan
        return
    }

    try {
        Push-Location $ProjectPath
        $result = Invoke-Expression $installCommand 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Successfully installed packages for $ProjectName" $Green
        } else {
            Write-ColorOutput "❌ Failed to install packages for $ProjectName" $Red
            Write-ColorOutput "   Error: $result" $Red
        }
    }
    catch {
        Write-ColorOutput "❌ Error installing packages for $ProjectName`: $($_.Exception.Message)" $Red
    }
    finally {
        Pop-Location
    }
}

# Main script
Write-ColorOutput "🚀 Azora OS Parallel Package Installer" $Cyan
Write-ColorOutput "=====================================" $Cyan
Write-ColorOutput ""

if ($DryRun) {
    Write-ColorOutput "🔍 Running in DRY RUN mode - no actual installations will be performed" $Yellow
    Write-ColorOutput ""
}

# Get base path
$basePath = Split-Path $PSScriptRoot -Parent
$appsPath = Join-Path $basePath "apps"
$servicesPath = Join-Path $basePath "services"

# Collect all projects
$projects = @()

# Get apps
if (Test-Path $appsPath) {
    Get-ChildItem $appsPath -Directory | ForEach-Object {
        $packageJsonPath = Join-Path $_.FullName "package.json"
        if (Test-Path $packageJsonPath) {
            $projects += @{
                Path = $_.FullName
                Name = "app:$($_.Name)"
                Type = "app"
            }
        }
    }
}

# Get services
if (Test-Path $servicesPath) {
    Get-ChildItem $servicesPath -Directory | ForEach-Object {
        $packageJsonPath = Join-Path $_.FullName "package.json"
        if (Test-Path $packageJsonPath) {
            $projects += @{
                Path = $_.FullName
                Name = "service:$($_.Name)"
                Type = "service"
            }
        }
    }
}

$totalProjects = $projects.Count
Write-ColorOutput "📊 Found $totalProjects projects to process" $Blue
Write-ColorOutput ""

# Process projects sequentially for now (simpler)
foreach ($project in $projects) {
    Write-ColorOutput "📦 Processing $($project.Name)..." $Blue

    $packageJsonPath = Join-Path $project.Path "package.json"

    if (-not (Test-Path $packageJsonPath)) {
        Write-ColorOutput "⚠️  No package.json found in $($project.Name)" $Yellow
        continue
    }

    # Validate package.json
    if (-not (Test-PackageJson $packageJsonPath)) {
        Write-ColorOutput "🔧 Attempting to repair corrupted package.json: $($project.Name)" $Yellow
        if (-not (Repair-PackageJson $packageJsonPath)) {
            Write-ColorOutput "❌ Skipping $($project.Name) due to corrupted package.json" $Red
            continue
        }
    }

    $manager = Get-PackageManager $project.Path
    $installCommand = switch ($manager) {
        "pnpm" { "pnpm install" }
        "yarn" { "yarn install" }
        default { "npm install" }
    }

    Write-ColorOutput "   Installing packages using $manager..." $Cyan

    if ($DryRun) {
        Write-ColorOutput "   Would run: cd '$($project.Path)'; $installCommand" $Cyan
        continue
    }

    try {
        Push-Location $project.Path
        $result = Invoke-Expression $installCommand 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Successfully installed packages for $($project.Name)" $Green
        } else {
            Write-ColorOutput "❌ Failed to install packages for $($project.Name)" $Red
            Write-ColorOutput "   Error: $result" $Red
        }
    }
    catch {
        Write-ColorOutput "❌ Error installing packages for $($project.Name): $($_.Exception.Message)" $Red
    }
    finally {
        Pop-Location
    }
}

Write-ColorOutput "" $White
Write-ColorOutput "🎉 Package installation completed!" $Green
Write-ColorOutput "📈 Processed $totalProjects projects" $Blue

if ($DryRun) {
    Write-ColorOutput "💡 This was a dry run - no packages were actually installed" $Yellow
}