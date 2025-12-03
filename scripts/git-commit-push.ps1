param(
    [string]$Message = "Update",
    [string]$BranchName
)

# Git commit & push helper for PowerShell
function Ensure-NotMain {
    $branch = git rev-parse --abbrev-ref HEAD
    if ($branch -eq 'main' -or $branch -eq 'master') {
        Write-Error "You are on $branch. Create a feature branch before pushing. Use: git checkout -b <branch>"
        exit 1
    }
}

function Ensure-OriginRemote {
    try {
        git remote get-url origin | Out-Null
    } catch {
        Write-Error "No 'origin' remote set — please set it: git remote add origin <repo-url>"; exit 1
    }
}

function Run-PreChecks {
    Write-Output "🔧 prechecks: installing hooks & scanning..."
    if (Get-Command -Name pnpm -ErrorAction SilentlyContinue) { pnpm install --ignore-scripts --no-frozen-lockfile || $false } else { npm ci || $false }

    npx husky install || $false

    if (Test-Path "scripts/prevent-secrets.js") {
        node ./scripts/prevent-secrets.js
        if ($LASTEXITCODE -ne 0) { Write-Error "Secrets detected — aborting commit."; exit 1 }
    }
}

Ensure-OriginRemote
Ensure-NotMain
Run-PreChecks

Write-Output "Staging all files..."
git add -A

Write-Output "Committing: $Message"
try { git commit -m "$Message" } catch { Write-Output "No changes to commit"; exit 0 }

$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -eq 'main' -or $currentBranch -eq 'master') {
    if (-not $BranchName) { $BranchName = "security/cleanup-secrets-" + (Get-Date -Format yyyyMMddHHmmss) }
    Write-Output "Creating branch: $BranchName"
    git checkout -b $BranchName
}

Write-Output "Pushing to origin..."
git push -u origin HEAD

Write-Output "✅ Done — changes pushed. Please open a PR on GitHub.";

