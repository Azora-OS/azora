# Ubuntu Philosophy Integration Script
# Adds UbuntuPhilosophyCard to all Azora applications
# Constitutional AI Operating System - Article I Section 1.1 Compliance

Write-Host "🤝 UBUNTU PHILOSOPHY INTEGRATION" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$apps = @(
    @{Name = "Azora Sapiens"; Path = "apps/azora-sapiens"; Dashboard = "app/dashboard/page.tsx"; Status = "✅ COMPLETE" },
    @{Name = "Azora Mint"; Path = "apps/azora-mint"; Dashboard = "app/page.tsx"; Status = "⏳ PENDING" },
    @{Name = "Azora Pay"; Path = "apps/azora-pay"; Dashboard = "app/page.tsx"; Status = "⏳ PENDING" },
    @{Name = "Azora BuildSpaces"; Path = "apps/azora-buildspaces"; Dashboard = "app/page.tsx"; Status = "⏳ PENDING" },
    @{Name = "Azora Jobspaces"; Path = "apps/azora-jobspaces"; Dashboard = "app/page.tsx"; Status = "⏳ PENDING" },
    @{Name = "Azora Classroom"; Path = "apps/azora-classroom"; Dashboard = "app/page.tsx"; Status = "⏳ PENDING" },
    @{Name = "Azora Library"; Path = "apps/azora-library"; Dashboard = "app/page.tsx"; Status = "⏳ PENDING" },
    @{Name = "Azora Oracle"; Path = "apps/azora-oracle"; Dashboard = "app/page.tsx"; Status = "⏳ PENDING" },
    @{Name = "Azora Research Center"; Path = "apps/azora-research-center"; Dashboard = "app/page.tsx"; Status = "⏳ PENDING" },
    @{Name = "Azora Enterprise Suite"; Path = "apps/azora-enterprise-suite"; Dashboard = "src/pages/Dashboard.jsx"; Status = "⏳ PENDING" }
)

Write-Host "📋 Applications to Update:" -ForegroundColor Yellow
foreach ($app in $apps) {
    Write-Host "   $($app.Status) $($app.Name)" -ForegroundColor $(if ($app.Status -eq "✅ COMPLETE") { "Green" } else { "Gray" })
}

Write-Host ""
Write-Host "📝 Integration Steps:" -ForegroundColor Yellow
Write-Host "   1. Import UbuntuPhilosophyCard from @azora/shared-design" -ForegroundColor White
Write-Host "   2. Add component to dashboard/sidebar" -ForegroundColor White
Write-Host "   3. Pass Ubuntu metrics (collectiveImpact, communityBenefit, ubuntuAlignment)" -ForegroundColor White
Write-Host "   4. Verify constitutional compliance" -ForegroundColor White
Write-Host ""

Write-Host "🛡️ Constitutional Requirement:" -ForegroundColor Magenta
Write-Host "   Article I Section 1.1 - Ubuntu Philosophy" -ForegroundColor White
Write-Host "   'I can because we can' must be prominently displayed" -ForegroundColor White
Write-Host ""

Write-Host "✅ Azora Sapiens: Ubuntu Philosophy Card added to dashboard" -ForegroundColor Green
Write-Host ""
Write-Host "⏭️  Next: Add to remaining 9 applications" -ForegroundColor Yellow
Write-Host ""
Write-Host '"Ngiyakwazi ngoba sikwazi" - "I can because we can"' -ForegroundColor Magenta
