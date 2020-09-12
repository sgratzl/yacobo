import useSWR from 'swr';
import { ICountyValue } from '../data';
import { ISignal } from '../data/constants';
import { fetcher } from '../ui/utils';

export default function SignalSection({ signal }: { signal: ISignal }) {
  const { data } = useSWR<ICountyValue[]>(`/api/signal/${signal.id}`, fetcher);
  return (
    <section key={signal.id}>
      <header>
        <h2>{signal.label}</h2>
      </header>
      <p>{signal.description}</p>
      <div>
        {signal.meta.mean} +- {signal.meta.stdev}
      </div>
      <div>{JSON.stringify(data)}</div>
    </section>
  );
}
