import { ReactNode } from 'react';
import { formatLocal } from '../ui/utils';

export interface ISignal {
  id: string;
  name: string;
  description: ReactNode | ((date: Date) => ReactNode);
  longDescription: ReactNode | ((date: Date) => ReactNode);
  colorScheme: string;

  data: {
    unit: string;
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
    id: 'fb_survey',
    name: 'Showing Symptoms',
    description: (date: Date) =>
      `How many out of 100 participants
       of the daily Facebook survey from ${formatLocal(date)} show COVID-like symptoms`,
    longDescription: `Each day, Delphi surveys tens of thousands of Facebook users and asks them
    if they or anyone in their household are currently experiencing symptoms.
    Based on the survey results, we estimate the percentage of people with COVID-like symptoms.
    A person has "COVID-like" symptoms if they have a fever, along with either cough,
    shortness of breath, or difficulty breathing. While many other conditions can cause
    these symptoms, comparing the rates of COVID-like symptoms across the country can
    suggest where COVID is most active.`,
    colorScheme: 'blues',
    data: {
      unit: 'participants',
      maxValue: 100,
      dataSource: 'fb-survey',
      signal: 'smoothed_cli',
      hasStdErr: true,
    },
  },
  // {
  //   id: 'fb-survey-community',
  //   name: 'Knowing Someone in Community with Symptoms',
  //   description: (date: Date) =>
  //     `How many out of 100 participants
  //      of the daily Facebook survey from  ${formatLocal(date)} survey
  //      know someone in their local community with COVID-like symptoms`,
  //   longDescription: 'TODO',
  //   colorScheme: 'teals',
  //   data: {
  //     maxValue: 100,
  //     dataSource: 'fb-survey',
  //     signal: 'smoothed_hh_cmnty_cli',
  //     hasStdErr: true,
  //   },
  // },
  {
    id: 'doctor_visits',
    name: 'Doctor Visits',
    description: (date: Date) =>
      `How many out of 100 doctor visits on ${formatLocal(date)} were due to COVID-like symptoms`,
    longDescription: 'TODO',
    colorScheme: 'purples',
    data: {
      unit: 'doctor visits',
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
    colorScheme: 'yelloworangered',
    data: {
      unit: 'people',
      maxValue: 100000,
      dataSource: 'indicator-combination',
      signal: 'confirmed_7dav_incidence_num',
      hasStdErr: false,
    },
  },
  {
    id: 'hospital_admissions',
    name: 'Hospital Admissions',
    description: (date: Date) =>
      `How many out of 100 hospital admission on ${formatLocal(date)} had a COVID-19 associated diagnoses`,
    longDescription: 'TODO',
    colorScheme: 'reds',
    data: {
      unit: 'hospital admissions',
      maxValue: 100,
      dataSource: 'hospital-admissions',
      signal: 'smoothed_adj_covid19',
      hasStdErr: false,
    },
  },
  {
    id: 'antigen_tests',
    name: 'COVID-19 Antigen Tests',
    description: (date: Date) =>
      `How many out of 100 people tested by Quidel, Inc. on ${formatLocal(date)} show for COVID-19 antigens`,
    longDescription: 'TODO',
    colorScheme: 'yellowgreen',
    data: {
      unit: 'people',
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
      `How many out of 100,000 people died on ${formatLocal(date)} because of COVID (7-day average)`,
    longDescription: 'based on data reported by USAFacts and Johns Hopkins University',
    colorScheme: 'bluepurple',
    data: {
      unit: 'people',
      maxValue: 100000,
      dataSource: 'indicator-combination',
      signal: 'deaths_7dav_incidence_num',
      hasStdErr: false,
    },
  },
];

export const signalByID = new Map(signals.map((d) => [d.id, d]));

export function selectLatestDate(meta: ISignalMeta[]) {
  const dates = meta.slice().sort((a, b) => a.maxTime.getTime() - b.maxTime.getTime());
  // use the median date
  return dates[Math.ceil(dates.length / 2)].maxTime;
}
