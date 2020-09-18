import useSWR from 'swr';
import { IDateValue, IRegion, IRegionValue, ISignal, regionByID } from '../model';
import { parseDates } from '@/common/parseDates';
import { compareDate, compareValue } from './compare';
import { formatAPIDate } from '@/common';
import { isValid } from 'date-fns';

function fetchDated(key: string) {
  const parse = parseDates<IDateValue>(['date']);
  return fetch(key)
    .then((r) => r.json())
    .then((r: IDateValue[]) => parse(r).sort(compareDate));
}

export function useDateValue(region?: IRegion, signal?: ISignal) {
  return useSWR<IDateValue[]>(
    signal && region ? `/api/region/${region.id}/${signal.id}.json?details` : null,
    fetchDated
  );
}

export interface IRegionObjectValue extends IRegionValue {
  regionObj: IRegion;
}

function fetchFilter(key: string) {
  return fetch(key)
    .then((r) => r.json())
    .then((r: IRegionValue[]) =>
      r
        .filter((d) => !d.region.endsWith('000'))
        .sort(compareValue)
        .map((row) => ({ ...row, regionObj: regionByID(row.region) } as IRegionObjectValue))
    );
}

export function useRegionValue(signal: ISignal, date?: Date) {
  const apiDate = formatAPIDate(date);
  const validDate = isValid(date);

  return useSWR<IRegionObjectValue[]>(validDate ? `/api/signal/${signal.id}/${apiDate}.json` : null, fetchFilter, {});
}
