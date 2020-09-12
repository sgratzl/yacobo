import fetch from 'cross-fetch';
import { formatISO } from 'date-fns';
import { signals, ISignal } from './constants';

const ENDPOINT = 'https://api.covidcast.cmu.edu/epidata/api.php';

const fetchOptions = process.env.NODE_ENV === 'development' ? { cache: 'force-cache' as const } : undefined;

export function fetchAllCounties(signal: ISignal, date: Date) {
  const url = new URL(ENDPOINT);
  url.searchParams.set('source', 'covidcast');
  url.searchParams.set('data_source', signal.dataSource);
  url.searchParams.set('signal', signal.signal);
  url.searchParams.set('geo_type', 'county');
  url.searchParams.set('geo_value', '*');
  url.searchParams.set('time_values', formatISO(date, { representation: 'date' }));
  return fetch(url.toString(), fetchOptions).then((r) => r.json());
}

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
