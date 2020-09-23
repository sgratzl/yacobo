export interface IDateRange {
  earliest: Date;
  latest: Date;
}

export type ISerializedDateRange = Record<keyof IDateRange, Date | number>;

export function serializeDateRange(data: IDateRange): ISerializedDateRange {
  return {
    earliest: data.earliest.valueOf(),
    latest: data.latest.valueOf(),
  };
}
