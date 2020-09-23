import { formatAPIDate } from '@/common';
import { isValid, subDays, addDays } from 'date-fns';
import { useCallback } from 'react';
import styles from './Select.module.css';
import DatePicker from './DatePicker';
import { Button, Tooltip } from 'antd';
import LeftOutlined from '@ant-design/icons/LeftOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import { IRouterQuery, useRouterWrapper } from '@/client/hooks';
import type { IDateRange } from '@/common/range';

export function DateSelect({
  date,
  path,
  query,
  clearPath,
  dynamic,
}: {
  date?: Date;
  path: string;
  clearPath: string;
  query: IRouterQuery;
  dynamic?: IDateRange;
}) {
  const router = useRouterWrapper();
  const onSelect = useCallback(
    (s: Date | null) => {
      if (s) {
        router.push(path, { ...query, date: formatAPIDate(s) });
      } else if (clearPath) {
        router.push(clearPath, query);
      }
    },
    [router, path, clearPath, query]
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
