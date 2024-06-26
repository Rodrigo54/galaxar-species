# Obter o caminho do último diretório mod modificado em ../mod/
$ultimoDiretorioMod = Get-ChildItem "$(Join-Path (Get-Item $PSScriptRoot).Parent.FullName mod)" | Sort-Object -Property LastWriteTime | Select-Object -Last 1

# Apagar o conteúdo da localização padrão dos mods locais do Stellaris
Remove-Item -Path "$env:USERPROFILE\Documents\Paradox Interactive\Stellaris\mod\$($ultimoDiretorioMod.Name)" -Recurse -Force

# Copiar o conteúdo do último diretório modificado para a localização padrão dos mods locais do Stellaris
Copy-Item -Path $ultimoDiretorioMod.FullName -Destination "$env:USERPROFILE\Documents\Paradox Interactive\Stellaris\mod" -Recurse

Write-Host "$($ultimoDiretorioMod.Name) copiado para ""$env:USERPROFILE\Documents\Paradox Interactive\Stellaris\mod"""
