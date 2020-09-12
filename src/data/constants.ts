import { ReactNode } from 'react';
import { formatLocal } from '../ui/utils';

export interface ISignal {
  id: string;
  name: string;
  description: ReactNode | ((date: Date) => ReactNode);
  longDescription: ReactNode | ((date: Date) => ReactNode);
  colorScheme: string;

  data: {
    maxValue: number;
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
    id: 'fb-survey',
    name: 'Showing Symptoms',
    description: (date: Date) =>
      `How many out of 100 participants
       of the daily Facebook survey from ${formatLocal(date)} show COVID-like symptoms`,
    longDescription: 'TODO',
    colorScheme: 'blues',
    data: {
      maxValue: 100,
      dataSource: 'fb-survey',
      signal: 'smoothed_cli',
      hasStdErr: true,
    },
  },
  {
    id: 'fb-survey-community',
    name: 'Knowing Someone in Community with Symptoms',
    description: (date: Date) =>
      `How many out of 100 participants
       of the daily Facebook survey from  ${formatLocal(date)} survey
       know someone in their local community with COVID-like symptoms`,
    longDescription: 'TODO',
    colorScheme: 'reds',
    data: {
      maxValue: 100,
      dataSource: 'fb-survey',
      signal: 'smoothed_hh_cmnty_cli',
      hasStdErr: true,
    },
  },
  {
    id: 'doctor-visits',
    name: 'Doctor Visits',
    description: (date: Date) =>
      `How many out of 100 doctor visits on ${formatLocal(date)} were due to COVID-like symptoms`,
    longDescription: 'TODO',
    colorScheme: 'reds',
    data: {
      maxValue: 100,
      dataSource: 'doctor-visits',
      signal: 'smoothed_adj_cli',
      hasStdErr: false,
    },
  },
  {
    id: 'cases',
    name: 'Confirmed Cases',
    description: (date: Date) =>
      `How many out of 100,000 people are newly confirmed COVID cases on ${formatLocal(date)} (7-day average)`,
    longDescription: 'based on data reported by USAFacts and Johns Hopkins University',
    colorScheme: 'reds',
    data: {
      maxValue: 100000,
      dataSource: 'indicator-combination',
      signal: 'confirmed_7dav_incidence_num',
      hasStdErr: false,
    },
  },
  {
    id: 'hospital-admissions',
    name: 'Hospital Admissions',
    description: (date: Date) =>
      `How many out of 100 hospital admission on ${formatLocal(date)} had a COVID-19 associated diagnoses`,
    longDescription: 'TODO',
    colorScheme: 'reds',
    data: {
      maxValue: 100,
      dataSource: 'hospital-admissions',
      signal: 'smoothed_adj_covid19',
      hasStdErr: false,
    },
  },
  {
    id: 'antigen-tests',
    name: 'COVID-19 Antigen Tests',
    description: (date: Date) =>
      `How many out of 100 people tested by Quidel, Inc. on ${formatLocal(date)} show for COVID-19 antigens`,
    longDescription: 'TODO',
    colorScheme: 'reds',
    data: {
      maxValue: 100,
      dataSource: 'quidel',
      signal: 'covid_ag_smoothed_pct_positive',
      hasStdErr: true,
    },
  },
  {
    id: 'deaths',
    name: 'Confirmed Deaths',
    description: (date: Date) =>
      `How many out of 100,000 people died because daily because of COVID on ${formatLocal(date)} (7-day average)`,
    longDescription: 'based on data reported by USAFacts and Johns Hopkins University',
    colorScheme: 'reds',
    data: {
      maxValue: 100000,
      dataSource: 'indicator-combination',
      signal: 'deaths_7dav_incidence_num',
      hasStdErr: true,
    },
  },
];

export const signalByID = new Map(signals.map((d) => [d.id, d]));
