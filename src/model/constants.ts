import { min } from 'date-fns';
import { ISignalMeta } from './signals';

export function selectLatestDate(meta: ISignalMeta[]) {
  const dates = meta.slice().sort((a, b) => a.maxTime.valueOf() - b.maxTime.valueOf());
  // use the median date
  return dates[Math.ceil(dates.length / 2)].maxTime;
}

export function selectEarliestDate(meta: ISignalMeta[]) {
  return min(meta.map((d) => d.minTime));
}
