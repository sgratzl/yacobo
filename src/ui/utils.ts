import { formatISO } from 'date-fns';

export function fetcher(path: string) {
  return fetch(path).then((r) => r.json());
}

export function formatISODate(date: Date) {
  return formatISO(date, { representation: 'date' });
}
