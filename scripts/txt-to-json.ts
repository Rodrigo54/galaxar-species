import { Jomini } from 'jomini';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __DIRNAME = dirname(fileURLToPath(import.meta.url));
const PARSER = await Jomini.initialize();
const PASTA_INICIAL = join(__DIRNAME, '../testmod');
const PASTA_DESTINO = join(__DIRNAME, '../output');

const readFileTXT = () => {
  return readFile(join(PASTA_INICIAL, 'ui_elderscrolls_altmer.txt'), 'utf-8');
};

const parseTXT = async () => {
  const fileContent = await readFileTXT();
  const data = PARSER.parseText(fileContent);
  return data;
};

const saveJSON = async (data: any) => {
  await writeFile(
    join(PASTA_DESTINO, 'ui_elderscrolls_altmer.json'),
    JSON.stringify(data, null, 2)
  );
};

const main = async () => {
  const data = await parseTXT();
  await saveJSON(data);
};

main();
