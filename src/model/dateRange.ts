import { parseDate, startOfISODate } from '@/common/parseDates';
import { min, max, startOfTomorrow } from 'date-fns';
import type { ISignalMeta } from './signals';

export function historyRange() {
  return {
    start: startOfISODate(new Date(2020, 1, 1)),
    end: startOfISODate(startOfTomorrow()),
  };
}
export interface IDateRange {
  /**
   * minimal date for which we have any signal
   */
  min: Date;
  /**
   * maximal date for which we have any signal
   */
  max: Date;
  /**
   * default date for which we have most signals
   */
  default: Date;
  /**
   * minimal date for which we all signals
   */
  minAll: Date;
  /**
   * maximal date for which we all signals
   */
  maxAll: Date;
}

export type ISerializedDateRange = Record<keyof IDateRange, Date | number>;

export function serializeDateRange(data: IDateRange): ISerializedDateRange {
  return {
    min: data.min.valueOf(),
    max: data.max.valueOf(),
    default: data.default.valueOf(),
    minAll: data.minAll.valueOf(),
    maxAll: data.maxAll.valueOf(),
  };
}

export function deserializeDateRange(meta: ISerializedDateRange): IDateRange {
  return {
    min: parseDate(meta.min),
    max: parseDate(meta.max),
    default: parseDate(meta.default),
    minAll: parseDate(meta.minAll),
    maxAll: parseDate(meta.maxAll),
  };
}

function selectLatestDate(meta: ISignalMeta[]) {
  const dates = meta.slice().sort((a, b) => a.maxTime.valueOf() - b.maxTime.valueOf());
  // use the median date
  return dates[Math.ceil(dates.length / 2)].maxTime;
}

export const UNDEFINED_DATE_RANGE: Partial<IDateRange> = {
  min: undefined,
  default: undefined,
  max: undefined,
  maxAll: undefined,
  minAll: undefined,
};

export function extractDateRange(meta: ISignalMeta[]): IDateRange {
  const minDates = meta.map((d) => d.minTime);
  const maxDates = meta.map((d) => d.maxTime);
  return {
    min: min(minDates),
    max: max(maxDates),
    default: selectLatestDate(meta),
    minAll: max(minDates),
    maxAll: min(maxDates),
  };
}
