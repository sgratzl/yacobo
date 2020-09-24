import useSWR from 'swr';
import { IDateValue, IRegion, IRegionDateValue, IRegionValue, ISignal, regionByID } from '../model';
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

function fetchInjectRegion<T extends IRegionValue>(key: string): Promise<(T & { regionObj: IRegion })[]> {
  return fetch(key)
    .then((r) => r.json())
    .then((r: T[]) => r.sort(compareValue).map((row) => ({ ...row, regionObj: regionByID(row.region) })));
}

function fetchRegionDates(key: string): Promise<(IRegionDateValue & { regionObj: IRegion })[]> {
  const parse = parseDates<IRegionDateValue>(['date']);
  return fetch(key)
    .then((r) => r.json())
    .then((r: IRegionDateValue[]) =>
      parse(r)
        .sort(compareDate)
        .map((row) => ({ ...row, regionObj: regionByID(row.region) }))
    );
}

export function useDateValue(region?: IRegion, signal?: ISignal) {
  return useSWR<IDateValue[]>(signal && region ? `/api/region/${region.id}/${signal.id}.json` : null, fetchDated);
}

export interface IRegionObjectDateValue extends IRegionDateValue {
  regionObj: IRegion;
}

export function useDateMultiRegionValue(regions: IRegion[], signal?: ISignal) {
  return useSWR<IRegionObjectDateValue[]>(
    signal && regions.length > 0 ? `/api/compare/${regions.map((d) => d.id).join(',')}/${signal.id}.json` : null,
    fetchRegionDates
  );
}
export interface IRegionObjectValue extends IRegionValue {
  regionObj: IRegion;
}

export function useRegionValue(signal?: ISignal, date?: Date) {
  const apiDate = formatAPIDate(date);
  const validDate = isValid(date);

  return useSWR<IRegionObjectValue[]>(
    validDate && signal != null ? `/api/signal/${signal.id}/${apiDate}.json` : null,
    fetchInjectRegion,
    {}
  );
}

export function useSignalHistory(signal?: ISignal) {
  return useSWR<IRegionObjectDateValue[]>(
    signal != null ? `/api/signal/${signal.id}.json` : null,
    fetchRegionDates,
    {}
  );
}
