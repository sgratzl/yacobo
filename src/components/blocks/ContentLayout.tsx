import { ReactNode } from 'react';
import styles from './BaseLayout.module.scss';

export default function ContentLayout(props: { children?: ReactNode }) {
  return <div className={styles.contentDetail}>{props.children}</div>;
}
