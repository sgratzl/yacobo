import { format, formatISO, isValid, parseJSON } from 'date-fns';
import { ReactNode } from 'react';
import useSWR from 'swr';
import { selectEarliestDate, selectLatestDate } from '../data/constants';
import { ISignalMeta, ISignalWithMeta, signalByID } from '../data/signals';

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

function fetchMeta(path: string) {
  return fetch(path)
    .then((r) => r.json())
    .then((rows: (ISignalMeta & { signal: string })[]) =>
      rows.map((row) => {
        const signal = signalByID(row.signal)!;
        return {
          ...signal,
          meta: {
            mean: row.mean,
            stdev: row.stdev,
            maxTime: parseJSON(row.maxTime),
            minTime: parseJSON(row.minTime),
          },
        } as ISignalWithMeta;
      })
    );
}
export function useFetchMeta() {
  return useSWR('/api/signal', fetchMeta);
}

export function useFetchMinMaxDate() {
  const { data } = useSWR('/api/signal', fetchMeta);

  if (!data) {
    return { min: undefined, max: undefined };
  }
  return {
    min: selectEarliestDate(data.map((d) => d.meta)),
    max: selectLatestDate(data.map((d) => d.meta)),
  };
}

export function f<T>(value: ReactNode | ((arg?: T) => ReactNode), arg?: T) {
  return typeof value === 'function' ? value(arg) : value;
}
