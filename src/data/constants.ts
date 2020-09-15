import { differenceInDays, min, startOfToday } from 'date-fns';
import { ISignalMeta } from './signals';

export function selectLatestDate(meta: ISignalMeta[]) {
  const dates = meta.slice().sort((a, b) => a.maxTime.getTime() - b.maxTime.getTime());
  // use the median date
  return dates[Math.ceil(dates.length / 2)].maxTime;
}

export function selectEarliestDate(meta: ISignalMeta[]) {
  return min(meta.map((d) => d.minTime));
}

// in seconds
export enum CacheDuration {
  short = 12 * 60 * 60,
  medium = 48 * 60 * 60, // default
  long = 96 * 60 * 60,
}

export function estimateCacheDuration(date: Date) {
  return differenceInDays(date, startOfToday()) < 5 ? CacheDuration.short : CacheDuration.medium;
}
