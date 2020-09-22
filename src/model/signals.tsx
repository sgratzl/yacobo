import { formatLocal } from '@/common';
import { ReactNode } from 'react';

export interface ISignal {
  id: string;
  name: string;
  description: (date?: Date) => string;
  longDescription: (date?: Date) => ReactNode;
  seeAlso: { href: string; alt: string }[];
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

function dated(prefix: string, date?: Date) {
  return date ? ` ${prefix} ${formatLocal(date)}` : '';
}

const base: (ISignal | false)[] = [
  {
    id: 'fb_survey',
    name: 'Showing Symptoms',
    description: (date?: Date) =>
      `How many out of 100 participants of the daily Facebook survey${dated('from', date)} show COVID-like symptoms`,
    longDescription: () => `Every day, Delphi surveys tens of thousands of Facebook users,
    asking a broad set of COVID-related questions, including whether they, or anyone in their household,
    are currently experiencing symptoms. We also ask questions about well-being and various lockdown measures,
    including mask wearing. For this signal, we estimate the percentage of people self-reporting COVID-like symptoms.
    COVID-like symptoms are defined as having fever, along with either cough, shortness of breath, or difficulty breathing.
    While many other conditions can cause these symptoms, comparing the rates of COVID-like symptoms across the country
    can suggest where COVID is most active.`,
    seeAlso: [
      {
        href: 'https://covidcast.cmu.edu/surveys.html',
        alt: 'More information',
      },
      {
        href: 'https://cmu-delphi.github.io/delphi-epidata/api/covidcast-signals/fb-survey.html',
        alt: 'Technical description',
      },
    ],
    colorScheme: 'blues',
    data: {
      unit: 'participants',
      maxValue: 100,
      dataSource: 'fb-survey',
      signal: 'smoothed_cli',
      hasStdErr: true,
    },
  },
  false && {
    id: 'fb-survey-community',
    name: 'Knowing Someone in Community with Symptoms',
    description: (date?: Date) =>
      `How many out of 100 participants of the daily Facebook survey${dated(
        'from',
        date
      )} survey know someone in their local community with COVID-like symptoms`,
    longDescription: () => `Every day, Delphi surveys tens of thousands of Facebook users, asking them a broad set of COVID-related questions,
    including whether they, or anyone in their household, are currently experiencing symptoms.
    We also ask them if they know anyone in their local community who is sick with fever and either sore throat,
    cough, shortness of breath, or difficulty breathing.
    For this indicator, we calculate the percentage of people who know someone, in their household or outside it, who is sick.
    While many conditions can cause these symptoms, not just COVID, comparing the rates across the country
    can suggest where COVID is most active.`,
    seeAlso: [
      {
        alt: 'More information',
        href: 'https://covidcast.cmu.edu/surveys.html',
      },
      {
        alt: 'Technical description',
        href: 'https://cmu-delphi.github.io/delphi-epidata/api/covidcast-signals/fb-survey.html',
      },
    ],
    colorScheme: 'teals',
    data: {
      unit: 'participants',
      maxValue: 100,
      dataSource: 'fb-survey',
      signal: 'smoothed_hh_cmnty_cli',
      hasStdErr: true,
    },
  },
  {
    id: 'doctor_visits',
    name: 'Doctor Visits',
    description: (date?: Date) =>
      `How many out of 100 doctor visits${dated('on', date)} were due to COVID-like symptoms`,
    longDescription: () => `Delphi receives from our health system partners aggregated statistics on COVID-related outpatient doctor visits,
    derived from ICD codes found in insurance claims. Using this data, Delphi estimates the percentage of daily doctor’s visits in each area that are due to COVID-like illnesses.
    Note that these estimates are based only on visits by patients whose data is accessible by our partners.`,
    seeAlso: [
      {
        alt: 'Technical description',
        href: 'https://cmu-delphi.github.io/delphi-epidata/api/covidcast-signals/doctor-visits.html',
      },
    ],
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
    name: 'Cases',
    description: (date?: Date) =>
      `How many out of 100,000 people are newly reported COVID cases${dated('on', date)} (7-day average)`,
    longDescription: () => (
      <>
        {`The maps reflect only cases reported by state and local health authorities.
    They are based on case counts compiled and made public by
    `}
        <a href="https://systems.jhu.edu/research/public-health/ncov/" target="_blank" rel="noopener noreferrer">
          a team at Johns Hopkins University
        </a>
        {` and by `}
        <a
          href="https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/"
          target="_blank"
          rel="noopener noreferrer"
        >
          USAFacts
        </a>
        {`. We use Johns Hopkins data for Puerto Rico and report USAFacts data in all other locations.
    Note that “confirmed cases” covers only those infections that were detected via testing, not all infections.
    The signal may not be directly comparable across regions with vastly different testing capacity.`}
      </>
    ),
    seeAlso: [
      {
        alt: 'Technical description',
        href:
          'https://cmu-delphi.github.io/delphi-epidata/api/covidcast-signals/indicator-combination.html#compositional-signals-confirmed-cases-and-deaths',
      },
    ],
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
    id: 'antigen_tests',
    name: 'COVID-19 Antigen Tests',
    description: (date?: Date) =>
      `How many out of 100 people tested by Quidel, Inc.${dated('on', date)} show for COVID-19 antigens`,
    longDescription: () => `Quidel, a national provider of networked lab testing devices, provides us with data from every COVID antigen test
    that they conduct. When a patient (whether at a doctor’s office, clinic, or hospital) has COVID-like symptoms,
    doctors may order an antigen test, which can detect parts of the virus that are present during an active infection.
    We report the percentage of COVID antigen tests that are positive. Note that this signal only includes
    Quidel’s antigen tests, not those run by competitors.`,
    seeAlso: [
      {
        alt: 'Technical description',
        href: 'https://cmu-delphi.github.io/delphi-epidata/api/covidcast-signals/quidel.html#covid-19-tests',
      },
    ],
    colorScheme: 'yellowgreen',
    data: {
      unit: 'tested people',
      maxValue: 100,
      dataSource: 'quidel',
      signal: 'covid_ag_smoothed_pct_positive',
      hasStdErr: true,
    },
  },
  {
    id: 'hospital_admissions',
    name: 'Hospital Admissions',
    description: (date?: Date) =>
      `How many out of 100 hospital admission${dated('on', date)} had a COVID-19 associated diagnoses`,
    longDescription: () => `Delphi receives de-identified electronic medical records and claims data from our health systems partners.
    Based on diagnostic codes, we calculate the percentage of new hospital admissions each day that are related to COVID-19.
    Note that this  signal only covers those regions and patients whose data is observed by our partners,
    and addresses new hospital admissions each day, not all currently hospitalized patients who have COVID-related diagnoses.`,
    seeAlso: [
      {
        alt: 'Technical description',
        href: 'https://cmu-delphi.github.io/delphi-epidata/api/covidcast-signals/hospital-admissions.html',
      },
    ],
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
    id: 'deaths',
    name: 'Deaths',
    description: (date?: Date) =>
      `How many out of 100,000 people are newly reported COVID deaths${dated('on', date)} (7-day average)`,
    longDescription: () => (
      <>
        {`This data shows the number of COVID-19 related deaths reported each day.
    The maps reflect official figures by state and local health authorities,
    and may not include excess deaths not confirmed as due to COVID-19 by health authorities.
    They are based on death counts compiled and made public by `}
        <a href="https://systems.jhu.edu/research/public-health/ncov/" target="_blank" rel="noopener noreferrer">
          a team at Johns Hopkins University
        </a>
        {` and by `}
        <a
          href="https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/"
          target="_blank"
          rel="noopener noreferrer"
        >
          USAFacts
        </a>
        {`. We use Johns Hopkins data for Puerto Rico and report USAFacts data in all other locations.`}
      </>
    ),
    seeAlso: [
      {
        alt: 'Technical description',
        href:
          'https://cmu-delphi.github.io/delphi-epidata/api/covidcast-signals/indicator-combination.html#compositional-signals-confirmed-cases-and-deaths',
      },
    ],
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

export const signals = base.filter((d): d is ISignal => Boolean(d));

const byID = new Map(signals.map((d) => [d.id, d]));

export function signalByID(signal: string) {
  return !signal ? undefined : byID.get(signal.toLowerCase());
}

export const refSignal = signals.find((d) => d.id === 'cases')!;

export function getValueDomain(signal: ISignal, meta: ISignalMeta) {
  return [0, Math.min(signal.data.maxValue, Math.ceil(meta.mean + 3 * meta.stdev))] as const;
}

export function getValueScale(signal: ISignal, meta: ISignalMeta) {
  const domain = getValueDomain(signal, meta);
  const range = domain[1] - domain[0];
  return (value: number) => Math.min(1, Math.max(0, (value - domain[0]) / range));
}
