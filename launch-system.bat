@echo off
echo 🚀 Launching Azora OS System...
node scripts/fix-all-issues.cjs
node scripts/connect-frontends-backends.js
node scripts/start-all.js
echo ✅ System launched!
pause