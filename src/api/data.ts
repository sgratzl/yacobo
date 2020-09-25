import { formatAPIDate } from '@/common';
import { regionDateSummaryDates } from '@/common/helpers';
import { parseDates } from '@/common/parseDates';
import { extractDateRange, IDateRange } from '@/model';
import { compareDesc } from 'date-fns';
import {
  hasMeta,
  IDateValue,
  IRegion,
  IRegionDateValue,
  IRegionValue,
  isCountyRegion,
  ISignal,
  ISignalMeta,
  ISignalValue,
  signals,
} from '../model';
import {
  asDateValue,
  asRegionDateValue,
  asRegionValue,
  buildCovidCastURL,
  determineBatches,
  fetchCovidMeta,
} from './covidcast';
import fetchCached, { fetchJSON } from './fetchCached';
import type { IRequestContext } from './middleware';
import { CacheDuration, estimateCacheDuration } from './model';

export function fetchAllRegions(
  ctx: IRequestContext,
  signal: ISignal,
  date: Date,
  level: 'county' | 'state' = 'county'
): Promise<IRegionValue[]> {
  const url = buildCovidCastURL(signal, level, date, ['geo_value']);

  return fetchJSON(ctx, url, {
    cache: estimateCacheDuration(date),
    process: asRegionValue,
  });
}

export function fetchAllRegionsHistory(
  ctx: IRequestContext,
  signal: ISignal,
  range: Interval
): Promise<IRegionDateValue[]> {
  // fetch in batches
  const batches = determineBatches(range, 'state');
  return Promise.all(
    batches.map((batch) => {
      const b = buildCovidCastURL(signal, 'state', batch, ['geo_value', 'time_value']);
      return fetchJSON(ctx, b, {
        cache: estimateCacheDuration(batch instanceof Date ? batch : batch.end),
        process: asRegionDateValue,
        parse: parseDates(['date']),
      });
    })
  ).then((r) => r.flat());
}

export function fetchSignalRegion(
  ctx: IRequestContext,
  signal: ISignal,
  region: IRegion,
  date: Date | Interval | Date[]
): Promise<IDateValue[]> {
  const url = buildCovidCastURL(signal, region, date, ['time_value']);
  return fetchJSON(ctx, url, {
    cache: estimateCacheDuration(date instanceof Date ? date : Array.isArray(date) ? date[date.length - 1] : date.end),
    process: asDateValue,
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
  const dateKey = Array.isArray(range)
    ? range.map(formatAPIDate).join(',')
    : `${formatAPIDate(range.start)}:${formatAPIDate(range.end)}`;
  const key = `${signal.id}-${regionKey}-${dateKey}`;

  return fetchCached(
    ctx,
    key,
    () => {
      return Promise.all(regions.map((region) => fetchSignalRegion(ctx, signal, region, range))).then((regionRows) => {
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
      });
    },
    {
      cache: CacheDuration.short,
      parse: parseDates(['date']),
    }
  );
}

export async function fetchSignalRegionDate(
  ctx: IRequestContext,
  signal: ISignal,
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
    `${region.id}-${formatAPIDate(date)}`,
    () => {
      return Promise.all(signals.map((signal) => fetchSignalRegion(ctx, signal, region, date))).then((infos) => {
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

export function fetchMeta(ctx: IRequestContext): Promise<({ signal: string } & ISignalMeta)[]> {
  return fetchCovidMeta(ctx);
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
