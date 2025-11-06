# AZORA OS - Find Executables for Testing
# Searches for .exe files in the repository

Write-Host "🔍 Searching for executables in repository..." -ForegroundColor Cyan
Write-Host ""

$executables = @()

# Search for executables, excluding node_modules and .git
try {
    $found = Get-ChildItem -Recurse -Include *.exe,*.app,*.msi,*.dmg,*.deb,*.rpm -ErrorAction SilentlyContinue | 
        Where-Object { 
            $_.FullName -notlike '*node_modules*' -and 
            $_.FullName -notlike '*\.git*' -and
            $_.FullName -notlike '*\.next*'
        }
    
    if ($found) {
        $executables = $found
    }
} catch {
    Write-Host "Error searching: $_" -ForegroundColor Red
}

if ($executables.Count -gt 0) {
    Write-Host "✅ Found $($executables.Count) executable(s):" -ForegroundColor Green
    Write-Host ""
    
    $index = 1
    foreach ($exe in $executables) {
        $sizeKB = [math]::Round($exe.Length / 1KB, 2)
        Write-Host "$index. $($exe.FullName)" -ForegroundColor Yellow
        Write-Host "   Size: $sizeKB KB" -ForegroundColor Gray
        Write-Host "   Modified: $($exe.LastWriteTime)" -ForegroundColor Gray
        Write-Host ""
        $index++
    }
} else {
    Write-Host "⚠️  No executables found in repository." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To build executables, run:" -ForegroundColor Cyan
    Write-Host "  npm run build:exe" -ForegroundColor White
    Write-Host "  or" -ForegroundColor Gray
    Write-Host "  .\build-exe-for-testing.bat" -ForegroundColor White
    Write-Host ""
    Write-Host "Checking for build directories..." -ForegroundColor Cyan
    
    # Check common build output directories
    $buildDirs = @("dist", "build", "out", "release", "bin")
    foreach ($dir in $buildDirs) {
        if (Test-Path $dir) {
            Write-Host "  📁 Found: $dir" -ForegroundColor Green
            $files = Get-ChildItem $dir -Recurse -File -ErrorAction SilentlyContinue | Select-Object -First 5
            if ($files) {
                Write-Host "     Files: $($files.Count) found" -ForegroundColor Gray
            }
        }
    }
}

Write-Host ""
Write-Host "Search complete!" -ForegroundColor Cyan
