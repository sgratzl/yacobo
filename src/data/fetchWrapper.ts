import fetchImpl from 'cross-fetch';

export default function fetch(url: string): Promise<{ json(): Promise<any> }> {
  if (process.env.NODE_ENV !== 'development') {
    return fetchImpl(url);
  }
  return import('./fetchCached').then((r) => r.default(url));
}
