import { $, execa } from 'execa';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { readdir, writeFile, stat, mkdir,  } from 'node:fs/promises';


const __dirname = dirname(fileURLToPath(import.meta.url));

// Especifica o caminho da pasta e o arquivo de saída
const PASTA_INICIAL = join(__dirname, '../assets/cities');
const PASTA_DESTINO = PASTA_INICIAL.replace('assets', 'testmod');


async function listar(pastaInicial) {
  const arquivos = [];
  const pastas = [];
  
  async function buscar(pastaAtual) {
    const itens = await readdir(pastaAtual);
    
    for (const item of itens) {
      const caminhoCompleto = join(pastaAtual, item);
      const testFolder = await stat(caminhoCompleto);
      
      if (testFolder.isDirectory()) {
        pastas.push(caminhoCompleto);
        await buscar(caminhoCompleto);
      } else {
        arquivos.push(caminhoCompleto);
      }
    }
  }

  await buscar(pastaInicial);

  return { arquivos, pastas };
}

async function batchFile(arquivos) {

  const conteudo = arquivos.map((caminho) => {
    const caminhoRelativo = caminho.replace(PASTA_INICIAL, '');
    const caminhoDestino = join(PASTA_DESTINO, caminhoRelativo).replace('.png', '.dds');
    return `"${caminho}" --format bc1 --quality production --no-mips --zcmp 5 --output "${caminhoDestino}"`;
  });

  const batch = resolve(__dirname, '../batch.nvdds');
  await writeFile(batch, conteudo.join('\n'));
}


async function createFolders(pastas) {
  if (!existsSync(PASTA_DESTINO)) {
    await mkdir(PASTA_DESTINO, { recursive: true });
  }

  for(const pasta of pastas) {
    const pastaDestino = pasta.replace(PASTA_INICIAL, PASTA_DESTINO);
    if (!existsSync(pastaDestino)) {
      await mkdir(pastaDestino, { recursive: true });
    }
  }
}


const main = async () => {

  const { arquivos, pastas } = await listar(PASTA_INICIAL);

  console.log({arquivos, pastas});

  await createFolders(pastas);
  await batchFile(arquivos);

}

main();
