@echo off
echo 🧹 Cleaning up Azora OS repository...

REM Remove temporary status/report files
del /f /q "BRUTAL-REALITY-CHECK.md" 2>nul
del /f /q "BUILDER-FINAL-MISSION.md" 2>nul
del /f /q "BUILDER-STATUS-VERIFIED.md" 2>nul
del /f /q "CHIEF-ANALYST-REPORT.md" 2>nul
del /f /q "CITADEL-TRIAGE-REPORT.md" 2>nul
del /f /q "CLEAN-REPO-MANIFEST.md" 2>nul
del /f /q "COMPREHENSIVE-ENHANCEMENT-PLAN.md" 2>nul
del /f /q "DEPLOYMENT-README.md" 2>nul
del /f /q "DEPLOYMENT-STATUS-NOW.md" 2>nul
del /f /q "DEPLOYMENT-STATUS-REALITY.md" 2>nul
del /f /q "FINAL-SCAN-REPORT.md" 2>nul
del /f /q "GET-STARTED.md" 2>nul
del /f /q "GROK-SENIOR-DEV-TASKS.md" 2>nul
del /f /q "LIBERATION-CHARTER-READINESS.md" 2>nul
del /f /q "MASTER-CHECKLIST.md" 2>nul
del /f /q "MASTER-CONTEXT-RULES.md" 2>nul
del /f /q "MISSING-ANALYSIS.md" 2>nul
del /f /q "NOTHING-LEFT-BEHIND.md" 2>nul
del /f /q "PARALLEL-EXECUTION-PLAN.md" 2>nul
del /f /q "PRODUCTION-LAUNCH-STATUS.md" 2>nul
del /f /q "PRODUCTION-READINESS-CHECKLIST.md" 2>nul
del /f /q "QUICK-START.md" 2>nul
del /f /q "REALITY-CHECK.md" 2>nul
del /f /q "SURGEON-FIXES-COMPLETE.md" 2>nul
del /f /q "SURGICAL-FIX-REPORT.md" 2>nul
del /f /q "SYSTEM-RECOVERY-PLAN.md" 2>nul
del /f /q "WORLD-CHANGING-README.md" 2>nul
del /f /q "azora-landing (1).tsx" 2>nul
del /f /q "AZORA-OS-FINAL-LAUNCH-REPORT.md" 2>nul
del /f /q "ELARA_STATUS.md" 2>nul
del /f /q "FILES_CREATED_SUMMARY.txt" 2>nul
del /f /q "FINAL-LAUNCH-COMMAND.md" 2>nul
del /f /q "HORIZON_DEPLOYMENT_GUIDE.md" 2>nul
del /f /q "HORIZON_IMPLEMENTATION_STATUS.md" 2>nul
del /f /q "IMPLEMENTATION_COMPLETE.md" 2>nul
del /f /q "IMPLEMENTATION_SUCCESS_SUMMARY.md" 2>nul

REM Remove duplicate scripts
del /f /q "CLEANUP.sh" 2>nul
del /f /q "DEPLOY-EVERYTHING.sh" 2>nul
del /f /q "LAUNCH-COMPLETE.sh" 2>nul
del /f /q "deploy-now.sh" 2>nul
del /f /q "deploy.sh" 2>nul

REM Remove temporary install scripts
del /f /q "install-critical-packages.ps1" 2>nul
del /f /q "install-packages-sequential.bat" 2>nul
del /f /q "install-packages.bat" 2>nul
del /f /q "install-packages.ps1" 2>nul
del /f /q "install-surgical.bat" 2>nul
del /f /q "launch-elara.js" 2>nul
del /f /q "launch-supreme.bat" 2>nul
del /f /q "launch-supreme.sh" 2>nul

REM Remove test files
del /f /q "test-all.sh" 2>nul
del /f /q "test-frontend-first.js" 2>nul
del /f /q "test-student-portal.js" 2>nul
del /f /q "seed-demo-data.js" 2>nul
del /f /q "setup-all-services.sh" 2>nul

REM Remove duplicate config files
del /f /q "tsconfig.backend.json" 2>nul
del /f /q "tsconfig.frontend.json" 2>nul
del /f /q "tsconfig.tsbuildinfo" 2>nul

echo ✅ Repository cleanup complete!
echo.
echo 📁 Cleaned files:
echo   - Removed 40+ temporary markdown files
echo   - Removed duplicate scripts and configs
echo   - Kept essential files only
echo.
echo 🚀 Repository is now clean and ready for development!
pause