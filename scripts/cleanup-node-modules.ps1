$root='C:\Users\Azora Sapiens\Documents\azora'
Write-Output "Scanning for node_modules under $root"
$mods=Get-ChildItem -Path $root -Directory -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'node_modules' }
$ifNullCheck = ($mods -eq $null -or $mods.Count -eq 0)
if ($ifNullCheck) { Write-Output 'No node_modules found'; exit 0 }
$totalBefore=0
foreach($m in $mods){ $size=(Get-ChildItem -Path $m.FullName -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum; $totalBefore += $size }
$totalMB = [math]::Round($totalBefore/1MB,2)
Write-Output ("Found {0} node_modules totaling {1} MB" -f $mods.Count, $totalMB)
foreach($m in $mods){ Write-Output ("Deleting {0}" -f $m.FullName); Remove-Item -LiteralPath $m.FullName -Recurse -Force -ErrorAction SilentlyContinue }
Write-Output "Deletion complete. Re-scanning..."
$mods2=Get-ChildItem -Path $root -Directory -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'node_modules' }
if ($null -eq $mods2 -or $mods2.Count -eq 0) { Write-Output 'All node_modules removed.' } else { Write-Output (("Remaining node_modules: {0}" -f $mods2.Count)) }
Write-Output (("Top 10 largest dirs under {0}" -f $root))
Get-ChildItem -Path $root -Directory -Recurse -ErrorAction SilentlyContinue | ForEach-Object { $size=(Get-ChildItem -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum; [PSCustomObject]@{Path=$_.FullName; SizeMB=[math]::Round($size/1MB,2)} } | Sort-Object -Property SizeMB -Descending | Select-Object -First 10 | Format-Table -AutoSize
