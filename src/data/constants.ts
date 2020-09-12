export interface ISignal {
  id: string;
  label: string;
  description: string;

  data: {
    dataSource: string;
    signal: string;
    hasStdErr: boolean;
  };
}

export interface ISignalMeta {
  mean: number;
  stdev: number;
  minTime: Date;
  maxTime: Date;
}
export interface ISignalWithMeta extends ISignal {
  meta: ISignalMeta;
}

export function hasMeta(signal: ISignal): signal is ISignalWithMeta {
  return (signal as ISignalWithMeta).meta != null;
}

export const signals: ISignal[] = [
  {
    id: 'doctor-visits',
    label: 'Doctor Visits',
    description: 'How many out of 100 daily doctor visits that are due to COVID-like symptoms',
    data: {
      dataSource: 'doctor-visits',
      signal: 'smoothed_adj_cli',
      hasStdErr: false,
    },
  },
];

export const signalByID = new Map(signals.map((d) => [d.id, d]));
