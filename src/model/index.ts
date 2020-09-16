export * from './constants';
export * from './signals';
export * from './regions';

export interface IValue {
  value?: number | null;
  stderr?: number | null;
}

export interface IRegionValue extends IValue {
  region: string;
}

export interface ICountyWithDetailsValue extends IRegionValue {
  regionName: string;
  regionPopulation: number;
  regionState: string;
}

export interface IStateWithDetailsValue extends IRegionValue {
  regionName: string;
  regionPopulation: number;
}

export interface IDateValue extends IValue {
  date: Date;
}

export interface ISignalValue extends IValue {
  signal: string;
}
export interface ISignalWithDetailsValue extends ISignalValue {
  signalName: string;
}

export interface IEpiDataRow {
  signal: string;
  geo_value: string;
  time_value: number;
  value: number;
  stderr: number;
}
