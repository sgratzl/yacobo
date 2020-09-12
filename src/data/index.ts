import fetch from 'cross-fetch';
import { differenceInHours, formatISO, min, parseISO, startOfDay, startOfToday, subDays } from 'date-fns';
import { signals, ISignal, ISignalWithMeta, hasMeta, ISignalMeta } from './constants';

const ENDPOINT = 'https://api.covidcast.cmu.edu/epidata/api.php';

const fetchOptions = process.env.NODE_ENV === 'development' ? { cache: 'force-cache' as const } : undefined;

export const LATEST = subDays(startOfToday(), 4);
export const EARLIEST = startOfDay(new Date(2020, 1, 1));

export function formatAPIDate(date: Date) {
  return formatISO(date, { representation: 'date' });
}
export function parseAPIDate(v: number | string) {
  return parseISO(`${v}T000000-05`);
}

export interface IValue {
  value?: number | null;
  stderr?: number | null;
}

export interface ICountyValue extends IValue {
  region: string;
}

export interface IDateValue extends IValue {
  date: Date;
}

export interface ISignalValue extends IValue {
  signal: string;
}

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
  console.log(url.toString());
  return fetch(url.toString(), fetchOptions)
    .then((r) => r.json())
    .then((r) =>
      r.map((d: any) => ({
        region: d.geo_value,
        value: d.value,
        stderr: d.stderr,
      }))
    );
}

export function fetchSignalCounty(
  signal: ISignal['data'],
  region: string,
  date: Date | [Date, Date]
): Promise<IDateValue[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set('source', 'covidcast');
  url.searchParams.set('data_source', signal.dataSource);
  url.searchParams.set('signal', signal.signal);
  url.searchParams.set('geo_type', 'county');
  url.searchParams.set('time_type', 'day');
  url.searchParams.set('geo_value', region);
  url.searchParams.set(
    'time_values',
    date instanceof Date ? formatAPIDate(date) : `${formatAPIDate(date[0])}:${formatAPIDate(date[1])}`
  );
  url.searchParams.set('format', 'json');
  url.searchParams.set('fields', ['time_value', 'value', signal.hasStdErr && 'stderr'].filter(Boolean).join(','));
  console.log(url.toString());
  return fetch(url.toString(), fetchOptions)
    .then((r) => r.json())
    .then((r) => {
      return r.map((d: any) => ({
        date: parseAPIDate(d.time_value),
        value: d.value,
        stderr: d.stderr,
      }));
    });
}

export function fetchCounty(region: string, date: Date): Promise<ISignalValue[]> {
  return Promise.all(signals.map((signal) => fetchSignalCounty(signal.data, region, date))).then((infos) => {
    return signals.map((signal, i) => {
      const info = infos[i];
      return {
        signal: signal.id,
        ...(info[0] ?? {}),
      };
    });
  });
}

function injectMeta(data: any[]) {
  if (!Array.isArray(data)) {
    data = Object.values(data);
  }
  const lookup = new Map<string, ISignalMeta>(
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

let cachedFetchedMeta: Promise<ISignalWithMeta[]> | null = null;
let cachedFetchedMetaDate: Date | null;

export function fetchMeta(): Promise<ISignalWithMeta[]> {
  if (cachedFetchedMeta && cachedFetchedMetaDate && differenceInHours(cachedFetchedMetaDate, new Date()) < 6) {
    return cachedFetchedMeta;
  }
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
  console.log(url.toString());
  const r = fetch(url.toString(), fetchOptions)
    .then((r) => r.json())
    .then(injectMeta);
  cachedFetchedMeta = r;
  cachedFetchedMetaDate = new Date();
  return r;
}

export function fetchSignalMeta(signal: ISignal) {
  if (hasMeta(signal)) {
    return Promise.resolve(signal.meta);
  }
  return fetchMeta().then((meta) => meta.find((d) => d.id === signal.id)!.meta);
}

export function fetchLatestDate() {
  return fetchMeta().then((data) => min(data.map((d) => d.meta.maxTime)));
}
