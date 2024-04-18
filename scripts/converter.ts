import { $ } from 'bun';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clear, listar } from './utils';

const __DIRNAME = dirname(fileURLToPath(import.meta.url));

// Especifica o caminho da pasta e o arquivo de saída
const PASTA_INICIAL = join(__DIRNAME, '../assets/portraits');
const PASTA_DESTINO = join(__DIRNAME, '../output/portraits');

async function batchFile(arquivos: string[]) {
  const conteudo = arquivos.map((caminho) => {
    const caminhoRelativo = caminho.replace(PASTA_INICIAL, '');
    const caminhoDestino = join(PASTA_DESTINO, caminhoRelativo).replace(
      '.png',
      '.dds'
    );
    return `"${caminho}" --format bc3 --quality production --no-mips --zcmp 5 --output "${caminhoDestino}"`;
  });

  const batch = resolve(__DIRNAME, '../batch.nvdds');
  await writeFile(batch, conteudo.join('\n'));
}

async function createFolders(pastas: string[]) {
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

async function converter() {
  const executable = join(
    'C:/Program Files/NVIDIA Corporation/NVIDIA Texture Tools/nvtt_export.exe'
  );
  const batchFile = join(process.cwd(), 'batch.nvdds');
  const result = await $`${executable} --batch-file="${batchFile}"`.text();
  // const result = await $`pwsh ./scripts/nvdds.ps1`.quiet().text();
  console.log(result);
}

const main = async () => {
  console.log('Limpando pasta de destino...');
  await clear(PASTA_DESTINO);
  console.log('Encontrando arquivos...');
  const { arquivos, pastas } = await listar(PASTA_INICIAL);
  console.log('Criando pastas...');
  await createFolders(pastas);
  console.log('Criando arquivo em lote do nvdds...');
  await batchFile(arquivos);
  console.log('Convertendo arquivos...');
  await converter();
  console.log('Concluído!');
};

main().then(() => console.log('Fim'));
