# Obter o caminho do último diretório mod modificado em ../mod/
$ultimoDiretorioMod = Get-ChildItem "$(Join-Path (Get-Item $PSScriptRoot).Parent.FullName mod)" | Sort-Object -Property LastWriteTime | Select-Object -Last 1

# Remover recursivamente o conteúdo da pasta de destino com o mesmo nome do último diretório modificado
Remove-Item -Path "$env:USERPROFILE\Documents\Paradox Interactive\Stellaris\mod\$($ultimoDiretorioMod.Name)" -Recurse -Force

Write-Host "Pasta \"$($ultimoDiretorioMod.Name)\" removida em ""$env:USERPROFILE\Documents\Paradox Interactive\Stellaris\mod"""

# Copiar o conteúdo do último diretório modificado para a localização padrão dos mods locais do Stellaris
Copy-Item -Path $ultimoDiretorioMod.FullName -Destination "$env:USERPROFILE\Documents\Paradox Interactive\Stellaris\mod\$($ultimoDiretorioMod.Name)" -Recurse

Write-Host "$($ultimoDiretorioMod.Name) copiado para ""$env:USERPROFILE\Documents\Paradox Interactive\Stellaris\mod"""
