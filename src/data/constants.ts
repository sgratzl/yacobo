export interface ISignal {
  dataSource: string;
  signal: string;
  id: string;
  label: string;
  description: string;

  mean: number;
  stdev: number;
}

export const signals = [
  {
    id: 'doctor-visits',
    label: 'Doctor Visits',
    description: 'How many out of 100 daily doctor visits that are due to COVID-like symptoms',
    dataSource: 'doctor-visits',
    signal: 'smoothed_adj_cli',
  },
];

export const SIGNALS = ['doctor-visits:smoothed_adj_cli'];
