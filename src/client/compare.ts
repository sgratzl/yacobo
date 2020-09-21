import type { SortOrder } from 'antd/lib/table/interface';
import { IDateValue, IRegion, isCountyRegion, IValue } from '../model';

export function compare<T>(a?: T | null, b?: T | null, sortOrder?: SortOrder) {
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

export function compareRegionName(a: { regionObj: IRegion }, b: { regionObj: IRegion }, sortOrder?: SortOrder) {
  return compare(a.regionObj.name, b.regionObj.name, sortOrder);
}
export function compareRegionState(a: { regionObj: IRegion }, b: { regionObj: IRegion }, sortOrder?: SortOrder) {
  return compare(
    isCountyRegion(a.regionObj) ? a.regionObj.state.name : null,
    isCountyRegion(b.regionObj) ? b.regionObj.state.name : null,
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
