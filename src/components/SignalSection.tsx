import { ISignal } from '../data';

export default function SignalSection({ signal }: { signal: ISignal }) {
  return (
    <section key={signal.id}>
      <header>
        <h2>{signal.label}</h2>
      </header>
      <p>{signal.description}</p>
      <div>{signal.mean} +- {signal.stdev}</div>
    </section>
  );
}
