#!/usr/bin/env pwsh
# Merge student-portal into azora-sapiens
# Keeps the best features from both apps

$ErrorActionPreference = "Stop"

Write-Host "Merging student-portal into azora-sapiens..." -ForegroundColor Cyan
Write-Host ""

$studentPortal = "c:\Users\Azora Sapiens\Documents\azora\apps\student-portal"
$azoraSapiens = "c:\Users\Azora Sapiens\Documents\azora\apps\azora-sapiens"

# Create backup
Write-Host "Creating backup of azora-sapiens..." -ForegroundColor Yellow
$backup = "c:\Users\Azora Sapiens\Documents\azora\apps\azora-sapiens-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -Path $azoraSapiens -Destination $backup -Recurse
Write-Host "  Backup created at: $backup" -ForegroundColor Green
Write-Host ""

# Copy pages from student-portal
Write-Host "Copying pages from student-portal..." -ForegroundColor Yellow

$pagesToCopy = @(
    @{ Source = "app\courses"; Dest = "app\courses" },
    @{ Source = "app\dashboard"; Dest = "app\dashboard" },
    @{ Source = "app\my-courses"; Dest = "app\my-courses" },
    @{ Source = "app\learn"; Dest = "app\learn" },
    @{ Source = "app\login"; Dest = "app\login" }
)

foreach ($page in $pagesToCopy) {
    $sourcePath = Join-Path $studentPortal $page.Source
    $destPath = Join-Path $azoraSapiens $page.Dest
    
    if (Test-Path $sourcePath) {
        Write-Host "  Copying: $($page.Source)" -ForegroundColor Gray
        Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
    }
}

# Copy components
Write-Host ""
Write-Host "Copying components from student-portal..." -ForegroundColor Yellow

$componentsSource = Join-Path $studentPortal "app\components"
$componentsDest = Join-Path $azoraSapiens "app\components"

if (Test-Path $componentsSource) {
    if (-not (Test-Path $componentsDest)) {
        New-Item -ItemType Directory -Path $componentsDest -Force | Out-Null
    }
    
    Copy-Item -Path "$componentsSource\*" -Destination $componentsDest -Recurse -Force
    Write-Host "  Copied components: GlassCard, PremiumButton, Navbar" -ForegroundColor Green
}

# Update package.json to Next.js 16
Write-Host ""
Write-Host "Updating azora-sapiens to Next.js 16..." -ForegroundColor Yellow

$packageJsonPath = Join-Path $azoraSapiens "package.json"
$packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json

# Update to Next.js 16 and React 19 (from student-portal)
$packageJson.dependencies.next = "16.0.3"
$packageJson.dependencies.react = "19.2.0"
$packageJson.dependencies.'react-dom' = "19.2.0"

# Add Tailwind 4 (from student-portal)
if (-not $packageJson.devDependencies) {
    $packageJson | Add-Member -MemberType NoteProperty -Name "devDependencies" -Value @{}
}
$packageJson.devDependencies.tailwindcss = "^4"
$packageJson.devDependencies.'@tailwindcss/postcss' = "^4"

$packageJson | ConvertTo-Json -Depth 100 | Set-Content $packageJsonPath
Write-Host "  Updated to Next.js 16, React 19, Tailwind 4" -ForegroundColor Green

Write-Host ""
Write-Host "Merge complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review merged content in azora-sapiens"
Write-Host "  2. Test the app: cd apps/azora-sapiens && npm install && npm run dev"
Write-Host "  3. If everything works, delete student-portal"
Write-Host ""
Write-Host "Backup location: $backup" -ForegroundColor Gray
