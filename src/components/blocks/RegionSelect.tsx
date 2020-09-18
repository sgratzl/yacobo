import { TreeSelect } from 'antd';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { IRegion, states } from '../../model';
import { injectQuery } from './BaseLayout';
import type { DataNode } from 'antd/lib/tree';

export const treeData: (DataNode & { label: string; value: string })[] = [
  {
    key: 'US',
    label: 'US - whole country',
    value: 'US',
    children: states.map((state) => ({
      key: state.id,
      label: state.name,
      value: state.id,
      children: state.counties.map((county) => ({ key: county.id, label: county.name, value: county.id })),
    })),
  },
];

export function RegionSelect({ region, path, clearPath }: { region?: IRegion; path: string; clearPath?: string }) {
  const router = useRouter();
  const onSelect = useCallback(
    (s: string | null) => {
      if (s && s !== 'US') {
        router.push(path, injectQuery(router, path, { region: s }));
      } else if (clearPath) {
        router.push(clearPath, injectQuery(router, clearPath));
      }
    },
    [router, path, clearPath]
  );

  return (
    <TreeSelect
      className="select"
      value={region?.id ?? 'US'}
      onChange={onSelect}
      allowClear={clearPath != null}
      showSearch
      treeData={treeData}
      placeholder="Select Region"
      treeDefaultExpandedKeys={['US']}
      treeNodeFilterProp="label"
      dropdownMatchSelectWidth={300}
    >
      <style jsx>{`
        .select {
          font-size: inherit;
          background-color: unset;
          margin: 0;
          min-width: 12em;
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
    </TreeSelect>
  );
}
