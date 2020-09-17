export * from './constants';
export * from './signals';
export * from './regions';

export interface IValue {
  value?: number | null;
  stderr?: number | null;
}

export type RequiredValue<T> = T & { value: number };

export interface IRegionValue extends IValue {
  region: string;
}

export interface IRegionDetails {
  regionName: string;
  regionPopulation: number;
  regionState?: string;
}

export interface IRegionWithDetailsValue extends IRegionValue, IRegionDetails {}

export interface IDateValue extends IValue {
  date: Date;
}
export interface IRegionDateValue extends IDateValue, IRegionValue {}
export interface ISignalDateValue extends IDateValue, ISignalValue {}

export interface IRegionDateWithDetailsValue extends IDateValue, IRegionWithDetailsValue {}

export interface ISignalValue extends IValue {
  signal: string;
}

export interface ISignalDetails {
  signalName: string;
}

export interface ISignalWithDetailsValue extends ISignalValue, ISignalDetails {}

export interface IEpiDataRow {
  signal: string;
  geo_value: string;
  time_value: number;
  value: number;
  stderr: number;
}
