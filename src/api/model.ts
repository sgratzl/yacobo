import { addDays, differenceInDays, endOfTomorrow, startOfToday, subDays } from 'date-fns';

// in seconds
const HOURS = 60 * 60;
export enum CacheDuration {
  short = 12 * HOURS,
  medium = 48 * HOURS, // default
  long = 96 * HOURS,
}

export function estimateCacheDuration(date: Date | number) {
  return differenceInDays(date, startOfToday()) < 5 ? CacheDuration.short : CacheDuration.medium;
}

const PAST_DAYS = 5;

export function estimateDateToPreRender(date: Date) {
  // for the past 5 days and all till tomorrow
  const past = Array(PAST_DAYS)
    .fill(0)
    .map((_, i) => subDays(date, i));
  // and till tomorrow
  const difference = differenceInDays(date, endOfTomorrow());
  const future =
    difference > 0
      ? Array(difference)
          .fill(0)
          .map((_, i) => addDays(date, i))
      : [];

  return [...past, ...future];
}
