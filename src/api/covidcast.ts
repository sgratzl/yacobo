import { parseDates } from '@/common/parseDates';
import {
  IDateValue,
  IRegion,
  IRegionDateValue,
  IRegionValue,
  ISignal,
  ISignalMeta,
  isStateRegion,
  isValidRegionID,
  regionByID,
  signals,
} from '@/model';
import { addDays, compareAsc, eachDayOfInterval, formatISO, isBefore, min, parseISO } from 'date-fns';
import { fetchMemoryJSON } from './fetchCached';
import type { IRequestContext } from './middleware';
import { CacheDuration } from './model';

const ENDPOINT = process.env.COVIDCAST_ENDPOINT!;

interface IEpiDataRow {
  signal: string;
  geo_value: string;
  time_value: number;
  value: number;
  stderr: number;
}

function formatCCastAPIDate(date: number | Date) {
  return formatISO(date, { representation: 'date' });
}

function parseCCastAPIDate(v: number | string) {
  return parseISO(`${v}T000000-05`);
}

function formatTimeValues(date: Date | Interval | Date[]) {
  if (date instanceof Date) {
    return formatCCastAPIDate(date);
  }
  if (Array.isArray(date)) {
    return date.map(formatCCastAPIDate).join(',');
  }
  return `${formatCCastAPIDate(date.start)}:${formatCCastAPIDate(date.end)}`;
}

export function asRegionDateValue(r: IEpiDataRow[]): IRegionDateValue[] {
  return r
    .filter((d) => isValidRegionID(d.geo_value))
    .map((d) => ({
      region: regionByID(d.geo_value)!.id,
      date: parseCCastAPIDate(d.time_value),
      value: d.value,
      stderr: d.stderr,
    }))
    .sort((a, b) => compareAsc(a.date, b.date));
}

export function asRegionValue(r: IEpiDataRow[]): IRegionValue[] {
  return r.map((d) => ({
    region: regionByID(d.geo_value)!.id,
    value: d.value,
    stderr: d.stderr,
  }));
}

export function asDateValue(r: IEpiDataRow[]): IDateValue[] {
  return r
    .map(
      (d) =>
        ({
          date: parseCCastAPIDate(d.time_value),
          value: d.value,
          stderr: d.stderr,
        } as IDateValue)
    )
    .sort((a, b) => compareAsc(a.date, b.date));
}

export function buildCovidCastURL(
  signal: ISignal,
  region: IRegion | 'state' | 'county',
  date: Date | Interval | Date[],
  fields: (keyof IEpiDataRow)[]
) {
  const url = new URL(ENDPOINT);
  url.searchParams.set('source', 'covidcast');
  url.searchParams.set('time_type', 'day');
  url.searchParams.set('format', 'json');
  url.searchParams.set('data_source', signal.data.dataSource);
  url.searchParams.set('signal', signal.data.signal);

  if (typeof region === 'string') {
    url.searchParams.set('geo_type', region);
    url.searchParams.set('geo_value', '*');
  } else {
    url.searchParams.set('geo_type', isStateRegion(region) ? 'state' : 'county');
    url.searchParams.set('geo_value', isStateRegion(region) ? region.short.toLowerCase() : region.id);
  }

  url.searchParams.set('time_values', formatTimeValues(date));
  url.searchParams.set('fields', [...fields, 'value', signal.data.hasStdErr && 'stderr'].filter(Boolean).join(','));

  return url;
}

function timeRange(range: Interval | Date[]) {
  if (Array.isArray(range)) {
    return range;
  }
  return eachDayOfInterval(range);
}

const MAX_RESULTS = 3650;

export function determineBatches(range: Interval, level: 'state' | 'county'): ({ start: Date; end: Date } | Date)[] {
  // determine which elements can be combined
  if (level === 'county') {
    // need each day since we have around 3000 and max results is 3.6k
    return timeRange(range);
  }
  const pageSize = Math.floor(MAX_RESULTS / 60);
  // can batch multiple dates
  const batches: { start: Date; end: Date }[] = [];
  let start = range.start instanceof Date ? range.start : new Date(range.start);
  while (isBefore(start, range.end)) {
    const next = addDays(start, pageSize);
    const page = {
      start,
      end: min([next, range.end]),
    };
    batches.push(page);
    start = addDays(next, 1);
  }
  return batches;
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

export function fetchCovidMeta(ctx: IRequestContext): Promise<({ signal: string } & ISignalMeta)[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set('source', 'covidcast_meta');
  url.searchParams.set('time_types', 'day');
  url.searchParams.set('format', 'json');
  url.searchParams.set('geo_types', 'county');
  url.searchParams.set(
    'fields',
    ['data_source', 'signal', 'mean_value', 'stdev_value', 'min_time', 'max_time'].join(',')
  );
  url.searchParams.set('signals', signals.map((d) => `${d.data.dataSource}:${d.data.signal}`).join(','));
  return fetchMemoryJSON(ctx, url, {
    cache: CacheDuration.short,
    process: injectMeta,
    parse: parseDates(['maxTime', 'minTime']),
  });
}
