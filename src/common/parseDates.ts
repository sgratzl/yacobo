import { IDateValue } from '@/model';
import { addDays, compareAsc, differenceInDays, parseJSON, subDays } from 'date-fns';
import { formatAPIDate } from '.';

function identity(v: any) {
  return v;
}

// based on https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c
type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};
type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];

export function startOfISOToday() {
  return startOfISODate(new Date());
}

export function startOfISODate(date: Date) {
  const time = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
  return new Date(time);
}

export function parseDate(date: number | string | Date) {
  return startOfISODate(parseJSON(date));
}
/**
 * helper method for parsing serialized dates
 * @param fields
 */
export function parseDates<T>(fields: AllowedNames<T, Date>[]) {
  if (fields.length === 0) {
    return identity as (data: T[]) => T[];
  }
  if (fields.length === 1) {
    const field = fields[0];
    return (data: T[]) => {
      // parse serialized dates
      for (const row of data) {
        row[field] = parseDate(row[field] as any) as any;
      }
      return data;
    };
  }
  // multiple
  return (data: T[]) => {
    // parse serialized dates
    for (const row of data) {
      for (const field of fields) {
        row[field] = parseDate(row[field] as any) as any;
      }
    }
    return data;
  };
}

export function imputeMissingImpl<T extends IDateValue>(data: T[], mixin: Omit<T, 'date'>) {
  if (data.length < 2) {
    return data;
  }
  const imputed = data.slice().sort((a, b) => compareAsc(a.date, b.date));
  for (let i = 1; i < imputed.length; i++) {
    const prev = imputed[i - 1]!;
    const current = imputed[i];
    const diff = differenceInDays(current.date, prev.date);
    if (diff <= 1) {
      continue;
    }
    // impute one or two dates for the missing values
    if (diff === 2) {
      imputed.splice(i, 0, {
        ...mixin,
        date: addDays(prev.date, 1),
      } as any);
      i++; // skip
    } else {
      imputed.splice(
        i,
        0,
        {
          ...mixin,
          date: addDays(prev.date, 1),
        } as any,
        {
          ...mixin,
          date: subDays(current.date, 1),
        } as any
      );
      // start end
      i += 2;
    }
  }
  return imputed;
}

/**
 * imputes the data such that in charts we have proper breaks
 */
export function imputeMissing<T extends IDateValue>(
  data: T[],
  mixin: Omit<T, 'date'>,
  groupBy?: AllowedNames<T, string>
) {
  if (data.length < 2) {
    return data;
  }
  if (!groupBy) {
    return imputeMissingImpl(data, mixin);
  }

  const groups = new Map<string, T[]>();
  for (const row of data) {
    const group = (row[groupBy] as unknown) as string;
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(row);
  }
  return Array.from(groups.entries())
    .map(([key, value]) => imputeMissingImpl(value, { ...mixin, [groupBy]: key } as any))
    .flat();
}
