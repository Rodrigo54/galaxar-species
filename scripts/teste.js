import { $, execa } from 'execa';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdir, writeFile, stat } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));


async function listarArquivosRecursivamente(pastaInicial, pastaDestino) {
  // Inicializa um array para armazenar os caminhos dos arquivos
  const listaDeArquivos = [];

  async function listarArquivos(pastaAtual) {
    const itens = await readdir(pastaAtual);
    
    for (const item of itens) {
      const caminhoCompleto = join(pastaAtual, item);
      const testFolder = await stat(caminhoCompleto);
      
      if (testFolder.isDirectory()) {
        await listarArquivos(caminhoCompleto);
      } else {
        listaDeArquivos.push(caminhoCompleto);
      }
    }
  }

  await listarArquivos(pastaInicial);

  console.log(listaDeArquivos);

  return listaDeArquivos.map((caminho) => {
    
    const caminhoRelativo = caminho.replace(pastaInicial, '');
    const caminhoDestino = join(pastaDestino, caminhoRelativo).replace('.png', '.dds');

    return `${caminho} --format bc3 --quality normal --no-mips --zcmp 5 --output ${caminhoDestino}`;

  });
}

const criarArquivo = async (conteudo) => {
  const batch = resolve(__dirname, '../batch.nvdds');
  await writeFile(batch, conteudo.join('\n'));

}

// Especifica o caminho da pasta e o arquivo de saída
const pastaInicial = join(__dirname, '../assets/marmeid');
const pastaDestino = join(__dirname, '../testmod/marmeid');

// Chama a função para listar os arquivos e escrever em um arquivo TXT

const main = async () => {
  const listaDeArquivos = await listarArquivosRecursivamente(pastaInicial, pastaDestino);
  await criarArquivo(listaDeArquivos);
}

main();
