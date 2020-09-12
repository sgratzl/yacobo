import useSWR from 'swr';
import { fetchMeta } from '../data';
import { ISignal } from '../data/constants';

export default function SignalSection({ signal }: { signal: ISignal }) {
  const { data, error } = useSWR(`/api/meta`, fetchMeta);

  if (error) return <div>Failed to load user</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <section key={signal.id}>
      <header>
        <h2>{signal.label}</h2>
      </header>
      <p>{signal.description}</p>
      <div>
        {signal.mean} +- {signal.stdev}
      </div>
      <div>{JSON.stringify(data)}</div>
    </section>
  );
}
