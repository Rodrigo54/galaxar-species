import { join } from 'node:path';
import {
  PASTA_DESTINO,
  PASTA_INICIAL,
  batchFile,
  converter,
  createFolders,
} from './converter';
import { clear, listar } from './utils';

export const processPortraits = async () => {
  const inputFolder = join(PASTA_INICIAL, 'portraits');
  const outputFolder = join(PASTA_DESTINO, 'portraits');
  await clear(outputFolder);
  const { arquivos, pastas } = await listar(inputFolder);
  await createFolders(pastas);
  await batchFile(arquivos, {
    format: 'bc3',
    quality: 'production',
    noMips: true,
    zcmp: 15,
  });
  await converter();
};

const main = async () => {
  console.log('Processando Portraits');
  await processPortraits();
};

main().then(() => console.log('Fim'));
