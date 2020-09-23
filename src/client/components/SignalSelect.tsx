import { Select } from 'antd';
import { useCallback } from 'react';
import { ISignal, signals } from '../../model';
import styles from './Select.module.css';
import { IRouterQuery, useRouterWrapper } from '@/client/hooks';

export function SignalSelect({
  signal,
  path,
  clearPath,
  query,
}: {
  signal?: ISignal;
  path: string;
  clearPath: string;
  query: IRouterQuery;
}) {
  const router = useRouterWrapper();
  const onSelect = useCallback(
    (s: string | null) => {
      if (s) {
        router.push(path, { ...query, signal: s });
      } else if (clearPath) {
        router.push(clearPath, query);
      }
    },
    [router, path, clearPath, query]
  );

  return (
    <span>
      <Select
        className={styles.select}
        value={signal?.id}
        onChange={onSelect}
        placeholder="All Signals"
        allowClear={clearPath != null}
        dropdownMatchSelectWidth={200}
      >
        {signals.map((s) => (
          <Select.Option key={s.id} value={s.id}>
            {s.name}
          </Select.Option>
        ))}
      </Select>
    </span>
  );
}
