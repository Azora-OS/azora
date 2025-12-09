param(
    [string]$Root = "C:\\Users\\Azora Sapiens\\Documents\\azora"
)
Write-Output "Long-path delete: scanning for node_modules under: $Root"
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
    $p = $m.FullName.TrimEnd('\')
    $lp = "\\?\" + $p
    try {
        [System.IO.Directory]::Delete($lp, $true)
        Write-Output ("Deleted (long-path): {0}" -f $m.FullName)
    } catch {
        Write-Warning ("Primary delete failed for {0}: {1}" -f $m.FullName, $_.Exception.Message)
        # Fallback: mirror an empty directory onto the target using robocopy then remove
        $tmp = Join-Path $env:TEMP ([System.Guid]::NewGuid().ToString())
        New-Item -ItemType Directory -Path $tmp | Out-Null
        try {
            robocopy $tmp $m.FullName /MIR /R:1 /W:1 | Out-Null
            Remove-Item -LiteralPath $m.FullName -Recurse -Force -ErrorAction SilentlyContinue
            Write-Output ("Deleted (robocopy fallback): {0}" -f $m.FullName)
        } catch {
            Write-Warning ("Fallback failed for {0}: {1}" -f $m.FullName, $_.Exception.Message)
        } finally {
            Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Output 'Re-scanning...'
Start-Sleep -Seconds 2
$remaining = Get-ChildItem -Path $Root -Directory -Recurse -Force -Filter 'node_modules' -ErrorAction SilentlyContinue
Write-Output ('Remaining node_modules: {0}' -f ($remaining.Count))
if ($remaining.Count -gt 0) {
    $remaining | Select-Object -First 200 | ForEach-Object { Write-Output $_.FullName }
}
