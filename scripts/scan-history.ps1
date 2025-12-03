Write-Output "Running historical scans for secrets (trufflehog)"
if (-not (Get-Command 'python' -ErrorAction SilentlyContinue)) { Write-Error 'Python is required to run trufflehog' ; exit 1 }
python -m pip install --upgrade pip
pip install trufflehog --upgrade

try {
  trufflehog git file://$PWD --json > trufflehog_history.json
  Write-Output 'TruffleHog scan saved to trufflehog_history.json'
} catch {
  Write-Error 'TruffleHog scan failed' ; exit 1
}

Write-Output 'Done'

