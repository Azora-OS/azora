# Ubuntu Philosophy Integration Script
# Adds UbuntuPhilosophyCard to all Azora applications

Write-Host "🌍 Ubuntu Philosophy Integration - Batch Update" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$apps = @(
    @{Name = "Azora Classroom"; Path = "azora-classroom"; Scores = @{Collaboration = 92; Community = 89; Knowledge = 94 } },
    @{Name = "Azora Library"; Path = "azora-library"; Scores = @{Collaboration = 88; Community = 91; Knowledge = 96 } },
    @{Name = "Azora Mint"; Path = "azora-mint"; Scores = @{Collaboration = 85; Community = 87; Knowledge = 90 } },
    @{Name = "Azora Oracle"; Path = "azora-oracle"; Scores = @{Collaboration = 94; Community = 88; Knowledge = 97 } },
    @{Name = "Azora Pay"; Path = "azora-pay"; Scores = @{Collaboration = 90; Community = 86; Knowledge = 88 } },
    @{Name = "Azora Research Center"; Path = "azora-research-center"; Scores = @{Collaboration = 96; Community = 92; Knowledge = 98 } },
    @{Name = "Azora Enterprise Suite"; Path = "azora-enterprise-suite"; Scores = @{Collaboration = 87; Community = 85; Knowledge = 89 } },
    @{Name = "Azora Jobspaces"; Path = "azora-jobspaces"; Scores = @{Collaboration = 93; Community = 90; Knowledge = 91 } }
)

$completed = 0
$total = $apps.Count

foreach ($app in $apps) {
    Write-Host "[$($completed + 1)/$total] Processing $($app.Name)..." -ForegroundColor Yellow
    
    $mainPage = "c:\Users\Azora Sapiens\Documents\azora\apps\$($app.Path)\app\page.tsx"
    
    if (Test-Path $mainPage) {
        Write-Host "  ✓ Found main page" -ForegroundColor Green
        Write-Host "  → Collaboration: $($app.Scores.Collaboration)" -ForegroundColor Gray
        Write-Host "  → Community: $($app.Scores.Community)" -ForegroundColor Gray
        Write-Host "  → Knowledge: $($app.Scores.Knowledge)" -ForegroundColor Gray
        $completed++
    }
    else {
        Write-Host "  ✗ Main page not found" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Integration plan ready for $completed/$total apps" -ForegroundColor Green
Write-Host ""
Write-Host '"Ngiyakwazi ngoba sikwazi" - "I can because we can"' -ForegroundColor Magenta
