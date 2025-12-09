param(
    [string]$Root = "C:\\Users\\Azora Sapiens\\Documents\\azora",
    [int]$Top = 200
)
Write-Output "Scanning for node_modules under: $Root"
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

$results = @()
foreach ($m in $mods) {
    try {
        $sum = 0
        $files = Get-ChildItem -Path $m.FullName -File -Recurse -Force -ErrorAction SilentlyContinue
        if ($files) { $sum = ($files | Measure-Object -Property Length -Sum).Sum }
        $mb = [math]::Round((($sum) / 1MB), 2)
        $results += [PSCustomObject]@{ Path = $m.FullName; SizeMB = $mb }
    } catch {
        $results += [PSCustomObject]@{ Path = $m.FullName; SizeMB = -1 }
    }
}

$results = $results | Sort-Object -Property SizeMB -Descending
Write-Output ("Found {0} node_modules directories" -f $results.Count)
$results | Select-Object -First $Top | Format-Table -AutoSize

# Also print a machine-readable list for scripted deletion if needed
Write-Output "---RAW-LIST-BEGIN---"
$results | ForEach-Object { "{0}|{1}" -f $_.Path, $_.SizeMB }
Write-Output "---RAW-LIST-END---"
