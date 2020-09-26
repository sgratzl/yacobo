import type { PropsWithChildren, ReactNode } from 'react';
import { classNames } from '../utils';
import styles from './ColorBox.module.css';

export default function ColorBox({ children, color }: PropsWithChildren<{ color: string }>) {
  return (
    <span className={styles.color} style={{ '--color': color } as any}>
      {children}
    </span>
  );
}

export function MissingColorBox({ children }: { children: ReactNode }) {
  return <span className={classNames(styles.color, styles.missing)}>{children}</span>;
}
