import { parseDate } from '@/common/parseDates';
import useSWR from 'swr';
import { ISignal, ISignalMeta, ISignalWithMeta, selectEarliestDate, selectLatestDate, signalByID } from '../model';

export function addParam(url: string | undefined, key: string, value?: string | number) {
  if (!url || value == null) {
    return url;
  }
  return `${url}${url.includes('?') ? '&' : '?'}${key}=${value}`;
}

export function fetcher<T = any>(path: string): Promise<T> {
  return fetch(path).then((r) => r.json());
}

function fetchMeta() {
  return fetch('/api/signal')
    .then((r) => r.json())
    .then((rows: (ISignalMeta & { signal: string })[]) =>
      rows.map((row) => {
        const signal = signalByID(row.signal)!;
        return {
          ...signal,
          meta: {
            mean: row.mean,
            stdev: row.stdev,
            maxTime: parseDate(row.maxTime),
            minTime: parseDate(row.minTime),
          },
        } as ISignalWithMeta;
      })
    );
}
export function useFetchMeta() {
  return useSWR('/api/signal', fetchMeta, {
    refreshInterval: 6 * 60 * 60 * 1000, // 6h
  });
}

export interface ISerializedMinMax {
  min: number | Date;
  max: number | Date;
}

export function useFetchMinMaxDate(): { min?: Date; max?: Date };
export function useFetchMinMaxDate(initialData: { min: number | Date; max: number | Date }): { min: Date; max: Date };
export function useFetchMinMaxDate(initialData?: { min: number | Date; max: number | Date }) {
  const { data } = useFetchMeta();

  if (!data) {
    if (initialData) {
      return { min: parseDate(initialData.min), max: parseDate(initialData.max) };
    }
    return { min: undefined, max: undefined };
  }
  return {
    min: selectEarliestDate(data.map((d) => d.meta)),
    max: selectLatestDate(data.map((d) => d.meta)),
  };
}

export function useFetchSignalMeta(signal?: ISignal) {
  const { data } = useFetchMeta();
  return data && signal ? data.find((d) => d.id === signal.id) : undefined;
}
