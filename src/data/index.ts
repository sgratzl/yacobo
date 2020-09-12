import fetch from 'cross-fetch';

const ENDPOINT = 'https://api.covidcast.cmu.edu/epidata/api.php';

export interface ISignal {
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

const fetchOptions = process.env.NODE_ENV === 'development' ? { cache: 'force-cache' as const } : undefined;

export function fetchMeta(): Promise<ISignal[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set('source', 'covidcast_meta');
  url.searchParams.set('fields', ['data_source', 'signal', 'mean_value', 'stdev_value'].join(','));
  url.searchParams.set('signals', signals.map((d) => `${d.dataSource}:${d.signal}`).join(','));
  url.searchParams.set('geo_types', 'county');
  url.searchParams.set('time_types', 'day');
  url.searchParams.set('format', 'json');
  return fetch(url.toString(), fetchOptions)
    .then((r) => r.json())
    .then((data: any[]) => {
      const lookup = new Map(
        data.map((d) => [`${d.data_source}:${d.signal}`, { mean: d.mean_value, stdev: d.stdev_value }])
      );
      return signals.map((s) => ({
        ...s,
        ...lookup.get(`${s.dataSource}:${s.signal}`)!,
      }));
    });
}
