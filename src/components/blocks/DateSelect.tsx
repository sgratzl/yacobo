import { formatAPIDate } from '@/common';
import { isValid, subDays, addDays } from 'date-fns';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import styles from './Select.module.css';
import DatePicker from './DatePicker';
import { injectQuery } from './BaseLayout';
import { Button, Tooltip } from 'antd';
import LeftOutlined from '@ant-design/icons/LeftOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';

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
  const previous = useCallback(() => {
    if (date) {
      onSelect(subDays(date, 1));
    }
  }, [date, onSelect]);
  const next = useCallback(() => {
    if (date) {
      onSelect(addDays(date, 1));
    }
  }, [date, onSelect]);
  const dd = !date || !isValid(date) ? undefined : date;
  return (
    <span>
      {' as of '}
      <DatePicker
        className={styles.picker}
        value={dd}
        onChange={onSelect}
        placeholder="Select Date"
        allowClear={clearPath != null}
        format="MMM, d"
      />
      <Tooltip title="Go to the previous day">
        <Button onClick={previous}>
          <LeftOutlined />
        </Button>
      </Tooltip>
      <Tooltip title="Go to the next day">
        <Button onClick={next}>
          <RightOutlined />
        </Button>
      </Tooltip>
    </span>
  );
}
