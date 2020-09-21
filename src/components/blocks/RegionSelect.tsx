import { TreeSelect } from 'antd';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { COMPARE_COLORS, IRegion, states } from '../../model';
import styles from './Select.module.css';
import { injectQuery } from './BaseLayout';
import { TreeSelectProps } from 'antd/lib/tree-select';

export const treeData = [
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

export function RegionsSelect({ regions, path, clearPath }: { regions: IRegion[]; path: string; clearPath?: string }) {
  const router = useRouter();
  const onSelect = useCallback(
    (s: string | null | string[]) => {
      const validRegions = Array.isArray(s) ? s.filter((d) => d !== 'US') : [];
      if (validRegions.length > 4) {
        validRegions.splice(3, validRegions.length - 3 - 1);
      }
      if (validRegions.length > 0) {
        router.push(path, injectQuery(router, path, { regions: validRegions.join(',') }));
      } else if (clearPath) {
        router.push(clearPath, injectQuery(router, clearPath));
      }
    },
    [router, path, clearPath]
  );

  return (
    <TreeSelect
      treeCheckable
      maxTagCount={COMPARE_COLORS.length}
      className={`${styles.select} ${styles.selectTreeMultiple}`}
      value={regions.length === 0 ? undefined : (regions.map((r) => r.id) as any)}
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
