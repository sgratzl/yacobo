import type { ISignal } from '@/model';
import { addDays, eachDayOfInterval, formatISO, isBefore, min, parseISO } from 'date-fns';

export const ENDPOINT = 'https://api.covidcast.cmu.edu/epidata/api.php';

export function formatCCastAPIDate(date: number | Date) {
  return formatISO(date, { representation: 'date' });
}

export function parseCCastAPIDate(v: number | string) {
  return parseISO(`${v}T000000-05`);
}

export function formatTimeValues(date: Date | Interval | Date[]) {
  if (date instanceof Date) {
    return formatCCastAPIDate(date);
  }
  if (Array.isArray(date)) {
    return date.map(formatCCastAPIDate).join(',');
  }
  return `${formatCCastAPIDate(date.start)}:${formatCCastAPIDate(date.end)}`;
}

export function buildCovidCastURL(signal: ISignal['data']) {
  const url = new URL(ENDPOINT);
  url.searchParams.set('source', 'covidcast');
  url.searchParams.set('time_type', 'day');
  url.searchParams.set('format', 'json');
  url.searchParams.set('data_source', signal.dataSource);
  url.searchParams.set('signal', signal.signal);
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
