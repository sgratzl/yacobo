import fetchImpl from 'cross-fetch';
import type { IRequestContext } from './middleware';
import { CacheDuration } from './model';

function identity(v: any) {
  return v;
}

export default async function fetchCached<T, R = T>(
  ctx: IRequestContext,
  key: string,
  loader: (key: string) => Promise<T>,
  {
    cache = CacheDuration.short,
    process = identity,
    parse = identity,
  }: { cache?: CacheDuration; process?: (r: T) => R; parse?: (r: R) => R }
): Promise<R> {
  let r: string | null = null;
  try {
    r = await ctx.redis.getAsync(key);
  } catch (error) {
    console.warn(error);
    // in case of an redis error load it
    const loaded = await loader(key);
    return process(loaded);
  }

  if (r != null) {
    return parse(JSON.parse(r));
  }

  const loaded = await loader(key);
  const parsed = process(loaded);
  await ctx.redis.setAsync(key, JSON.stringify(parsed), 'EX', cache);
  return parsed;
}

function fetcher(url: string) {
  console.log('fetch', url);
  return fetchImpl(url).then((r) => r.json());
}

export async function fetchJSON<T, R = T>(
  ctx: IRequestContext,
  key: string | URL,
  options: { cache?: CacheDuration; process?: (r: T) => R; parse?: (r: R) => R }
): Promise<R> {
  const u = key.toString();
  return fetchCached(ctx, u, fetcher, options);
}
