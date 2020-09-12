import fetch from 'cross-fetch';
import { formatISO, parseISO, subDays } from 'date-fns';
import { signals, ISignal } from './constants';

const ENDPOINT = 'https://api.covidcast.cmu.edu/epidata/api.php';

const fetchOptions = process.env.NODE_ENV === 'development' ? { cache: 'force-cache' as const } : undefined;

export function formatAPIDate(date: Date) {
  return formatISO(date, { representation: 'date' });
}
export function parseAPIDate(v: number | string) {
  return parseISO(v.toString());
}

export interface ICountyValue {
  region: string;
  value: number;
  stderr?: number | null;
}

export const LATEST = subDays(new Date(), 2);

export function fetchAllCounties(signal: ISignal['data'], date: Date): Promise<ICountyValue[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set('source', 'covidcast');
  url.searchParams.set('data_source', signal.dataSource);
  url.searchParams.set('signal', signal.signal);
  url.searchParams.set('geo_type', 'county');
  url.searchParams.set('time_type', 'day');
  url.searchParams.set('geo_value', '*');
  url.searchParams.set('time_values', formatAPIDate(date));
  url.searchParams.set('format', 'json');
  url.searchParams.set('fields', ['geo_value', 'value', signal.hasStdErr && 'stderr'].filter(Boolean).join(','));
  return fetch(url.toString(), fetchOptions)
    .then((r) => r.json())
    .then((r) =>
      r.map((d) => ({
        region: d.geo_value,
        value: d.value,
        stderr: d.stderr,
      }))
    );
}

function injectMeta(data: any[]) {
  const lookup = new Map<string, ISignal['meta']>(
    data.map((d) => [
      `${d.data_source}:${d.signal}`,
      {
        mean: d.mean_value,
        stdev: d.stdev_value,
        minTime: parseAPIDate(d.min_time),
        maxTime: parseAPIDate(d.max_time),
      },
    ])
  );
  return signals.map((s) => ({
    ...s,
    meta: lookup.get(`${s.data.dataSource}:${s.data.signal}`)!,
  }));
}

export function fetchMeta(): Promise<ISignal[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set('source', 'covidcast_meta');
  url.searchParams.set(
    'fields',
    ['data_source', 'signal', 'mean_value', 'stdev_value', 'min_time', 'max_time'].join(',')
  );
  url.searchParams.set('signals', signals.map((d) => `${d.data.dataSource}:${d.data.signal}`).join(','));
  url.searchParams.set('geo_types', 'county');
  url.searchParams.set('time_types', 'day');
  url.searchParams.set('format', 'json');
  return fetch(url.toString(), fetchOptions)
    .then((r) => r.json())
    .then(injectMeta);
}
