# Run a lightweight dev stack for Agent Execution + Knowledge Ocean + AI Provider Router
set -e
pushd (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Start Redis (optional) - needs Docker
# docker run -d --name azora-redis -p 6379:6379 redis:7

Write-Output 'Starting AI Provider Router...'
Push-Location ..\services\ai-provider-router
Start-Process -NoNewWindow -FilePath npm -ArgumentList 'run dev'
Pop-Location

Write-Output 'Starting Knowledge Ocean...'
Push-Location ..\services\knowledge-ocean
Start-Process -NoNewWindow -FilePath npm -ArgumentList 'run dev'
Pop-Location

Write-Output 'Starting Agent Execution...'
Push-Location ..\services\agent-execution
Start-Process -NoNewWindow -FilePath npm -ArgumentList 'run dev'
Pop-Location

Write-Output 'Started services. Open http://localhost:4002/ui for Agent Dashboard and http://localhost:4003/search?q=hello for Knowledge Search.'
popd
