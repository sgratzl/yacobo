import { startOfISODate } from '@/common/parseDates';
import { min, startOfTomorrow } from 'date-fns';
import type { ISignalMeta } from './signals';

export function selectLatestDate(meta: ISignalMeta[]) {
  const dates = meta.slice().sort((a, b) => a.maxTime.valueOf() - b.maxTime.valueOf());
  // use the median date
  return dates[Math.ceil(dates.length / 2)].maxTime;
}

export function selectEarliestDate(meta: ISignalMeta[]) {
  return min(meta.map((d) => d.minTime));
}

export function historyRange() {
  return {
    from: startOfISODate(new Date(2020, 1, 1)),
    to: startOfISODate(startOfTomorrow()),
  };
}

export const ZERO_COLOR = 'rgb(242,242,242)';
export const MAP_STROKE = '#eaeaea';

export const DEFAULT_CHART_COLOR = 'grey';
export const DEFAULT_CHART_AREA_OPACITY = 0.25;
export const HIGHLIGHT_COLOR = '#ff7f00';
export const HIGHLIGHT_LIGHT_COLOR = '#fdbf6f';

export const COMPARE_LIGHT_COLORS = ['#a6cee3', '#b2df8a', '#fb9a99', '#cab2d6'];
export const COMPARE_COLORS = ['#1f78b4', '#33a02c', '#e31a1c', '#6a3d9a'];
