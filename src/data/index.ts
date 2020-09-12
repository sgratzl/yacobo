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

export const LATEST = subDays(new Date(), 4);

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

export function fetchSignalCounty(signal: ISignal['data'], region: string, date: Date): Promise<ICountyValue[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set('source', 'covidcast');
  url.searchParams.set('data_source', signal.dataSource);
  url.searchParams.set('signal', signal.signal);
  url.searchParams.set('geo_type', 'county');
  url.searchParams.set('time_type', 'day');
  url.searchParams.set('geo_value', region);
  url.searchParams.set('time_values', formatAPIDate(date));
  url.searchParams.set('format', 'json');
  url.searchParams.set('fields', ['value', signal.hasStdErr && 'stderr'].filter(Boolean).join(','));
  return fetch(url.toString(), fetchOptions)
    .then((r) => r.json())
    .then((r) =>
      r.map((d) => ({
        region,
        value: d.value,
        stderr: d.stderr,
      }))
    );
}

export interface ICountyInfo {
  region: string;
  signals: { signal: string; value?: number | null; stderr?: number | null }[];
}

export function fetchCounty(region: string, date: Date): Promise<ICountyInfo> {
  return Promise.all(signals.map((signal) => fetchSignalCounty(signal.data, region, date))).then((infos) => {
    return {
      region,
      signals: signals.map((signal, i) => {
        const info = infos[i];
        return {
          signal: signal.id,
          ...(info[0] ?? {}),
        };
      }),
    };
  });
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
