import fetch from './fetchWrapper';
import { formatISO, min, parseISO, startOfDay, startOfToday, subDays } from 'date-fns';
import { signals, ISignal, ISignalWithMeta, hasMeta, ISignalMeta, selectLatestDate } from './constants';
import { IRegion } from './regions';

const ENDPOINT = 'https://api.covidcast.cmu.edu/epidata/api.php';

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

export interface IRegionValue extends IValue {
  region: string;
}

export interface ICountyWithDetailsValue extends IRegionValue {
  regionName: string;
  regionPopulation: number;
  regionState: string;
}

export interface IStateWithDetailsValue extends IRegionValue {
  regionName: string;
  regionPopulation: number;
}

export interface IDateValue extends IValue {
  date: Date;
}

export interface ISignalValue extends IValue {
  signal: string;
}
export interface ISignalWithDetailsValue extends ISignalValue {
  signalName: string;
}

export function fetchAllCounties(signal: ISignal['data'], date: Date): Promise<IRegionValue[]> {
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
  return fetch(url.toString())
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
  region: IRegion,
  date: Date | [Date, Date]
): Promise<IDateValue[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set('source', 'covidcast');
  url.searchParams.set('data_source', signal.dataSource);
  url.searchParams.set('signal', signal.signal);
  url.searchParams.set('geo_type', 'county');
  url.searchParams.set('time_type', 'day');
  url.searchParams.set('geo_value', region.id);
  url.searchParams.set(
    'time_values',
    date instanceof Date ? formatAPIDate(date) : `${formatAPIDate(date[0])}:${formatAPIDate(date[1])}`
  );
  url.searchParams.set('format', 'json');
  url.searchParams.set('fields', ['time_value', 'value', signal.hasStdErr && 'stderr'].filter(Boolean).join(','));
  return fetch(url.toString())
    .then((r) => r.json())
    .then((r) => {
      return r.map((d: any) => ({
        date: parseAPIDate(d.time_value),
        value: d.value,
        stderr: d.stderr,
      }));
    });
}

export function fetchCounty(region: IRegion, date: Date): Promise<ISignalValue[]> {
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
    signal: s.id,
    ...lookup.get(`${s.data.dataSource}:${s.data.signal}`)!,
  }));
}

export function fetchMeta(): Promise<({ signal: string } & ISignalMeta)[]> {
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
  return fetch(url.toString())
    .then((r) => r.json())
    .then(injectMeta);
}

export function fetchSignalMeta(signal: ISignal) {
  if (hasMeta(signal)) {
    return Promise.resolve(signal.meta);
  }
  return fetchMeta().then((meta) => meta.find((d) => d.signal === signal.id)!);
}

export function fetchLatestDate() {
  return fetchMeta().then(selectLatestDate);
}
