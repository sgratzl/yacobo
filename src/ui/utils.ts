import { format, formatISO, isValid } from 'date-fns';

export function fetcher(path: string) {
  return fetch(path).then((r) => r.json());
}

export function formatISODate(date?: Date) {
  if (!date || !isValid(date)) {
    return '?';
  }
  return formatISO(date, { representation: 'date' });
}

export function formatLocal(date?: Date) {
  if (!date || !isValid(date)) {
    return '?';
  }
  return format(date, 'MMM, d');
}
