import { format, formatISO, isValid, min, parseJSON } from 'date-fns';
import useSWR from 'swr';
import { ISignalMeta, ISignalWithMeta, selectLatestDate, signalByID } from '../data/constants';

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
        const signal = signalByID.get(row.signal)!;
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

export function useFetchLatestDate() {
  const { data } = useSWR('/api/signal', fetchMeta);

  if (!data) {
    return undefined;
  }
  return selectLatestDate(data.map((d) => d.meta));
}
