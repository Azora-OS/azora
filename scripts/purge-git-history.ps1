param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl
)

# WARNING: This rewrites git history. Run only with admin privileges and backups.
function Ensure-Installed([string]$cmd) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Error "$cmd is not installed or not on PATH. Please install it and run again."
        exit 1
    }
}

Ensure-Installed -cmd 'git'
Ensure-Installed -cmd 'python'

if (-not (Get-Command 'git-filter-repo' -ErrorAction SilentlyContinue)) {
    Write-Output "git-filter-repo not found. Install with: pip install git-filter-repo"
    exit 1
}

$workdir = Join-Path -Path $env:TEMP -ChildPath "azora-purge-$(Get-Date -Format o)"
New-Item -ItemType Directory -Force -Path $workdir | Out-Null

Write-Output "Cloning git mirror into $workdir"
git clone --mirror $RepoUrl "$workdir\repo.git"
Set-Location "$workdir\repo.git"

Write-Output "Creating backup copy"
Copy-Item -Recurse -Path "$workdir\repo.git" -Destination "$workdir\repo.git.backup"

Write-Output "Removing .env files from history"
git filter-repo --invert-paths --paths .env
git filter-repo --invert-paths --paths .env.test

Write-Output "Applying replacement patterns from SECURITY/PATTERNS_TO_REDACT.txt"
git filter-repo --replace-text "..\SECURITY\PATTERNS_TO_REDACT.txt" | Out-Null

git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Output "Ready to force push cleaned history. You must confirm manually."
$confirm = Read-Host "Proceed with force push to remote (yes/no)?"
if ($confirm -ne 'yes') {
    Write-Output "Aborting. You may manually inspect the cleaned mirror at $workdir\repo.git"
    exit 0
}

git push --force --all
git push --force --tags

Write-Output "Purge completed; please inform all contributors to re-clone their repository";

