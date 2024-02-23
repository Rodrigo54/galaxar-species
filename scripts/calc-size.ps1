$folderPath = Get-ChildItem "$(Join-Path (Get-Item $PSScriptRoot).Parent.FullName mod)" | Sort-Object -Property LastWriteTime | Select-Object -Last 1

$folderSize = Get-ChildItem -Path $folderPath -Recurse | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum
$folderSizeMB = $folderSize / 1MB

Write-Host "Folder size: $folderSizeMB MB"
