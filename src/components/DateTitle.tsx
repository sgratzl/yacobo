import { useRouter } from 'next/router';
import { useCallback } from 'react';
import DatePicker from '../components/DatePicker';
import { formatISODate } from '../ui/utils';
import styles from './DateTitle.module.scss';

export default function DateTitle({ date }: { date?: Date }) {
  const router = useRouter();
  const jump = useCallback(
    (date: Date | null) => {
      if (date) {
        router.push(`/history/[date]`, `/history/${formatISODate(date)}`);
      }
    },
    [router]
  );

  return (
    <span className={styles.title}>
      COVID as of
      <DatePicker className={styles.picker} value={date} onChange={jump} allowClear={false} format="MMM, d" />
    </span>
  );
}
