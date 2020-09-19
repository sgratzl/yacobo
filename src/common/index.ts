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
