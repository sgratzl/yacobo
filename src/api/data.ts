import { regionDateSummaryDates } from '@/common/helpers';
import { parseDates } from '@/common/parseDates';
import { extractDateRange, IDateRange } from '@/model';
import { compareAsc, compareDesc, formatISO, parseISO } from 'date-fns';
import {
  hasMeta,
  IDateValue,
  IEpiDataRow,
  IRegion,
  IRegionDateValue,
  IRegionValue,
  isCountyRegion,
  ISignal,
  ISignalMeta,
  ISignalValue,
  isStateRegion,
  regionByID,
  signals,
} from '../model';
import fetchCached, { fetchJSON } from './fetchCached';
import type { IRequestContext } from './middleware';
import { CacheDuration, estimateCacheDuration } from './model';

const ENDPOINT = 'https://api.covidcast.cmu.edu/epidata/api.php';

function formatCCastAPIDate(date: Date) {
  return formatISO(date, { representation: 'date' });
}

function parseCCastAPIDate(v: number | string) {
  return parseISO(`${v}T000000-05`);
}

export function fetchAllRegions(
  ctx: IRequestContext,
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

  return fetchJSON(ctx, url, {
    cache: estimateCacheDuration(date),
    process: (r: IEpiDataRow[]) =>
      r.map((d) => ({
        region: regionByID(d.geo_value)!.id,
        value: d.value,
        stderr: d.stderr,
      })),
  });
}

function formatTimeValues(date: Date | { from: Date; to: Date } | Date[]) {
  if (date instanceof Date) {
    return formatCCastAPIDate(date);
  }
  if (Array.isArray(date)) {
    return date.map(formatCCastAPIDate).join(',');
  }
  return `${formatCCastAPIDate(date.from)}:${formatCCastAPIDate(date.to)}`;
}

export function fetchSignalRegion(
  ctx: IRequestContext,
  signal: ISignal['data'],
  region: IRegion,
  date: Date | { from: Date; to: Date } | Date[]
): Promise<IDateValue[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set('source', 'covidcast');
  url.searchParams.set('data_source', signal.dataSource);
  url.searchParams.set('signal', signal.signal);
  url.searchParams.set('geo_type', isStateRegion(region) ? 'state' : 'county');
  url.searchParams.set('time_type', 'day');
  url.searchParams.set('geo_value', isStateRegion(region) ? region.short.toLowerCase() : region.id);
  url.searchParams.set('time_values', formatTimeValues(date));
  url.searchParams.set('format', 'json');
  url.searchParams.set('fields', ['time_value', 'value', signal.hasStdErr && 'stderr'].filter(Boolean).join(','));
  return fetchJSON(ctx, url, {
    cache: estimateCacheDuration(date instanceof Date ? date : Array.isArray(date) ? date[date.length - 1] : date.to),
    process: (r: IEpiDataRow[]) =>
      r
        .map(
          (d) =>
            ({
              date: parseCCastAPIDate(d.time_value),
              value: d.value,
              stderr: d.stderr,
            } as IDateValue)
        )
        .sort((a, b) => compareAsc(a.date, b.date)),
    parse: parseDates(['date']),
  });
}

export function fetchSignalRegions(
  ctx: IRequestContext,
  signal: ISignal,
  regions: IRegion[],
  range: { from: Date; to: Date } | Date[]
): Promise<IRegionDateValue[]> {
  const key = `${signal.id}-${regions
    .map((d) => d.id)
    .sort()
    .join(',')}`;
  return fetchCached(
    ctx,
    key,
    () => {
      return Promise.all(regions.map((region) => fetchSignalRegion(ctx, signal.data, region, range))).then(
        (regionRows) => {
          return regions
            .map((region, i) => {
              const rows = regionRows[i];
              return rows.map(
                (row) =>
                  ({
                    region: region.id,
                    ...row,
                  } as IRegionDateValue)
              );
            })
            .flat();
        }
      );
    },
    {
      cache: CacheDuration.short,
      parse: parseDates(['date']),
    }
  );
}

export async function fetchSignalRegionDate(
  ctx: IRequestContext,
  signal: ISignal['data'],
  region: IRegion,
  date: Date
): Promise<IRegionDateValue[]> {
  // fetch multiple time stamps along with state info
  const dates = regionDateSummaryDates(date);

  const countyData = fetchSignalRegion(ctx, signal, region, dates);
  // fetch also its state
  const stateData = isCountyRegion(region) ? fetchSignalRegion(ctx, signal, region.state, dates) : Promise.resolve([]);

  const [county, state] = await Promise.all([countyData, stateData]);

  const result: IRegionDateValue[] = county
    .map((row) => ({
      ...row,
      region: region.id,
    }))
    .sort((a, b) => compareDesc(a.date, b.date));

  if (isCountyRegion(region)) {
    result.push(
      ...state
        .map((row) => ({
          ...row,
          region: region.state.id,
        }))
        .sort((a, b) => compareDesc(a.date, b.date))
    );
  }
  return result;
}

export function fetchRegion(ctx: IRequestContext, region: IRegion, date: Date): Promise<ISignalValue[]> {
  return fetchCached(
    ctx,
    `${region.id}-${formatCCastAPIDate(date)}`,
    () => {
      return Promise.all(signals.map((signal) => fetchSignalRegion(ctx, signal.data, region, date))).then((infos) => {
        return signals
          .map((signal, i) => {
            const info = infos[i];
            return {
              signal: signal.id,
              ...(info[0] ?? {}),
            } as ISignalValue;
          })
          .sort((a, b) => a.signal.localeCompare(b.signal));
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

export function fetchMeta(ctx: IRequestContext): Promise<({ signal: string } & ISignalMeta)[]> {
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
  return fetchJSON(ctx, url, {
    cache: CacheDuration.short,
    process: injectMeta,
    parse: parseDates(['maxTime', 'minTime']),
  });
}

export function fetchSignalMeta(ctx: IRequestContext, signal: ISignal) {
  if (hasMeta(signal)) {
    return Promise.resolve(signal.meta);
  }
  return fetchMeta(ctx).then((meta) => meta.find((d) => d.signal === signal.id)!);
}

export function fetchMinMaxDate(ctx: IRequestContext): Promise<IDateRange> {
  return fetchMeta(ctx).then(extractDateRange);
}
