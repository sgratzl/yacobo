import { ISignal } from '../data/constants';
import { formatISODate } from '../ui/utils';
import styles from './SignalSection.module.scss';

export default function SignalSection({ signal, date }: { signal: ISignal; date: Date }) {
  const image = `/api/signal/${signal.id}/${formatISODate(date)}.png`;
  return (
    <section key={signal.id} className={styles.root}>
      <header className={styles.header}>
        <h2>{signal.label}</h2>
      </header>
      <p className={styles.description}>{signal.description}</p>
      <img
        className={styles.map}
        src={image}
        srcSet={`${image} 1x, ${image}?scale=2 2x, ${image}?scale=3 3x`}
        alt={`US Map of ${signal.label}`}
      />
    </section>
  );
}
