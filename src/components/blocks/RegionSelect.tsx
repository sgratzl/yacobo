import { TreeSelect } from 'antd';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { IRegion, states } from '../../model';
import styles from './BaseLayout.module.scss';
import { injectQuery } from './BaseLayout';

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

  const treeData = useMemo(
    () => [
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
    ],
    []
  );

  return (
    <TreeSelect
      className={`${styles.select} ${styles.selectTree}`}
      value={region?.id ?? 'US'}
      onChange={onSelect}
      allowClear={clearPath != null}
      showSearch
      treeData={treeData}
      placeholder="Select Region"
      treeDefaultExpandedKeys={['US']}
      treeNodeFilterProp="label"
      dropdownMatchSelectWidth={300}
    ></TreeSelect>
  );
}
