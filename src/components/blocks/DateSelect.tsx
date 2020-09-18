import { formatAPIDate } from '@/common';
import { startOfToday } from 'date-fns';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import DatePicker from './DatePicker';
import { injectQuery } from './BaseLayout';

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
      <style jsx>{`
        .picker {
          font-size: inherit;
          background-color: unset;
          margin: 0 0.5em;
        }
        .picker :global(input) {
          font-size: inherit;
          font-weight: inherit;
          line-height: inherit;
        }
      `}</style>
      {' as of '}
      <DatePicker
        className="picker"
        value={date || startOfToday()}
        onChange={onSelect}
        placeholder="Select Date"
        allowClear={clearPath != null}
        format="MMM, d"
      />
    </span>
  );
}
