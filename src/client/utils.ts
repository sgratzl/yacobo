import { parseDate } from '@/common/parseDates';
import type { IDateRange, ISerializedDateRange } from '@/model';
import useSWR from 'swr';
import { ISignal, ISignalMeta, ISignalWithMeta, selectMinDate, selectLatestDate, signalByID } from '../model';

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

export function useFetchMinMaxDate(): Partial<IDateRange>;
export function useFetchMinMaxDate(initialData: ISerializedDateRange): IDateRange;
export function useFetchMinMaxDate(initialData?: ISerializedDateRange) {
  const { data } = useFetchMeta();

  if (!data) {
    if (initialData) {
      return { min: parseDate(initialData.min), latest: parseDate(initialData.latest) };
    }
    return { min: undefined, latest: undefined };
  }
  const meta = data.map((d) => d.meta);
  return {
    min: selectMinDate(meta),
    latest: selectLatestDate(meta),
  };
}

export function useFetchSignalMeta(signal?: ISignal) {
  const { data } = useFetchMeta();
  return data && signal ? data.find((d) => d.id === signal.id) : undefined;
}
