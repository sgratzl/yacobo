import { formatAPIDate, formatLocal } from '@/common';
import { isValid, subDays, addDays } from 'date-fns';
import { useCallback, useMemo } from 'react';
import styles from './Select.module.css';
import DatePicker from './DatePicker';
import { Button, Tooltip } from 'antd';
import LeftOutlined from '@ant-design/icons/LeftOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import VerticalRightOutlined from '@ant-design/icons/VerticalRightOutlined';
import VerticalLeftOutlined from '@ant-design/icons/VerticalLeftOutlined';
import { IRouterQuery, useRouterWrapper } from '@/client/hooks';
import type { IDateRange, ISignal, ISignalMeta } from '@/model';
import { useFetchDateRange, useFetchSignalMeta } from '@/client/utils';
import { isEqualDate } from '@/common/parseDates';

function DateSelectImpl({
  date,
  path,
  query,
  clearPath,
  dateRange,
}: {
  date?: Date;
  path: string;
  clearPath: string;
  query: IRouterQuery;
  dateRange?: Partial<IDateRange>;
}) {
  const { onSelect, previous, next } = useDateSelect(path, query, clearPath, date);

  const jumpDateRange = useMemo(
    () => ({
      min: () => {
        dateRange && dateRange.min && onSelect(dateRange.min);
      },
      max: () => {
        dateRange && dateRange.max && onSelect(dateRange.max);
      },
      maxAll: () => {
        dateRange && dateRange.maxAll && onSelect(dateRange.maxAll);
      },
      minAll: () => {
        dateRange && dateRange.minAll && onSelect(dateRange.minAll);
      },
      default: () => {
        dateRange && dateRange.default && onSelect(dateRange.default);
      },
    }),
    [onSelect, dateRange]
  );
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
      <Tooltip title={`Go to the earliest date in which any signals are available\n${formatLocal(dateRange?.min)}`}>
        <Button
          onClick={jumpDateRange.min}
          icon={<VerticalRightOutlined />}
          disabled={isEqualDate(dateRange?.min, date)}
        />
      </Tooltip>
      <Tooltip title={`Go to the previous day: ${formatLocal(date ? subDays(date, 1) : undefined)}`}>
        <Button onClick={previous} icon={<LeftOutlined />} disabled={isEqualDate(dateRange?.min, date)} />
      </Tooltip>
      <Tooltip title={`Go to the latest date in which all signals are available: ${formatLocal(dateRange?.maxAll)}`}>
        <Button
          onClick={jumpDateRange.maxAll}
          icon={<CalendarOutlined />}
          disabled={isEqualDate(dateRange?.maxAll, date)}
        />
      </Tooltip>
      <Tooltip title={`Go to the next day: ${formatLocal(date ? addDays(date, 1) : undefined)}`}>
        <Button onClick={next} icon={<RightOutlined />} disabled={isEqualDate(dateRange?.max, date)} />
      </Tooltip>
      <Tooltip title={`Go to the latest date in which any signal is available: ${formatLocal(dateRange?.max)}`}>
        <Button
          onClick={jumpDateRange.max}
          icon={<VerticalLeftOutlined />}
          disabled={isEqualDate(dateRange?.max, date)}
        />
      </Tooltip>
    </span>
  );
}

function DateSelectLoader(props: { date?: Date; path: string; clearPath: string; query: IRouterQuery }) {
  const dataRange = useFetchDateRange();
  return <DateSelectImpl {...props} dateRange={dataRange} />;
}

export function DateSelect(props: {
  date?: Date;
  path: string;
  clearPath: string;
  query: IRouterQuery;
  dateRange?: IDateRange;
}) {
  if (props.dateRange) {
    return <DateSelectImpl {...props} />;
  }
  return <DateSelectLoader {...props} />;
}

export function DateSignalSelect({
  date,
  signal,
  path,
  query,
  clearPath,
}: {
  date?: Date;
  signal?: ISignal;
  path: string;
  clearPath: string;
  query: IRouterQuery;
  signalMeta?: ISignalMeta;
  dateRange?: IDateRange;
}) {
  const { onSelect, previous, next } = useDateSelect(path, query, clearPath, date);

  const meta = useFetchSignalMeta(signal);
  const jumpSignalMeta = useMemo(
    () => ({
      min: () => {
        meta && onSelect(meta.meta.minTime);
      },
      max: () => {
        meta && onSelect(meta.meta.maxTime);
      },
    }),
    [onSelect, meta]
  );

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
      <Tooltip title={`Go to the earliest date in which data is available: ${formatLocal(meta?.meta.minTime)}`}>
        <Button
          onClick={jumpSignalMeta.min}
          icon={<VerticalRightOutlined />}
          disabled={isEqualDate(meta?.meta.minTime, date)}
        />
      </Tooltip>
      <Tooltip title={`Go to the previous day: ${formatLocal(date ? subDays(date, 1) : undefined)}`}>
        <Button onClick={previous} icon={<LeftOutlined />} disabled={isEqualDate(meta?.meta.minTime, date)} />
      </Tooltip>
      <Tooltip title={`Go to the next day: ${formatLocal(date ? addDays(date, 1) : undefined)}`}>
        <Button onClick={next} icon={<RightOutlined />} disabled={isEqualDate(meta?.meta.maxTime, date)} />
      </Tooltip>
      <Tooltip title={`Go to the latest date in which data is available: ${formatLocal(meta?.meta.maxTime)}`}>
        <Button
          onClick={jumpSignalMeta.max}
          icon={<VerticalLeftOutlined />}
          disabled={isEqualDate(meta?.meta.maxTime, date)}
        />
      </Tooltip>
    </span>
  );
}

function useDateSelect(
  path: string,
  query: Record<string, string | Date | string[] | { id: string } | { id: string }[] | null | undefined>,
  clearPath: string,
  date: Date | undefined
) {
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
  return { onSelect, previous, next };
}
