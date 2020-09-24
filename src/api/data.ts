import { regionDateSummaryDates } from '@/common/helpers';
import { parseDates } from '@/common/parseDates';
import { extractDateRange, IDateRange } from '@/model';
import { compareAsc, compareDesc } from 'date-fns';
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
  isValidRegionID,
  signals,
} from '../model';
import {
  buildCovidCastURL,
  determineBatches,
  ENDPOINT,
  formatCCastAPIDate,
  formatTimeValues,
  parseCCastAPIDate,
} from './covidcast';
import fetchCached, { fetchJSON, fetchMemoryJSON } from './fetchCached';
import type { IRequestContext } from './middleware';
import { CacheDuration, estimateCacheDuration } from './model';

export function fetchAllRegions(
  ctx: IRequestContext,
  signal: ISignal['data'],
  date: Date,
  level: 'county' | 'state' = 'county'
): Promise<IRegionValue[]> {
  const url = buildCovidCastURL(signal);
  url.searchParams.set('geo_type', level);
  url.searchParams.set('geo_value', '*');
  url.searchParams.set('time_values', formatCCastAPIDate(date));
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

export function fetchAllRegionsHistory(
  ctx: IRequestContext,
  signal: ISignal,
  range: Interval
): Promise<IRegionDateValue[]> {
  // just state level for now since we can pack it then
  const key = `${signal.id}-history-state-${formatTimeValues(range)}`;
  return fetchCached(
    ctx,
    key,
    () => {
      // fetch in batches
      const batches = determineBatches(range, 'state');
      return Promise.all(
        batches.map((batch) => {
          const b = buildCovidCastURL(signal.data);
          b.searchParams.set('geo_type', 'state');
          b.searchParams.set('geo_value', '*');
          b.searchParams.set('time_values', formatTimeValues(batch));
          b.searchParams.set(
            'fields',
            ['geo_value', 'time_value', 'value', signal.data.hasStdErr && 'stderr'].filter(Boolean).join(',')
          );
          return fetchJSON(ctx, b, {
            cache: estimateCacheDuration(batch instanceof Date ? batch : batch.end),
            process: (r: IEpiDataRow[]) =>
              r
                .filter((d) => isValidRegionID(d.geo_value))
                .map(
                  (d) =>
                    ({
                      region: regionByID(d.geo_value)!.id,
                      date: parseCCastAPIDate(d.time_value),
                      value: d.value,
                      stderr: d.stderr,
                    } as IRegionDateValue)
                )
                .sort((a, b) => compareAsc(a.date, b.date)),
            parse: parseDates(['date']),
          });
        })
      ).then((r) => r.flat());
    },
    {
      cache: CacheDuration.short,
      parse: parseDates(['date']),
    }
  );
}

export function fetchSignalRegion(
  ctx: IRequestContext,
  signal: ISignal['data'],
  region: IRegion,
  date: Date | Interval | Date[]
): Promise<IDateValue[]> {
  const url = buildCovidCastURL(signal);
  url.searchParams.set('geo_type', isStateRegion(region) ? 'state' : 'county');
  url.searchParams.set('geo_value', isStateRegion(region) ? region.short.toLowerCase() : region.id);
  url.searchParams.set('time_values', formatTimeValues(date));
  url.searchParams.set('fields', ['time_value', 'value', signal.hasStdErr && 'stderr'].filter(Boolean).join(','));
  return fetchJSON(ctx, url, {
    cache: estimateCacheDuration(date instanceof Date ? date : Array.isArray(date) ? date[date.length - 1] : date.end),
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
  range: Interval | Date[]
): Promise<IRegionDateValue[]> {
  const regionKey = regions
    .map((d) => d.id)
    .sort()
    .join(',');
  const key = `${signal.id}-${regionKey}-${formatTimeValues(range)}`;
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

export function fetchSignalMeta(ctx: IRequestContext, signal: ISignal) {
  if (hasMeta(signal)) {
    return Promise.resolve(signal.meta);
  }
  return fetchMeta(ctx).then((meta) => meta.find((d) => d.signal === signal.id)!);
}

export function fetchMinMaxDate(ctx: IRequestContext): Promise<IDateRange> {
  return fetchMeta(ctx).then(extractDateRange);
}

export function resolveMetaSignalDate(key: 'latest' | 'earliest', ctx: IRequestContext, signal: ISignal) {
  return fetchSignalMeta(ctx, signal).then((r) => {
    if (key === 'latest') {
      return r.maxTime;
    }
    return r.minTime;
  });
}

export function resolveMetaDate(key: 'latest' | 'earliest', ctx: IRequestContext) {
  return fetchMinMaxDate(ctx).then((r) => {
    if (key === 'latest') {
      return r.max;
    }
    return r.min;
  });
}
