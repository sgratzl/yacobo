import { differenceInDays, startOfToday } from 'date-fns';

// in seconds
export enum CacheDuration {
  short = 12 * 60 * 60,
  medium = 48 * 60 * 60, // default
  long = 96 * 60 * 60,
}

export function estimateCacheDuration(date: Date) {
  return differenceInDays(date, startOfToday()) < 5 ? CacheDuration.short : CacheDuration.medium;
}
