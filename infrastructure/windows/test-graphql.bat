@echo off
start /B npx tsx graphql-server.ts
timeout /t 3 /nobreak > nul
powershell -Command "Invoke-WebRequest -Uri http://localhost:4000/graphql -Method POST -ContentType 'application/json' -Body '{\"query\":\"{hello}\"}'"