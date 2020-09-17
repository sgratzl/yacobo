import fetchImpl from 'cross-fetch';
import { IRequestContext } from './middleware';
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
  const r = await ctx.redis.getAsync(key);

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
