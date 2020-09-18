import { Select } from 'antd';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { ISignal, signals } from '../../model';
import styles from './BaseLayout.module.scss';
import { injectQuery } from './BaseLayout';

export function SignalSelect({ signal, path, clearPath }: { signal?: ISignal; path: string; clearPath?: string }) {
  const router = useRouter();
  const onSelect = useCallback(
    (s: string | null) => {
      if (s) {
        router.push(path, injectQuery(router, path, { signal: s }));
      } else if (clearPath) {
        router.push(clearPath, injectQuery(router, clearPath));
      }
    },
    [router, path, clearPath]
  );

  return (
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
  );
}
