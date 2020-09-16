import fetchImpl from 'cross-fetch';
import { parseJSON } from 'date-fns';
import { CacheDuration } from './model';
import { getAsync, setAsync } from './redis';

function identity(v: any) {
  return v;
}

export default async function fetchCached<T, R = T>(
  key: string,
  loader: (key: string) => Promise<T>,
  {
    cache = CacheDuration.short,
    process = identity,
    parse = identity,
  }: { cache?: CacheDuration; process?: (r: T) => R; parse?: (r: R) => R }
): Promise<R> {
  const r = await getAsync(key);

  if (r != null) {
    return parse(JSON.parse(r));
  }

  const loaded = await loader(key);
  const parsed = process(loaded);
  await setAsync(key, JSON.stringify(parsed), 'EX', cache);
  return parsed;
}

function fetcher(url: string) {
  console.log('fetch', url);
  return fetchImpl(url).then((r) => r.json());
}

export async function fetchJSON<T, R = T>(
  key: string | URL,
  options: { cache?: CacheDuration; process?: (r: T) => R; parse?: (r: R) => R }
): Promise<R> {
  const u = key.toString();
  return fetchCached(u, fetcher, options);
}

// based on https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c
type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};
type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];

/**
 * helper method for parsing serialized dates
 * @param fields
 */
export function parseDates<T>(fields: AllowedNames<T, Date>[]) {
  if (fields.length === 0) {
    return identity;
  }
  if (fields.length === 1) {
    const field = fields[0];
    return (data: T[]) => {
      // parse serialized dates
      for (const row of data) {
        row[field] = parseJSON(row[field] as any) as any;
      }
      return data;
    };
  }
  // multiple
  return (data: T[]) => {
    // parse serialized dates
    for (const row of data) {
      for (const field of fields) {
        row[field] = parseJSON(row[field] as any) as any;
      }
    }
    return data;
  };
}
