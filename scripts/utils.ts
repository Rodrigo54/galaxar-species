import { readdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

export async function clear(pasta: string) {
  await rm(pasta, { recursive: true, force: true });
}

export async function listar(pastaInicial: string, extension: string = '.png') {
  const arquivos: string[] = [];
  const pastas: string[] = [];

  async function buscar(pastaAtual: string, extension: string = '.png') {
    const itens = await readdir(pastaAtual);

    for (const item of itens) {
      const caminhoCompleto = join(pastaAtual, item);
      const file = await stat(caminhoCompleto);
      const isDirectory = file.isDirectory();
      const isExtension = item.endsWith(extension);

      if (isDirectory) {
        pastas.push(caminhoCompleto);
        await buscar(caminhoCompleto);
      }
      if (isExtension) {
        arquivos.push(caminhoCompleto);
      }
    }
  }

  await buscar(pastaInicial, extension);

  return { arquivos, pastas };
}
