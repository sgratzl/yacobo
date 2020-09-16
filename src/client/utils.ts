import { parseJSON } from 'date-fns';
import { ReactNode } from 'react';
import useSWR from 'swr';
import { ISignalMeta, ISignalWithMeta, selectEarliestDate, selectLatestDate, signalByID } from '../model';

export function fetcher(path: string) {
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
            maxTime: parseJSON(row.maxTime),
            minTime: parseJSON(row.minTime),
          },
        } as ISignalWithMeta;
      })
    );
}
export function useFetchMeta() {
  return useSWR('/api/signal', fetchMeta, {
    refreshInterval: 6 * 60 * 60, // 6h
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
      return { min: parseJSON(initialData.min), max: parseJSON(initialData.max) };
    }
    return { min: undefined, max: undefined };
  }
  return {
    min: selectEarliestDate(data.map((d) => d.meta)),
    max: selectLatestDate(data.map((d) => d.meta)),
  };
}
