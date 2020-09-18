import { formatAPIDate } from '@/common';
import { startOfToday } from 'date-fns';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import styles from './Select.module.css';
import DatePicker from './DatePicker';
import { injectQuery } from './BaseLayout';

const start = startOfToday();

export function DateSelect({ date, path, clearPath }: { date?: Date; path: string; clearPath?: string }) {
  const router = useRouter();
  const onSelect = useCallback(
    (s: Date | null) => {
      if (s) {
        router.push(path, injectQuery(router, path, { date: formatAPIDate(s) }));
      } else if (clearPath) {
        router.push(clearPath, injectQuery(router, clearPath));
      }
    },
    [router, path, clearPath]
  );
  return (
    <span>
      {' as of '}
      <DatePicker
        className={styles.picker}
        value={date == null ? start : date}
        onChange={onSelect}
        placeholder="Select Date"
        allowClear={clearPath != null}
        format="MMM, d"
      />
    </span>
  );
}
