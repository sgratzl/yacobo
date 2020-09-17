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
    description: (date?: Date) => `How many out of 100 participants
       of the daily Facebook survey${dated('from', date)} show COVID-like symptoms`,
    longDescription: () => `Each day, Delphi surveys tens of thousands of Facebook users
    and asks them if they or anyone in their household are currently experiencing symptoms.
    Based on the survey results, we estimate the percentage of people with COVID-like
    symptoms. A person has "COVID-like" symptoms if they have a fever, along with either
    cough, shortness of breath, or difficulty breathing. While many other conditions
    can cause these symptoms, comparing the rates of COVID-like symptoms across the
    country can suggest where COVID is most active.`,
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
      `How many out of 100 participants
       of the daily Facebook surveyy${dated('from', date)} survey
       know someone in their local community with COVID-like symptoms`,
    longDescription: () => `Each day, Delphi surveys tens of thousands of Facebook users
    and asks them if they know anyone in their local community who is sick -- with
    fever and either sore throat, cough, shortness of breath, or difficulty breathing.
    We also ask whether anyone in their household is currently experiencing COVID-like
    symptoms. We use these questions to calculate the percentage of people who know
    someone, in their household or outside it, who is sick. While many conditions can
    cause these symptoms, not just COVID, comparing the rates across the country can
    suggest where COVID is most active.`,
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
    longDescription: () => `Delphi receives outpatient doctor visits data from our health system partners.
    Using this data, which is de-identified, Delphi estimates the percentage of daily doctor’s visits in each area
     that are related to COVID. Note that this can only report on regions and patients whose data is observed by our partners.`,
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
    name: 'Confirmed Cases',
    description: (date?: Date) =>
      `How many out of 100,000 people are newly confirmed COVID cases${dated('on', date)} (7-day average)`,
    longDescription: () => (
      <>
        {`This data shows the number of new confirmed COVID-19 cases per day. The maps reflect only cases confirmed by
        state and local health authorities. They are based on confirmed case counts compiled and made public by
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
    longDescription: () => `Quidel, a national provider of networked lab testing devices,
    provides us with data about all COVID antigen tests they conduct.
    When a patient (whether at a doctor’s office, clinic, or hospital)
    has COVID-like symptoms, doctors may order an antigen test, which can
    detect parts of the virus that are present during an active infection.
    We report the percentage of COVID antigen tests that are positive. Note
    that this only reports on Quidel’s antigen tests, not on tests conducted
    by other providers.`,
    seeAlso: [
      {
        alt: 'Technical description',
        href: 'https://cmu-delphi.github.io/delphi-epidata/api/covidcast-signals/quidel.html#covid-19-tests',
      },
    ],
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
    id: 'hospital_admissions',
    name: 'Hospital Admissions',
    description: (date?: Date) =>
      `How many out of 100 hospital admission${dated('on', date)} had a COVID-19 associated diagnoses`,
    longDescription: () => `Delphi receives de-identified electronic medical records and claims data
    from our health systems partners. Based on diagnostic codes, we calculate
    the percentage of new hospital admissions each day that are related to COVID-19.
    Note that this can only report on regions and patients whose data is observed
    by our partners, and reflects new hospital admissions each day, rather than the
    fraction of all currently hospitalized patients who have COVID-related diagnoses.`,
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
    name: 'Confirmed Deaths',
    description: (date?: Date) =>
      `How many out of 100,000 people died${dated('on', date)} because of COVID (7-day average)`,
    longDescription: () => (
      <>
        {`This data shows the number of COVID-19 related deaths per day.
    The maps reflect official figures by state and local health authorities,
    and may not include excess deaths not confirmed as due to COVID-19 by
    health authorities. They are based on confirmed death counts compiled
    and made public by `}
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
        {`.
    We use Johns Hopkins data for Puerto Rico and report USAFacts data in all
    other locations.`}
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
