import { formatISO, parseISO } from 'date-fns';
import {
  hasMeta,
  IDateValue,
  IEpiDataRow,
  IRegion,
  IRegionValue,
  ISignal,
  ISignalMeta,
  ISignalValue,
  isStateRegion,
  regionByID,
  selectLatestDate,
  signals,
} from '../model';
import fetchCached, { fetchJSON, parseDates } from './fetchCached';
import { CacheDuration, estimateCacheDuration } from './model';

const ENDPOINT = 'https://api.covidcast.cmu.edu/epidata/api.php';

function formatCCastAPIDate(date: Date) {
  return formatISO(date, { representation: 'date' });
}

function parseCCastAPIDate(v: number | string) {
  return parseISO(`${v}T000000-05`);
}

export function fetchAllRegions(
  signal: ISignal['data'],
  date: Date,
  level: 'county' | 'state' = 'county'
): Promise<IRegionValue[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set('source', 'covidcast');
  url.searchParams.set('data_source', signal.dataSource);
  url.searchParams.set('signal', signal.signal);
  url.searchParams.set('geo_type', level);
  url.searchParams.set('time_type', 'day');
  url.searchParams.set('geo_value', '*');
  url.searchParams.set('time_values', formatCCastAPIDate(date));
  url.searchParams.set('format', 'json');
  url.searchParams.set('fields', ['geo_value', 'value', signal.hasStdErr && 'stderr'].filter(Boolean).join(','));

  return fetchJSON(url, {
    cache: estimateCacheDuration(date),
    process: (r: IEpiDataRow[]) =>
      r.map((d) => ({
        region: regionByID(d.geo_value)!.id,
        value: d.value,
        stderr: d.stderr,
      })),
  });
}

export function fetchSignalRegion(
  signal: ISignal['data'],
  region: IRegion,
  date: Date | [Date, Date]
): Promise<IDateValue[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set('source', 'covidcast');
  url.searchParams.set('data_source', signal.dataSource);
  url.searchParams.set('signal', signal.signal);
  url.searchParams.set('geo_type', isStateRegion(region) ? 'state' : 'county');
  url.searchParams.set('time_type', 'day');
  url.searchParams.set('geo_value', isStateRegion(region) ? region.short.toLowerCase() : region.id);
  url.searchParams.set(
    'time_values',
    date instanceof Date ? formatCCastAPIDate(date) : `${formatCCastAPIDate(date[0])}:${formatCCastAPIDate(date[1])}`
  );
  url.searchParams.set('format', 'json');
  url.searchParams.set('fields', ['time_value', 'value', signal.hasStdErr && 'stderr'].filter(Boolean).join(','));
  return fetchJSON(url, {
    cache: estimateCacheDuration(date instanceof Date ? date : date[1]),
    process: (r: IEpiDataRow[]) =>
      r.map(
        (d) =>
          ({
            date: parseCCastAPIDate(d.time_value),
            value: d.value,
            stderr: d.stderr,
          } as IDateValue)
      ),
    parse: parseDates(['date']),
  });
}

export function fetchRegion(region: IRegion, date: Date): Promise<ISignalValue[]> {
  return fetchCached(
    `${region.id}-${formatCCastAPIDate(date)}`,
    () => {
      return Promise.all(signals.map((signal) => fetchSignalRegion(signal.data, region, date))).then((infos) => {
        return signals.map((signal, i) => {
          const info = infos[i];
          return {
            signal: signal.id,
            ...(info[0] ?? {}),
          } as ISignalValue;
        });
      });
    },
    {
      cache: estimateCacheDuration(date),
    }
  );
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
        minTime: parseCCastAPIDate(d.min_time),
        maxTime: parseCCastAPIDate(d.max_time),
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
  return fetchJSON(url, {
    cache: CacheDuration.short,
    process: injectMeta,
    parse: parseDates(['maxTime', 'minTime']),
  });
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
