import type { IRegion } from './regions';
import type { ISignal } from './signals';

export * from './constants';
export * from './dateRange';
export * from './signals';
export * from './regions';

export interface ITriple {
  region?: IRegion;
  signal?: ISignal;
  date?: Date;
}

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

export interface ITripleValue extends IValue {
  date?: Date;
  signal?: string;
  region?: string;
}
