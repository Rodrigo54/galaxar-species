import { $ } from 'bun';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __DIRNAME = dirname(fileURLToPath(import.meta.url));

// Especifica o caminho da pasta e o arquivo de saída
export const PASTA_INICIAL = join(__DIRNAME, '../assets');
export const PASTA_DESTINO = join(__DIRNAME, '../output');

export async function batchFile(
  arquivos: string[],
  options = {
    format: 'bc3',
    quality: 'production',
    noMips: true,
    zcmp: 5,
  }
) {
  const conteudo = arquivos.map((caminho) => {
    const caminhoRelativo = caminho.replace(PASTA_INICIAL, '');
    const caminhoDestino = join(PASTA_DESTINO, caminhoRelativo).replace(
      '.png',
      '.dds'
    );
    return `"${caminho}" --format ${options.format} --quality ${
      options.quality
    } ${options.noMips ? '--no-mips' : ''} --zcmp ${
      options.zcmp
    } --output "${caminhoDestino}"`;
  });

  const batch = resolve(__DIRNAME, '../batch.nvdds');
  await writeFile(batch, conteudo.join('\n'));
}

export async function createFolders(pastas: string[]) {
  if (!existsSync(PASTA_DESTINO)) {
    await mkdir(PASTA_DESTINO, { recursive: true });
  }

  for (const pasta of pastas) {
    const pastaDestino = pasta.replace(PASTA_INICIAL, PASTA_DESTINO);
    if (!existsSync(pastaDestino)) {
      await mkdir(pastaDestino, { recursive: true });
    }
  }
}

export async function converter() {
  const executable = join(
    'C:/Program Files/NVIDIA Corporation/NVIDIA Texture Tools/nvtt_export.exe'
  );
  const batchFile = join(process.cwd(), 'batch.nvdds');
  const result = await $`${executable} --batch-file="${batchFile}"`;
  // const result = await $`pwsh ./scripts/nvdds.ps1`.quiet().text();
  console.log(result);
}
