import { join } from 'node:path';
import {
  PASTA_DESTINO,
  PASTA_INICIAL,
  batchFile,
  converter,
  createFolders,
} from './converter';
import { clear, listar } from './utils';

export const processRooms = async () => {
  const inputFolder = join(PASTA_INICIAL, 'city_sets');
  const outputFolder = join(PASTA_DESTINO, 'city_sets');
  const { arquivos, pastas } = await listar(inputFolder);
  await batchFile(arquivos, {
    format: 'bc1',
    quality: 'production',
    noMips: true,
    zcmp: 15,
  });
  await converter();
};

const main = async () => {
  console.log('Processando City Sets');
  await processRooms();
};

main().then(() => console.log('Fim'));
