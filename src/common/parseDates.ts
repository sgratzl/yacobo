import { parseJSON, startOfDay } from 'date-fns';

function identity(v: any) {
  return v;
}

// based on https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c
type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};
type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];

export function parseDate(date: number | string | Date) {
  return startOfDay(parseJSON(date));
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
