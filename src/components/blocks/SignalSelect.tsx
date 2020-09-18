import { Select } from 'antd';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { ISignal, signals } from '../../model';
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
    <span>
      <style jsx>{`
        .select {
          font-size: inherit;
          background-color: unset;
          margin: 0;
          min-width: 12em;
          margin-right: 0.5em;
        }

        .select .select:global(.ant-select) > :global(.ant-select-selector) {
          background-color: unset;
          font-size: inherit;
          font-weight: inherit;
          height: unset;
        }

        .select:global(.ant-select) > :global(.ant-select-selector) :global(.ant-select-selection-search-input) {
          height: unset;
        }
      `}</style>
      <Select
        className="select"
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
