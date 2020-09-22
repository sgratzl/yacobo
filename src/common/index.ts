import { IRegion } from '@/model';
import { format, formatISO, isValid } from 'date-fns';

export function formatAPIDate(date?: Date | number) {
  if (!date || !isValid(date)) {
    return '?';
  }
  return formatISO(date, { representation: 'date' });
}

export function formatLocal(date?: Date) {
  if (!date || !isValid(date)) {
    return '?';
  }
  return format(date, 'MMM, d');
}

export function formatValue(value?: number | null) {
  if (value == null) {
    return '?';
  }
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });
}

export function formatFixedValue(value?: number | null) {
  if (value == null) {
    return '?';
  }
  return value.toFixed(1);
}

export function formatAPIRegions(regions: string[]): string;
export function formatAPIRegions(regions: IRegion[]): string;
export function formatAPIRegions(regions: (IRegion | string)[]): string {
  return regions.map((r) => (typeof r === 'string' ? r : r.id)).join(',');
}
