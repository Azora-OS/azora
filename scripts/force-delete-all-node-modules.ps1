param(
    [string]$Root = "C:\\Users\\Azora Sapiens\\Documents\\azora"
)
Write-Output "Force-deleting node_modules under: $Root"
try {
    $mods = Get-ChildItem -Path $Root -Directory -Recurse -Force -Filter 'node_modules' -ErrorAction SilentlyContinue
} catch {
    Write-Warning "Scan failed: $_"
    exit 1
}
if (-not $mods) {
    Write-Output "No node_modules directories found."
    exit 0
}

foreach ($m in $mods) {
    try {
        Write-Output ("Deleting: {0}" -f $m.FullName)
        Remove-Item -LiteralPath $m.FullName -Recurse -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Warning ("Failed to delete {0}: {1}" -f $m.FullName, $_)
    }
}

Write-Output 'Re-scanning...'
Start-Sleep -Seconds 2
$remaining = Get-ChildItem -Path $Root -Directory -Recurse -Force -Filter 'node_modules' -ErrorAction SilentlyContinue
Write-Output ('Remaining node_modules: {0}' -f ($remaining.Count))
if ($remaining.Count -gt 0) {
    $remaining | Select-Object -First 100 | ForEach-Object { Write-Output $_.FullName }
}
