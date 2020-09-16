import { addDays, differenceInDays, startOfToday, startOfTomorrow, subDays } from 'date-fns';

// in seconds
export enum CacheDuration {
  short = 12 * 60 * 60,
  medium = 48 * 60 * 60, // default
  long = 96 * 60 * 60,
}

export function estimateCacheDuration(date: Date) {
  return differenceInDays(date, startOfToday()) < 5 ? CacheDuration.short : CacheDuration.medium;
}

const PAST_DAYS = 5;

export function estimateDateToPreRender(date: Date) {
  // for the past 5 days and all till tomorrow
  const past = Array(PAST_DAYS)
    .fill(0)
    .map((_, i) => subDays(date, i));
  const tomorrow = startOfTomorrow();

  // and till tomorrow
  const future = Array(differenceInDays(date, tomorrow))
    .fill(0)
    .map((_, i) => addDays(date, i));

  return [...past, ...future];
}
