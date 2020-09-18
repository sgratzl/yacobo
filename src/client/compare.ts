import type { SortOrder } from 'antd/lib/table/interface';
import { IDateValue, IRegion, isCountyRegion, IValue } from '../model';

function compare<T>(a?: T | null, b?: T | null, sortOrder?: SortOrder) {
  if (a === b) {
    return 0;
  }
  if (a == null) {
    return sortOrder === 'ascend' ? 1 : -1;
  }
  if (b == null) {
    return sortOrder === 'ascend' ? -1 : 1;
  }
  return a < b ? -1 : +1;
}

export function compareRegionName(a: { region: IRegion }, b: { region: IRegion }, sortOrder?: SortOrder) {
  return compare(a.region.name, b.region.name, sortOrder);
}
export function compareRegionState(a: { region: IRegion }, b: { region: IRegion }, sortOrder?: SortOrder) {
  return compare(
    isCountyRegion(a.region) ? a.region.state.name : null,
    isCountyRegion(b.region) ? b.region.state.name : null,
    sortOrder
  );
}
export function compareValue(a: IValue, b: IValue, sortOrder?: SortOrder) {
  return compare(a.value, b.value, sortOrder);
}
export function compareStdErr(a: IValue, b: IValue, sortOrder?: SortOrder) {
  return compare(a.stderr, b.stderr, sortOrder);
}
export function compareDate(a: IDateValue, b: IDateValue, sortOrder?: SortOrder) {
  return compare(a.date, b.date, sortOrder);
}
