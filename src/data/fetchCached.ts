import { promisify } from 'util';
import { createHash } from 'crypto';
import { formatISO, startOfToday } from 'date-fns';
import { resolve } from 'path';
import { readFile, writeFile, lstat } from 'fs';
import fetchImpl from 'cross-fetch';

const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);
const lstatP = promisify(lstat);

const map = new Map<string, Promise<any>>();
/**
 * fetch with local file directory cache
 * @param url
 */
export default async function fetch(url: string): Promise<{ json(): Promise<any> }> {
  const now = formatISO(startOfToday(), { representation: 'date' });

  const key = `${now}-${url}`;
  if (map.has(key)) {
    const value = map.get(key);
    return {
      json: () => Promise.resolve(value),
    };
  }

  const hash = createHash('sha256').update(key).digest('hex');

  const path = resolve(`./.cache/${hash}.json`);
  try {
    if ((await lstatP(path)).isFile()) {
      return {
        json: () => readFileP(path, { encoding: 'utf-8' }).then((r) => JSON.parse(r.toString())),
      };
    }
  } catch {
    // invalid file
  }

  console.log('fetch', url);
  const data = await (await fetchImpl(url)).json();
  map.set(key, data);
  writeFileP(path, JSON.stringify(data), { encoding: 'utf-8' });
  return {
    json: () => Promise.resolve(data),
  };
}
