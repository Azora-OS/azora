@echo off
echo 🚀 UBUNTU SYSTEM LAUNCH - PREMIUM GRADE ACTIVATION
echo =================================================
echo ⚡ "I launch because we conquer together!" ⚡
echo.

echo 🏢 Starting Ubuntu Backend Services...
start "Ubuntu azora-api-gateway" cmd /k "cd services/azora-api-gateway && npm install && npm start"
start "Ubuntu azora-education" cmd /k "cd services/azora-education && npm install && npm start"
start "Ubuntu azora-finance" cmd /k "cd services/azora-finance && npm install && npm start"
start "Ubuntu azora-marketplace" cmd /k "cd services/azora-marketplace && npm install && npm start"
start "Ubuntu azora-auth" cmd /k "cd services/azora-auth && npm install && npm start"
start "Ubuntu azora-ai" cmd /k "cd services/azora-ai && npm install && npm start"
start "Ubuntu azora-blockchain" cmd /k "cd services/azora-blockchain && npm install && npm start"
start "Ubuntu azora-analytics" cmd /k "cd services/azora-analytics && npm install && npm start"

echo.
echo 🎨 Starting Ubuntu Frontend Applications...
start "Ubuntu azora-student-portal" cmd /k "cd apps/azora-student-portal && npm install && npm run dev"
start "Ubuntu azora-enterprise-ui" cmd /k "cd apps/azora-enterprise-ui && npm install && npm run dev"
start "Ubuntu azora-marketplace-ui" cmd /k "cd apps/azora-marketplace-ui && npm install && npm run dev"
start "Ubuntu azora-pay-ui" cmd /k "cd apps/azora-pay-ui && npm install && npm run dev"

echo.
echo 🎉 UBUNTU SYSTEM LAUNCHING!
echo ===========================
echo 🌐 API Gateway: http://localhost:4000
echo 🎓 Student Portal: http://localhost:3000
echo 💼 Enterprise UI: http://localhost:3001
echo 🛒 Marketplace UI: http://localhost:3002
echo 💰 Pay UI: http://localhost:3003
echo.
echo 🌟 Ubuntu: "Ngiyakwazi ngoba sikwazi - We are LIVE together!" 🚀
pause
